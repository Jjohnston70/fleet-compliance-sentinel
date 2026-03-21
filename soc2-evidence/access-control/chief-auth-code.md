# Chief Org Access Control Middleware Evidence

## Source File
- `src/lib/chief-auth.ts`

## Implemented Controls
- `requireChiefOrg(request)` calls Clerk `auth()` and enforces:
  - `401 Unauthorized` when `userId` is missing
  - `403 Forbidden` when `orgId` is missing
  - Returns `{ userId, orgId }` from Clerk session context only
- `requireChiefOrgWithRole(request, requiredRole)` enforces org membership and org-role gate:
  - `member`: authenticated org member
  - `admin`: authenticated org member with org role resolved to admin
- Route handlers use `chiefAuthErrorResponse()` for consistent `401/403` responses.

## Security Notes
- No API handler in `src/app/api/chief/*` trusts `org_id` from body, query, params, or headers as source-of-truth.
- Org context is derived from Clerk session `auth()` on each request.

## Route Coverage
- `src/app/api/chief/alerts/preview/route.ts`
- `src/app/api/chief/alerts/run/route.ts`
- `src/app/api/chief/alerts/trigger/route.ts`
- `src/app/api/chief/assets/route.ts`
- `src/app/api/chief/bulk-template/route.ts`
- `src/app/api/chief/cron-health/route.ts`
- `src/app/api/chief/fmcsa/lookup/route.ts`
- `src/app/api/chief/import/parse/route.ts`
- `src/app/api/chief/import/rollback/route.ts`
- `src/app/api/chief/import/save/route.ts`
- `src/app/api/chief/import/setup/route.ts`
- `src/app/api/chief/[collection]/[id]/restore/route.ts`
