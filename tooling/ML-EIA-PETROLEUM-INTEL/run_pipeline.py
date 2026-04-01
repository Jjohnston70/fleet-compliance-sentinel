from __future__ import annotations

import argparse
import json
from pathlib import Path
import re
import sys
import warnings

import pandas as pd

from config import OUTPUT_DIR, PROCESSED_DIR, TRAINING_LOOKBACK_YEARS
from src.analysis.pricing_strategy import analyze_pricing_strategy
from src.analysis.seasonal_patterns import analyze_heating_oil_seasonality
from src.analysis.weather_correlation import analyze_weather_correlation
from src.models.regime_detector import detect_market_regime
from src.models.sarima_forecast import run_sarima_forecast
from src.signals.price_alerts import generate_price_alerts

warnings.filterwarnings("ignore", message="No supported index is available.*")
warnings.filterwarnings("ignore", message=".*without a supported index will result in an exception.*")


SPOT_FILE = PROCESSED_DIR / "spot_prices_daily.csv"
OPIS_FILE = PROCESSED_DIR / "fountain_opis_prices_daily.csv"
INVENTORY_FILE = PROCESSED_DIR / "client_average_inventory_daily.csv"
WEATHER_FILE = PROCESSED_DIR / "weather_colorado_springs_daily.csv"
FORECAST_DIR = OUTPUT_DIR / "forecasts"
REPORTS_DIR = OUTPUT_DIR / "reports"
ALERTS_FILE = OUTPUT_DIR / "alerts" / "active_alerts.json"
ANALYSIS_SNAPSHOT_FILE = REPORTS_DIR / "analysis_snapshot.json"

PRODUCT_ALIASES = {
    "heating_oil": "New York Harbor No. 2 Heating Oil Spot Price FOB",
    "crude": "Cushing, OK WTI Spot Price FOB",
    "diesel": "New York Harbor Ultra-Low Sulfur No 2 Diesel Spot Price",
    "gasoline": "New York Harbor Conventional Gasoline Regular Spot Price FOB",
}


def _slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", value.lower()).strip("_")


def parse_args(argv: list[str] | None = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Run SARIMA forecasting pipeline for petroleum products.")
    parser.add_argument("--all", action="store_true", help="Forecast all default products.")
    parser.add_argument(
        "--product",
        help=(
            "Product alias or exact product name. Aliases: "
            + ", ".join(sorted(PRODUCT_ALIASES.keys()))
        ),
    )
    parser.add_argument("--horizon", type=int, choices=[30, 60, 90], help="Single forecast horizon in days.")
    parser.add_argument("--train-years", type=int, default=TRAINING_LOOKBACK_YEARS, help="Rolling training window.")
    return parser.parse_args(argv)


def _load_spot_prices() -> pd.DataFrame:
    if not SPOT_FILE.exists():
        raise FileNotFoundError(f"Missing processed spot price file: {SPOT_FILE}")
    df = pd.read_csv(SPOT_FILE)
    required = {"date", "product", "value", "source"}
    missing = required.difference(df.columns)
    if missing:
        raise ValueError(f"spot_prices_daily.csv missing required columns: {sorted(missing)}")
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["date", "product", "value"])
    return df


def _load_processed_long_csv(path: Path) -> pd.DataFrame:
    if not path.exists():
        return pd.DataFrame(columns=["date", "product", "value", "source"])
    df = pd.read_csv(path)
    required = {"date", "product", "value", "source"}
    if not required.issubset(df.columns):
        return pd.DataFrame(columns=["date", "product", "value", "source"])
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    return df.dropna(subset=["date", "product", "value"]).copy()


def _resolve_products(args: argparse.Namespace) -> list[str]:
    if args.all:
        return list(PRODUCT_ALIASES.values())
    if args.product:
        return [PRODUCT_ALIASES.get(args.product, args.product)]
    raise ValueError("Specify --all or --product.")


def _build_product_series(df: pd.DataFrame, product: str, train_years: int) -> pd.Series:
    subset = df[df["product"] == product].copy()
    if subset.empty:
        raise ValueError(f"No rows found for product: {product}")

    source_priority = {"eia_api_spot": 0, "eia_spot_prices": 1}
    subset["source_priority"] = subset["source"].map(source_priority).fillna(99)
    subset = subset.sort_values(["date", "source_priority"])
    subset = subset.drop_duplicates(subset=["date"], keep="first")
    subset = subset.sort_values("date")

    latest_date = subset["date"].max()
    min_date = latest_date - pd.DateOffset(years=train_years)
    subset = subset[subset["date"] >= min_date]
    series = pd.Series(subset["value"].values, index=subset["date"], name=product)
    return series


