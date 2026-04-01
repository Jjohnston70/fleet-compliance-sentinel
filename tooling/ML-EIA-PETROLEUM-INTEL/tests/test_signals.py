from __future__ import annotations

from pathlib import Path

import pandas as pd

from src.signals.price_alerts import generate_price_alerts


def test_generate_price_alerts_writes_output(tmp_path: Path) -> None:
    spot = pd.DataFrame(
        [
            {"date": "2026-01-01", "product": "Diesel", "value": 3.0},
            {"date": "2026-01-02", "product": "Diesel", "value": 3.1},
            {"date": "2026-01-05", "product": "Diesel", "value": 3.2},
            {"date": "2026-01-06", "product": "Diesel", "value": 3.3},
            {"date": "2026-01-07", "product": "Diesel", "value": 3.5},
            {"date": "2026-01-08", "product": "Diesel", "value": 3.7},
        ]
    )
    spread_table = pd.DataFrame(
        [
            {"date": "2026-01-01", "product": "Diesel", "spread": 0.05, "spread_30d_avg": 0.05},
            {"date": "2026-01-08", "product": "Diesel", "spread": 0.15, "spread_30d_avg": 0.05},
        ]
    )
    regime_history = pd.DataFrame(
        [
            {"date": "2026-01-07", "regime": "bull"},
            {"date": "2026-01-08", "regime": "bear"},
        ]
    )

    out = tmp_path / "active_alerts.json"
    payload = generate_price_alerts(spot, spread_table, regime_history, output_path=out)
    assert out.exists()
    assert payload["alert_count"] >= 1

