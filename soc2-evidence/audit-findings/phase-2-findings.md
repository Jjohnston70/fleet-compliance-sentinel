# Phase 2 Audit Findings
**Auditor**: Claude Code (automated static analysis review)
**Date**: 2026-03-20
**Phase**: 2 — Data Integrity + Access Control
**Scope**: `requireChiefOrg` / `requireChiefOrgWithRole` auth middleware, `chief-validators.ts` field validation, parameterized query audit across all API routes, invoice module access control, cross-tenant isolation assessment

---

## Phase 2 Audit Findings
**Overall Score**: 8/10
**Pass/Conditional Pass/Fail**: Pass
**Blocker Count**: 0

---

## Remediation Update (2026-03-21)
**Updated Score**: 8/10  
**Updated Result**: Pass  
**Updated Blocker Count**: 0

Resolved from original blockers/findings:
- Invoice module now enforces org-admin auth in both invoice API routes and stores/scopes by `org_id`.
- Cron secret comparison now uses `crypto.timingSafeEqual` with length pre-check.
- Middleware matcher now protects `/chief(.*)`, `/api/chief(.*)`, and `/api/invoices(.*)`.
- Chief API 500 responses now return generic errors while logging details server-side.
- Import save now validates all remaining collections using schema-based fallback validation.

---

### Critical Findings (must fix before Phase 3)
All critical findings listed in this original section are resolved as of the remediation update on 2026-03-21.

1. **Invoice module has ZERO authentication or authorization** — Both `/api/invoices/setup` and `/api/invoices/import` accept unauthenticated POST requests from anyone on the internet. No `requireChiefOrg()`, no Clerk check, no org scoping. The `invoices` table schema has no `org_id` column, so all invoices are in a single flat namespace. Any HTTP client can create invoices, and any authenticated user can read all invoices regardless of org. **Recommended fix**: Add `requireChiefOrgWithRole(request, 'admin')` to both routes. Add `org_id TEXT NOT NULL` column to the `invoices` table. Add org_id filtering to `listInvoices()`, `getInvoice()`, and `deleteInvoice()`. This is a data exposure and integrity violation.

