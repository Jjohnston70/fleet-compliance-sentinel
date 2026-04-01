from __future__ import annotations

import json
from pathlib import Path

import pandas as pd

from src.export.json_exporter import export_api_payloads
from src.export.penny_context import build_penny_context
from src.export.report_generator import _latest_forecasts as latest_report_forecasts


def test_export_api_payloads_and_penny_context(tmp_path: Path) -> None:
    output_dir = tmp_path / "output"
    processed_dir = tmp_path / "processed"
    (output_dir / "forecasts").mkdir(parents=True, exist_ok=True)
    (output_dir / "reports").mkdir(parents=True, exist_ok=True)
    (output_dir / "alerts").mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    forecast_payload = {
        "product": "New York Harbor No. 2 Heating Oil Spot Price FOB",
        "generated_at": "2026-03-31T00:00:00Z",
        "horizon_days": [30, 60, 90],
        "forecast": [{"date": "2026-04-01", "point": 4.0}],
        "metrics": {"mape": 3.0},
    }
    (output_dir / "forecasts" / "heating_oil_20260331.json").write_text(
        json.dumps(forecast_payload), encoding="utf-8"
    )
    (output_dir / "reports" / "analysis_snapshot.json").write_text(
        json.dumps({"regime": {"current_regime": "bull"}, "pricing_strategy": {"overall_recommendation": "opis_plus"}}),
        encoding="utf-8",
    )
    (output_dir / "alerts" / "active_alerts.json").write_text(
        json.dumps({"alert_count": 1, "alerts": [{"severity": "medium", "message": "Test alert"}]}),
        encoding="utf-8",
    )

    prices = pd.DataFrame(
        [{"date": "2026-03-31", "product": "X", "value": 1.23, "source": "test"}]
    )
    prices.to_csv(processed_dir / "spot_prices_daily.csv", index=False)

    paths = export_api_payloads(output_dir=output_dir, processed_dir=processed_dir)
    assert all(p.exists() for p in paths.values())

    context = build_penny_context(output_dir=output_dir, processed_dir=processed_dir, max_chars=2000)
    assert "Petroleum Market Intelligence Context" in context
    assert "Active Alerts" in context


def test_export_uses_latest_forecast_per_product(tmp_path: Path) -> None:
    output_dir = tmp_path / "output"
    processed_dir = tmp_path / "processed"
    (output_dir / "forecasts").mkdir(parents=True, exist_ok=True)
    (output_dir / "reports").mkdir(parents=True, exist_ok=True)
    (output_dir / "alerts").mkdir(parents=True, exist_ok=True)
    processed_dir.mkdir(parents=True, exist_ok=True)

    older = {
        "product": "New York Harbor No. 2 Heating Oil Spot Price FOB",
        "generated_at": "2026-03-30T00:00:00Z",
        "horizon_days": 30,
        "forecast": [{"date": "2026-04-01", "point": 1.0}],
        "metrics": {"mape": 9.9},
    }
    newer = {
        "product": "New York Harbor No. 2 Heating Oil Spot Price FOB",
        "generated_at": "2026-03-31T00:00:00Z",
        "horizon_days": 30,
        "forecast": [{"date": "2026-04-01", "point": 2.0}],
        "metrics": {"mape": 3.3},
    }
    # Filenames intentionally out of chronological order to ensure payload timestamps drive selection.
    (output_dir / "forecasts" / "heating_oil_z_old.json").write_text(json.dumps(older), encoding="utf-8")
    (output_dir / "forecasts" / "heating_oil_a_new.json").write_text(json.dumps(newer), encoding="utf-8")
    (output_dir / "reports" / "analysis_snapshot.json").write_text(json.dumps({}), encoding="utf-8")
    (output_dir / "alerts" / "active_alerts.json").write_text(
        json.dumps({"alert_count": 0, "alerts": []}),
        encoding="utf-8",
    )
    pd.DataFrame([{"date": "2026-03-31", "product": "X", "value": 1.0, "source": "test"}]).to_csv(
        processed_dir / "spot_prices_daily.csv",
        index=False,
    )

    paths = export_api_payloads(output_dir=output_dir, processed_dir=processed_dir)
    forecast_api = json.loads(paths["forecast"].read_text(encoding="utf-8"))
    selected = forecast_api["products"]["New York Harbor No. 2 Heating Oil Spot Price FOB"]
    assert selected["metrics"]["mape"] == 3.3

    report_payloads = latest_report_forecasts(output_dir / "forecasts")
    assert len(report_payloads) == 1
    assert report_payloads[0]["metrics"]["mape"] == 3.3
