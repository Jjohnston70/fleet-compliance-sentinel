from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import pandas as pd


def _read_json(path: Path, fallback: Any) -> Any:
    if not path.exists():
        return fallback
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return fallback


def _latest_forecasts(forecast_dir: Path) -> dict[str, Any]:
    forecasts: dict[str, Any] = {}
    latest_keys: dict[str, pd.Timestamp] = {}
    for p in sorted(forecast_dir.glob("*.json")):
        payload = _read_json(p, {})
        product = payload.get("product")
        if not product:
            continue

        generated_at = pd.to_datetime(payload.get("generated_at"), errors="coerce", utc=True)
        if pd.isna(generated_at):
            generated_at = pd.Timestamp(p.stat().st_mtime, unit="s", tz="UTC")

        current = latest_keys.get(product)
        if current is not None and generated_at <= current:
            continue

        latest_keys[product] = generated_at
        forecasts[product] = {
            "product": product,
            "generated_at": payload.get("generated_at"),
            "horizon_days": payload.get("horizon_days"),
            "metrics": payload.get("metrics", {}),
            "forecast": payload.get("forecast", [])[:30],
        }
    return forecasts


def _latest_prices(processed_dir: Path) -> dict[str, Any]:
    spot_file = processed_dir / "spot_prices_daily.csv"
    if not spot_file.exists():
        return {}
    df = pd.read_csv(spot_file)
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["value"] = pd.to_numeric(df["value"], errors="coerce")
    df = df.dropna(subset=["date", "product", "value"]).sort_values(["product", "date"])
    latest = df.groupby("product", as_index=False).tail(1)
    return {
        row["product"]: {"date": str(pd.to_datetime(row["date"]).date()), "value": float(row["value"])}
        for _, row in latest.iterrows()
    }


def _write_json(path: Path, payload: dict[str, Any]) -> Path:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return path


def export_api_payloads(
    output_dir: Path,
    processed_dir: Path,
) -> dict[str, Path]:
    forecast_dir = output_dir / "forecasts"
    report_dir = output_dir / "reports"
    alerts_file = output_dir / "alerts" / "active_alerts.json"
    analysis_file = report_dir / "analysis_snapshot.json"

    analysis = _read_json(analysis_file, {})
    alerts = _read_json(alerts_file, {"alerts": [], "alert_count": 0})
    forecasts = _latest_forecasts(forecast_dir)
    prices = _latest_prices(processed_dir)

    forecast_payload = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "count": len(forecasts),
        "products": forecasts,
    }
    regime_payload = {"generated_at": pd.Timestamp.utcnow().isoformat(), "regime": analysis.get("regime", {})}
    alerts_payload = alerts
    spreads_payload = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "overall_recommendation": analysis.get("pricing_strategy", {}).get("overall_recommendation"),
        "products": analysis.get("pricing_strategy", {}).get("products", {}),
    }
    seasonal_payload = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "seasonal": analysis.get("seasonal", {}),
    }
    prices_payload = {
        "generated_at": pd.Timestamp.utcnow().isoformat(),
        "prices": prices,
    }

    api_dir = output_dir / "forecasts" / "api"
    paths = {
        "forecast": _write_json(api_dir / "forecast.json", forecast_payload),
        "regime": _write_json(api_dir / "regime.json", regime_payload),
        "alerts": _write_json(api_dir / "alerts.json", alerts_payload),
        "spreads": _write_json(api_dir / "spreads.json", spreads_payload),
        "seasonal": _write_json(api_dir / "seasonal.json", seasonal_payload),
        "prices": _write_json(api_dir / "prices.json", prices_payload),
    }
    return paths
