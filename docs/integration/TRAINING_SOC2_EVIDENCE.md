# Training Command SOC 2 Evidence (B9)

Last Updated: 2026-04-01  
Scope: training-command reporting, certificate delivery, and Penny training/compliance query context

## 1) Access Controls

- Training API routes require authenticated Clerk session and org scope:
  - `src/app/api/v1/training/*`
  - `src/app/api/v1/training/reports/route.ts`
  - `src/app/api/v1/training/certificates/route.ts`
- Report exports are admin-only, except employee self-transcript:
  - Non-admin access is limited to `employee_transcript` for self.
- Certificate download route enforces tenant + role checks:
  - Admin can request any org employee certificate.
  - Member can request only own certificate.

## 2) Audit Trail

- Training report generation logs read events through `auditLog`:
  - `training.reports.org_completion`
  - `training.reports.employee_transcript`
  - `training.reports.hours`
  - `training.reports.audit_package`
- Certificate download events are logged as `training.certificate`.
- Assessment submission logs write events as `training.assessment`, including score/pass metadata.

## 3) Data Integrity and Evidence Output

- Canonical compliance source:
  - `hazmat_training_records` (completion, due dates, certificate path, credit pathway)
- Operational training source:
  - `training_progress` and `training_assignments` (attempts, time spent, scores)
- Exports available:
  - Org completion report (`json/csv/pdf`)
  - Employee transcript (`json/csv/pdf`)
  - Training hours report (`json/csv/pdf`)
  - DOT audit package (`json/csv/pdf`)

## 4) Retention and Storage

- Certificates are generated and persisted in durable DB storage (`training_certificate_files`) with authenticated read access.
- Application path is still recorded in compliance records for deterministic lookup:
  - `/{org_id}/training-certs/{employee_id}/{module_code}_{date}.pdf`
- Certificate download route records both:
  - `training.certificate` (read event)
  - `training.certificate.regenerated` when a missing binary is regenerated before serving
- Offboarding hard delete now includes training tables:
  - `training_progress`
  - `training_assignments`
  - `training_plans`
  - `hazmat_training_records`

### Training Data Retention Policy (49 CFR 172.704(d) + SOC 2 CC6.5)

- Active tenant:
  - Keep `hazmat_training_records`, `training_assignments`, and `training_progress` for the current employment/compliance cycle.
- Canceled tenant:
  - Soft delete at 30 days.
  - Hard delete at 60 days through the offboarding lifecycle sweep.
- Auditability:
  - Offboarding row counts are captured in org metadata and org audit events.

## 5) Penny Integration Evidence

- Training markdown files are indexed into the CFR retrieval index via:
  - `scripts/build-cfr-index.mjs`
  - `src/lib/penny-ingest.ts`
- Local Penny catalog includes `Training Modules` category via:
  - `src/lib/penny-catalog.ts`
- Penny org context includes live training completion/deadline rows via:
  - `src/lib/penny-context.ts`
- Penny training context is de-identified to employee IDs (no employee full names).

## 6) Operational Checks

- TypeScript validation:
  - `npx tsc --noEmit`
- Hazmat tracking API validation (new compliance surface):
  - `GET /api/v1/hazmat-training/{employee_id}`
  - `POST /api/v1/hazmat-training/{employee_id}/record`
  - `GET /api/v1/hazmat-training/org/{org_id}/summary`
  - `GET /api/v1/hazmat-training/org/{org_id}/expiring`
  - `GET /api/v1/hazmat-training/org/{org_id}/report`
  - `PUT /api/v1/hazmat-training/records/{record_id}`
  - `DELETE /api/v1/hazmat-training/records/{record_id}` (soft-delete behavior)
  - `POST /api/v1/hazmat-training/records/{record_id}/certificate` (PDF upload, durable DB-backed storage)
- Recommended post-deploy validation:
  1. Pass a module assessment and confirm `hazmat_training_records` row upsert.
  2. Download certificate from both admin and employee paths.
  3. Run each training report export in `csv` and `pdf`.
  4. Query Penny with:
     - "What does Module 6.0 cover?"
     - "Has <employee> completed hazmat training?"
     - "When is the team training due?"
