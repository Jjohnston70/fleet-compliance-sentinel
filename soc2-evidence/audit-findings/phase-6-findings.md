# Phase 6 Audit Findings

**Audit Date**: 2026-03-25
**Auditor**: Jacob Johnston
**Scope**: Phase 6 — Rate limiting, dependency audit, secret rotation schedule, penetration test guide, GitHub security hardening guide, test data cleanup, general fallback prompt security hardening
**Build Cycles**: 2

---

**Overall Score**: 8/10
**Pass/Conditional Pass/Fail**: Conditional Pass
**Blocker Count**: 1

---

## Critical Findings

**CF-1: `next@15.5.9` has known high-severity vulnerabilities — not yet patched**

`npm audit` reports multiple advisories affecting Next.js versions below `15.5.14`. The DEPENDENCY_AUDIT.md correctly identifies this and recommends immediate upgrade, but `package.json` still pins `next@15.5.9`. This is a known, exploitable vulnerability class in the production web framework.

- **File**: `package.json`
- **Evidence**: `npm audit` output: "Will install next@15.5.14, which is outside the stated dependency range"
- **Impact**: Depending on advisory specifics, could expose server-side request forgery, middleware bypass, or header injection vectors in production.
- **SOC 2 Control**: CC7.1 (vulnerability detection and remediation)
- **Remediation**: Upgrade `next` to `>=15.5.14` immediately, rebuild, and re-run audit. This is the **blocker** for unconditional pass.

---

## High Findings

**HF-1: `xlsx@0.18.5` — high-severity prototype pollution and ReDoS, no upstream fix available**

`npm audit` reports two high-severity advisories (GHSA-4r6h-8v6p-xvw6, GHSA-5pgg-2g8v-p4x9) against the `xlsx` package. `fixAvailable: false` — there is no patched version. The DEPENDENCY_AUDIT.md correctly identifies this.

- **File**: `package.json` (`"xlsx": "^0.18.5"`)
- **Impact**: If untrusted spreadsheet files are processed (import flow), prototype pollution could compromise server-side object state. ReDoS could cause denial of service during file parsing.
- **Remediation**: Replace `xlsx` with a maintained alternative (e.g., `exceljs`, `sheetjs-ce`) or isolate parsing to a sandboxed worker with timeout. Document the trust boundary: only admin-uploaded files are processed, reducing but not eliminating risk.

**HF-2: All 18 secrets show "Last Rotated: Not recorded" — no rotation evidence exists**

The SECURITY_ROTATION.md correctly catalogs all 18 secrets with rotation frequencies (90/180 days), dashboard URLs, and a rotation procedure. However, every entry has `Last Rotated: Not recorded`. There is zero evidence that any secret has ever been rotated.

- **File**: `SECURITY_ROTATION.md`
- **Impact**: SOC 2 CC6.1 (logical access controls) requires demonstrable credential lifecycle management. An auditor will ask for rotation evidence and find none.
- **Remediation**: Perform an initial rotation of all 90-day secrets (Clerk, DATABASE_URL, PENNY_API_KEY, RESEND_API_KEY, SENTRY_AUTH_TOKEN, DATADOG_API_KEY, STRIPE_WEBHOOK_SECRET, UPSTASH_REDIS_REST_TOKEN, ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY). Record dates. Set a calendar reminder for the 90-day cycle.

**HF-3: Clerk test organization cleanup incomplete**

Test data cleanup deleted all Neon records (72 null-org rows, 1 orphan, 2 test-org rows, 1 test org) but Clerk-side org deletion returned `Unauthorized`. If the test org still exists in Clerk, it represents orphaned identity infrastructure.

- **File**: `soc2-evidence/access-control/test-data-cleanup-2026-03-25.md`
- **Impact**: A stale test org in Clerk could be used to authenticate and access the application with an org context that has no corresponding database records — leading to empty but valid sessions.
- **Remediation**: Complete Clerk org deletion from an authorized admin session. Document the deletion in the evidence file.

---

## Medium Findings

**MF-1: Railway CORS defaults to wildcard origins**

`main.py:111` reads `CORS_ORIGINS` from environment and falls back to `["*"]` if unset or empty. If the Railway deployment does not have `CORS_ORIGINS` explicitly configured, any origin can make authenticated requests to the Penny backend.