def _to_json_ready(value):
    if isinstance(value, dict):
        return {k: _to_json_ready(v) for k, v in value.items()}
    if isinstance(value, list):
        return [_to_json_ready(v) for v in value]
    if hasattr(value, "item"):
        return value.item()
    return value


def _run_analysis_bundle(spot_df: pd.DataFrame, train_years: int) -> dict[str, object]:
    heating_product = PRODUCT_ALIASES["heating_oil"]
    heating_series = _build_product_series(spot_df, product=heating_product, train_years=train_years)

    regime = detect_market_regime(heating_series)
    seasonal = analyze_heating_oil_seasonality(heating_series)
    opis = _load_processed_long_csv(OPIS_FILE)
    inventory = _load_processed_long_csv(INVENTORY_FILE)
    weather = _load_processed_long_csv(WEATHER_FILE)
    pricing = analyze_pricing_strategy(opis, inventory)
    weather_corr = analyze_weather_correlation(weather, heating_series)

    primary_products = set(PRODUCT_ALIASES.values())
    spot_for_alerts = spot_df[spot_df["product"].isin(primary_products)].copy()
    alerts = generate_price_alerts(
        spot_df=spot_for_alerts,
        spread_table=pricing.get("spread_table"),
        regime_history=regime.get("history"),
        output_path=ALERTS_FILE,
    )

    summary = {
        "generated_at": pd.Timestamp.now("UTC").isoformat(),
        "regime": {
            "current_regime": regime.get("current_regime"),
            "days_in_regime": regime.get("days_in_regime"),
            "transition_probability": regime.get("transition_probability"),
            "volatility_20d": regime.get("volatility_20d"),
            "momentum_20d": regime.get("momentum_20d"),
        },
        "seasonal": seasonal,
        "pricing_strategy": {
            "overall_recommendation": pricing.get("overall_recommendation"),
            "products": pricing.get("products"),
        },
        "weather_correlation": weather_corr,
        "alerts": {
            "alert_count": alerts.get("alert_count"),
            "output_file": str(ALERTS_FILE),
        },
    }

    REPORTS_DIR.mkdir(parents=True, exist_ok=True)
    ANALYSIS_SNAPSHOT_FILE.write_text(json.dumps(_to_json_ready(summary), indent=2), encoding="utf-8")
    return summary


def run_for_product(df: pd.DataFrame, product: str, horizons: list[int], train_years: int) -> Path:
    series = _build_product_series(df, product=product, train_years=train_years)
    result = run_sarima_forecast(
        series=series,
        horizons=horizons,
        train_window_points=int(train_years * 252),
    )

    max_horizon = max(horizons)
    forecast_rows = result["forecast_rows"]
    payload = {
        "product": product,
        "generated_at": result["generated_at"],
        "horizon_days": max_horizon if len(horizons) == 1 else horizons,
        "forecast": forecast_rows.head(max_horizon).to_dict(orient="records"),
        "metrics": result["metrics"],
        "model": result["model"],
        "warnings": result["warnings"],
    }

    FORECAST_DIR.mkdir(parents=True, exist_ok=True)
    date_suffix = pd.Timestamp.now("UTC").strftime("%Y%m%d")
    out_path = FORECAST_DIR / f"{_slugify(product)}_{date_suffix}.json"
    out_path.write_text(json.dumps(_to_json_ready(payload), indent=2), encoding="utf-8")
    return out_path


def main(argv: list[str] | None = None) -> int:
    args = parse_args(argv)
    horizons = [args.horizon] if args.horizon else [30, 60, 90]

    df = _load_spot_prices()
    products = _resolve_products(args)

    for product in products:
        out_path = run_for_product(df=df, product=product, horizons=horizons, train_years=args.train_years)
        print(f"[{product}] forecast saved -> {out_path}")

    if args.all:
        analysis = _run_analysis_bundle(df, train_years=args.train_years)
        print(f"[analysis] regime={analysis['regime']['current_regime']} days={analysis['regime']['days_in_regime']}")
        print(f"[analysis] strategy={analysis['pricing_strategy']['overall_recommendation']}")
        print(f"[analysis] alerts={analysis['alerts']['alert_count']} -> {analysis['alerts']['output_file']}")
        print(f"[analysis] snapshot -> {ANALYSIS_SNAPSHOT_FILE}")

    print("Pipeline complete.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
