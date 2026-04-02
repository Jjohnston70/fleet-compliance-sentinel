# Training Module B7-B9 Compliance Audit Report

**Audit Date:** 2026-04-01
**Auditor:** Claude Opus 4.6 (automated compliance review)
**Scope:** Compliance auto-update (B7), certificate pipeline (B8), Penny integration + reporting (B9)
**SOC 2 Observation Window:** 2026-03-24 to 2026-06-22
**Regulatory Context:** 49 CFR 172 Subpart H (hazmat employee training records)

---

## CRITICAL — Regulatory and Data Integrity Failures

### C-1: No Server-Side Score Validation on Assessment Submit

**File:** `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts` lines 99-113
**Risk:** Fraudulent compliance records, invalid DOT audit trail

The assessment submit route accepts `score`, `total`, `percentage`, and `passed` directly from the client request body. It validates the field types (number, boolean) but **never recalculates** whether `passed` is correct given the actual answers submitted.

A client can POST:
```json
{ "answers": {}, "score": 1, "total": 10, "percentage": 10, "passed": true }
```

The server will:
1. Create a `hazmat_training_records` row with `status = 'complete'`
2. Generate a PHMSA-equivalent compliance certificate
3. Send a completion notification to the org admin
4. Clear the employee as trained under 49 CFR 172 Subpart H

**No answer key comparison occurs server-side.** The assessment JSON files in `knowledge/training-content/assessments/` contain correct answers, but the submit route never loads them. The `answers` field in the request body is accepted but unused.

**Regulatory impact:** A hazmat employee could fabricate a training completion record that would be presented to DOT/PHMSA auditors as proof of training. This is the single highest-risk finding.

**Recommendation:** Server-side must load the assessment JSON, score the `answers` dict against the answer key, compute `passed` from the `passingScore` threshold in module metadata, and reject or override the client-submitted `passed` boolean.

---

### C-2: No Transaction Wrapping on Compliance Write Sequence

**File:** `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts` lines 117-308
**Risk:** Partial compliance records, orphaned certificates, false audit trail

When an assessment passes, the submit route performs 6 sequential writes as independent SQL statements:

1. `training_progress` upsert (line 137-154)
2. `training_assignments` completion percentage update (line 157-179)
3. `hazmat_training_records` upsert (line 196-250)
4. Certificate PDF generation via `generateTrainingCertificate` (line 261-274)
5. `training_progress.certificate_url` update (line 277-283)
6. Resend email notification (line 291-303)

**None of these are wrapped in a SQL transaction.** If step 3 succeeds but step 4 fails (e.g., filesystem error), the database shows a completed compliance record with no valid certificate. If step 4 succeeds but step 3 had a transient failure, a certificate exists with no compliance record backing it.

The outer `catch` block (line 305-308) logs the error but the route **still returns HTTP 201 with `status: 'passed'`** to the client, meaning the user believes they passed even if the compliance record was never written.

```typescript
} catch (err) {
    // Log but don't fail the response — assessment result is still valid
    console.error('Failed to persist assessment result:', err);
}
```

**Regulatory impact:** A partial write produces a compliance record that cannot be fully validated in a DOT audit — either the certificate is missing for a "complete" record, or a certificate exists for a record that was never persisted.

**Recommendation:** Wrap steps 1-5 in a SQL transaction (`sql.begin()`). If any step fails, roll back. The HTTP response should reflect the actual persistence outcome, not the client-submitted result.

---

### C-3: Suspense Items NOT Cleared on Training Completion

**File:** `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts` (entire file)
**Cross-ref:** `src/lib/fleet-compliance-data.ts` lines 671-725
**Risk:** False compliance alerts, alert fatigue, incorrect suspense state

When training is completed, the submit route does NOT clear the corresponding suspense item. Grep for "suspense", "clear", or "susp-" in the submit route returned zero matches.

