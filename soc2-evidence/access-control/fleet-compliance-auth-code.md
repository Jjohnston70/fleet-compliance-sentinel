# Fleet-Compliance Org Access Control Middleware Evidence

## Source File
- `src/lib/fleet-compliance-auth.ts`

## Implemented Controls
- `requireFleetComplianceOrg(request)` calls Clerk `auth()` and enforces:
  - `401 Unauthorized` when `userId` is missing
  - `403 Forbidden` when `orgId` is missing
  - Returns `{ userId, orgId }` from Clerk session context only
- `requireFleetComplianceOrgWithRole(request, requiredRole)` enforces org membership and org-role gate:
  - `member`: authenticated org member
  - `admin`: authenticated org member with org role resolved to admin
- Route handlers use `chiefAuthErrorResponse()` for consistent `401/403` responses.

## Security Notes
- No API handler in `src/app/api/fleet-compliance/*` trusts `org_id` from body, query, params, or headers as source-of-truth.
- Org context is derived from Clerk session `auth()` on each request.

## Route Coverage
- `src/app/api/fleet-compliance/alerts/preview/route.ts`
- `src/app/api/fleet-compliance/alerts/run/route.ts`
- `src/app/api/fleet-compliance/alerts/trigger/route.ts`
- `src/app/api/fleet-compliance/assets/route.ts`
- `src/app/api/fleet-compliance/bulk-template/route.ts`
- `src/app/api/fleet-compliance/cron-health/route.ts`
- `src/app/api/fleet-compliance/fmcsa/lookup/route.ts`
- `src/app/api/fleet-compliance/import/parse/route.ts`
- `src/app/api/fleet-compliance/import/rollback/route.ts`
- `src/app/api/fleet-compliance/import/save/route.ts`
- `src/app/api/fleet-compliance/import/setup/route.ts`
- `src/app/api/fleet-compliance/[collection]/[id]/restore/route.ts`
