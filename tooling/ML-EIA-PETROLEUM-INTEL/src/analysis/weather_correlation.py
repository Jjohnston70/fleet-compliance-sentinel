from __future__ import annotations

import numpy as np
import pandas as pd


def analyze_weather_correlation(weather_df: pd.DataFrame, heating_oil_series: pd.Series) -> dict[str, object]:
    temp = weather_df.copy()
    temp["date"] = pd.to_datetime(temp["date"], errors="coerce")
    temp["value"] = pd.to_numeric(temp["value"], errors="coerce")
    temp = temp[temp["product"] == "Temperature F"].dropna(subset=["date", "value"])
    temp = temp[["date", "value"]].rename(columns={"value": "temperature_f"}).drop_duplicates("date")

    prices = pd.DataFrame({"date": pd.to_datetime(heating_oil_series.index), "heating_oil_price": heating_oil_series.values})
    prices = prices.dropna(subset=["date", "heating_oil_price"])
    prices = prices.drop_duplicates("date")

    joined = prices.merge(temp, on="date", how="inner").sort_values("date")
    if joined.empty:
        return {
            "rows_used": 0,
            "correlation": float("nan"),
            "regression_slope": float("nan"),
            "cold_snap_price_impact_pct": float("nan"),
            "confidence": "low",
        }

    correlation = float(joined["temperature_f"].corr(joined["heating_oil_price"]))
    slope = float(np.polyfit(joined["temperature_f"], joined["heating_oil_price"], deg=1)[0]) if len(joined) > 2 else float("nan")

    joined["temp_drop_2d"] = joined["temperature_f"].diff(2)
    joined["price_change_3d_pct"] = joined["heating_oil_price"].pct_change(3) * 100.0
    cold_snap = joined[joined["temp_drop_2d"] <= -15]
    cold_snap_impact = float(cold_snap["price_change_3d_pct"].mean()) if not cold_snap.empty else float("nan")

    n = len(joined)
    confidence = "low" if n < 60 else "medium" if n < 180 else "high"
    return {
        "rows_used": int(n),
        "correlation": correlation,
        "regression_slope": slope,
        "cold_snap_price_impact_pct": cold_snap_impact,
        "confidence": confidence,
    }

