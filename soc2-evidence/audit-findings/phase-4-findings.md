# Phase 4 Audit Findings

**Audit Date**: 2026-03-25 (initial), 2026-03-25 (re-audit after risk mitigations)
**Auditor**: Claude Opus 4.6 (automated code review)
**Scope**: Phase 4 — Multi-tenant org scoping, plan/trial gating, onboarding flow, query-level data isolation, Stripe webhook, org lifecycle audit trail, PII separation
**Build Cycles**: 4 (initial) + mitigation pass

---

**Overall Score**: 9/10
**Pass/Conditional Pass/Fail**: Pass
**Blocker Count**: 0

---

## Critical Findings

None.

---

## High Findings

**HF-1: `org_default` fallback in migration allows pre-existing data to be visible to any org that queries `org_default`** — OPEN (low practical risk)

The migration sets `DEFAULT 'org_default'` on all `org_id` columns. Clerk will never assign this as an org ID, so the risk is theoretical. The isolation test confirms `org_default` remains accessible by design.

- **File**: `migrations/004_org_scoping.sql:1-7`
- **Remediation**: One-time data migration script to re-scope `org_default` records after first production org onboards.

**HF-2: ~~Onboarding API returns full org row to client~~ — OPEN (low severity, unchanged)**

The response still includes `rows[0]` from the organizations table. This exposes `plan` and `trial_ends_at` to the client. Low severity since it's the org's own data.

- **File**: `src/app/api/fleet-compliance/onboarding/route.ts:103-106`
- **Remediation**: Return only `{ status: 'ok', onboardingComplete: true }`.

---

## Medium Findings

**MF-1: ~~No audit event for org provisioning~~ — RESOLVED**

`ensureOrgProvisioned` now calls `recordOrgAuditEvent({ eventType: 'org.provisioned' })` after INSERT.

- **File**: `src/lib/org-provisioner.ts:120-128`

**MF-2: ~~No audit event for plan/trial state changes~~ — RESOLVED**

`getOrgPlan` now calls `recordTrialStateIfChanged()` which detects trial active/expired transitions and writes to `org_audit_events`. Fail-open design (try/catch no-op) prevents audit writes from blocking the UI.

- **File**: `src/lib/plan-gate.ts:43-55`

**MF-3: Client-side onboarding redirect flash** — OPEN (UX only)

`Fleet-ComplianceOnboardingRedirect` still uses client-side `router.replace()` which briefly shows "Redirecting to onboarding..." before navigation.

- **File**: `src/components/fleet-compliance/Fleet-ComplianceOnboardingRedirect.tsx:25-32`

**MF-4: `past_due` subscription status treated as active** — OPEN (intentional, now documented in code)

`plan-gate.ts` line 39 includes `past_due` in the active set. This is a grace period policy decision.

- **File**: `src/lib/plan-gate.ts:39`

**MF-5: `stripe_webhook_events.payload` stores full Stripe event body including potential PII**

The raw Stripe webhook payload is stored as JSONB in `stripe_webhook_events.payload`. Stripe subscription/invoice events can contain customer email, name, and address fields. This data is in the database, not in logs, so it's not subject to the audit logger deny-list.

- **File**: `src/app/api/stripe/webhook/route.ts:295-307`
- **Impact**: PII in database is expected and governed by DB access controls, but the `payload` column should be documented as containing PII for CCPA deletion requests.
- **Remediation**: Document that `stripe_webhook_events.payload` may contain customer PII and must be included in CCPA data deletion sweeps. Consider scrubbing PII fields before storage, or add a retention policy to purge old webhook payloads.

**MF-6: No timestamp tolerance check on Stripe signature verification**

The `verifyStripeSignature` function validates the HMAC signature but does not check whether the `t=` timestamp is within a reasonable window (Stripe recommends rejecting events older than 5 minutes to prevent replay attacks).

- **File**: `src/app/api/stripe/webhook/route.ts:38-47`
- **Remediation**: Add a check: `if (Math.abs(Date.now() / 1000 - Number(parsed.timestamp)) > 300) return false;`

---

## Resolved Phase 4 Risks (from initial audit)

| Risk | Status | Resolution |
|---|---|---|
| No audit trail for org lifecycle events | **RESOLVED** | `org-audit.ts` with `org_audit_events` table. Provisioning, trial state, onboarding, and Stripe events all logged. |
| `primaryContact` PII in metadata JSONB | **RESOLVED** | Separated into `organization_contacts` table. Migration backfills and cleans existing metadata. Onboarding writes to separate table. Audit logger deny-list expanded with `includes`-style matchers. |
| No Stripe webhook handler | **RESOLVED** | `POST /api/stripe/webhook` with signature verification, idempotency via `event_id` unique, subscription state capture, and org audit events for plan/status changes. |

---

## SOC 2 Assessment

