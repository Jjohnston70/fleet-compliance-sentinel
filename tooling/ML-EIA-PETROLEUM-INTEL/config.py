from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import os

from dotenv import load_dotenv

load_dotenv()

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
EIA_DIR = DATA_DIR / "eia"
CLIENT_DIR = DATA_DIR / "client"
PROCESSED_DIR = DATA_DIR / "processed"
OUTPUT_DIR = BASE_DIR / "output"
TRAFFIC_DIR = DATA_DIR / "traffic"
TRAFFIC_RAW_DIR = TRAFFIC_DIR / "raw"
TRAFFIC_PROCESSED_DIR = TRAFFIC_DIR / "processed"
API_CACHE_FILE = PROCESSED_DIR / "eia_api_cache.json"
EIA_API_KEY = os.getenv("EIA_API_KEY", "")


@dataclass(frozen=True)
class SourceConfig:
    source_id: str
    file_path: Path
    loader: str
    output_file: str
    frequency: str
    description: str
    output_schema: str = "canonical"


SOURCE_CONFIGS: dict[str, SourceConfig] = {
    "spot_prices": SourceConfig(
        source_id="spot_prices",
        file_path=EIA_DIR / "PET_PRI_SPT_S1_D.xls",
        loader="spot_prices",
        output_file="spot_prices_daily.csv",
        frequency="daily",
        description="EIA daily spot prices",
    ),
    "futures": SourceConfig(
        source_id="futures",
        file_path=EIA_DIR / "PET_PRI_FUT_S1_D.xls",
        loader="futures",
        output_file="futures_daily.csv",
        frequency="daily",
        description="EIA daily futures prices",
    ),
    "colorado_retail": SourceConfig(
        source_id="colorado_retail",
        file_path=EIA_DIR / "PET_PRI_GND_DCUS_SCO_W.xls",
        loader="colorado_retail",
        output_file="colorado_retail_weekly.csv",
        frequency="weekly",
        description="EIA Colorado weekly retail prices",
    ),
    "rocky_mountain_retail": SourceConfig(
        source_id="rocky_mountain_retail",
        file_path=EIA_DIR / "PET_PRI_GND_DCUS_R40_W.xls",
        loader="rocky_mountain_retail",
        output_file="rocky_mountain_retail_weekly.csv",
        frequency="weekly",
        description="EIA Rocky Mountain weekly retail prices",
    ),
    "residential_standard_errors": SourceConfig(
        source_id="residential_standard_errors",
        file_path=EIA_DIR / "standard-errors.xlsx",
        loader="standard_errors",
        output_file="residential_heating_oil_standard_errors.csv",
        frequency="weekly",
        description="EIA residential heating oil and propane prices with standard errors",
    ),
    "fountain_opis_prices": SourceConfig(
        source_id="fountain_opis_prices",
        file_path=CLIENT_DIR / "fountain_opis_prices.csv",
        loader="fountain_opis_prices",
        output_file="fountain_opis_prices_daily.csv",
        frequency="daily",
        description="Client OPIS rack pricing in Fountain, Colorado",
    ),
    "client_average_inventory": SourceConfig(
        source_id="client_average_inventory",
        file_path=CLIENT_DIR / "client_average_inventory.csv",
        loader="client_average_inventory",
        output_file="client_average_inventory_daily.csv",
        frequency="daily",
        description="Client cost basis average inventory pricing",
    ),
    "weather_colorado_springs": SourceConfig(
        source_id="weather_colorado_springs",
        file_path=CLIENT_DIR / "weather_colorado_springs.csv",
        loader="weather_colorado_springs",
        output_file="weather_colorado_springs_daily.csv",
        frequency="daily",
        description="Colorado Springs weather observations",
    ),
    "traffic_cdot": SourceConfig(
        source_id="traffic_cdot",
        file_path=TRAFFIC_RAW_DIR,
        loader="traffic_cdot",
        output_file="traffic_cdot_segment_year.csv",
        frequency="annual",
        description="CDOT ArcGIS corridor traffic volumes and truck counts",
        output_schema="traffic",
    ),
}

TRAINING_LOOKBACK_YEARS = 10
