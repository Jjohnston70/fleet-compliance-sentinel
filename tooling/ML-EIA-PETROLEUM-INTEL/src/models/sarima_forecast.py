from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
import warnings

import numpy as np
import pandas as pd
from pandas.tseries.offsets import BDay
from statsmodels.tsa.statespace.sarimax import SARIMAX
from statsmodels.tsa.statespace.sarimax import SARIMAXResultsWrapper

from .evaluator import compute_metrics


@dataclass(frozen=True)
class SarimaParams:
    order: tuple[int, int, int]
    seasonal_order: tuple[int, int, int, int]


DEFAULT_CANDIDATES: list[SarimaParams] = [
    SarimaParams((1, 1, 1), (0, 0, 0, 5)),
    SarimaParams((2, 1, 1), (0, 0, 0, 5)),
    SarimaParams((1, 1, 2), (0, 0, 0, 5)),
    SarimaParams((2, 1, 2), (0, 0, 0, 5)),
    SarimaParams((0, 1, 1), (0, 0, 0, 5)),
    SarimaParams((1, 0, 1), (1, 0, 0, 5)),
    SarimaParams((2, 0, 2), (1, 0, 0, 5)),
    SarimaParams((1, 1, 1), (1, 1, 0, 5)),
    SarimaParams((1, 1, 1), (1, 1, 1, 5)),
]


