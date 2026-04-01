from __future__ import annotations

import numpy as np
import pandas as pd


def _safe_array(values: pd.Series | np.ndarray | list[float]) -> np.ndarray:
    arr = np.asarray(values, dtype=float)
    return arr[~np.isnan(arr)]


def mae(actual: pd.Series, predicted: pd.Series) -> float:
    a = _safe_array(actual)
    p = _safe_array(predicted)
    n = min(len(a), len(p))
    if n == 0:
        return float("nan")
    return float(np.mean(np.abs(a[:n] - p[:n])))


def rmse(actual: pd.Series, predicted: pd.Series) -> float:
    a = _safe_array(actual)
    p = _safe_array(predicted)
    n = min(len(a), len(p))
    if n == 0:
        return float("nan")
    return float(np.sqrt(np.mean((a[:n] - p[:n]) ** 2)))


def mape(actual: pd.Series, predicted: pd.Series) -> float:
    a = _safe_array(actual)
    p = _safe_array(predicted)
    n = min(len(a), len(p))
    if n == 0:
        return float("nan")
    a = a[:n]
    p = p[:n]
    mask = a != 0
    if not np.any(mask):
        return float("nan")
    return float(np.mean(np.abs((a[mask] - p[mask]) / a[mask])) * 100.0)


def directional_accuracy(actual: pd.Series, predicted: pd.Series) -> float:
    actual = pd.Series(actual).reset_index(drop=True)
    predicted = pd.Series(predicted).reset_index(drop=True)
    n = min(len(actual), len(predicted))
    if n < 2:
        return float("nan")

    actual_delta = actual.diff().iloc[1:n]
    pred_delta = predicted.diff().iloc[1:n]
    aligned = pd.DataFrame({"a": actual_delta, "p": pred_delta}).dropna()
    if aligned.empty:
        return float("nan")
    same_direction = np.sign(aligned["a"]) == np.sign(aligned["p"])
    return float(same_direction.mean() * 100.0)


def compute_metrics(actual: pd.Series, predicted: pd.Series, naive_predicted: pd.Series) -> dict[str, float]:
    return {
        "mae": mae(actual, predicted),
        "rmse": rmse(actual, predicted),
        "mape": mape(actual, predicted),
        "directional_accuracy": directional_accuracy(actual, predicted),
        "naive_mape": mape(actual, naive_predicted),
    }

