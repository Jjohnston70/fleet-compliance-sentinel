# Module Environment Matrix (Phase 1)

Date captured: 2026-03-31

## Environment Variables and Secrets

| Module | Required secrets | Optional env vars | Source references |
| --- | --- | --- | --- |
| `ML-EIA-PETROLEUM-INTEL` | `EIA_API_KEY` (required only for `--api-update`) | None currently | `tooling/ML-EIA-PETROLEUM-INTEL/config.py`, `.env.example`, `run_ingest.py` |
| `ML-SIGNAL-STACK-TNCC` | None | None | No env lookups found in module code (`run_pipeline.py`, `config.py`, helpers) |
| `MOD-PAPERSTACK-PP` | None | None | No env lookups found in launcher or shared config |
| `command-center` | None | `MODULES_BASE_PATH`, `AUTO_DISCOVERY_ENABLED`, `HEALTH_CHECK_INTERVAL_MS`, `DEFAULT_TIMEOUT_MS` | `tooling/command-center/.env.example`, `src/config/index.ts` |

## External Runtime Dependencies

| Module | Runtime | Required packages/tools | Notes |
| --- | --- | --- | --- |
| `ML-EIA-PETROLEUM-INTEL` | Python | `requirements.txt` stack (pandas, statsmodels, python-docx, requests, pytest, etc.) | EIA live pull path requires outbound API access + valid `EIA_API_KEY` |
| `ML-SIGNAL-STACK-TNCC` | Python | `requirements.txt` stack (pandas, statsmodels, scikit-learn, matplotlib, openpyxl, etc.) | Source files must exist under `data/raw/<source>/` |
| `MOD-PAPERSTACK-PP` | Python + Node | Python libs from `requirements.txt`, Node `docx`, external `Poppler` (`pdftoppm`) and `Tesseract` for inspectors | `paperstack.py check` passed on this workstation |
| `command-center` | Node/TypeScript | `npm` deps (`zod`, `vitest`, `typescript`) | Uses in-memory registry and static manifest by default |

## Gateway Secret Handling Rules (Locked for Implementation)

1. Gateway must never return raw secret values in API responses, logs, or UI previews.
2. Gateway should preflight required env for each action and fail fast with structured `MISSING_ENV` errors.
3. `EIA_API_KEY` should be validated only for ML-EIA actions that hit API update paths (not for local ingest/pipeline/report actions).
4. For `command-center`, env values should be read server-side only and surfaced as resolved booleans/status in diagnostics (never full raw values).
5. PaperStack external dependency checks (`poppler`, `tesseract`) should be treated as capability checks and returned as actionable diagnostics.

## Current Blocked/Brittle Points

1. `ML-SIGNAL-STACK-TNCC` has no test-suite signal in CI-compatible form.
2. `MOD-PAPERSTACK-PP` includes both Python and Node assets; current `start-module.ps1` module-type heuristic chooses Node first and bypasses Python test flow.
3. `command-center` `MODULES_BASE_PATH` default points to a non-repo path; this is safe today because discovery uses static manifest, but should be made explicit in gateway diagnostics.