| Control | Status | Notes |
|---|---|---|
| **CC6.1** (Logical Access) | **Satisfied** | Clerk auth + org scoping. Trial expiration hard-blocks. |
| **CC6.2** (Access Provisioning) | **Satisfied** | Org provisioning, trial state, onboarding, and plan changes all emit audit events to `org_audit_events`. |
| **CC6.3** (Access Removal) | **Satisfied** | Trial expiration blocks access. Subscription deletion captured via webhook. |
| **CC7.2** (System Monitoring) | **Satisfied** | Structured audit logging + org lifecycle events + Stripe webhook logging with idempotency. |

---

## Multi-Tenant Isolation Assessment

**Is org-level data isolation properly enforced?**

**Yes.** No changes to the query-level isolation from the initial Phase 4 audit. All data access paths remain scoped by `org_id`.

**New tables added in migration 005:**

| Table | Scoped By | Purpose |
|---|---|---|
| `org_audit_events` | `org_id` (FK → organizations) | Org lifecycle audit trail |
| `organization_contacts` | `org_id` (PK, FK → organizations) | PII-separated contact storage |
| `stripe_webhook_events` | `org_id` (nullable, resolved at processing time) | Webhook idempotency + audit |

---

## PII Risk Assessment (Updated)

**What changed:**

1. `primaryContact` is now stored in `organization_contacts.primary_contact` — separated from the `organizations.metadata` JSONB field.
2. Migration 005 backfills existing `primaryContact` values to the new table and strips them from metadata.
3. The audit logger now has `REDACTED_METADATA_KEY_MATCHERS` with `includes`-style matching that catches `primarycontact`, `contactemail`, `contactphone`, `firstname`, `lastname`, `fullname`, and compound variants.
4. The onboarding audit event logs only `{ onboardingComplete: true, fleetSize, hasPrimaryDotConcern: boolean }` — no PII.

**Remaining PII concern:** `stripe_webhook_events.payload` stores raw Stripe JSON which may contain customer names/emails. This is in the DB (not logs) and is governed by DB access controls, but needs a documented retention/purge policy.

---

## Stripe Webhook Security Assessment

| Check | Status |
|---|---|
| Signature verification (HMAC-SHA256) | **Pass** — `verifyStripeSignature` with `crypto.timingSafeEqual` |
| Idempotency | **Pass** — `event_id UNIQUE` with `ON CONFLICT DO NOTHING` |
| Org resolution | **Pass** — checks `metadata.org_id` first, falls back to `stripe_customer_id` lookup |
| Error handling | **Pass** — errors update `processing_status='error'` with message, return 500 |
| Event type filtering | **Pass** — only processes 5 known event types, ignores others |
| Replay protection | **Partial** — signature valid but no timestamp tolerance check (MF-6) |
| Raw body parsing | **Pass** — reads `request.text()` before parsing, prevents JSON manipulation |

---

## Top 3 Risks Entering Phase 5

1. **Stripe webhook replay window.** No timestamp tolerance check means a captured valid webhook could be replayed indefinitely (though idempotency prevents duplicate processing of the same event_id, a new event with the same content but different id would be processed).

2. **`stripe_webhook_events.payload` PII retention.** Raw Stripe payloads may contain customer PII. No retention or purge policy is defined. CCPA deletion requests must include this table.

3. **No reconciliation between Stripe and local subscription state.** If a webhook is missed (Stripe retries fail, endpoint down during deploy), local subscription state could drift from Stripe's truth. A daily reconciliation job would detect and correct this.

---

## Implementation Quality Notes

**What was done well:**

- Clean separation of concerns: `org-audit.ts` is a reusable audit helper, not tangled into business logic
- `recordTrialStateIfChanged` does state-diff detection — only writes on actual transitions, preventing audit event spam
- Fail-open design in `plan-gate.ts` (try/catch around audit write) — audit logging never blocks the user
- Migration 005 is a proper data migration: creates new tables, backfills data, then cleans source — idempotent with `IF NOT EXISTS` and `ON CONFLICT`
- Stripe webhook uses raw `request.text()` for signature verification before JSON parsing — correct order of operations
- `timingSafeEqual` for HMAC comparison — prevents timing attacks
- Idempotency via `event_id UNIQUE` is the industry standard approach
- Org resolution cascade (metadata → customer ID lookup) handles multiple Stripe integration patterns
- `REDACTED_METADATA_KEY_MATCHERS` with `includes`-style matching is now aligned with `sentry-scrub.ts` approach — Phase 3 MF-3 is effectively resolved
- Onboarding audit event properly excludes PII — logs `hasPrimaryDotConcern: boolean` instead of the text content

**Phase 3 findings resolved by this work:**
- Phase 3 MF-3 (inconsistent PII scrubbing strategies) — **RESOLVED** by adding `includes`-style matchers to audit-logger
- Phase 3 HF-2 (PII deny-list incomplete) — **Substantially mitigated** by expanded matchers covering `primarycontact`, `contactemail`, `contactphone`, `firstname`, `lastname`, `fullname`

**Build validation:** npm run build passes.
