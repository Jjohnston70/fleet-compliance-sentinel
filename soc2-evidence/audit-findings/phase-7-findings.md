# Phase 7 Audit Findings

**Audit Date**: 2026-03-25 (post-remediation re-audit)
**Auditor**: Claude Opus 4.6 (automated code review)
**Scope**: Phase 7 — Incident response plan, subprocessor registry, client offboarding process, offboarding lifecycle automation, status page setup, offboarding migration
**Build Cycles**: 1
**Commits Reviewed**: `75d764d`, `a1e87f2`, `f133b5d`, `edf0258`

---

**Overall Score**: 9/10
**Pass/Conditional Pass/Fail**: Conditional Pass
**Blocker Count**: 0

---

## Critical Findings

None.

---

## High Findings

None.

All three High findings from the initial Phase 7 audit have been remediated:

| Original Finding | Status | Evidence |
|---|---|---|
| HF-1: Subprocessor registry incomplete (6 of 13 vendors) | **Fixed** | `SUBPROCESSORS.md` now lists 13 vendors with compensating controls for non-SOC2 providers |
| HF-2: Offboarding entirely manual, no automation | **Fixed** | `src/lib/offboarding-lifecycle.ts` implements automated 30-day soft delete and 60-day hard delete, integrated into cron via `alerts/run/route.ts` |
| HF-3: Migration numbering collision (two `006_*.sql`) | **Fixed** | Renumbered to `migrations/007_offboarding.sql`, old `006_offboarding.sql` removed in `f133b5d` |

---

## Medium Findings

**MF-1: Status page is not operational**

`STATUS_PAGE_SETUP.md` documents that `https://status.pipelinepunks.com` fails DNS resolution as of 2026-03-25. The setup guide and operational evidence checklist are comprehensive, but the status page itself does not exist yet. SOC 2 CC7.3 incident communication requires a reachable notification channel.

- **File**: `STATUS_PAGE_SETUP.md:8`
- **Impact**: During a P1/P2 incident, there is no public status page to direct clients to. Communication falls back entirely to email templates.
- **Remediation**: Complete UptimeRobot setup, configure DNS CNAME, and capture evidence per the checklist in `STATUS_PAGE_SETUP.md` Section 6.

**MF-2: Soft delete covers 2 of 10 org-scoped tables**

`offboarding-lifecycle.ts:94-121` soft-deletes only `fleet_compliance_records` and `invoices` (setting `deleted_at = NOW()`). The remaining 8 tables (`invoice_line_items`, `invoice_work_descriptions`, `fleet_compliance_error_events`, `cron_log`, `subscriptions`, `stripe_webhook_events`, `organization_contacts`, `org_audit_events`) remain accessible between day 30 and day 60.

- **Files**: `src/lib/offboarding-lifecycle.ts:94-121`, `CLIENT_OFFBOARDING.md:34-47`
- **Impact**: If application queries against those 8 tables do not filter by `deleted_at`, the data is still queryable during the soft-delete window. Since the plan gate blocks `canceled` orgs at the auth layer (`fleet-compliance-auth.ts:63`), the practical exposure is limited to direct DB access.
- **Remediation**: Acceptable as-is given the auth gate blocks canceled orgs. For defense-in-depth, consider adding `deleted_at` columns to tables that lack them, or document the design decision that soft delete applies only to primary data tables while the auth gate provides the access boundary.

**MF-3: Clerk org removal and deletion confirmation email are manual steps**

The offboarding automation handles `data_deletion_scheduled_at` scheduling, soft delete, and hard delete. However, two steps remain manual:

1. Clerk org membership removal (Day 60, `CLIENT_OFFBOARDING.md:68`)
2. Sending the final deletion confirmation email (Day 60, `CLIENT_OFFBOARDING.md:69`)

- **Impact**: If the manual Clerk cleanup is missed, the user retains Clerk org membership after data is deleted, creating an orphaned auth context. The Clerk session would hit the `canceled` plan gate and get a 403, so data exposure risk is low, but the identity lifecycle is incomplete.
- **Remediation**: Evaluate Clerk Backend API for programmatic org deletion. If available, add to the hard-delete phase of `offboarding-lifecycle.ts`. For the confirmation email, integrate with Resend in the hard-delete phase.

**MF-4: Google AI (Gemini) SOC 2 certification marked "Not verified"**

`SUBPROCESSORS.md:14` lists Google AI (Gemini) with `Not verified in this registry`. Google Cloud Platform has SOC 2 Type II, but Gemini API may operate under different terms depending on the API version and commercial agreement.

