from __future__ import annotations

import re
from pathlib import Path

import pandas as pd


def _clean_product_name(name: str) -> str:
    cleaned = re.sub(r"\s*\(.*?\)", "", str(name)).strip()
    cleaned = re.sub(r"\s+", " ", cleaned)
    return cleaned


def _to_canonical_long(
    df: pd.DataFrame,
    source: str,
    extra_product_prefix: str | None = None,
) -> pd.DataFrame:
    if "Date" not in df.columns:
        raise ValueError("Expected a 'Date' column in workbook data sheet.")

    value_columns = [c for c in df.columns if c != "Date"]
    if not value_columns:
        raise ValueError("No value columns found in workbook data sheet.")

    long_df = df.melt(
        id_vars=["Date"],
        value_vars=value_columns,
        var_name="product",
        value_name="value",
    )
    long_df["date"] = pd.to_datetime(long_df["Date"], errors="coerce")
    long_df["value"] = pd.to_numeric(long_df["value"], errors="coerce")

    if extra_product_prefix:
        long_df["product"] = extra_product_prefix + " | " + long_df["product"].astype(str)
    long_df["product"] = long_df["product"].astype(str).map(_clean_product_name)
    long_df["source"] = source

    long_df = long_df.drop(columns=["Date"])
    long_df = long_df.dropna(subset=["date", "value"])
    long_df = long_df[["date", "product", "value", "source"]]
    return long_df


def _load_data_sheets(path: Path, source: str) -> tuple[pd.DataFrame, list[str]]:
    xls = pd.ExcelFile(path)
    data_sheets = [sheet for sheet in xls.sheet_names if sheet.lower().startswith("data")]
    if not data_sheets:
        raise ValueError(f"No 'Data *' sheets found in workbook: {path}")

    frames: list[pd.DataFrame] = []
    warnings: list[str] = []
    for sheet_name in data_sheets:
        try:
            wide_df = pd.read_excel(path, sheet_name=sheet_name, header=2)
            frame = _to_canonical_long(wide_df, source=source)
            if frame.empty:
                warnings.append(f"{sheet_name}: no usable rows after normalization.")
                continue
            frames.append(frame)
        except Exception as exc:  # noqa: BLE001 - ingest should degrade gracefully
            warnings.append(f"{sheet_name}: {exc}")

    if not frames:
        return pd.DataFrame(columns=["date", "product", "value", "source"]), warnings

    combined = pd.concat(frames, ignore_index=True)
    return combined, warnings


def load_spot_prices(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_data_sheets(path=path, source="eia_spot_prices")


def load_futures(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_data_sheets(path=path, source="eia_futures")


def load_colorado_retail(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_data_sheets(path=path, source="eia_colorado_retail")


def load_rocky_mountain_retail(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_data_sheets(path=path, source="eia_rocky_mountain_retail")


def load_standard_errors(path: Path) -> tuple[pd.DataFrame, list[str]]:
    xls = pd.ExcelFile(path)
    frames: list[pd.DataFrame] = []
    warnings: list[str] = []

    for sheet_name in xls.sheet_names:
        try:
            df = pd.read_excel(path, sheet_name=sheet_name)
            if not {"Reference_Date", "geographic_area", "average_price"}.issubset(df.columns):
                warnings.append(f"{sheet_name}: required columns missing.")
                continue

            fuel_type = "Residential Heating Oil" if "_HO_" in sheet_name else "Residential Propane"
            frame = pd.DataFrame(
                {
                    "date": pd.to_datetime(df["Reference_Date"], errors="coerce"),
                    "product": fuel_type + " | " + df["geographic_area"].astype(str).str.strip(),
                    "value": pd.to_numeric(df["average_price"], errors="coerce"),
                    "source": "eia_residential_standard_errors",
                }
            )
            frame = frame.dropna(subset=["date", "value"])
            if frame.empty:
                warnings.append(f"{sheet_name}: no usable rows after normalization.")
                continue
            frames.append(frame)
        except Exception as exc:  # noqa: BLE001
            warnings.append(f"{sheet_name}: {exc}")

    if not frames:
        return pd.DataFrame(columns=["date", "product", "value", "source"]), warnings

    return pd.concat(frames, ignore_index=True), warnings
