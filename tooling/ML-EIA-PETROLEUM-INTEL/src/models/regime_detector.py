from __future__ import annotations

import numpy as np
import pandas as pd


def detect_market_regime(
    price_series: pd.Series,
    low_vol_threshold: float = 0.01,
    high_vol_threshold: float = 0.03,
) -> dict[str, object]:
    series = pd.Series(price_series).dropna().astype(float).sort_index()
    if len(series) < 40:
        return {
            "current_regime": "unknown",
            "days_in_regime": 0,
            "transition_probability": 0.0,
            "volatility_20d": float("nan"),
            "momentum_20d": float("nan"),
            "history": pd.DataFrame(columns=["date", "regime", "volatility_20d", "momentum_20d"]),
        }

    returns = series.pct_change()
    volatility_20d = returns.rolling(20).std()
    momentum_20d = series.pct_change(20)

    regime = pd.Series(index=series.index, dtype="object")
    high_vol_mask = volatility_20d > high_vol_threshold
    regime.loc[high_vol_mask] = "volatile"
    regime.loc[~high_vol_mask & (momentum_20d >= 0)] = "bull"
    regime.loc[~high_vol_mask & (momentum_20d < 0)] = "bear"
    regime = regime.fillna("unknown")

    current_regime = regime.iloc[-1]
    days_in_regime = int((regime.iloc[::-1] == current_regime).cumprod().sum())

    transitions = pd.DataFrame({"prev": regime.shift(1), "curr": regime}).dropna()
    current_rows = transitions[transitions["prev"] == current_regime]
    if current_rows.empty:
        transition_probability = 0.0
    else:
        changed = (current_rows["curr"] != current_rows["prev"]).mean()
        transition_probability = float(changed)

    history = pd.DataFrame(
        {
            "date": series.index,
            "regime": regime.values,
            "volatility_20d": volatility_20d.values,
            "momentum_20d": momentum_20d.values,
        }
    ).dropna(subset=["date"])

    return {
        "current_regime": str(current_regime),
        "days_in_regime": days_in_regime,
        "transition_probability": transition_probability,
        "volatility_20d": float(volatility_20d.iloc[-1]) if not np.isnan(volatility_20d.iloc[-1]) else float("nan"),
        "momentum_20d": float(momentum_20d.iloc[-1]) if not np.isnan(momentum_20d.iloc[-1]) else float("nan"),
        "history": history,
    }

