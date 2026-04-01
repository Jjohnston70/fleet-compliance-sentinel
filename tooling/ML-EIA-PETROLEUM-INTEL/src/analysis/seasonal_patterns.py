from __future__ import annotations

import numpy as np
import pandas as pd


def _season_year(dt: pd.Timestamp) -> int:
    return dt.year + 1 if dt.month >= 10 else dt.year


def analyze_heating_oil_seasonality(price_series: pd.Series) -> dict[str, object]:
    series = pd.Series(price_series).dropna().astype(float).sort_index()
    if series.empty:
        return {
            "current_season_year": None,
            "current_season_avg": float("nan"),
            "last_5_season_avg": float("nan"),
            "yoy_delta_pct": float("nan"),
            "peak_demand_week": None,
            "confidence": "low",
            "season_table": [],
        }

    df = pd.DataFrame({"price": series})
    df["date"] = df.index
    df["month"] = df["date"].dt.month
    df["is_heating_season"] = df["month"].isin([10, 11, 12, 1, 2, 3])
    df["season_year"] = df["date"].map(_season_year)

    heating = df[df["is_heating_season"]].copy()
    if heating.empty:
        return {
            "current_season_year": None,
            "current_season_avg": float("nan"),
            "last_5_season_avg": float("nan"),
            "yoy_delta_pct": float("nan"),
            "peak_demand_week": None,
            "confidence": "low",
            "season_table": [],
        }

    season_table = (
        heating.groupby("season_year", as_index=False)["price"]
        .mean()
        .rename(columns={"price": "avg_price"})
        .sort_values("season_year")
    )
    current_season_year = int(season_table["season_year"].max())
    current_avg = float(season_table.loc[season_table["season_year"] == current_season_year, "avg_price"].iloc[0])

    prior = season_table[season_table["season_year"] < current_season_year].tail(5)
    last_5_avg = float(prior["avg_price"].mean()) if not prior.empty else float("nan")
    yoy_delta_pct = (
        float((current_avg - last_5_avg) / last_5_avg * 100.0)
        if np.isfinite(last_5_avg) and last_5_avg != 0
        else float("nan")
    )

    weekly = heating.set_index("date")["price"].resample("W-MON").mean().dropna()
    peak_week = None if weekly.empty else str(weekly.idxmax().date())

    n_obs = len(heating)
    confidence = "low" if n_obs < 52 else "medium" if n_obs < 260 else "high"

    return {
        "current_season_year": current_season_year,
        "current_season_avg": current_avg,
        "last_5_season_avg": last_5_avg,
        "yoy_delta_pct": yoy_delta_pct,
        "peak_demand_week": peak_week,
        "confidence": confidence,
        "season_table": season_table.to_dict(orient="records"),
    }

