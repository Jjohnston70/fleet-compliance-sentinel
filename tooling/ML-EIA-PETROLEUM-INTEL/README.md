# ML-EIA-PETROLEUM-INTEL

Standalone Python module for petroleum market intelligence.

## What It Does

- Ingests EIA petroleum datasets and client pricing/weather datasets
- Appends live EIA API updates without duplicates
- Runs SARIMA forecasts (30/60/90 day)
- Computes market regime, seasonal patterns, spread strategy, and weather correlation
- Generates active price/spread alerts
- Exports executive report artifacts and Penny context

## Data Layout

- `data/eia/` EIA Excel files
- `data/client/` client pricing/weather CSV files
- `data/processed/` normalized long-format outputs (`date, product, value, source`)
- `data/traffic/raw/` raw CDOT pulls
- `data/traffic/processed/` normalized corridor traffic panel
- `output/forecasts/` model JSON outputs
- `output/alerts/active_alerts.json` current alert state
- `output/reports/analysis_snapshot.json` analysis summary

## Setup

```bash
cd tooling/ML-EIA-PETROLEUM-INTEL
python -m pip install -r requirements.txt
```

Create `.env`:

```bash
EIA_API_KEY=your_eia_api_key
```

## Commands

Ingest local files:

```bash
python run_ingest.py --all
python run_ingest.py --source spot_prices
python run_ingest.py --source traffic_cdot
```

Update from EIA API:

```bash
python run_ingest.py --api-update
python run_ingest.py --api-update --force-api
```

Run forecasts:

```bash
python run_pipeline.py --all
python run_pipeline.py --product heating_oil --horizon 90
```

Export reports/json/context:

```bash
python export_reports.py --format docx --period monthly
python export_reports.py --skip-docx
```

## Key Outputs

- Forecast JSON structure:
  - `product`
  - `generated_at`
  - `horizon_days`
  - `forecast[]` (`date`, `point`, `ci_80_low`, `ci_80_high`, `ci_95_low`, `ci_95_high`)
  - `metrics` (`mae`, `rmse`, `mape`, `directional_accuracy`, `naive_mape`)

- Analysis snapshot includes:
  - market regime
  - seasonal outlook
  - pricing strategy recommendation
  - weather correlation summary
  - alert counts

## Tests

```bash
python -m pytest tests -q
```

## Documentation

- `PLAN.md` current implementation/status plan
- `MASTER-TODO.md` cross-phase execution backlog
- `USER-MANUAL.md` operator workflow guide
- `DEV-MANUAL.md` developer implementation guide
- `PETROLEUM-DATA-MIGRATION.md` current migration baseline and decisions
- `AUDIT-REPORT-2026-03-31.md` execution audit + bug-fix record (Phase 1 through Task 2.0 boundary)