def _fit_model(series: pd.Series, params: SarimaParams) -> tuple[SARIMAXResultsWrapper | None, list[str]]:
    fit_warnings: list[str] = []
    with warnings.catch_warnings(record=True) as captured:
        warnings.simplefilter("always")
        try:
            model = SARIMAX(
                series,
                order=params.order,
                seasonal_order=params.seasonal_order,
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            fitted = model.fit(disp=False, maxiter=200)
            converged = bool((getattr(fitted, "mle_retvals", {}) or {}).get("converged", True))
            if not converged:
                fit_warnings.append(
                    f"Non-converged fit for order={params.order} seasonal={params.seasonal_order}."
                )
                return None, fit_warnings
            for item in captured:
                fit_warnings.append(str(item.message))
            return fitted, fit_warnings
        except Exception as exc:  # noqa: BLE001
            fit_warnings.append(f"Fit failed for order={params.order} seasonal={params.seasonal_order}: {exc}")
            return None, fit_warnings


def _select_best_params(
    training_series: pd.Series,
    manual_params: SarimaParams | None = None,
) -> tuple[SarimaParams, SARIMAXResultsWrapper, list[str]]:
    warnings_accum: list[str] = []

    if manual_params:
        fitted, fit_warnings = _fit_model(training_series, manual_params)
        warnings_accum.extend(fit_warnings)
        if fitted is not None:
            return manual_params, fitted, warnings_accum
        warnings_accum.append("Manual SARIMA parameters failed; falling back to default grid candidates.")

    best_aic = float("inf")
    best_params: SarimaParams | None = None
    best_model: SARIMAXResultsWrapper | None = None

    for params in DEFAULT_CANDIDATES:
        fitted, fit_warnings = _fit_model(training_series, params)
        warnings_accum.extend(fit_warnings)
        if fitted is None:
            continue
        if fitted.aic < best_aic:
            best_aic = float(fitted.aic)
            best_params = params
            best_model = fitted

    if best_params is None or best_model is None:
        raise RuntimeError("No converged SARIMA model found in candidate grid.")
    return best_params, best_model, warnings_accum


def _one_step_backtest(
    training_series: pd.Series,
    validation_series: pd.Series,
    params: SarimaParams,
) -> tuple[pd.Series, pd.Series, list[str]]:
    fit_warnings: list[str] = []
    fitted, model_warnings = _fit_model(training_series, params)
    fit_warnings.extend(model_warnings)
    if fitted is None:
        naive_pred = validation_series.shift(1).fillna(training_series.iloc[-1])
        return naive_pred, naive_pred, fit_warnings

    rolling_model = fitted
    preds: list[float] = []
    for _, actual in validation_series.items():
        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            next_pred = float(rolling_model.get_forecast(steps=1).predicted_mean.iloc[0])
        preds.append(next_pred)
        try:
            rolling_model = rolling_model.append([actual], refit=False)
        except Exception as exc:  # noqa: BLE001
            fit_warnings.append(f"Rolling append fallback triggered: {exc}")
            break

    pred_series = pd.Series(preds, index=validation_series.index[: len(preds)])
    actual_aligned = validation_series.iloc[: len(preds)]
    naive = actual_aligned.shift(1)
    naive.iloc[0] = training_series.iloc[-1]
    return pred_series, naive, fit_warnings


def _build_forecast_rows(
    fitted: SARIMAXResultsWrapper,
    last_date: pd.Timestamp,
    max_horizon: int,
) -> pd.DataFrame:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore")
        fc80 = fitted.get_forecast(steps=max_horizon)
        fc95 = fitted.get_forecast(steps=max_horizon)
    mean = fc80.predicted_mean.astype(float)
    ci80 = fc80.conf_int(alpha=0.20)
    ci95 = fc95.conf_int(alpha=0.05)

    future_dates = pd.bdate_range(start=last_date + BDay(1), periods=max_horizon)
    rows = []
    for i in range(max_horizon):
        rows.append(
            {
                "date": future_dates[i].date().isoformat(),
                "point": float(mean.iloc[i]),
                "ci_80_low": float(ci80.iloc[i, 0]),
                "ci_80_high": float(ci80.iloc[i, 1]),
                "ci_95_low": float(ci95.iloc[i, 0]),
                "ci_95_high": float(ci95.iloc[i, 1]),
            }
        )
    return pd.DataFrame(rows)


def run_sarima_forecast(
    series: pd.Series,
    horizons: list[int],
    train_window_points: int = 504,
    validation_points: int = 90,
    manual_params: SarimaParams | None = None,
) -> dict[str, object]:
    clean = pd.Series(series).dropna().astype(float).sort_index()
    if len(clean) < 120:
        raise ValueError("Not enough data points for SARIMA forecasting (need at least 120 points).")

    validation_points = min(validation_points, max(30, len(clean) // 5))
    train_full = clean.iloc[:-validation_points]
    validation = clean.iloc[-validation_points:]
    if train_full.empty:
        raise ValueError("Training split is empty after validation cutoff.")

    train_window = train_full.iloc[-train_window_points:] if len(train_full) > train_window_points else train_full
    best_params, _, fit_warnings = _select_best_params(train_window, manual_params=manual_params)

    one_step_pred, naive_pred, backtest_warnings = _one_step_backtest(train_window, validation, best_params)
    fit_warnings.extend(backtest_warnings)
    actual_aligned = validation.iloc[: len(one_step_pred)]
    metrics = compute_metrics(actual_aligned, one_step_pred, naive_pred.iloc[: len(one_step_pred)])

    final_training = clean.iloc[-train_window_points:] if len(clean) > train_window_points else clean
    final_model, final_fit_warnings = _fit_model(final_training, best_params)
    fit_warnings.extend(final_fit_warnings)

    if final_model is None:
        last_value = float(final_training.iloc[-1])
        max_horizon = max(horizons)
        future_dates = pd.bdate_range(start=final_training.index.max() + BDay(1), periods=max_horizon)
        fallback_rows = pd.DataFrame(
            [
                {
                    "date": d.date().isoformat(),
                    "point": last_value,
                    "ci_80_low": last_value,
                    "ci_80_high": last_value,
                    "ci_95_low": last_value,
                    "ci_95_high": last_value,
                }
                for d in future_dates
            ]
        )
        forecast_rows = fallback_rows
    else:
        forecast_rows = _build_forecast_rows(
            fitted=final_model,
            last_date=final_training.index.max(),
            max_horizon=max(horizons),
        )

    return {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "model": {
            "order": list(best_params.order),
            "seasonal_order": list(best_params.seasonal_order),
            "train_points": int(len(train_window)),
            "validation_points": int(len(actual_aligned)),
        },
        "metrics": metrics,
        "forecast_rows": forecast_rows,
        "warnings": sorted(set([w for w in fit_warnings if w])),
    }
