from __future__ import annotations

from pathlib import Path

from src.ingest import traffic_loader


def test_load_cdot_traffic_with_mocked_query(tmp_path: Path, monkeypatch) -> None:
    sample_rows = [
        {
            "COUNTSTATIONID": "100972",
            "ROUTE": "025A",
            "REFPT": 148.8,
            "ENDREFPT": 150.3,
            "AADT": 140000,
            "AADTTRUCKS": 9300,
            "AADTCOMB": 5500,
            "AADTSINGLE": 3800,
            "AADTYR": "2024",
            "AADTDERIV": "0",
            "SEASONALGROUPID": "5",
            "DHV": 9800,
            "VCRATIO": 0.72,
        }
    ]

    monkeypatch.setattr(traffic_loader, "_query_layer", lambda layer_id, where_clause: sample_rows)
    frame, warnings = traffic_loader.load_cdot_traffic(path=tmp_path, years=[2024])

    assert len(warnings) == 0
    assert len(frame) == 1
    assert frame.loc[0, "station_id"] == "100972"
    assert frame.loc[0, "route"] == "025A"
    assert frame.loc[0, "truck_volume"] == 9300
    assert frame.loc[0, "truck_pct"] > 0
    assert (tmp_path / "cdot_traffic_corridors_2024.csv").exists()


def test_load_cdot_traffic_handles_missing_deriv_field(tmp_path: Path, monkeypatch) -> None:
    sample_rows = [
        {
            "COUNTSTATIONID": "100972",
            "ROUTE": "025A",
            "REFPT": 148.8,
            "ENDREFPT": 150.3,
            "AADT": 140000,
            "AADTTRUCKS": 9300,
            "AADTCOMB": 5500,
            "AADTSINGLE": 3800,
            "AADTYR": "2024",
            # AADTDERIV intentionally missing
            "SEASONALGROUPID": "5",
            "DHV": 9800,
            "VCRATIO": 0.72,
        }
    ]

    monkeypatch.setattr(traffic_loader, "_query_layer", lambda layer_id, where_clause: sample_rows)
    frame, warnings = traffic_loader.load_cdot_traffic(path=tmp_path, years=[2024])

    assert len(warnings) == 0
    assert len(frame) == 1
    assert frame.loc[0, "deriv_code"] == ""
