from __future__ import annotations

from pathlib import Path

import pandas as pd

from config import SOURCE_CONFIGS
from run_ingest import main
from src.ingest.csv_loader import load_client_average_inventory, load_fountain_opis_prices
from src.ingest.excel_loader import load_spot_prices


def test_source_files_exist_for_task_1_1() -> None:
    required = [
        "spot_prices",
        "futures",
        "colorado_retail",
        "rocky_mountain_retail",
        "residential_standard_errors",
        "fountain_opis_prices",
        "client_average_inventory",
        "weather_colorado_springs",
    ]
    missing = [name for name in required if not SOURCE_CONFIGS[name].file_path.exists()]
    assert missing == [], f"Missing required source files: {missing}"


def test_load_spot_prices_returns_canonical_columns() -> None:
    frame, warnings = load_spot_prices(SOURCE_CONFIGS["spot_prices"].file_path)
    assert frame.empty is False
    assert set(["date", "product", "value", "source"]).issubset(frame.columns)
    assert frame["date"].min() <= pd.Timestamp("1986-01-02")
    assert warnings is not None


def test_load_client_price_csvs() -> None:
    opis_frame, _ = load_fountain_opis_prices(SOURCE_CONFIGS["fountain_opis_prices"].file_path)
    inv_frame, _ = load_client_average_inventory(SOURCE_CONFIGS["client_average_inventory"].file_path)

    assert opis_frame.empty is False
    assert inv_frame.empty is False
    assert set(opis_frame["product"].unique()) == {"Unleaded", "Diesel", "Dyed Diesel"}
    assert set(inv_frame["product"].unique()) == {"Unleaded", "Diesel", "Dyed Diesel"}


def test_run_ingest_single_source_writes_processed_csv(tmp_path: Path) -> None:
    exit_code = main(["--source", "spot_prices", "--output-dir", str(tmp_path)])
    output_file = tmp_path / SOURCE_CONFIGS["spot_prices"].output_file
    assert exit_code == 0
    assert output_file.exists()

    written = pd.read_csv(output_file)
    assert list(written.columns) == ["date", "product", "value", "source"]
    assert len(written) > 1000

