# ML Module Gateway Runbook (Phase 3)

Date: 2026-03-31
Scope: Gateway invocation for `ML-EIA-PETROLEUM-INTEL` and `ML-SIGNAL-STACK-TNCC`

## Preconditions

1. Start app API locally (`npm run dev`) or use deployed environment.
2. Authenticate as Fleet Compliance org admin (module endpoints are admin-protected).
3. Install Python dependencies per module:

```bash
cd tooling/ML-EIA-PETROLEUM-INTEL && python -m pip install -r requirements.txt
cd tooling/ML-SIGNAL-STACK-TNCC && python -m pip install -r requirements.txt
```

## ML-EIA Actions

| Action ID | Purpose | Args |
| --- | --- | --- |
| `ingest.all` | Ingest all configured datasets | `apiUpdate?: boolean`, `forceApi?: boolean` |
| `ingest.source` | Ingest one configured dataset | `source: spot_prices|futures|colorado_retail|rocky_mountain_retail|residential_standard_errors|fountain_opis_prices|client_average_inventory|weather_colorado_springs|traffic_cdot`, `apiUpdate?: boolean`, `forceApi?: boolean` |
| `ingest.api_update` | Pull latest EIA API deltas | `forceApi?: boolean` |
| `pipeline.product` | Run forecast for one petroleum product | `product: crude|diesel|gasoline|heating_oil`, `horizon?: 30|60|90`, `trainYears?: number(1..20)` |
| `pipeline.all` | Run forecast for all products | `horizon?: 30|60|90`, `trainYears?: number(1..20)` |
| `export.report` | Generate docx + JSON/context exports | `period?: string` |
| `export.skip_docx` | Generate JSON/context only | none |
| `export.json_only` | Alias for JSON/context export | none |

## ML-SIGNAL Actions

| Action ID | Purpose | Args |
| --- | --- | --- |
| `export.csv` | Export source workbook(s) to CSV | `source?: sales|ops_pulse|cash_flow_compass|pipeline_pulse|team_tempo|all`, `skipRootFix?: boolean` |
| `export.csv_all` | Export all workbook sources | `skipRootFix?: boolean` |
| `export.csv_source` | Export one workbook source | `source: sales|ops_pulse|cash_flow_compass|pipeline_pulse|team_tempo`, `skipRootFix?: boolean` |
| `pipeline.source` | Run pipeline for one source or `all` | `source: sales|ops_pulse|cash_flow_compass|pipeline_pulse|team_tempo|all`, `skipSearch?: boolean` |
| `pipeline.all` | Run pipeline for all sources | `skipSearch?: boolean` |
| `report.generate` | Build SignalStack DOCX report | `source?: sales|ops_pulse|cash_flow_compass|pipeline_pulse|team_tempo|all`, `out?: string` |
| `package.output` | Build delivery ZIP package | `source?: sales|ops_pulse|cash_flow_compass|pipeline_pulse|team_tempo|all`, `noCode?: boolean`, `outDir?: string` |

## Example API Payloads

Run ML-EIA product pipeline:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-EIA-PETROLEUM-INTEL",
    "actionId": "pipeline.product",
    "args": {
      "product": "diesel",
      "horizon": 30,
      "trainYears": 10
    },
    "timeoutMs": 600000,
    "correlationId": "ml-eia-pipeline-diesel-01"
  }'
```

Run ML-SIGNAL full pipeline:

```bash
curl -X POST "http://localhost:3000/api/modules/run" \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=<clerk-session-token>" \
  -d '{
    "moduleId": "ML-SIGNAL-STACK-TNCC",
    "actionId": "pipeline.all",
    "args": {
      "skipSearch": true
    },
    "timeoutMs": 900000,
    "correlationId": "ml-signal-all-01"
  }'
```

Poll status:

```bash
curl -X GET "http://localhost:3000/api/modules/status/<run_id>" \
  -H "Cookie: __session=<clerk-session-token>"
```

## Troubleshooting

1. Missing Python dependencies (`ModuleNotFoundError`):
   - Reinstall module dependencies with `python -m pip install -r requirements.txt` in target module directory.
2. Missing EIA API key for `ingest.api_update`:
   - Set `EIA_API_KEY` in `tooling/ML-EIA-PETROLEUM-INTEL/.env`.
3. Missing source input files:
   - ML-EIA ingest expects specific files under `tooling/ML-EIA-PETROLEUM-INTEL/data/`.
   - ML-SIGNAL expects workbook files at module root before CSV export.
4. Timeout failures (`EXEC_TIMEOUT`):
   - Increase `timeoutMs` in request up to gateway max of `900000` ms.
   - Prefer `skipSearch: true` for ML-SIGNAL routine runs.
5. Validation errors (`VALIDATION_ERROR`):
   - Check action-specific enums in `/api/modules/catalog` and send only allowlisted keys.
6. Package output fails with Desktop path errors in Linux containers:
   - `package.output` now defaults to `tooling/ML-SIGNAL-STACK-TNCC/reports/deliveries` when `~/Desktop` is unavailable.
   - Optionally pass `args.outDir` for an explicit destination.
7. Report/package files are not visible on your laptop after cloud runs:
   - Runs triggered from deployed app execute on Railway, not your local machine.
   - Check run details `Artifacts` list and `Output Preview` path lines for generated file locations.

## Operational Notes

- Gateway run records include exact executable/args and return code.
- `dryRun: true` can validate payload + command resolution without running the module.
- For deterministic operations, keep `correlationId` unique per request from callers.