- **File**: `railway-backend/app/main.py:111-120`
- **Impact**: In practice, the Railway backend requires `X-Penny-Api-Key` for all endpoints, so CORS alone is not the auth boundary. But wildcard CORS weakens defense-in-depth and could enable credential-bearing cross-origin requests if the API key is compromised.
- **Remediation**: Set `CORS_ORIGINS` in Railway environment to the production domain(s) only (e.g., `https://www.pipelinepunks.com,https://pipelinepunks.com`).

**MF-2: No audit event emitted when prompt injection is detected (carried from Phase 5)**

Phase 5 finding MF-4 identified that `is_prompt_injection_or_enumeration_query` returns the refusal string but emits no audit event. This remains unresolved. SOC 2 CC7.1 requires evidence of attack detection.

- **Files**: `railway-backend/app/main.py:537-574`, `src/app/api/penny/query/route.ts`
- **Remediation**: Have Railway return a `injection_blocked: true` flag in the response body when the keyword filter triggers. The Next.js route should detect this flag and emit `auditLog({ action: 'penny.injection_blocked', ... })`.

**MF-3: GitHub branch protection and CODEOWNERS are documented but not verified as applied**

`GITHUB_SECURITY.md` provides a thorough configuration guide, but there is no evidence that branch protection rules are actually enabled on the `main` branch, and no `.github/CODEOWNERS` file exists in the repository.

- **Impact**: Without enforced branch protection, direct pushes to `main` are possible, bypassing code review. Without CODEOWNERS, security-sensitive file changes have no mandatory reviewer.
- **Remediation**: Apply the branch protection rules from the guide. Create `.github/CODEOWNERS`. Capture a screenshot of the GitHub branch protection settings page as SOC 2 evidence.

**MF-4: Penetration test guide created but no scan has been executed**

`PENTEST_GUIDE.md` provides a solid OWASP ZAP procedure, but no scan report exists in `SECURITY_REPORTS/` and no summary exists in `soc2-evidence/penetration-testing/`. CC7.1 requires evidence of actual vulnerability scanning, not just a procedure.

- **Remediation**: Execute the OWASP ZAP scan per the guide. Store the report in `SECURITY_REPORTS/`. Write a summary in `soc2-evidence/penetration-testing/`.

**MF-5: `flatted` and `minimatch` transitive vulnerabilities remain in dependency tree**

`npm audit` shows 4 high-severity vulnerabilities total. Two affect `flatted` (DoS + prototype pollution via `eslint` toolchain) and two affect `minimatch` (ReDoS). These are in dev/tooling paths only but still appear in audit reports.

- **Impact**: Low in production (dev-only paths), but audit reports showing 4 high-severity findings will require explanation for every SOC 2 review cycle.
- **Remediation**: Upgrade `eslint` and related plugins/configs to clear the transitive dependency chain. Re-run `npm audit` to confirm resolution.

---

## SOC 2 Assessment

| Control                             | Status      | Evidence                                                                                                                                                                                                                                      |
| ----------------------------------- | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CC6.1** (Logical Access)          | **Partial** | Secret rotation schedule documented but no rotation has been performed. All "Last Rotated" fields are empty. Credential lifecycle management is procedurally defined but not yet operationally demonstrated.                                  |
| **CC7.1** (Vulnerability Detection) | **Partial** | Dependency audit performed and documented. 4 high-severity vulnerabilities identified. `next` upgrade recommended but not applied. Pentest guide created but no scan executed. Prompt injection detection exists but produces no audit trail. |
| **CC8.1** (Change Management)       | **Partial** | GitHub branch protection guide documented but not verified as applied. No CODEOWNERS file exists. Direct pushes to `main` may still be possible.                                                                                              |

---

## Dependency Risk Assessment

### Highest Risk Dependencies

1. **`next@15.5.9`** — HIGH. Production web framework with known advisories. Immediate upgrade path exists (`15.5.14`). Blocking finding.

2. **`xlsx@0.18.5`** — HIGH. No upstream fix. Prototype pollution + ReDoS. Used in the import flow where admin-uploaded spreadsheets are parsed. Risk is partially mitigated by the admin-only upload trust boundary, but not eliminated.

3. **`flatted@3.x` (via `eslint`)** — HIGH (dev path). Prototype pollution + DoS. Not in production runtime, but appears in audit reports. Upgrading the ESLint toolchain clears this.

