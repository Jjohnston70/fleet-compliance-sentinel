from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime, timedelta
import json
from pathlib import Path
from typing import Any

import pandas as pd
import requests


EIA_BASE_URL = "https://api.eia.gov/v2/petroleum/pri"


@dataclass(frozen=True)
class EiaSeriesConfig:
    name: str
    table: str
    frequency: str
    series: str
    product: str
    output_file: str
    source: str


SPOT_SERIES: list[EiaSeriesConfig] = [
    EiaSeriesConfig(
        name="wti_crude",
        table="spt",
        frequency="daily",
        series="RWTC",
        product="Cushing, OK WTI Spot Price FOB",
        output_file="spot_prices_daily.csv",
        source="eia_api_spot",
    ),
    EiaSeriesConfig(
        name="heating_oil_ny",
        table="spt",
        frequency="daily",
        series="EER_EPD2F_PF4_Y35NY_DPG",
        product="New York Harbor No. 2 Heating Oil Spot Price FOB",
        output_file="spot_prices_daily.csv",
        source="eia_api_spot",
    ),
    EiaSeriesConfig(
        name="ulsd_ny",
        table="spt",
        frequency="daily",
        series="EER_EPD2DXL0_PF4_Y35NY_DPG",
        product="New York Harbor Ultra-Low Sulfur No 2 Diesel Spot Price",
        output_file="spot_prices_daily.csv",
        source="eia_api_spot",
    ),
    EiaSeriesConfig(
        name="gasoline_regular_ny",
        table="spt",
        frequency="daily",
        series="EER_EPMRU_PF4_Y35NY_DPG",
        product="New York Harbor Conventional Gasoline Regular Spot Price FOB",
        output_file="spot_prices_daily.csv",
        source="eia_api_spot",
    ),
]

RETAIL_SERIES: list[EiaSeriesConfig] = [
    EiaSeriesConfig(
        name="colorado_all_grades",
        table="gnd",
        frequency="weekly",
        series="EMM_EPM0_PTE_SCO_DPG",
        product="Weekly Colorado All Grades All Formulations Retail Gasoline Prices",
        output_file="colorado_retail_weekly.csv",
        source="eia_api_retail",
    )
]


def _load_cache(cache_path: Path) -> dict[str, dict[str, Any]]:
    if not cache_path.exists():
        return {}
    try:
        return json.loads(cache_path.read_text(encoding="utf-8"))
    except Exception:  # noqa: BLE001
        return {}


def _save_cache(cache_path: Path, cache: dict[str, dict[str, Any]]) -> None:
    cache_path.parent.mkdir(parents=True, exist_ok=True)
    cache_path.write_text(json.dumps(cache, indent=2), encoding="utf-8")


def _read_existing_max_date(csv_path: Path, product: str) -> date | None:
    if not csv_path.exists():
        return None
    try:
        df = pd.read_csv(csv_path, usecols=["date", "product"])
    except Exception:  # noqa: BLE001
        return None

    if "product" not in df.columns or "date" not in df.columns:
        return None
    mask = df["product"] == product
    if not mask.any():
        return None
    max_ts = pd.to_datetime(df.loc[mask, "date"], errors="coerce").max()
    if pd.isna(max_ts):
        return None
    return max_ts.date()


def _append_dedup(csv_path: Path, incoming: pd.DataFrame) -> tuple[int, pd.DataFrame]:
    csv_path.parent.mkdir(parents=True, exist_ok=True)
    incoming = incoming.copy()
    incoming["date"] = pd.to_datetime(incoming["date"], errors="coerce")
    incoming = incoming.dropna(subset=["date", "product", "value", "source"])
    incoming["__ingest_rank"] = 1

    if csv_path.exists():
        existing = pd.read_csv(csv_path)
        existing["date"] = pd.to_datetime(existing["date"], errors="coerce")
    else:
        existing = pd.DataFrame(columns=["date", "product", "value", "source"])
    existing["__ingest_rank"] = 0

    before = len(existing)
    merged = pd.concat([existing, incoming], ignore_index=True)
    merged = merged.dropna(subset=["date", "product", "value", "source"])
    merged = merged.sort_values(["date", "product", "source", "__ingest_rank"])
    # Keep latest occurrence so fresh API pulls can correct prior values for the same date/product/source.
    merged = merged.drop_duplicates(subset=["date", "product", "source"], keep="last")
    merged = merged.drop(columns=["__ingest_rank"], errors="ignore")
    merged = merged.sort_values(["date", "product", "source"]).reset_index(drop=True)
    added = len(merged) - before

    out = merged.copy()
    out["date"] = out["date"].dt.strftime("%Y-%m-%d")
    out.to_csv(csv_path, index=False)
    return int(added), merged


