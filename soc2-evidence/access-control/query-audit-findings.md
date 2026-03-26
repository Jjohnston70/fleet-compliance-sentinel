# Parameterized Query Audit Findings

Scope reviewed:
- `src/lib/fleet-compliance-data.ts`
- `src/app/api/fleet-compliance/*` route handlers

## Findings

| File | Query Description | Status |
|---|---|---|
| `src/lib/fleet-compliance-data.ts` | Load collection rows for org (`SELECT data FROM fleet_compliance_records WHERE collection = ${collection} AND org_id = ${orgId} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/fleet-compliance-data.ts` | Load collection rows (system path) (`SELECT data FROM fleet_compliance_records WHERE collection = ${collection} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/fleet-compliance-data.ts` | Import stats for org (`SELECT collection, count(*) FROM fleet_compliance_records WHERE org_id = ${orgId} AND deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/lib/fleet-compliance-data.ts` | Import stats (system path) (`SELECT collection, count(*) FROM fleet_compliance_records WHERE deleted_at IS NULL ...`) | Safe (tagged template parameterization) |
| `src/app/api/fleet-compliance/*` | Direct SQL literals in route files | No direct SQL found; routes call data-layer/db helpers only |

## Unsafe Pattern Check
- Checked for string-built SQL patterns (e.g., `"... '${value}' ..."`): none found in scope.
- No raw concatenated SQL queries found in reviewed files.
