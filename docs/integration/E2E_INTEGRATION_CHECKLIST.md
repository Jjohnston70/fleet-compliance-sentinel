# E2E Integration Checklist (Phase 6)

Date: 2026-03-31  
Scope: Validate end-to-end operator flow from Fleet-Compliance UI to module gateway execution and status reporting.

## Preconditions

1. Deployed build includes Phase 1-6 module gateway changes.
2. Authenticated org-admin session is active.
3. Target environment has module runtime dependencies installed:
   - Python deps for ML-EIA, ML-SIGNAL, PaperStack.
   - Built command-center dist runtime (`tooling/command-center/dist/src/tools.js`).
4. Optional failure alert webhook configured:
   - `MODULE_GATEWAY_FAILURE_WEBHOOK_URL`

## UI Flow Validation (`/fleet-compliance/tools`)

1. Open Fleet-Compliance sidebar and click `Module Tools`.
2. Confirm catalog load succeeds and module/action selectors are populated.
3. Confirm action change updates args default JSON and timeout defaults.
4. Submit dry run for one action and verify:
   - New run appears in `Run History`.
   - Status reaches `success`.
   - Output preview includes dry-run command summary.
5. Submit live run for one action and verify polling:
   - Status transitions `queued` -> `running` -> `success|fail`.
   - Detail panel updates with status, timing, exit code, previews.

## Module Action Coverage

Check at least one action per integrated target:

1. `ML-EIA-PETROLEUM-INTEL`
   - `pipeline.product` (dry run + optional live run)
2. `ML-SIGNAL-STACK-TNCC`
   - `pipeline.all` or `export.csv`
3. `MOD-PAPERSTACK-PP`
   - `list` (safe smoke)
   - Optional: `convert` or `generate.pdf` and verify artifacts appear
4. `command-center`
   - `startup.initialize`
   - `discover.modules`
   - `route.tool_call` with a valid qualified name and parameters object

## API Validation

1. `GET /api/modules/catalog`
   - Returns `ok: true` with all four module IDs.
2. `POST /api/modules/run`
   - Returns `202` for queued live run and `200` for dry run immediate success.
3. `GET /api/modules/status/:id`
   - Returns run record with current status and previews.
4. Auth check:
   - Non-admin org member receives `403` on run endpoints.

## Failure Path Validation

1. Submit intentionally invalid args and confirm `VALIDATION_ERROR`.
2. Trigger one known runtime failure and confirm:
   - Run status is `fail`.
   - `error.code` and `error.message` are populated.
   - Server logs contain `[module-gateway] run failed`.
3. If webhook is configured, confirm failure payload receipt.

## Acceptance Criteria

1. Operator can run and observe module actions from browser UI.
2. Status and output previews are visible without opening server logs.
3. Failure cases are observable through API/UI and alert/log hooks.
4. No Penny route regressions and no Fleet-Compliance auth regressions.
