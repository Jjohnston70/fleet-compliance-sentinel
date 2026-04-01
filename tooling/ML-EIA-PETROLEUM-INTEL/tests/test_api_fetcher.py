from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.ingest.api_fetcher import _append_dedup


def test_append_dedup_adds_only_new_rows(tmp_path: Path) -> None:
    csv_path = tmp_path / "spot_prices_daily.csv"
    existing = pd.DataFrame(
        [
            {"date": "2026-03-20", "product": "WTI Crude", "value": 68.1, "source": "eia_api_spot"},
            {"date": "2026-03-21", "product": "WTI Crude", "value": 69.2, "source": "eia_api_spot"},
        ]
    )
    existing.to_csv(csv_path, index=False)

    incoming = pd.DataFrame(
        [
            {"date": "2026-03-21", "product": "WTI Crude", "value": 69.2, "source": "eia_api_spot"},
            {"date": "2026-03-22", "product": "WTI Crude", "value": 70.0, "source": "eia_api_spot"},
        ]
    )

    rows_added, merged = _append_dedup(csv_path, incoming)
    assert rows_added == 1
    assert len(merged) == 3
    assert merged["date"].max() == pd.Timestamp("2026-03-22")


def test_append_dedup_prefers_latest_value_for_existing_key(tmp_path: Path) -> None:
    csv_path = tmp_path / "spot_prices_daily.csv"
    existing = pd.DataFrame(
        [
            {"date": "2026-03-20", "product": "WTI Crude", "value": 68.1, "source": "eia_api_spot"},
            {"date": "2026-03-21", "product": "WTI Crude", "value": 69.2, "source": "eia_api_spot"},
        ]
    )
    existing.to_csv(csv_path, index=False)

    # Same date/product/source key with corrected value should overwrite prior value.
    incoming = pd.DataFrame(
        [
            {"date": "2026-03-21", "product": "WTI Crude", "value": 70.5, "source": "eia_api_spot"},
        ]
    )

    rows_added, merged = _append_dedup(csv_path, incoming)
    assert rows_added == 0
    value = merged.loc[merged["date"] == pd.Timestamp("2026-03-21"), "value"].iloc[0]
    assert float(value) == 70.5
