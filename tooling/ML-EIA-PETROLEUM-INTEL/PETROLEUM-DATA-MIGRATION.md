# Petroleum Data Migration (Current Baseline)

**Last Updated:** 2026-03-31

## Purpose

This document records what data is now considered source-of-truth inside `ML-EIA-PETROLEUM-INTEL` and what legacy files were intentionally not migrated.

## Current Data Layout

### `data/eia/` (market baseline)

- `PET_PRI_SPT_S1_D.xls`
- `PET_PRI_FUT_S1_D.xls`
- `PET_PRI_GND_DCUS_SCO_W.xls`
- `PET_PRI_GND_DCUS_R40_W.xls`
- `standard-errors.xlsx`
- `state-coverage.xls`

### `data/client/` (client operational inputs)

- `fountain_opis_prices.csv` (renamed from legacy OPIS pricing file)
- `client_average_inventory.csv` (renamed from legacy inventory average file)
- `weather_colorado_springs.csv`

### `data/traffic/` (demand sidecar)

- `raw/` yearly ArcGIS pulls from CDOT
- `processed/traffic_cdot_segment_year.csv`

## Migration Decisions

### Completed

1. EIA historical files are loaded from `data/eia/` and normalized by ingest.
2. Client CSVs were copied into `data/client/` with neutral names.
3. Traffic ingestion was added as `traffic_cdot` in `run_ingest.py`.
4. Pipeline outputs now write to `data/processed/` and `output/`.

### Deferred or Removed

1. Separate legacy heating oil OHLC CSV was not kept as a primary source because overlapping coverage exists in the EIA file set.
2. Large supplier-history datasets are deferred to a follow-on supplier comparison module.
3. Legacy SQLite and dashboard-specific artifacts are intentionally excluded from this module.

## Operational Commands

```bash
python run_ingest.py --all
python run_ingest.py --api-update
python run_ingest.py --source traffic_cdot
python run_pipeline.py --all
python export_reports.py --format docx --period monthly
```

## Security and Secrets

- Keep API keys in `.env` only (`EIA_API_KEY` required for live API updates).
- Do not commit plaintext credentials to markdown, scripts, or CSV files.

