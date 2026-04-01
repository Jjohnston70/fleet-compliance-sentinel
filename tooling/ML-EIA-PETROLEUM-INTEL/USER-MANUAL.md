# User Manual - ML-EIA-PETROLEUM-INTEL

**Last Updated:** 2026-03-31

## Purpose

This module produces petroleum market forecasts, pricing strategy insights, and alerts from EIA + client datasets.

## 1) Setup

```bash
cd tooling/ML-EIA-PETROLEUM-INTEL
python -m pip install -r requirements.txt
```

Create `.env`:

```bash
EIA_API_KEY=your_eia_api_key
```

## 2) Daily Workflow

### Step A - Refresh data

```bash
python run_ingest.py --all
python run_ingest.py --api-update
```

### Step B - Run forecasts + analytics

```bash
python run_pipeline.py --all
```

### Step C - Export deliverables

```bash
python export_reports.py --format docx --period monthly
```

## 3) Key Outputs

- Forecast files: `output/forecasts/*.json`
- Active alerts: `output/alerts/active_alerts.json`
- Analysis snapshot: `output/reports/analysis_snapshot.json`
- Executive report: `output/reports/petroleum_executive_summary_YYYYMMDD.docx`
- Penny context: `output/reports/penny_context_latest.txt`
- API payloads: `output/forecasts/api/*.json`

## 4) Common Commands

Single-source ingest:

```bash
python run_ingest.py --source spot_prices
python run_ingest.py --source traffic_cdot
```

Single-product forecast:

```bash
python run_pipeline.py --product heating_oil --horizon 90
```

Fast JSON/context export (skip Word doc):

```bash
python export_reports.py --skip-docx
```

## 5) Reading Results

- `mape`: lower is better (target for 30-day heating oil is < 8%)
- `directional_accuracy`: percentage of correctly predicted up/down direction
- `regime`: `bull`, `bear`, or `volatile`
- `overall_recommendation`: `opis_plus` or `cost_plus`

## 6) Troubleshooting

- Missing API key:
  - Ensure `.env` has `EIA_API_KEY`
- No new API rows:
  - Re-run with `--force-api`
- No traffic rows:
  - Re-run `python run_ingest.py --source traffic_cdot`
- Word report issue:
  - Run `python export_reports.py --skip-docx` and verify `python-docx` and `matplotlib` installs
