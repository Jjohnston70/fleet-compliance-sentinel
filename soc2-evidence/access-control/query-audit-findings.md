# Parameterized Query Audit Findings

Scope reviewed:
- `src/lib/chief-data.ts`
- `src/app/api/chief/*` route handlers

## Findings

| File | Query Description | Status |
|---|---|---|
| `src/lib/chief-data.ts` | Load collection rows for org (`SELECT data FROM chief_records WHERE collection = ${collection} AND org_id = ${orgId} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/chief-data.ts` | Load collection rows (system path) (`SELECT data FROM chief_records WHERE collection = ${collection} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/chief-data.ts` | Import stats for org (`SELECT collection, count(*) FROM chief_records WHERE org_id = ${orgId} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/chief-data.ts` | Import stats (system path) (`SELECT collection, count(*) FROM chief_records WHERE deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/app/api/chief/*` | Direct SQL literals in route files | No direct SQL found; routes call data-layer/db helpers only |

## Unsafe Pattern Check
- Checked for string-built SQL patterns (e.g., `"... '${value}' ..."`): none found in scope.
- No raw concatenated SQL queries found in reviewed files.