4. **`minimatch@3.x` (via `eslint`)** — HIGH (dev path). ReDoS. Same toolchain upgrade path as `flatted`.

5. **`@upstash/ratelimit` + `@upstash/redis`** — LOW risk, but new dependencies added in Phase 6. Both are from a reputable vendor with active maintenance. No known advisories. Monitor for supply-chain risk given they execute in the production request path.

---

## Rate Limiting Adequacy

### Is 20 requests/minute per user appropriate?

**Yes, for the current application profile.** Penny is a compliance Q&A assistant — users ask questions and read answers. 20 queries/minute (one every 3 seconds) is generous for human interaction and prevents automated abuse.

### What's done well:

- **Sliding window** via Upstash (not fixed window) — prevents burst-at-boundary attacks
- **In-memory fallback** if Upstash is unavailable — rate limiting degrades gracefully rather than failing open
- **Audit event** on `rate_limit.exceeded` — provides SOC 2 evidence of enforcement
- **`Retry-After` header** returned on 429 — standards-compliant response
- **Per-user keying** (`userId`) — prevents one user from exhausting another's quota

### Additional rate limiting to consider:

1. **Global endpoint rate limit**: The current limit is per-user only. A coordinated attack from many authenticated users (credential stuffing scenario) could overwhelm the Railway backend. Consider a global rate limit of ~200 req/min across all users on the `/api/penny/query` endpoint.

2. **IP-based rate limit on auth endpoints**: The `/api/penny/query` route requires Clerk auth, but the auth check itself (`await auth()`) is not rate-limited. A flood of unauthenticated requests forces Clerk SDK calls. Consider IP-based rate limiting at the middleware or Vercel edge level.

3. **Knowledge ingest endpoint**: The Railway `/ingest` endpoint is protected by API key only. If the API key is compromised, an attacker could flood the knowledge store. Consider rate limiting ingest operations.

---

## Top 3 Risks Entering Phase 7

1. **`next@15.5.9` is running in production with known high-severity advisories.** This is the single most actionable risk. Upgrade to `15.5.14`, rebuild, redeploy. Until this is done, the application has a documented unpatched vulnerability in its core framework.

2. **Zero secret rotation evidence.** All 18 secrets have never been rotated (or rotation was never recorded). A SOC 2 auditor will flag this as a CC6.1 gap. Before onboarding the first client, at least the 90-day secrets must be rotated once with dates recorded.

3. **No actual penetration test has been run.** The guide exists, OWASP ZAP is recommended, and the evidence folder structure is ready — but no scan has been executed. CC7.1 requires evidence of actual vulnerability scanning. Run the scan and document results before the first client engagement.

---

## Implementation Quality Notes

**What was done well:**

- `SECURITY_RULES_BLOCK` is defined once and reused in both `SYSTEM_PROMPT` and `GENERAL_FALLBACK_SYSTEM_PROMPT` — eliminates drift between the two prompts. This was the top risk from Phase 5 and it is cleanly resolved.
- Rate limiting implementation is production-grade: Upstash sliding window with in-memory fallback, typed result interface, proper cleanup of expired memory buckets, audit logging on rate limit exceeded.
- `penny-rate-limit.ts` is well-structured: lazy initialization of Upstash client, graceful degradation, clean separation between Upstash and memory paths.
- Dependency audit is thorough and actionable — correct classification of runtime vs. dev dependencies, clear priority ordering.
- Security rotation schedule covers all 18 secrets with rotation frequencies, dashboard URLs, and a 6-step rotation procedure.
- Test data cleanup is well-documented with before/after counts and specific SQL operations.
- Adversarial prompt injection tests (4 queries, all clean refusals) demonstrate the security block is working.
- `SECURITY_REPORTS/` folder with `.gitkeep` and gitignore rules for `*.html` and `*.pdf` — correct pattern for sensitive artifacts.
- Pentest guide is actionable and maps to CC7.1 with proper severity triage guidance.
- GitHub security guide covers branch protection, secret scanning, dependency review, and CODEOWNERS — comprehensive.

**What needs follow-through:**

- The dependency audit and security guides are _plans_, not _completed actions_. The audit identified the right issues; now the fixes must be applied.
- The rotation schedule is a template — it becomes SOC 2 evidence only when dates are filled in.
- Branch protection is documented but must be applied to the GitHub repository.

**Build validation:** `npm run build` passes (2 existing a11y warnings only). No regressions introduced.
