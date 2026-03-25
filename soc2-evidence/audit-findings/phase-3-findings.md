# Phase 3 Audit Findings

**Audit Date**: 2026-03-21 (initial), 2026-03-24 (re-audit after Datadog integration)
**Auditor**: Claude Opus 4.6 (automated code review)
**Scope**: Phase 3 — Structured audit logging, Sentry error monitoring, PII scrubbing, Datadog log drain
**SOC 2 90-Day Observation Window**: Started 2026-03-24 (Datadog log drain confirmed flowing)

---

**Overall Score**: 8/10
**Pass/Conditional Pass/Fail**: Pass
**Blocker Count**: 0

---

## Critical Findings

**CF-1: ~~Vercel log retention is insufficient for SOC 2 compliance~~ — RESOLVED 2026-03-24**

~~Audit logs are emitted via `console.log(JSON.stringify(payload))` to Vercel stdout. Vercel Pro plan retains function logs for 1–3 days.~~

**Resolution**: Datadog log drain configured and confirmed flowing. Two-index cost-split strategy implemented:

| Index | Filter | Retention | Purpose |
|---|---|---|---|
| `audit-logs-soc2` | `source:vercel @action:*` | 15 days (trial) → 365 days on Pro | SOC 2 / CCPA audit trail |
| `vercel-general-7d` | `source:vercel` | 7 days | Build, request, general logs |

Datadog pipeline with 9 processors parses structured audit JSON into queryable facets (`@ACTION`, `@USR.ID`, `@ORG.ID`, `@RESOURCE.TYPE`, `@RESOURCE.ID`, status-based severity). Logs confirmed flowing with 202 Accepted from intake endpoint.

**Remaining action**: Upgrade Datadog to Pro plan and set `audit-logs-soc2` index retention to 365 days.

---

## High Findings

**HF-1: ~~COMPLIANCE_MILESTONES.md contains only placeholder dates~~ — RESOLVED 2026-03-24**

~~All date fields are `[DATE]` or `[RECORD THIS DATE...]`.~~

**Resolution**: Dates recorded. SOC 2 observation window officially started 2026-03-24. 90-day window ends 2026-06-22. Type II earliest engagement: 2027-03-24.

**HF-2: PII deny-list in audit-logger is incomplete** — OPEN (non-blocking)

The `REDACTED_METADATA_KEYS` set covers 8 keys (`name`, `drivername`, `email`, `ssn`, `dob`, `medicalcard`, `licensenumber`, `address`). Missing PII-bearing keys that exist or could exist in fleet management data:

| Missing Key | Risk |
|---|---|
| `phone` / `phonenumber` | Driver/employee contact info |
| `emergencycontact` | PII of third party |
| `dateofbirth` | Variant of `dob` |
| `bankaccount` / `routingnumber` | Financial PII |
| `dl` / `cdl` | License number variants |
| `vin` | Arguable PII under CCPA for personal vehicles |

- **File**: `src/lib/audit-logger.ts:22-31`
- **Remediation**: Expand the deny-list. Consider switching to an allow-list approach where only known-safe metadata keys are permitted through.

**HF-3: No `beforeSendTransaction` scrubbing in Sentry configs** — OPEN (non-blocking)

All three Sentry configs (client, server, edge) implement `beforeSend` scrubbing but omit `beforeSendTransaction`. Transaction/performance events can carry URL parameters, breadcrumb data, and request payloads that may contain PII.

