from __future__ import annotations

from datetime import datetime, timezone
import json
from pathlib import Path

import pandas as pd


def _weekly_move_alerts(spot_df: pd.DataFrame, threshold_pct: float = 5.0) -> list[dict[str, object]]:
    alerts: list[dict[str, object]] = []
    work = spot_df.copy()
    work["date"] = pd.to_datetime(work["date"], errors="coerce")
    work["value"] = pd.to_numeric(work["value"], errors="coerce")
    work = work.dropna(subset=["date", "product", "value"]).sort_values(["product", "date"])

    for product, group in work.groupby("product"):
        if len(group) < 6:
            continue
        latest = group.iloc[-1]
        prior = group.iloc[-6]
        if prior["value"] == 0:
            continue
        change_pct = (latest["value"] - prior["value"]) / prior["value"] * 100.0
        if abs(change_pct) >= threshold_pct:
            alerts.append(
                {
                    "type": "weekly_move",
                    "product": product,
                    "severity": "high" if abs(change_pct) >= 8 else "medium",
                    "message": f"{product} moved {change_pct:.2f}% over the last week.",
                    "value": float(change_pct),
                    "date": str(latest["date"].date()),
                }
            )
    return alerts


def _spread_alerts(spread_table: pd.DataFrame, threshold_pct: float = 10.0) -> list[dict[str, object]]:
    alerts: list[dict[str, object]] = []
    if spread_table is None or spread_table.empty:
        return alerts

    table = spread_table.copy().dropna(subset=["date", "product", "spread", "spread_30d_avg"])
    table["date"] = pd.to_datetime(table["date"], errors="coerce")
    table = table.sort_values(["product", "date"])

    for product, group in table.groupby("product"):
        latest = group.iloc[-1]
        baseline = latest["spread_30d_avg"]
        if baseline == 0:
            continue
        deviation_pct = (latest["spread"] - baseline) / abs(baseline) * 100.0
        if abs(deviation_pct) >= threshold_pct:
            alerts.append(
                {
                    "type": "spread_deviation",
                    "product": product,
                    "severity": "high" if abs(deviation_pct) >= 20 else "medium",
                    "message": f"{product} spread deviated {deviation_pct:.2f}% vs 30-day average.",
                    "value": float(deviation_pct),
                    "date": str(latest["date"].date()),
                }
            )
    return alerts


def _regime_alert(regime_history: pd.DataFrame) -> list[dict[str, object]]:
    if regime_history is None or len(regime_history) < 2:
        return []
    history = regime_history.copy()
    history["date"] = pd.to_datetime(history["date"], errors="coerce")
    history = history.sort_values("date")
    prev_regime = history.iloc[-2]["regime"]
    curr_regime = history.iloc[-1]["regime"]
    if prev_regime == curr_regime:
        return []
    return [
        {
            "type": "regime_transition",
            "product": "market",
            "severity": "high",
            "message": f"Market regime changed from {prev_regime} to {curr_regime}.",
            "value": 1.0,
            "date": str(pd.to_datetime(history.iloc[-1]["date"]).date()),
        }
    ]


def generate_price_alerts(
    spot_df: pd.DataFrame,
    spread_table: pd.DataFrame | None,
    regime_history: pd.DataFrame | None,
    output_path: Path,
) -> dict[str, object]:
    alerts = [
        *_weekly_move_alerts(spot_df, threshold_pct=5.0),
        *_spread_alerts(spread_table, threshold_pct=10.0),
        *_regime_alert(regime_history),
    ]

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "alert_count": len(alerts),
        "alerts": alerts,
    }
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return payload