2. **Cron secret comparison is not timing-safe** — [alerts/run/route.ts:19](src/app/api/chief/alerts/run/route.ts#L19) uses `provided === cronSecret` for bearer token comparison. String equality comparison in JavaScript is not constant-time — response timing varies with the number of matching prefix characters, enabling timing side-channel attacks to brute-force the secret one character at a time. **Recommended fix**: Replace with `crypto.timingSafeEqual(Buffer.from(provided), Buffer.from(cronSecret))` with length pre-check. This is required for SOC 2 CC6.1.

---

### High Findings (fix within 2 phases)

1. **`/chief/*` routes still not protected by middleware** — [middleware.ts:9-12](src/middleware.ts#L9-L12) only protects `/penny(.*)` and `/api/penny/query(.*)`. All Chief API routes rely entirely on per-route `requireChiefOrg()` calls. This is defense-in-depth failure — a single missing auth call on any future route creates an unauthenticated endpoint. The `chief-auth.ts` functions are consistently applied to existing routes (verified), but there is no safety net. **Recommended fix**: Add `/chief(.*)` and `/api/chief/(.*)` and `/api/invoices/(.*)` to the `createRouteMatcher` array. This ensures authentication at the edge even if individual routes have bugs.

2. **`requireChiefOrg()` accepts `_request` parameter but never uses it** — [chief-auth.ts:41](src/lib/chief-auth.ts#L41) accepts a `_request: Request` parameter that is completely ignored. The auth context comes from `await auth()` (Clerk's server-side helper), not from the request object. This is not a security vulnerability today (Clerk's `auth()` reads from headers automatically), but it creates a false sense of security — callers think they are passing the request for validation when it is discarded. **Recommended fix**: Either use the request parameter (e.g., for additional header validation) or remove it to make the API honest. If removed, update all call sites.

3. **Alert sweep cron runs for ALL orgs when called via cron secret** — [alerts/run/route.ts:14-34](src/app/api/chief/alerts/run/route.ts#L14-L34) sets `orgId = null` for cron invocations, then passes `orgId ?? undefined` to `loadChiefData()`. If `loadChiefData(undefined)` returns data across all orgs, the alert sweep processes every org's suspense items in a single run without org isolation. **Recommended fix**: Either iterate orgs explicitly and sweep per-org, or verify `loadChiefData(undefined)` returns empty/safe results. Document the intended behavior.

4. **Error responses leak internal details** — Multiple routes return `String(err)` in 500 responses: [save/route.ts:123](src/app/api/chief/import/save/route.ts#L123), [alerts/run/route.ts:57](src/app/api/chief/alerts/run/route.ts#L57), [trigger/route.ts:33](src/app/api/chief/alerts/trigger/route.ts#L33), [parse/route.ts:124](src/app/api/chief/import/parse/route.ts#L124). These can expose database connection strings, SQL errors, or internal file paths to authenticated users. **Recommended fix**: Return generic error messages in responses, log detailed errors server-side only.

5. **Five collections have no field-level validation** — [save/route.ts:127-141](src/app/api/chief/import/save/route.ts#L127-L141) shows that `validateCollectionRow()` returns `{ valid: true, errors: [] }` for any collection that isn't `drivers`, `assets_master`, `vehicles_equipment`, `permits_licenses`, or `employees`. Collections like `suspense_items`, `maintenance_events`, `compliance_records`, `training_records`, `insurance_policies`, `fuel_tax_records`, and `contacts` pass validation with no checks. **Recommended fix**: Add validators for all collections, or at minimum add required-field checks using the `IMPORT_SCHEMAS` field definitions.

---

### Medium Findings (fix before first paying client)

1. **Email regex is too permissive** — [chief-validators.ts:7](src/lib/chief-validators.ts#L7) uses `^[^\s@]+@[^\s@]+\.[^\s@]+$` which accepts malformed addresses like `a@b.c`, `@@@.@`, and strings with control characters. **Recommended fix**: Use a stricter pattern or validate against RFC 5322. For a fleet management SaaS, incorrect email addresses mean missed compliance alerts.

2. **Date validation has no range bounds** — [chief-validators.ts:38-43](src/lib/chief-validators.ts#L38-L43) validates format (YYYY-MM-DD) and parseability but allows year 9999 or year 0001. Only the Medical Card Expiry field has a "not in the past" check. **Recommended fix**: Add reasonable range bounds (e.g., 1900-2100) for all date fields.

3. **Parse and save validation are separate codepaths** — The parse route uses `validateRows()` from `chief-import-schemas.ts` while the save route uses `validateCollectionRow()` from `chief-validators.ts`. A client could bypass the parse step entirely and POST directly to `/api/chief/import/save` with rows that would have been flagged during parse. The save route does re-validate (good), but using different validator functions creates divergence risk. **Recommended fix**: Consolidate to a single validation source of truth, or ensure save-side validators are strictly equal-or-stricter than parse-side.

4. **`source_file` in invoice import stores arbitrary text** — [invoice-db.ts:98](src/lib/invoice-db.ts#L98) accepts `source_file: string` with no sanitization. An attacker could store XSS payloads, path traversal strings, or other malicious content that would be rendered when invoices are displayed. **Recommended fix**: Sanitize to filename-only (strip path separators), validate length, HTML-encode on output.

5. **Invoice line items inserted in unbounded loop** — [invoice-db.ts:136-141](src/lib/invoice-db.ts#L136-L141) loops over `data.line_items` with individual INSERT statements and no upper bound. A malicious request with 100,000 line items would execute 100,000 sequential queries. **Recommended fix**: Add a maximum line item count (e.g., 500), batch inserts, or use a single multi-row INSERT.

---

### SOC 2 Assessment

- **CC6.1 (Logical Access)**: **Partial** — `requireChiefOrg()` and `requireChiefOrgWithRole()` are implemented and consistently applied to all Chief API routes. Clerk org context provides the identity foundation. However, the invoice module has zero access controls, and `/chief/*` routes lack middleware-level protection. The cron secret uses non-timing-safe comparison. Logical access is established for Chief but not uniform across the application.

- **CC6.3 (Access Restriction)**: **Partial** — Org-scoped queries are correctly implemented in `chief-db.ts` — every query that reads or writes `chief_records` includes an `org_id` filter (verified: `listChiefRecords`, `getChiefRecordCounts`, `clearChiefCollection`, `insertChiefRecords`, `rollbackChiefImportBatch`, `restoreChiefRecord`). Role-based restrictions enforce admin-only access on write operations (save, setup, trigger, cron-health). However, the invoice module completely lacks access restrictions — no org isolation, no role checks, no user tracking.

- **PI1.1 (Processing Integrity)**: **Partial** — Input validation exists for 4 of 12 collections with field-level checks (drivers, assets, permits, employees). Validators enforce required fields, date formats, and enum constraints. All SQL queries use Neon's parameterized template literals (no string concatenation). However, 8 collections pass through with no validation, the email regex is weak, dates have no range bounds, and the invoice import has no input validation at all.

---

### Cross-Tenant Isolation Assessment

**Can a Clerk session `org_id` be spoofed or bypassed to access another org's data?**

**Vectors analyzed:**

1. **Clerk `auth()` trust model** — `requireChiefOrg()` calls `await auth()` which extracts `orgId` from the Clerk JWT. The JWT is signed by Clerk's private key and validated server-side. An attacker cannot forge a valid `orgId` without compromising Clerk's signing key. **Verdict: Not spoofable via request manipulation.**

2. **Request parameter injection** — The `_request` parameter in `requireChiefOrg()` is ignored. The `orgId` is never extracted from request body, query params, or headers — it always comes from the Clerk JWT. Even if an attacker adds `org_id` to a POST body, it won't override the Clerk-derived value. **Verdict: Not injectable.**

3. **Cron bypass** — [alerts/run/route.ts:14-30](src/app/api/chief/alerts/run/route.ts#L14-L30): When `CHIEF_CRON_SECRET` matches, `orgId` is `null` and `loadChiefData(undefined)` is called. If this returns data across all orgs, the cron job processes every tenant's data in a single context — but this is an availability/correctness issue, not a cross-tenant data leak (the response only returns aggregate counts, not per-org data). **Verdict: Architectural concern, not a spoofing vector.**

4. **Invoice module** — No org isolation exists at all. `listInvoices()` returns all invoices regardless of org. `getInvoice(id)` retrieves any invoice by numeric ID. This is not spoofing — it's a complete absence of isolation. **Verdict: CRITICAL — any authenticated user sees all invoices.**

5. **Batch import scope** — `getImportBatchScope()` takes `orgId` and `batchId`, but the query counts ALL records matching `batchId` (not just the org's). The `org_count` subcount is filtered, but `total_count` reveals cross-org batch size. **Verdict: Minor information disclosure — an org can see how many records exist in a batch across all orgs.**

**Summary**: Clerk JWT-based org isolation is sound for Chief records. The invoice module has no isolation at all. One minor information disclosure in batch scope queries.

---

### SQL Injection Assessment

**Are there any remaining SQL injection risks in the patterns shown?**

All database queries across the entire codebase use Neon's tagged template literal syntax:

```typescript
const rows = await sql`
  SELECT * FROM chief_records
  WHERE collection = ${collection}
    AND org_id = ${orgId}
`;
```

Neon's `neon()` function processes tagged template literals by extracting interpolated values as parameterized query arguments. The `${variable}` expressions are converted to `$1`, `$2`, etc. in the generated SQL, with values passed separately. **This is not string concatenation — it is parameterized query construction.**

**Verified patterns (all safe):**
- `chief-db.ts`: 12 queries — all parameterized via template literals
- `invoice-db.ts`: 8 queries — all parameterized via template literals
- `cron-health/route.ts`: reads via `getLastCronLog()` — parameterized
- All INSERT, UPDATE, SELECT, and DELETE operations use `${value}` interpolation

**One edge case identified:**
- [chief-db.ts:150](src/lib/chief-db.ts#L150): `${JSON.stringify(row)}::jsonb` — The row data is JSON-serialized and cast to JSONB. The `JSON.stringify()` output is passed as a parameterized string value, so it is safe from SQL injection. However, if the JSON contains deeply nested or extremely large objects, it could cause Postgres JSONB parsing errors. **Verdict: Safe from injection, minor robustness concern.**

**Overall SQL injection assessment: No injection risks found.** The Neon template literal pattern provides consistent protection across all queries.

---

### Top 3 Risks Entering Phase 3

1. **Cross-org alert sweep behavior now depends on org discovery quality** — Cron invocation iterates `listChiefOrgIds()` and runs per-org. If stale/deleted org records are the only source, sweep coverage can drift. Add explicit org registry checks in Phase 3.

2. **Import parse/save validation remains split across two modules** — Save path is stricter and authoritative, but parse preview still uses `validateRows()` independently. Keep them aligned or consolidate in Phase 3.

3. **Medium-grade invoice robustness items remain** — source file sanitization and line-item limits are added, but invoice import still lacks dedicated schema-level field validators comparable to Chief import.

---

### Audit Metadata
- **Auth Pattern Applied**: `requireChiefOrg*` on 12/12 Chief API routes, 2/2 Invoice routes
- **Role Enforcement**: Admin-only on save, setup, trigger, cron-health, alerts/run, import rollback, restore, and invoice routes
- **Org-Scoped Queries**: 12/12 chief_records queries include `org_id` filter
- **Invoice Queries**: org-scoped with `org_id` in list/get/delete operations
- **SQL Injection Risk**: None — all queries use parameterized template literals
- **Validator Coverage**: 12/12 collections validated on save (specialized + schema fallback)
- **Next Phase**: Phase 3 — Audit Logging + Observability
- **Blockers for Phase 3**: 0
