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

- Certificates are generated and persisted under:
  - `storage/{org_id}/training-certs/{employee_id}/{module_code}_{date}.pdf`
- Application path recorded in DB:
  - `/{org_id}/training-certs/{employee_id}/{module_code}_{date}.pdf`
- Files are served through authenticated API route and not public static hosting.

## 5) Penny Integration Evidence

- Training markdown files are indexed into the CFR retrieval index via:
  - `scripts/build-cfr-index.mjs`
  - `src/lib/penny-ingest.ts`
- Local Penny catalog includes `Training Modules` category via:
  - `src/lib/penny-catalog.ts`
- Penny org context includes live training completion/deadline rows via:
  - `src/lib/penny-context.ts`

## 6) Operational Checks

- TypeScript validation:
  - `npx tsc --noEmit`
- Recommended post-deploy validation:
  1. Pass a module assessment and confirm `hazmat_training_records` row upsert.
  2. Download certificate from both admin and employee paths.
  3. Run each training report export in `csv` and `pdf`.
  4. Query Penny with:
     - "What does Module 6.0 cover?"
     - "Has <employee> completed hazmat training?"
     - "When is the team training due?"
