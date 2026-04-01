from __future__ import annotations

import numpy as np
import pandas as pd

from src.models.evaluator import compute_metrics
from src.models.sarima_forecast import SarimaParams, run_sarima_forecast


def test_compute_metrics_returns_expected_keys() -> None:
    actual = pd.Series([10.0, 11.0, 12.0, 13.0])
    pred = pd.Series([10.5, 10.8, 12.2, 12.7])
    naive = pd.Series([10.0, 10.0, 11.0, 12.0])
    metrics = compute_metrics(actual, pred, naive)

    assert set(metrics.keys()) == {
        "mae",
        "rmse",
        "mape",
        "directional_accuracy",
        "naive_mape",
    }
    assert metrics["mae"] >= 0
    assert metrics["rmse"] >= 0


def test_run_sarima_forecast_generates_rows() -> None:
    idx = pd.bdate_range("2022-01-03", periods=420)
    values = 3.0 + np.sin(np.arange(420) / 16.0) * 0.4 + (np.arange(420) * 0.001)
    series = pd.Series(values, index=idx)

    result = run_sarima_forecast(
        series=series,
        horizons=[30, 60, 90],
        train_window_points=252,
        validation_points=60,
        manual_params=SarimaParams(order=(1, 1, 1), seasonal_order=(0, 0, 0, 5)),
    )

    assert "metrics" in result
    assert "forecast_rows" in result
    forecast_rows = result["forecast_rows"]
    assert len(forecast_rows) == 90
    assert set(["date", "point", "ci_80_low", "ci_80_high", "ci_95_low", "ci_95_high"]).issubset(
        forecast_rows.columns
    )