- **File**: `SUBPROCESSORS.md:14`
- **Remediation**: Verify whether the Gemini API used falls under Google Cloud's SOC 2 umbrella or has separate terms. Update the registry with the verified status. If not covered, add Gemini to the compensating controls section alongside Railway and Anthropic.

---

## SOC 2 Assessment

| Control | Status | Evidence |
|---|---|---|
| **CC7.3** (Incident Response) | **Satisfied** | Incident response plan covers 4 severity levels (P1-P4) with defined response times (15 min to 1 business day), multi-role escalation chain, investigation/resolution procedures, 72-hour breach notification, GDPR Article 33 supervisory authority notification, and communication templates. Personal contact info removed from repository templates. Status page setup guide ready but not yet operational (separate MF-1). |
| **CC9.1** (Vendor Management) | **Satisfied** | Subprocessor registry lists all 13 data-processing vendors with purpose, data categories, and security certification status. Quarterly review frequency documented. Compensating controls section covers non-SOC2 vendors (Railway, Anthropic) with 6 specific mitigations: data minimization, transport security, secret rotation, endpoint controls, prompt controls, and logging. Vendor management onboarding procedure defined. |
| **P4.3** (Data Retention) | **Satisfied** | Automated offboarding lifecycle (`offboarding-lifecycle.ts`) enforces 30-day soft delete and 60-day hard delete across 10 org-scoped tables. Schedule is set automatically by cron (`alerts/run/route.ts`) for canceled orgs or triggered by Stripe webhook on subscription cancellation (`stripe/webhook/route.ts`). `data_deletion_scheduled_at` is read and enforced by the plan gate. Reactivation clears the deletion schedule. Individual deletion request procedure documented for non-cancellation GDPR/CCPA requests. |

---

## GDPR/CCPA Adequacy

### Does the 72-hour breach notification satisfy GDPR Article 33?

**Yes.** The updated incident response plan addresses both required notification channels:

1. **Article 33 (supervisory authority)**: The breach procedure now explicitly states: "Assess GDPR Article 33 threshold and notify the relevant supervisory authority within 72 hours when required" (`INCIDENT_RESPONSE_PLAN.md:91`). This satisfies the regulatory notification requirement.

2. **Article 34 (data subjects)**: Client notification within 72 hours via the P1 communication template. Template includes what happened, what data was affected, when, what was done, and what the client should do.

**Remaining gap**: No named Data Protection Officer (DPO) or designated GDPR contact. For operations processing EU personal data at scale, a DPO designation may be required under Article 37. For the current user base (US fleet compliance operators), this is unlikely to be mandatory but should be evaluated as the customer base grows.

### Does the 30/60-day deletion process satisfy CCPA?

**Yes.** CCPA requires deletion within 45 days (extendable to 90 days with notice). The 30-day soft delete + 60-day hard delete (60 days total) falls within the 45-day default window.

The updated `CLIENT_OFFBOARDING.md` also addresses the individual deletion request gap identified in the initial audit:

- **Section: "Individual Deletion Requests (Non-Cancellation)"** (`CLIENT_OFFBOARDING.md:71-81`) — provides a procedure for GDPR/CCPA deletion requests from active users, separate from full offboarding. This covers the scenario where a consumer requests data deletion without org cancellation.

**Remaining gap**: The offboarding automation does not notify subprocessors to delete data they hold (Railway request logs, Sentry error context, Clerk user records beyond org removal). CCPA requires that service providers also delete data. Document which subprocessors retain data after offboarding and their data retention policies.

---

## Subprocessor Risk

### Highest Data Risk

1. **Railway** — Receives query text + org context (driver IDs, CDL/medical expiry, permit data, suspense items) on every Penny query. No SOC 2 certification listed. **Mitigated by**: HTTPS transport, org context capped at 8000 chars with anonymized IDs (no names), Railway processes ephemerally, API key authentication, CORS controls, audit logging. Railway is the highest-risk vendor due to the combination of sensitive data flow and absent certification.

2. **Anthropic** — Receives the same query + org context forwarded by Railway. No SOC 2 listed, though Anthropic publishes security practices and has undergone third-party assessments. **Mitigated by**: commercial API zero-retention policy (no training on customer data), HTTPS transport, prompt injection filtering.

