# Developer Manual - ML-EIA-PETROLEUM-INTEL

**Last Updated:** 2026-03-31

## 1) Scope

Standalone Python forecasting module for petroleum market intelligence. This module is build-first in `tooling/` and integration-ready for Sentinel API/UI wiring.

## 2) Repo Structure

```text
ML-EIA-PETROLEUM-INTEL/
  data/
    eia/
    client/
    processed/
    traffic/
  output/
    forecasts/
    alerts/
    reports/
  src/
    ingest/
    models/
    analysis/
    signals/
    export/
  tests/
  run_ingest.py
  run_pipeline.py
  export_reports.py
  tools.ts
```

## 3) Runtime Flow

1. `run_ingest.py`
2. `run_pipeline.py`
3. `export_reports.py`

### Ingest

- Local loaders normalize source files to long-form processed CSVs.
- `--api-update` appends latest EIA API rows with dedup and daily cache.
- `traffic_cdot` ingests CDOT ArcGIS corridor data into raw + processed outputs.

### Forecasting and Analysis

- SARIMA model runs by product and horizon (30/60/90).
- Metrics emitted: MAE, RMSE, MAPE, directional accuracy, naive MAPE.
- Analysis bundle emits regime, seasonal, strategy, and weather summaries.
- Signals layer emits active price/spread alerts.

### Export

- Generates executive `.docx` summary.
- Produces API-style JSON payloads.
- Produces Penny context text file.

## 4) Environment

Required:

- Python 3.11+
- `pip install -r requirements.txt`
- `.env` with `EIA_API_KEY`

## 5) Dev Commands

```bash
# full ingest
python run_ingest.py --all

# live EIA append
python run_ingest.py --api-update

# traffic-only ingest
python run_ingest.py --source traffic_cdot

# full forecast pipeline
python run_pipeline.py --all

# export docs and API payloads
python export_reports.py --format docx --period monthly
```

## 6) Tests and Validation

```bash
python -m pytest tests -q
```

Minimum validation before merging docs/code changes:

1. Ingest runs clean (`--all` and `--api-update`)
2. Pipeline runs clean (`--all`)
3. Exports run clean (`--skip-docx` at minimum)
4. Tests pass

## 7) Extension Patterns

### Add a new ingest source

1. Add source metadata in `config.py`.
2. Implement parser/loader in `src/ingest/`.
3. Register source in `run_ingest.py`.
4. Add tests in `tests/test_ingest.py` or a dedicated test file.

### Add a new model output

1. Add/extend logic in `src/models/` or `src/analysis/`.
2. Wire output generation in `run_pipeline.py`.
3. Export via `src/export/json_exporter.py` if API payload is needed.
4. Add regression tests.

### Add a new tool contract

1. Add schema and docs in `tools.ts`.
2. Ensure output files contain required fields.
3. Keep payload sizes bounded for UI/API use.

## 8) Integration Notes (Next Repo Phase)

- Module-gate as `petroleum-intel` in Sentinel.
- Serve `output/forecasts/api/*.json` via Next.js API routes or load into Neon.
- Keep market-wide data shared; keep client-specific OPIS/inventory data org-scoped.

## 9) Audit Baseline

- Latest full execution audit: `AUDIT-REPORT-2026-03-31.md`
- Current regression status from that audit: `16 passed`
