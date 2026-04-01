from __future__ import annotations

from pathlib import Path

import pandas as pd


def _load_price_table(
    path: Path,
    date_column: str,
    column_map: dict[str, str],
    source: str,
) -> tuple[pd.DataFrame, list[str]]:
    warnings: list[str] = []
    df = pd.read_csv(path)

    missing_cols = [col for col in [date_column, *column_map.keys()] if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing expected columns: {missing_cols}")

    frame = df[[date_column, *column_map.keys()]].copy()
    frame = frame.rename(columns={date_column: "date"})
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame = frame.melt(id_vars=["date"], var_name="product", value_name="value")
    frame["product"] = frame["product"].map(column_map)
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame["source"] = source
    frame = frame.dropna(subset=["date", "value"])
    frame = frame[["date", "product", "value", "source"]]

    return frame, warnings


def load_fountain_opis_prices(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_price_table(
        path=path,
        date_column="OPIS_Date",
        column_map={
            "OPIS_Unleaded_Price": "Unleaded",
            "OPIS_Diesel_Price": "Diesel",
            "OPIS_Dyed_Diesel_Price": "Dyed Diesel",
        },
        source="client_fountain_opis",
    )


def load_client_average_inventory(path: Path) -> tuple[pd.DataFrame, list[str]]:
    return _load_price_table(
        path=path,
        date_column="Average_Inventory_Date",
        column_map={
            "AVG_Inventory_Unleaded_Price": "Unleaded",
            "AVG_Inventory_Diesel_Price": "Diesel",
            "AVG_Inventory_Dyed_Diesel_Price": "Dyed Diesel",
        },
        source="client_average_inventory",
    )


def load_weather_colorado_springs(path: Path) -> tuple[pd.DataFrame, list[str]]:
    df = pd.read_csv(path)
    required = [
        "Formatted Dates",
        "Temperature (°F)",
        "Min Temperature (°F)",
        "Max Temperature (°F)",
        "Wind Speed (mph)",
    ]
    missing_cols = [col for col in required if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Missing expected columns: {missing_cols}")

    frame = df[required].copy()
    frame = frame.rename(columns={"Formatted Dates": "date"})
    frame["date"] = pd.to_datetime(frame["date"], errors="coerce")
    frame = frame.melt(id_vars=["date"], var_name="product", value_name="value")

    weather_product_map = {
        "Temperature (°F)": "Temperature F",
        "Min Temperature (°F)": "Min Temperature F",
        "Max Temperature (°F)": "Max Temperature F",
        "Wind Speed (mph)": "Wind Speed MPH",
    }
    frame["product"] = frame["product"].map(weather_product_map)
    frame["value"] = pd.to_numeric(frame["value"], errors="coerce")
    frame["source"] = "weather_colorado_springs"
    frame = frame.dropna(subset=["date", "value"])
    frame = frame[["date", "product", "value", "source"]]
    return frame, []

