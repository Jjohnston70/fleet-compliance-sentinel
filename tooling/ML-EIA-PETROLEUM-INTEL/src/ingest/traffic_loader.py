from __future__ import annotations

from pathlib import Path
from typing import Any

import pandas as pd
import requests


FEATURE_SERVER_BASE = (
    "https://services.arcgis.com/yzB9WM8W0BO3Ql7d/arcgis/rest/services/"
    "TraffonAllYrs_gdb/FeatureServer"
)

CORRIDOR_WHERE = (
    "(ROUTE LIKE '025A' AND REFPT BETWEEN 128 AND 162) "
    "OR (ROUTE LIKE '021%' AND REFPT BETWEEN 130 AND 160) "
    "OR (ROUTE LIKE '024%' AND REFPT BETWEEN 280 AND 315)"
)

OUT_FIELDS = [
    "ROUTE",
    "REFPT",
    "ENDREFPT",
    "COUNTSTATIONID",
    "AADT",
    "AADTTRUCKS",
    "AADTCOMB",
    "AADTSINGLE",
    "AADTYR",
    "AADTDERIV",
    "SEASONALGROUPID",
    "DHV",
    "VCRATIO",
]


def _layer_id_for_year(year: int) -> int:
    if year < 1997 or year > 2024:
        raise ValueError("CDOT ArcGIS yearly layer support is expected for 1997-2024.")
    return 28 + (2024 - year)


def _query_layer(layer_id: int, where_clause: str) -> list[dict[str, Any]]:
    offset = 0
    page_size = 2000
    rows: list[dict[str, Any]] = []

    while True:
        url = f"{FEATURE_SERVER_BASE}/{layer_id}/query"
        params = {
            "where": where_clause,
            "outFields": ",".join(OUT_FIELDS),
            "returnGeometry": "false",
            "f": "json",
            "resultOffset": offset,
            "resultRecordCount": page_size,
        }
        resp = requests.get(url, params=params, timeout=60)
        resp.raise_for_status()
        payload = resp.json()
        features = payload.get("features", [])
        if not features:
            break

        rows.extend([f.get("attributes", {}) for f in features])
        exceeded = payload.get("exceededTransferLimit", False)
        if not exceeded or len(features) < page_size:
            break
        offset += page_size

    return rows


def _to_output_schema(frame: pd.DataFrame, year: int) -> pd.DataFrame:
    deriv_series = frame["AADTDERIV"] if "AADTDERIV" in frame.columns else pd.Series([pd.NA] * len(frame))
    out = pd.DataFrame(
        {
            "date": pd.Timestamp(year=year, month=1, day=1),
            "station_id": frame.get("COUNTSTATIONID"),
            "route": frame.get("ROUTE"),
            "refpt_from": pd.to_numeric(frame.get("REFPT"), errors="coerce"),
            "refpt_to": pd.to_numeric(frame.get("ENDREFPT"), errors="coerce"),
            "total_volume": pd.to_numeric(frame.get("AADT"), errors="coerce"),
            "truck_volume": pd.to_numeric(frame.get("AADTTRUCKS"), errors="coerce"),
            "truck_comb": pd.to_numeric(frame.get("AADTCOMB"), errors="coerce"),
            "truck_single": pd.to_numeric(frame.get("AADTSINGLE"), errors="coerce"),
            "aadt_year": pd.to_numeric(frame.get("AADTYR"), errors="coerce"),
            "deriv_code": deriv_series.astype("string"),
            "seasonal_group_id": frame.get("SEASONALGROUPID"),
            "dhv": pd.to_numeric(frame.get("DHV"), errors="coerce"),
            "v_c_ratio": pd.to_numeric(frame.get("VCRATIO"), errors="coerce"),
            "source": "cdot_arcgis_featureserver",
        }
    )
    out["deriv_code"] = out["deriv_code"].fillna("")
    out["truck_pct"] = (out["truck_volume"] / out["total_volume"] * 100.0).round(4)
    out = out.dropna(subset=["station_id", "route", "total_volume"])
    out["station_id"] = out["station_id"].astype(str).str.strip()
    out["route"] = out["route"].astype(str).str.strip()
    return out[
        [
            "date",
            "station_id",
            "route",
            "refpt_from",
            "refpt_to",
            "total_volume",
            "truck_volume",
            "truck_pct",
            "truck_comb",
            "truck_single",
            "aadt_year",
            "deriv_code",
            "seasonal_group_id",
            "dhv",
            "v_c_ratio",
            "source",
        ]
    ]


def load_cdot_traffic(path: Path, years: list[int] | None = None) -> tuple[pd.DataFrame, list[str]]:
    years = years or [2022, 2023, 2024]
    raw_dir = path
    raw_dir.mkdir(parents=True, exist_ok=True)

    frames: list[pd.DataFrame] = []
    warnings: list[str] = []

    for year in years:
        try:
            layer_id = _layer_id_for_year(year)
            rows = _query_layer(layer_id=layer_id, where_clause=CORRIDOR_WHERE)
            if not rows:
                warnings.append(f"{year}: no rows returned from CDOT ArcGIS query.")
                continue
            raw_df = pd.DataFrame(rows)
            raw_csv = raw_dir / f"cdot_traffic_corridors_{year}.csv"
            raw_df.to_csv(raw_csv, index=False)
            frames.append(_to_output_schema(raw_df, year=year))
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"{year}: {exc}")

    if not frames:
        cols = [
            "date",
            "station_id",
            "route",
            "refpt_from",
            "refpt_to",
            "total_volume",
            "truck_volume",
            "truck_pct",
            "truck_comb",
            "truck_single",
            "aadt_year",
            "deriv_code",
            "seasonal_group_id",
            "dhv",
            "v_c_ratio",
            "source",
        ]
        return pd.DataFrame(columns=cols), warnings

    merged = pd.concat(frames, ignore_index=True)
    merged = merged.drop_duplicates(subset=["date", "station_id", "route", "refpt_from", "refpt_to"])
    merged = merged.sort_values(["date", "route", "station_id"]).reset_index(drop=True)
    return merged, warnings