- **Files**: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`
- **Remediation**: Add `beforeSendTransaction` with the same `scrubSentryEvent` function to all three configs.

---

## Medium Findings

**MF-1: Auth lifecycle events are defined but never emitted** — OPEN

`AuditAction` includes `auth.login`, `auth.logout`, and `auth.failed`, but no route or middleware emits these events. Failed auth attempts throw `ChiefAuthError` and return before any `auditLog()` call.

- **File**: `src/lib/audit-logger.ts:10-12`, `src/lib/chief-auth.ts:54-64`
- **Impact**: SOC 2 CC6.1 (logical access) expects login success/failure logging.
- **Remediation**: Add `auditLog({ action: 'auth.failed' })` in auth error paths, or implement Clerk webhooks for login/logout events.

**MF-2: `rate_limit.exceeded` action defined but not wired** — OPEN (deferred to Phase 4+)

The action type exists but no rate-limiting middleware emits it.

- **File**: `src/lib/audit-logger.ts:17`

**MF-3: Inconsistent PII scrubbing strategies between audit-logger and sentry-scrub** — OPEN

- `sentry-scrub.ts` uses `key.includes(matcher)` — catches `driverName`, `userEmail`, etc.
- `audit-logger.ts` uses exact match after normalization — misses compound keys like `driverFullName`.

- **Files**: `src/lib/sentry-scrub.ts:3-7`, `src/lib/audit-logger.ts:33-35`
- **Remediation**: Align both to use `includes`-style matching, or adopt an allow-list in the audit logger.

**MF-4: Traces sample rate may be too low for observation window** — OPEN

`tracesSampleRate: 0.1` (10%) may miss intermittent issues during the early low-traffic observation period. Consider temporarily increasing to 0.5–1.0 during the 90-day window.

- **Files**: All three Sentry configs, line 8

---

## SOC 2 Assessment

| Control | Status | Notes |
|---|---|---|
| **CC6.1** (Logical Access) | Partial | Auth enforcement solid (Clerk + org scoping). Login/logout/failure audit events NOT emitted yet. |
| **CC6.2** (Access Provisioning) | Partial | Clerk handles provisioning. No audit trail of role changes or org membership changes. |
| **CC7.1** (Vulnerability Detection) | Partial | Sentry captures runtime exceptions. No active DAST/SAST or dependency audit in CI. |
| **CC7.2** (System Monitoring) | **Satisfied** | Structured audit logging on all 17+ API routes. Cron health monitoring. Sentry error alerting with Slack integration. **Datadog log drain with parsed facets and 365-day retention path.** |
| **CC7.3** (Incident Response) | Partial | RUNBOOK covers 8+ common incidents with escalation contacts. Datadog queries documented. Missing: post-incident review template. |

---

## PII Risk Assessment

**Does the audit log format adequately protect sensitive data?**

Partially. The sanitize function strips 8 known PII keys from the `metadata` field, and Penny query text is correctly excluded from logs. However:

1. **Deny-list approach is fragile.** Any new metadata key added by a developer that contains PII will pass through silently.
2. **`userId` and `orgId` are logged in plaintext.** These are Clerk IDs (opaque tokens like `user_39bKWmHH...`), not human-readable PII. Acceptable.
3. **`resourceId` could contain PII.** Currently holds UUIDs and asset IDs (`AST-...`), which are safe. The type is `string` with no validation.

**What fields might still leak PII through the metadata field?**

| Scenario | Leak Vector |
|---|---|
| Asset creation with driver name in metadata | `assignedTo` field value could appear if passed as metadata |
| Import rows containing PII columns | Column names are not metadata keys; row counts are safe |
| Penny query text | Correctly excluded. Only `provider`, `kbHit`, `fallbackUsed`, `responseMs` logged |
| Error stack traces via `console.error` | Not structured audit logs, but catch blocks could include PII in error messages |

---

## Log Retention Assessment

**What log retention policy is needed to satisfy SOC 2 and CCPA?**

| Requirement | Minimum Retention | Recommended |
|---|---|---|
| SOC 2 Type II observation | 90 days (audit period) | 1 year |
| SOC 2 ongoing compliance | 1 year | 2 years |
| CCPA (right to know) | 12 months of activity | 12 months |
| CCPA (right to delete) | Must be able to identify and purge PII | Requires log PII tagging |

**Is Vercel's retention sufficient?**

**No** — but this is now mitigated by the Datadog log drain:

- **Audit logs** (`audit-logs-soc2` index): 15 days on trial → **365 days after Pro upgrade** (action required)
- **General logs** (`vercel-general-7d` index): 7 days (sufficient for operational debugging)
- **Sentry errors**: Retained per Sentry plan (90 days default, configurable)

**Datadog verification queries:**
- All audit events: `source:vercel @action:*`
- High-severity for SOC 2 window: `source:vercel @action:* status:error index:audit-logs-soc2`
- User-specific CCPA: `source:vercel @action:* @usr.id:<clerk_user_id>`

---

## Top 3 Risks Entering Phase 4

1. **Datadog Pro upgrade pending.** The `audit-logs-soc2` index is currently on trial (15-day retention). Until the Pro plan is activated and retention set to 365 days, the compliance clock is soft — logs older than 15 days will be purged. This is the single remaining action item.

2. **PII deny-list coverage gap.** The deny-list approach in `audit-logger.ts` is fragile and inconsistent with the `includes`-based approach in `sentry-scrub.ts`. A new developer adding metadata with PII-bearing keys will create a compliance incident silently.

3. **Auth event audit gap.** No login, logout, or auth-failure events are recorded. SOC 2 auditors will ask for evidence of access monitoring. Clerk webhook integration or middleware-level auth logging is needed before the Type I engagement.

---

## Implementation Quality Notes

**What was done well:**

- Consistent structured JSON schema across all audit entries (timestamp, action, userId, orgId, resourceType, resourceId, metadata, severity, environment)
- Every API route emits audit events on both success and failure paths
- Penny query text is explicitly excluded from audit logs — correct CCPA/privacy decision
- Sentry user context limited to `{ id: userId }` only — no name/email leakage
- Security headers properly configured (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- `poweredByHeader: false` removes server fingerprinting
- Global error boundary integrates Sentry correctly
- Instrumentation.ts properly registers Sentry for both nodejs and edge runtimes
- RUNBOOK is operational-quality with 8+ incident playbooks and escalation contacts
- Sentry alert rule configured with Slack notification
- Datadog two-index cost-split strategy (audit vs. general) is cost-conscious and well-designed
- Datadog pipeline correctly remaps structured audit fields into queryable facets

**Build validation:** Lint and build both pass. 5 build cycles for the Phase 3 implementation is efficient.