def _fetch_series_data(
    series_cfg: EiaSeriesConfig,
    api_key: str,
    start_date: date | None = None,
) -> pd.DataFrame:
    url = f"{EIA_BASE_URL}/{series_cfg.table}/data/"
    params = {
        "api_key": api_key,
        "frequency": series_cfg.frequency,
        "data[0]": "value",
        "facets[series][]": series_cfg.series,
        "sort[0][column]": "period",
        "sort[0][direction]": "asc",
    }
    if start_date:
        params["start"] = start_date.isoformat()

    resp = requests.get(url, params=params, timeout=30)
    if resp.status_code == 404:
        raise FileNotFoundError(f"Series not found (404): {series_cfg.series}")
    resp.raise_for_status()

    payload = resp.json()
    rows = payload.get("response", {}).get("data", [])
    if not rows:
        return pd.DataFrame(columns=["date", "product", "value", "source"])

    frame = pd.DataFrame(rows)
    frame = frame.rename(columns={"period": "date"})
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame["value"] = pd.to_numeric(frame.get("value"), errors="coerce")
    frame["product"] = series_cfg.product
    frame["source"] = series_cfg.source
    frame = frame[["date", "product", "value", "source"]]
    frame = frame.dropna(subset=["date", "value"])
    return frame


def _update_series(
    series_cfg: EiaSeriesConfig,
    api_key: str,
    processed_dir: Path,
    cache: dict[str, dict[str, Any]],
    force: bool,
) -> dict[str, Any]:
    today = date.today().isoformat()
    cache_key = f"{series_cfg.table}:{series_cfg.series}"
    cache_entry = cache.get(cache_key, {})

    if not force and cache_entry.get("last_checked_date") == today:
        return {
            "series": series_cfg.series,
            "product": series_cfg.product,
            "status": "skipped_cached_today",
            "rows_fetched": 0,
            "rows_added": 0,
            "output_file": str(processed_dir / series_cfg.output_file),
        }

    output_path = processed_dir / series_cfg.output_file
    last_date = _read_existing_max_date(output_path, series_cfg.product)
    start_date = (last_date - timedelta(days=7)) if last_date else None

    result: dict[str, Any] = {
        "series": series_cfg.series,
        "product": series_cfg.product,
        "status": "ok",
        "rows_fetched": 0,
        "rows_added": 0,
        "output_file": str(output_path),
    }
    try:
        incoming = _fetch_series_data(series_cfg, api_key=api_key, start_date=start_date)
        rows_fetched = len(incoming)
        rows_added, merged = _append_dedup(output_path, incoming)

        result["rows_fetched"] = int(rows_fetched)
        result["rows_added"] = int(rows_added)
        result["start_date"] = None if merged.empty else str(merged["date"].min().date())
        result["end_date"] = None if merged.empty else str(merged["date"].max().date())

        cache[cache_key] = {
            "last_checked_date": today,
            "last_success_date": today,
            "last_rows_fetched": int(rows_fetched),
            "last_rows_added": int(rows_added),
            "last_period_seen": result["end_date"],
        }
    except FileNotFoundError as exc:
        result["status"] = "not_found"
        result["warning"] = str(exc)
        cache[cache_key] = {"last_checked_date": today, "status": "not_found"}
    except requests.HTTPError as exc:
        result["status"] = "http_error"
        result["warning"] = str(exc)
        cache[cache_key] = {"last_checked_date": today, "status": "http_error"}
    except Exception as exc:  # noqa: BLE001
        result["status"] = "error"
        result["warning"] = str(exc)
        cache[cache_key] = {"last_checked_date": today, "status": "error"}

    return result


def fetch_latest_spot_prices(
    api_key: str,
    processed_dir: Path,
    cache_path: Path,
    force: bool = False,
) -> list[dict[str, Any]]:
    cache = _load_cache(cache_path)
    summaries = [
        _update_series(cfg, api_key=api_key, processed_dir=processed_dir, cache=cache, force=force)
        for cfg in SPOT_SERIES
    ]
    _save_cache(cache_path, cache)
    return summaries


def fetch_latest_retail_prices(
    api_key: str,
    processed_dir: Path,
    cache_path: Path,
    force: bool = False,
) -> list[dict[str, Any]]:
    cache = _load_cache(cache_path)
    summaries = [
        _update_series(cfg, api_key=api_key, processed_dir=processed_dir, cache=cache, force=force)
        for cfg in RETAIL_SERIES
    ]
    _save_cache(cache_path, cache)
    return summaries


def run_api_update(
    api_key: str,
    processed_dir: Path,
    cache_path: Path,
    force: bool = False,
) -> dict[str, Any]:
    spot = fetch_latest_spot_prices(api_key=api_key, processed_dir=processed_dir, cache_path=cache_path, force=force)
    retail = fetch_latest_retail_prices(api_key=api_key, processed_dir=processed_dir, cache_path=cache_path, force=force)
    combined = [*spot, *retail]
    return {
        "ran_at": datetime.utcnow().isoformat(timespec="seconds") + "Z",
        "total_series": len(combined),
        "total_rows_fetched": sum(int(item.get("rows_fetched", 0)) for item in combined),
        "total_rows_added": sum(int(item.get("rows_added", 0)) for item in combined),
        "series": combined,
    }