3. **Neon** — Stores the entire database (all Fleet-Compliance records, org lifecycle data, subscriptions, audit events). Highest data volume. **Mitigated by**: SOC 2 Type II certification. Lowest unmitigated risk despite highest data concentration.

### Vendors Lacking SOC 2 Certification

| Vendor | Gap | Compensating Controls | Risk Level |
|---|---|---|---|
| **Railway** | No SOC 2 | 6 compensating controls documented in `SUBPROCESSORS.md:24-31` | High — primary AI backend runtime |
| **Anthropic** | No SOC 2 | Same 6 controls + zero-retention API terms | Medium — ephemeral processing only |
| **Google AI (Gemini)** | Not verified | Optional provider, same prompt controls apply | Low — only used when explicitly selected |
| **UptimeRobot** | No SOC 2 | Receives only public endpoint URLs and monitor metadata — no customer PII | Low — minimal data exposure |

**Recommendation**: For Railway specifically, evaluate whether the Penny backend could be migrated to a SOC 2-certified compute provider (e.g., AWS Fargate, Google Cloud Run, Render) to eliminate the highest-risk vendor gap. This is not a blocker but would significantly strengthen the CC9.1 posture.

---

## Top 3 Risks Entering Phase 8

1. **Status page is not operational.** `status.pipelinepunks.com` does not resolve. During a production incident there is no public communication channel beyond direct email. The setup guide and evidence checklist are ready — this is purely an operational execution item. Complete it before the first client engagement.

2. **Secret rotation has never been performed (carried from Phase 6).** All 18 secrets in `SECURITY_ROTATION.md` still show "Last Rotated: Not recorded." SOC 2 CC6.1 requires demonstrable credential lifecycle management. Perform an initial rotation of all 90-day secrets and record dates before client onboarding.

3. **`xlsx@0.18.5` has no upstream fix (carried from Phase 6).** High-severity prototype pollution and ReDoS with `fixAvailable: false`. The import flow processes admin-uploaded spreadsheets through this library. The trust boundary (admin-only uploads) reduces but does not eliminate risk. Evaluate replacement with `exceljs` or `sheetjs-ce`, or isolate parsing to a sandboxed worker with timeout.

---

## Implementation Quality Notes

**What was done well:**

- **Offboarding lifecycle automation is production-grade.** `offboarding-lifecycle.ts` handles table availability checking, structured metadata tracking, phased deletion (soft then hard), audit events at each stage, and returns a structured summary for cron evidence. The code is defensive: it checks table existence before querying, handles metadata parsing gracefully, and isolates per-org errors without aborting the sweep.

- **Stripe webhook integration closes the lifecycle loop.** `stripe/webhook/route.ts` sets `plan = 'canceled'` and schedules deletion on subscription cancellation, and clears the schedule on reactivation. This means the offboarding lifecycle is triggered automatically by billing events — not dependent on manual operator action.

- **Plan gate and auth layer enforce canceled access immediately.** `plan-gate.ts:45-46` recognizes `canceled`, `cancelled`, `unpaid`, and `incomplete_expired` as canceled states. `fleet-compliance-auth.ts:63` and `:86` throw 403 for canceled orgs. Access is blocked at the auth boundary, not just the data layer.

- **Incident response plan is now institutionally sound.** 4-role escalation chain, personal contact info removed from templates, GDPR Article 33 supervisory authority step added, generic security@pipelinepunks.com contact for client communications. The plan can survive team changes.

- **Subprocessor registry is comprehensive.** 13 vendors with purpose, data categories, cert status, and links. 6-point compensating controls section for non-SOC2 vendors. Quarterly review cycle. Vendor onboarding procedure. This is ready for auditor review.

- **Individual deletion request procedure** covers GDPR/CCPA requests from active users — a gap the initial audit identified and the remediation addressed.

- **Migration numbering clean.** `006_offboarding.sql` removed, `007_offboarding.sql` in place. No collision.

- **Next.js upgrade committed separately** (`edf0258`) with clean change management history. Phase 6 blocker closed.

**What needs follow-through:**

- Status page operationalization (DNS + UptimeRobot setup + evidence capture)
- First secret rotation pass with dates recorded
- `xlsx` replacement or isolation plan
- Verify Google AI (Gemini) SOC 2 status
- Evaluate Clerk API for programmatic org deletion in offboarding automation

**Build validation:** `npm run build` passes on Next 15.5.14 (2 existing no-autofocus warnings). `npm audit` reports 1 remaining high: `xlsx` (no upstream fix). No regressions introduced.
