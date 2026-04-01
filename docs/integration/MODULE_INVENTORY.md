# Module Inventory - Phase 1 Preflight Lock

Date locked: 2026-03-31
Scope: `ML-EIA-PETROLEUM-INTEL`, `ML-SIGNAL-STACK-TNCC`, `MOD-PAPERSTACK-PP`, `command-center`

## Baseline Verification Summary

| Module | Runtime | Verification command(s) | Result |
|---|---|---|---|
| `ML-EIA-PETROLEUM-INTEL` | Python | `.\scripts\start-module.ps1 -Module ML-EIA-PETROLEUM-INTEL -Action test` | PASS (16/16) |
| `ML-SIGNAL-STACK-TNCC` | Python | `python export_to_csv.py --source sales --skip-root-fix`; `python run_pipeline.py --source sales --skip-search` | PASS (smoke run) |
| `MOD-PAPERSTACK-PP` | Python + Node dep | `python -m pytest tests -q`; `python -m pytest invoice-module/tests -q` | PASS (24 + 24) |
| `command-center` | Node/TypeScript | `.\scripts\start-module.ps1 -Module command-center -Action test` | PASS (31/31) |

## Module Command Matrix (Known Good vs Documented)

### ML-EIA-PETROLEUM-INTEL (`tooling/ML-EIA-PETROLEUM-INTEL`)
- Verified:
  - `python -m pytest tests -q`
- Documented entrypoints:
  - `python run_ingest.py --all`
  - `python run_ingest.py --source spot_prices`
  - `python run_ingest.py --api-update` (requires `EIA_API_KEY`)
  - `python run_pipeline.py --all`
  - `python run_pipeline.py --product heating_oil --horizon 90`
  - `python export_reports.py --format docx --period monthly`
  - `python export_reports.py --skip-docx`

### ML-SIGNAL-STACK-TNCC (`tooling/ML-SIGNAL-STACK-TNCC`)
- Verified:
  - `python export_to_csv.py --source sales --skip-root-fix`
  - `python run_pipeline.py --source sales --skip-search`
- Documented entrypoints:
  - `python export_to_csv.py --source all`
  - `python run_pipeline.py --source all`
  - `python generate_report.py`
  - `python package_output.py`
- Tests:
  - No `tests/` directory currently present. Baseline is smoke-test only.

### MOD-PAPERSTACK-PP (`tooling/MOD-PAPERSTACK-PP`)
- Verified:
  - `python -m pytest tests -q`
  - `python -m pytest invoice-module/tests -q`
- Documented launcher actions:
  - `python paperstack.py list`
  - `python paperstack.py check`
  - `python paperstack.py generate pdf`
  - `python paperstack.py generate docx`
  - `python paperstack.py convert <file.md> [--dark] [--open]`
  - `python paperstack.py reverse <file.docx> [--python] [--pdf]`
  - `python paperstack.py inspect <file.pdf> [--port 5000]`
  - `python paperstack.py scan <file.pdf> [--dpi 300] [--force-ocr] [--port 5000]`

### command-center (`tooling/command-center`)
- Verified:
  - `npm run test` (via `.\scripts\start-module.ps1 -Module command-center -Action test`)
- Documented entrypoints:
  - `npm install`
  - `npm run build`
  - `npm run typecheck`
  - `initializeCommandCenter()` in `src/tools.ts`
  - meta-tool handlers in `src/api/handlers.ts`

## Phase 1 Blocked or Risky Items

1. `ML-SIGNAL-STACK-TNCC` has no automated test suite (`tests/` missing), so baseline is smoke-test only.
2. `MOD-PAPERSTACK-PP` includes both `package.json` and Python tests; `scripts/start-module.ps1` currently routes this module as Node first and cannot run its Python tests without explicit direct Python commands.
3. `command-center` discovery/routing is currently stubbed around static manifest + delegated execution messaging (no real downstream module execution bridge yet), so Phase 5 must provide the real adapter bridge.

## Source References

- `scripts/start-module.ps1`
- `tooling/ML-EIA-PETROLEUM-INTEL/README.md`
- `tooling/ML-EIA-PETROLEUM-INTEL/run_ingest.py`
- `tooling/ML-EIA-PETROLEUM-INTEL/run_pipeline.py`
- `tooling/ML-EIA-PETROLEUM-INTEL/export_reports.py`
- `tooling/ML-SIGNAL-STACK-TNCC/README.md`
- `tooling/ML-SIGNAL-STACK-TNCC/export_to_csv.py`
- `tooling/ML-SIGNAL-STACK-TNCC/run_pipeline.py`
- `tooling/MOD-PAPERSTACK-PP/README.md`
- `tooling/MOD-PAPERSTACK-PP/paperstack.py`
- `tooling/command-center/README.md`
- `tooling/command-center/src/tools.ts`
- `tooling/command-center/src/api/handlers.ts`
