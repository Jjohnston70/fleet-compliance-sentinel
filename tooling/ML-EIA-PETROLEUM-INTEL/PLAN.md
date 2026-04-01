# ML-EIA-PETROLEUM-INTEL Plan (Current State)

**Last Updated:** 2026-03-31

## Scope

Standalone petroleum intelligence module in `tooling/ML-EIA-PETROLEUM-INTEL` with:

- EIA + client data ingest
- Live EIA API updates
- SARIMA forecasting (30/60/90 day)
- Regime/seasonal/strategy/weather analysis
- Alert generation
- Report + JSON export + Penny context
- CDOT traffic sidecar ingest for demand signals

## Status

### Completed

1. Ingest scaffold and loaders (`run_ingest.py`, `src/ingest/*`)
2. EIA API fetch/append with cache (`--api-update`)
3. SARIMA pipeline + metrics (`run_pipeline.py`, `src/models/*`)
4. Analysis and alerts (`src/analysis/*`, `src/signals/*`)
5. Export layer and docs (`export_reports.py`, `src/export/*`, `tools.ts`, `README.md`)
6. Traffic ingest source (`--source traffic_cdot`)

### Audit Status (2026-03-31)

- End-to-end execution validated: ingest (`--all`, `--api-update`, `--source traffic_cdot`), pipeline (`--all`), export (`--format docx`).
- Regression tests passing: `16 passed`.
- Hardening fixes applied during audit:
  1. API append dedup now prefers latest incoming value for same `date/product/source`.
  2. Export/report builders now pick latest forecast per product by `generated_at` (with file timestamp fallback).
  3. Traffic ingest handles missing `AADTDERIV` without failing.

### In Progress / Next

1. Tighten and calibrate regime transition confidence against historical labels
2. Integrate CDOT traffic features into model inputs (AADT, truck %, derivation quality)
3. Add supplier comparison and inventory timing modules
4. Add optional Prophet path for long-horizon seasonal comparison
5. Wire outputs to Sentinel API routes and module-gated UI (next repo phase)

## Data Sources

### EIA files (local)

- `data/eia/PET_PRI_SPT_S1_D.xls`
- `data/eia/PET_PRI_FUT_S1_D.xls`
- `data/eia/PET_PRI_GND_DCUS_SCO_W.xls`
- `data/eia/PET_PRI_GND_DCUS_R40_W.xls`
- `data/eia/standard-errors.xlsx`
- `data/eia/state-coverage.xls`

### Client files (renamed, no legacy naming)

- `data/client/fountain_opis_prices.csv`
- `data/client/client_average_inventory.csv`
- `data/client/weather_colorado_springs.csv`

### Traffic source

- CDOT ArcGIS FeatureServer corridor pull (currently 2022-2024 rows available for configured query)
- Raw files written to `data/traffic/raw/`
- Processed panel written to `data/traffic/processed/traffic_cdot_segment_year.csv`

## Core Commands

```bash
# full ingest
python run_ingest.py --all

# EIA live update
python run_ingest.py --api-update
python run_ingest.py --api-update --force-api

# traffic ingest
python run_ingest.py --source traffic_cdot

# forecasts + analysis + alerts
python run_pipeline.py --all
python run_pipeline.py --product heating_oil --horizon 90

# report/json/context export
python export_reports.py --format docx --period monthly
python export_reports.py --skip-docx
```

## Output Contracts

### Forecast JSON (`output/forecasts/*.json`)

- `product`
- `generated_at`
- `horizon_days`
- `forecast[]` with `date`, `point`, `ci_80_low`, `ci_80_high`, `ci_95_low`, `ci_95_high`
- `metrics` with `mae`, `rmse`, `mape`, `directional_accuracy`, `naive_mape`

### Analysis + Alerts

- `output/reports/analysis_snapshot.json`
- `output/alerts/active_alerts.json`

### API-style exports

- `output/forecasts/api/forecast.json`
- `output/forecasts/api/regime.json`
- `output/forecasts/api/alerts.json`
- `output/forecasts/api/spreads.json`
- `output/forecasts/api/seasonal.json`
- `output/forecasts/api/prices.json`

## Accuracy and Performance Targets

- 30-day heating oil MAPE target: `< 8%` (currently achieved in latest run)
- JSON payload target: `< 50KB` per API-style file (enforced for `forecast.json`)
- Report generation target: `< 30s` on local run
