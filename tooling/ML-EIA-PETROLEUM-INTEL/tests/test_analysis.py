from __future__ import annotations

import numpy as np
import pandas as pd

from src.analysis.pricing_strategy import analyze_pricing_strategy
from src.analysis.seasonal_patterns import analyze_heating_oil_seasonality
from src.analysis.weather_correlation import analyze_weather_correlation
from src.models.regime_detector import detect_market_regime


def test_detect_market_regime_returns_expected_shape() -> None:
    idx = pd.bdate_range("2024-01-01", periods=120)
    values = pd.Series(3.0 + np.linspace(0, 0.4, 120) + np.sin(np.arange(120) / 8.0) * 0.03, index=idx)
    result = detect_market_regime(values)
    assert result["current_regime"] in {"bull", "bear", "volatile", "unknown"}
    assert "history" in result


def test_analyze_heating_oil_seasonality_runs() -> None:
    idx = pd.bdate_range("2021-01-01", periods=800)
    values = pd.Series(3.0 + np.sin(np.arange(800) / 30.0) * 0.2, index=idx)
    result = analyze_heating_oil_seasonality(values)
    assert "current_season_year" in result
    assert "season_table" in result


def test_analyze_pricing_strategy_and_weather_correlation() -> None:
    dates = pd.date_range("2025-01-01", periods=80, freq="D")
    opis = pd.DataFrame(
        {
            "date": dates,
            "product": ["Diesel"] * len(dates),
            "value": np.linspace(2.8, 3.1, len(dates)),
            "source": ["client_fountain_opis"] * len(dates),
        }
    )
    inv = pd.DataFrame(
        {
            "date": dates,
            "product": ["Diesel"] * len(dates),
            "value": np.linspace(2.9, 3.2, len(dates)),
            "source": ["client_average_inventory"] * len(dates),
        }
    )
    pricing = analyze_pricing_strategy(opis, inv)
    assert pricing["overall_recommendation"] in {"cost_plus", "opis_plus", "insufficient_data"}

    weather = pd.DataFrame(
        {
            "date": dates,
            "product": ["Temperature F"] * len(dates),
            "value": np.linspace(55, 20, len(dates)),
            "source": ["weather_colorado_springs"] * len(dates),
        }
    )
    heating = pd.Series(np.linspace(2.6, 3.4, len(dates)), index=dates)
    corr = analyze_weather_correlation(weather, heating)
    assert corr["rows_used"] > 0

