from __future__ import annotations

from pathlib import Path

import pandas as pd

from .schema import IngestSummary


CANONICAL_COLUMNS = ["date", "product", "value", "source"]


def normalize_for_output(df: pd.DataFrame, source_id: str) -> pd.DataFrame:
    frame = df.copy()
    missing_cols = [col for col in CANONICAL_COLUMNS if col not in frame.columns]
    if missing_cols:
        raise ValueError(f"Missing canonical columns: {missing_cols}")

    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame["product"] = frame["product"].astype(str).str.strip()
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame["source"] = frame["source"].fillna(source_id).astype(str)

    frame = frame.dropna(subset=["date", "product", "value"])
    frame = frame[CANONICAL_COLUMNS]
    frame = frame.drop_duplicates(subset=["date", "product", "source"])
    frame = frame.sort_values(["date", "product"]).reset_index(drop=True)
    return frame


def detect_gaps(df: pd.DataFrame, frequency: str) -> list[str]:
    warnings: list[str] = []
    if df.empty:
        return ["No rows found after normalization."]

    frequency_map = {
        "daily": "B",
        "weekly": "W-MON",
    }
    freq = frequency_map.get(frequency)
    if not freq:
        return warnings

    for product, product_df in df.groupby("product"):
        product_df = product_df.sort_values("date")
        min_date = product_df["date"].min()
        max_date = product_df["date"].max()
        if pd.isna(min_date) or pd.isna(max_date) or min_date == max_date:
            continue

        expected = pd.date_range(start=min_date, end=max_date, freq=freq)
        observed = pd.DatetimeIndex(product_df["date"])
        missing = expected.difference(observed)
        if len(missing) > 0:
            warnings.append(
                f"{product}: {len(missing)} missing {frequency} periods between "
                f"{min_date.date()} and {max_date.date()}."
            )

    return warnings


def write_processed_csv(df: pd.DataFrame, output_path: Path) -> None:
    output_path.parent.mkdir(parents=True, exist_ok=True)
    frame = df.copy()
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce").dt.strftime("%Y-%m-%d")
    frame.to_csv(output_path, index=False)


def build_summary(
    source_id: str,
    output_file: str,
    df: pd.DataFrame,
    warnings: list[str],
) -> IngestSummary:
    start_date = None if df.empty else str(df["date"].min().date())
    end_date = None if df.empty else str(df["date"].max().date())
    return IngestSummary(
        source_id=source_id,
        output_file=output_file,
        rows=int(len(df)),
        start_date=start_date,
        end_date=end_date,
        warnings=warnings,
    )