Meanwhile, `fleet-compliance-data.ts` generates suspense items from two sources:
- `generateSuspenseFromTrainingDeadlines` (line 671) — creates `susp-training-{employee}-{module}` items for assignment deadlines
- `generateSuspenseFromHazmatRecurrence` (line 699) — creates `susp-hazmat-renewal-{employee}-{module}` items for recurrence deadlines

After an employee passes a training module:
- The `hazmat_training_records.next_due_date` is set 3 years out
- The `training_assignments.status` may update to `complete`
- But no suspense clear operation runs

The recurrence suspense (`susp-hazmat-renewal-*`) will self-heal because the new `next_due_date` is 3 years away (> 90 days, so `generateSuspenseFromHazmatRecurrence` won't generate it). However, the assignment suspense (`susp-training-*`) is generated from `training_assignments.deadline` — and the deadline column is not updated by the submit route. If the deadline was within 90 days, the suspense item will persist even after completion.

**Operational impact:** Clients paying for compliance alerting will receive false "training due" alerts for training that was already completed. This undermines trust in the alert system.

**Recommendation:** On successful completion, either clear the suspense item directly or update the assignment deadline to null/far-future so the suspense generator skips it.

---

### C-4: DOT Audit Package Missing 49 CFR 172.704(d) Required Fields

**File:** `src/app/api/v1/training/reports/route.ts` lines 319-394
**Risk:** Non-compliant DOT audit documentation

49 CFR 172.704(d) requires training records to include five specific elements:

| Required Field | Present in Audit Package? | Notes |
|---|---|---|
| Hazmat employee's name | Yes | `employee_name` column |
| Most recent training completion date | Yes | `completion_date` column |
| Description of training materials | **No** | Module title is present but not the materials description |
| Name and address of hazmat trainer | **No** | System is self-paced; no trainer of record is stored |
| Certification that employee has been trained and tested | **Partial** | Certificate exists but audit export only shows `certificate_status: 'available'|'missing'` — no certification statement |

The `audit_package` report type exports: `employee_id`, `employee_name`, `module_code`, `status`, `next_due_date`, `certificate_status`. It is missing:
- **CFR reference** for each module (available in `hazmat_training_modules` table but not joined)
- **Trainer name/address** — the system has no concept of a trainer of record
- **Training materials description** — only the module title is present, not the content description or PHMSA equivalent reference

**Regulatory impact:** An audit package generated from this system would not satisfy a PHMSA field auditor checking 49 CFR 172.704(d) completeness. The certificate PDF itself contains more of the required information (CFR reference, PHMSA equivalent, score) than the audit export does.

**Recommendation:**
1. Add `cfr_reference`, `phmsa_equivalent`, and `credit_pathway` to the audit_package query by joining `hazmat_training_modules`
2. Designate a trainer of record (e.g., "True North Data Strategies, [business address]" or "Self-paced PHMSA-equivalent training") and store it as a config value or column
3. Add a certification statement field (e.g., "Employee has been trained and tested per 49 CFR 172.704(a)")

---

## HIGH — Security and Tenant Isolation Gaps

### H-1: HTML Injection in Training Completion Email

**File:** `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts` lines 44-56
**Risk:** Stored XSS via email, phishing vector

The `sendTrainingCompletionEmail` function interpolates values directly into HTML via template literals without HTML-encoding:

```typescript
const html = `...
    <p><strong>Employee:</strong> ${input.employeeName} (${input.employeeId})</p>
    <p><strong>Module:</strong> ${input.moduleTitle} (${input.moduleCode})</p>
    ...`;
```

While `employeeName` comes from Clerk (a trusted auth provider), the Clerk admin panel allows arbitrary name values. An attacker with org admin access could set an employee's name to `<img src=x onerror=alert(1)>` or inject a phishing link. The email is sent to the org admin, making this a targeted attack vector.

**Recommendation:** HTML-encode all interpolated values before embedding in the email template. At minimum: `&`, `<`, `>`, `"`, `'`.

---

### H-2: Certificate Storage on Ephemeral Filesystem (Vercel)

**File:** `src/lib/training-certificate.ts` lines 4-6, 116
**Risk:** Certificate loss, regenerated-not-original artifacts

`TRAINING_CERT_STORAGE_ROOT` defaults to `process.cwd()/storage`. On Vercel serverless functions, the filesystem is ephemeral — certificates written to local storage will not survive cold starts.

**Mitigating factor:** The certificate download route (`certificates/route.ts` lines 77-93) checks if the file exists and regenerates it on-the-fly if missing, using the original `completion_date` from the database. So certificates are functionally available.

**Remaining risk:**
- The regenerated certificate is not the same artifact as the original — there is no cryptographic binding (hash, signature, timestamp of original generation)
- If the certificate format changes in a code update, regenerated certificates will differ from originals
- There is no audit trail distinguishing "original generation" from "regenerated on download"
- For SOC 2 evidence, the assertion that "this certificate was generated at completion time" is not provable

**Recommendation:** Either:
1. Store certificates in object storage (S3/R2/GCS) for durability, or
2. Store the PDF bytes as a BYTEA column in the database alongside the `hazmat_training_records` row, or
3. At minimum, store a SHA-256 hash of the original certificate in the DB so regenerated certificates can be verified against the original

---

### H-3: PII Leakage in Penny Training Context

**File:** `src/lib/penny-context.ts` lines 336-342
**Risk:** Employee names sent to external LLM via Railway

The training records section of Penny's org context includes employee full names:

```typescript
const employeeLabel = row.employeeName || normalizeDriverId(row.employeeId);
// Output: "- Employee: John Smith | Module: TNDS-HZ-001 ..."
```

This is inconsistent with the driver section (lines 297-308), which anonymizes to Driver IDs only:

```typescript
const driverId = normalizeDriverId(driver.employeeId || driver.personId);
// Output: "- Driver ID: DRV001 | CDL Expires: ..."
```

The org context is sent to Railway's FastAPI backend (`penny/query/route.ts` line 526-544), which forwards it to an external LLM. Employee names are thus transmitted outside the Next.js server boundary.

**Recommendation:** Replace `row.employeeName` with `normalizeDriverId(row.employeeId)` in the training context to match the anonymization pattern used for drivers. Alternatively, document this as an accepted risk with client consent.

---

### H-4: Training Tables Missing from Offboarding Hard-Delete

**File:** `src/lib/offboarding-lifecycle.ts` lines 123-213
**Risk:** Data retention violation, GDPR/privacy exposure

`runHardDeleteForOrg` deletes from 10 tables when a client cancels:

| Deleted | NOT Deleted |
|---|---|
| fleet_compliance_records | **hazmat_training_records** |
| invoices + line items + work descriptions | **training_progress** |
| fleet_compliance_error_events | **training_assignments** |
| cron_log | **training_plans** |
| subscriptions | |
| stripe_webhook_events | |
| organization_contacts | |
| org_audit_events | |

When a client cancels their subscription and triggers offboarding, their training records — including employee names, email addresses, assessment scores, and certificate paths — persist indefinitely.

**SOC 2 impact:** The SOC 2 observation window requires demonstrable data lifecycle controls. Training records containing PII that survive offboarding hard-delete are a gap in the data retention story.

**Recommendation:** Add `hazmat_training_records`, `training_progress`, `training_assignments`, and `training_plans` (filtered by `org_id`) to the `runHardDeleteForOrg` function. Delete in FK-safe order: progress -> assignments -> plans -> records.

---

## MEDIUM — Compliance and SOC 2 Gaps

### M-1: No Data Retention Policy for Training Tables

**Cross-ref:** H-4 above
**Risk:** SOC 2 CC6.5 (data retention and disposal)

There is no documented retention policy for `training_progress`, `training_assignments`, or `hazmat_training_records`. 49 CFR 172.704(d) requires training records to be retained for the duration of employment plus the most recent training. After an employee leaves AND the 3-year recurrence cycle expires, the record could be eligible for archival.

The SOC 2 evidence file (`docs/integration/TRAINING_SOC2_EVIDENCE.md`) should document retention periods for these tables and the deletion mechanism.

---

### M-2: Certificate Regeneration Not Audit-Logged

**File:** `src/app/api/v1/training/certificates/route.ts` lines 77-93
**Risk:** SOC 2 evidence gap

When a certificate file is missing and regenerated on download (lines 78-93), the regeneration is not logged as a distinct audit event. The audit log on line 100 records `data.read` for the download, but does not distinguish between "served existing certificate" and "regenerated missing certificate then served it."

For SOC 2, this means there is no evidence trail showing when certificates were regenerated vs. served from original storage.

**Recommendation:** Add an audit event with action `training.certificate.regenerated` when `exists === false` and regeneration occurs.

---

### M-3: Alert Engine Does Not Query Training Deadlines Directly

**File:** `src/lib/fleet-compliance-alert-engine.ts` (entire file)
**Risk:** Training deadlines depend on suspense pass-through

The alert engine (`runFleetComplianceAlertSweep`) operates on `FleetComplianceSuspenseRecord[]` — it does not query training deadlines directly. Training deadlines reach the alert system only through the suspense generation pipeline in `fleet-compliance-data.ts`.

This is architecturally sound (single alert pathway), but it means:
- If the data loader fails to generate training suspense items (e.g., DB connection error in `loadHazmatTrainingRecurrenceRows`), training deadlines silently disappear from alerts
- The `catch` blocks in the data loader (lines 346-348, 374-377) return empty arrays on failure, suppressing errors

**Recommendation:** Add monitoring/alerting on the suspense generation step — if training suspense item count drops to zero for an org that previously had items, flag it.

---

### M-4: Report PDF Truncation at 30-42 Rows

**File:** `src/app/api/v1/training/reports/route.ts` and `src/lib/training-report-export.ts`
**Risk:** Incomplete audit documentation

Report PDFs are limited by the single-page PDF generator:
- `training-report-export.ts` line 63: `lines.slice(0, 42)` — max 42 lines per PDF
- Report route applies its own caps: `normalized.slice(0, 32)` for org completion, `normalized.slice(0, 30)` for audit package

A fleet with 50 employees × 12 modules = 600 records would have only ~30 shown in the PDF export. The CSV and JSON formats return all rows, but the PDF — the format most likely to be printed for a DOT auditor — is silently truncated.

**Recommendation:** Either add pagination (multi-page PDF) or add a visible notice in the PDF: "Showing 30 of 600 records. Use CSV export for complete data."

---

## CONFIRMED WORKING — Clean Controls

### Authentication and Tenant Isolation

| Control | Status | Evidence |
|---|---|---|
| Assessment submit requires Clerk auth + org membership | Confirmed | `requireFleetComplianceOrg` at line 86 of submit route |
| Certificate download enforces org_id on DB query | Confirmed | `WHERE org_id = ${orgId}` at line 38 of certificates route |
| Certificate download restricts non-admin to own records | Confirmed | Role check at line 30-31: `role !== 'admin' && employeeId !== userId` returns 403 |
| Reports route enforces org_id on all queries | Confirmed | All SQL queries filter `WHERE ... org_id = ${orgId}` or `WHERE ta.org_id = ${orgId}` |
| Non-admin restricted to `employee_transcript` report only | Confirmed | Lines 55-60 of reports route |
| Module code validated via regex | Confirmed | `/^TNDS-HZ-\d{3}[a-d]?$/` on all training routes |
| Penny query enforces Clerk auth + rate limiting | Confirmed | `checkPennyRateLimit` at line 419 of penny query route |

### Compliance Record Integrity (Partial)

| Control | Status | Evidence |
|---|---|---|
| `hazmat_training_records` table exists with migration 013 | Confirmed | `migrations/013_hazmat_training_compliance.sql` |
| UNIQUE constraint on `(org_id, employee_id, module_code)` | Confirmed | Migration line 38 |
| Upsert is idempotent on re-completion | Confirmed | `ON CONFLICT (org_id, employee_id, module_code) DO UPDATE` at submit route line 234 |
| Completion date set server-side (`new Date()`) | Confirmed | Submit route line 183 — not client-controlled |
| `next_due_date` uses completion_date + recurrenceCycleYears | Confirmed | Submit route lines 186-187 — correctly adds to completion date, not assignment date |
| Certificate URL is server-generated | Confirmed | Template at line 188: `/${orgId}/training-certs/${userId}/${moduleCode}_${date}.pdf` |
| `employeeName` sourced from Clerk (trusted), not request body | Confirmed | Submit route lines 189-193 — fetched via `currentUser()` |
| Certificate path traversal protection | Confirmed | `resolveCertificateAbsolutePath` validates path stays within STORAGE_ROOT (certificate.ts lines 64-76) |

### Penny Integration

| Control | Status | Evidence |
|---|---|---|
| 12 hazmat training markdown files exist | Confirmed | `knowledge/training-content/hazmat/TNDS-HZ-000` through `TNDS-HZ-008` |
| Training markdowns indexed into Penny retrieval | Confirmed | `penny-ingest.ts` lines 90-116 — reads TRAINING_DOCS_DIR and adds to CFR index |
| Penny org context includes live training data | Confirmed | `penny-context.ts` `loadTrainingContextRows` queries `hazmat_training_records` and `training_assignments/progress` |
| Training context capped at 40 entries | Confirmed | `penny-context.ts` line 352 — `.slice(0, 40)` |
| Overall context cap enforced (12,000 chars) | Confirmed | `MAX_CONTEXT_CHARS = 12000` with `trimToMaxContextChars` trim function |
| Combined context for Railway capped (7,900 chars) | Confirmed | `RAILWAY_ORG_CONTEXT_MAX_CHARS = 7900` in penny query route |

### Training Suspense Generation

| Control | Status | Evidence |
|---|---|---|
| Training assignment deadlines feed suspense | Confirmed | `generateSuspenseFromTrainingDeadlines` in fleet-compliance-data.ts lines 671-697 |
| Hazmat recurrence deadlines feed suspense | Confirmed | `generateSuspenseFromHazmatRecurrence` in fleet-compliance-data.ts lines 699-725 |
| 90-day warning window for training deadlines | Confirmed | Both functions filter `days > 90` |
| Severity escalation at 30-day threshold | Confirmed | `days <= 30 ? 'high' : 'medium'` |

### Audit Logging

| Route | Audit Event | Status |
|---|---|---|
| Assessment submit | `data.write` / `training.assessment` | Confirmed (line 310-322) |
| Certificate download | `data.read` / `training.certificate` | Confirmed (line 100-109) |
| Reports (all types) | `data.read` / `training.reports.*` | Confirmed (lines 109, 205, 276, 346) |
| Training assignments | `data.read` + `data.write` / `training.assignments` | Confirmed |
| Training plans | `data.read` + `data.write` / `training.plans` | Confirmed |
| Training progress | `data.write` / `training.progress` | Confirmed |
| Penny query | `penny.query` with context metadata | Confirmed (lines 594-611) |

---

## Summary

| Severity | Count | Key Theme |
|---|---|---|
| **CRITICAL** | 4 | Score validation bypass, no transactions, stale suspense, missing audit fields |
| **HIGH** | 4 | Email injection, ephemeral storage, PII leakage, offboarding gap |
| **MEDIUM** | 4 | Retention policy, regeneration logging, alert monitoring, PDF truncation |
| **CONFIRMED** | 28 controls | Auth, tenant isolation, audit logging, Penny integration all verified |

### Triage Priority

1. **C-1** (score validation) — highest regulatory risk, must fix before any client goes live
2. **C-2** (transaction wrapping) — prevents partial compliance records
3. **C-4** (audit package fields) — required for DOT audit readiness
4. **H-4** (offboarding gap) — SOC 2 observation window is active
5. **C-3** (suspense clearing) — client-facing alert accuracy
6. **H-2** (certificate storage) — move to durable storage before production load
7. Remaining HIGH and MEDIUM items in any order

---

*Report generated 2026-04-01. No code changes made. All findings require Jacob's triage before remediation.*
