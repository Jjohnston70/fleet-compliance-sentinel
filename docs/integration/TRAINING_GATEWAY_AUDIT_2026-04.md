# TRAINING + MODULE GATEWAY PRODUCTION READINESS AUDIT

Date: 2026-04-02  
Scope: Workstream A (Module Gateway) + Workstream B1-B6 (Training)

## Assumptions / Limits
- `PIPELINE-PUNKS-NEXTJS-6` was treated as a production fact pattern (missing relation in Neon). Repo review confirms migration exists, but deployment-state verification is inferred from codepaths and scripts (no direct Neon console access in this session).
- `PIPELINE-PUNKS-NEXTJS-5` (hydration on `/fleet-compliance/tools`) could not be deterministically reproduced from static code alone; finding is based on code-level hydration risk patterns in reviewed files.
- No code changes were made; findings only.

## CRITICAL — Fix Before First Paying Client

### C-1: Training schema rollout is not deployment-safe; missing-table failures are expected in prod
- Evidence:
  - `training_assignments`/`training_progress`/`training_plans` are created in migration only: `migrations/012_training_tables.sql:22`, `migrations/012_training_tables.sql:41`, `migrations/012_training_tables.sql:6`.
  - App routes query these tables directly with no schema guard/fallback: `src/app/api/v1/training/progress/route.ts:38`, `src/app/api/v1/training/assignments/route.ts:33`, `src/app/api/v1/training/plans/route.ts:26`, `src/app/api/v1/training/reports/route.ts:81`, `src/app/api/v1/training/certificates/route.ts:37`.
  - No migration runner in scripts: `package.json:9`-`package.json:22`.
  - `scripts/init-db.mjs` provisions only `chief_records`: `scripts/init-db.mjs:28`-`scripts/init-db.mjs:41`.
- Impact:
  - Live 500s in training APIs (already visible via Sentry issue 6), blocking assignment/progress/reporting/certificates.
- Remediation:
  - Add a deterministic migration pipeline for deploy (CI/CD gate + startup check).
  - Add a preflight health check that asserts required training tables before enabling training routes.

### C-2: Assessment pass/fail is client-trusted; regulatory completion can be forged
- Evidence:
  - Server validates only types for `score/total/percentage/passed`, not correctness: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:106`-`src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:113`.
  - Server writes client-provided `percentage`/`passed` into `training_progress`: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:143`-`src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:150`.
  - Client computes and submits final score/pass directly: `src/components/training/TrainingAssessment.tsx:137`-`src/components/training/TrainingAssessment.tsx:165`.
- Impact:
  - Any authenticated user can submit a fabricated passing payload and generate fraudulent compliance completion.
- Remediation:
  - Recompute score server-side from authoritative answer key.
  - Ignore client `score/percentage/passed` for persistence decisions.

### C-3: Compliance completion/certificate can be recorded without assignment or deck completion
- Evidence:
  - `assignmentId` is nullable and only set if assignment lookup succeeds: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:119`, `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:133`-`src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:134`.
  - Pass branch (`if (body.passed)`) still writes compliance record + certificate generation regardless of assignment existence: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:182`, `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:196`, `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:261`.
  - No server check for `deck_completed_at`/`deck_complete` before accepting assessment submit.
- Impact:
  - Users can bypass assigned training flow and still create formal completion artifacts.
- Remediation:
  - Require an org-scoped active assignment and module progress row.
  - Enforce deck completion server-side before allowing assessment submission.

### C-4: Assessment submit masks persistence failures and still returns success
- Evidence:
  - Persistence block catches all errors and continues: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:305`-`src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:308`.
  - Endpoint still returns `201` with client-provided result payload: `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:324`-`src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:330`.
- Impact:
  - Silent data integrity failures (UI says passed; DB/certificate state can be partial or absent).
- Remediation:
  - Fail closed on persistence errors; return non-2xx.
  - Wrap assessment/progress/compliance/certificate writes in a transaction with explicit rollback.

### C-5: Remote Module Gateway path is not tenant-bound end-to-end
- Evidence:
  - Remote run dispatch sends only module/action args (no org/user context payload/header): `src/app/api/modules/run/route.ts:230`, `src/lib/modules-gateway/remote.ts:66`-`src/lib/modules-gateway/remote.ts:73`.
  - Remote artifact fetch returns streamed bytes without local org ownership verification in remote mode: `src/app/api/modules/artifact/route.ts:62`-`src/app/api/modules/artifact/route.ts:87`.
  - Status check only enforces org mismatch if `run.orgId` exists; missing orgId bypasses tenant check: `src/app/api/modules/status/[id]/route.ts:90`-`src/app/api/modules/status/[id]/route.ts:95`.
- Impact:
  - If remote service does not enforce org ownership independently, cross-tenant run/artifact exposure is possible.
- Remediation:
  - Propagate signed org/user claims to remote gateway.
  - Require org match on every remote status/artifact response.
  - Reject remote responses with missing org ownership metadata.

### C-6: New orgs get zero training plans and cannot assign training from UI
- Evidence:
  - Seed plan is hardcoded to `org_default`: `migrations/012_training_tables.sql:72`.
  - Plans API filters by caller org: `src/app/api/v1/training/plans/route.ts:27`.
  - Training management UI has assign flow only (no plan creation UX): `src/components/training/TrainingManagement.tsx:187`-`src/components/training/TrainingManagement.tsx:267`.
- Impact:
  - First-time tenant onboarding can land in unusable training admin flow.
- Remediation:
  - Seed baseline training plan per org on provisioning (or first training access).
  - Add explicit plan creation UX if per-org customization is intended.

## HIGH — Fix Before Client #5

### H-1: Training management data is visible to non-admin members
- Evidence:
  - Management page allows any authenticated org member: `src/app/fleet-compliance/training/manage/page.tsx:10`-`src/app/fleet-compliance/training/manage/page.tsx:13`.
  - Assignments GET uses member-level auth and returns full org assignments when no filter is provided: `src/app/api/v1/training/assignments/route.ts:12`, `src/app/api/v1/training/assignments/route.ts:48`-`src/app/api/v1/training/assignments/route.ts:67`.
- Impact:
  - Internal privacy leak of employee IDs, assignment status, completion, deadlines.
- Remediation:
  - Require admin role on management page and for unfiltered assignments listing.

### H-2: Assignment target identity is not org-validated
- Evidence:
  - `employee_id` validation is only “non-empty string”: `src/app/api/v1/training/assignments/route.ts:103`-`src/app/api/v1/training/assignments/route.ts:105`.
  - Direct insert of user-supplied identifier: `src/app/api/v1/training/assignments/route.ts:143`.
  - UI hints arbitrary IDs (example `EMP-001`): `src/components/training/TrainingManagement.tsx:239`.
- Impact:
  - Identity spoofing / orphaned assignments; weak auditability for DOT training records.
- Remediation:
  - Bind assignments to org membership directory/employee table with referential validation.

### H-3: Answer key is exposed to clients
- Evidence:
  - Assessment endpoint returns full assessment JSON object to client: `src/app/api/v1/training/[moduleCode]/assessment/attempts/route.ts:40`-`src/app/api/v1/training/[moduleCode]/assessment/attempts/route.ts:42`, `src/app/api/v1/training/[moduleCode]/assessment/attempts/route.ts:66`.
  - Source JSON includes `is_correct` and `correct_answer` fields (example): `knowledge/training-content/assessments/TNDS-HZ-000-assessment.json:20`, `knowledge/training-content/assessments/TNDS-HZ-000-assessment.json:38`.
- Impact:
  - Assessment can be trivially aced without training comprehension.
- Remediation:
  - Return question text/options without correctness markers; grade server-side.

### H-4: Certificate storage is not durable in serverless runtime
- Evidence:
  - Default storage root is local filesystem under app working directory: `src/lib/training-certificate.ts:4`-`src/lib/training-certificate.ts:5`.
  - Certificates are written to local disk: `src/lib/training-certificate.ts:116`.
- Impact:
  - Cold starts/deploys can drop generated certificates; audit artifact availability risk.
- Remediation:
  - Move certificate binaries to durable object storage (S3/R2/GCS) and keep DB pointer.

### H-5: Path traversal guard in certificate resolver is boundary-unsafe
- Evidence:
  - Guard relies on `absolute.startsWith(STORAGE_ROOT)`: `src/lib/training-certificate.ts:72`.
- Impact:
  - Prefix-based checks are not robust path-boundary validation.
- Remediation:
  - Replace with `path.relative` boundary enforcement and reject `..` or absolute-relative escapes.

## MEDIUM — Fix Within SOC 2 Window (Before June 22)

### M-1: Assignment creation + progress row creation is not transactional
- Evidence:
  - Assignment insert occurs first: `src/app/api/v1/training/assignments/route.ts:138`.
  - Per-module progress inserts run sequentially afterward: `src/app/api/v1/training/assignments/route.ts:161`-`src/app/api/v1/training/assignments/route.ts:171`.
- Impact:
  - Partial state possible under mid-loop DB failure (assignment exists but incomplete progress matrix).
- Remediation:
  - Wrap assignment + all progress inserts in a single DB transaction.

### M-2: `/fleet-compliance/tools` hydration issue is not pinned to a deterministic mismatch in current revision
- Evidence:
  - Reviewed `src/app/fleet-compliance/tools/page.tsx` and `src/components/fleet-compliance/ModuleGatewayPanel.tsx`; no obvious first-render random/clock-based rendering in panel shell.
  - Remaining risk pattern: locale-sensitive timestamp rendering helper in client panel (`toLocaleString`) can diverge by environment when SSR content includes timestamped rows: `src/components/fleet-compliance/ModuleGatewayPanel.tsx:120`-`src/components/fleet-compliance/ModuleGatewayPanel.tsx:124`.
- Impact:
  - Hydration errors can degrade admin tooling UX and trust.
- Remediation:
  - Stabilize client/server formatting (ISO on SSR, localize post-mount), and capture exact Sentry stack/component path to close root cause.

### M-3: Training table availability failures are not uniformly handled across APIs
- Evidence:
  - Some routes hard-fail on missing tables (no catch): `src/app/api/v1/training/progress/route.ts:27`, `src/app/api/v1/training/assignments/route.ts:26`, `src/app/api/v1/training/plans/route.ts:21`.
  - Other route degrades silently (`assessment/attempts`): `src/app/api/v1/training/[moduleCode]/assessment/attempts/route.ts:62`-`src/app/api/v1/training/[moduleCode]/assessment/attempts/route.ts:64`.
- Impact:
  - Inconsistent failure behavior complicates incident triage and SOC2 evidence consistency.
- Remediation:
  - Standardize schema-readiness checks and error contracts across all training routes.

## STYLING FIXES — Fix Before Training Goes Live

### S-1: Training pages rely on Tailwind utility classes, but Tailwind directives are missing from global stylesheet
- Evidence:
  - Training UI uses utility classes heavily: `src/app/fleet-compliance/training/page.tsx:71`, `src/app/fleet-compliance/training/[moduleCode]/page.tsx:47`, `src/components/training/TrainingDeckViewer.tsx:236`-`src/components/training/TrainingDeckViewer.tsx:271`.
  - `src/styles/globals.css` does not include Tailwind base/components/utilities directives (file starts with custom CSS declarations only): `src/styles/globals.css:1`.
- Root cause:
  - Utility class CSS is not generated/applied, so controls render as browser defaults.
- Remediation:
  - Restore Tailwind CSS inclusion in the global CSS pipeline.

### S-2: “Previous/Next” buttons are not a duplicate control set; they are the intended styled buttons in `TrainingDeckViewer`
- Evidence:
  - Only navigation controls in deck view are in `TrainingDeckViewer`: `src/components/training/TrainingDeckViewer.tsx:236`-`src/components/training/TrainingDeckViewer.tsx:271`.
  - Page wrapper only adds back/catalog and mode shell: `src/app/fleet-compliance/training/[moduleCode]/page.tsx:46`-`src/app/fleet-compliance/training/[moduleCode]/page.tsx:75`.
- Root cause:
  - Styling pipeline issue, not duplicate unstyled controls.
- Remediation:
  - Fix Tailwind load path first; then validate visual hierarchy.

### S-3: No training-specific fallback styles exist in global CSS
- Evidence:
  - Global CSS includes dedicated `.legal-*` blocks but no equivalent training-specific class system: `src/styles/globals.css:1188`-`src/styles/globals.css:1244`.
- Impact:
  - If utility CSS is unavailable, training UX collapses to unstyled plain HTML.
- Remediation:
  - Add minimal resilient training styles or ensure utility CSS is a hard requirement with deployment checks.

## CONFIRMED WORKING — What the Sprint Got Right
- Training plans and assignment/progress routes enforce org scoping in SQL predicates (`org_id` in WHERE): `src/app/api/v1/training/plans/route.ts:27`, `src/app/api/v1/training/assignments/route.ts:43`, `src/app/api/v1/training/progress/route.ts:41`.
- Assignment creation endpoint enforces admin role server-side: `src/app/api/v1/training/assignments/route.ts:85`.
- Certificate endpoint prevents non-admin cross-user certificate access: `src/app/api/v1/training/certificates/route.ts:30`-`src/app/api/v1/training/certificates/route.ts:32`.
- ACL persistence and lazy org seeding are implemented (new orgs are not permanently “empty catalog”): `src/lib/modules-gateway/persistence.ts:401`, `src/lib/modules-gateway/persistence.ts:545`.
- Local mode module artifact/status paths enforce run org ownership (`TENANT_ISOLATION_VIOLATION`): `src/app/api/modules/artifact/route.ts:101`-`src/app/api/modules/artifact/route.ts:112`, `src/app/api/modules/status/[id]/route.ts:141`-`src/app/api/modules/status/[id]/route.ts:145`.
- Duplicate-safe upserts are present on assignment/progress/compliance record writes: `src/app/api/v1/training/assignments/route.ts:149`, `src/app/api/v1/training/assignments/route.ts:170`, `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:146`, `src/app/api/v1/training/[moduleCode]/assessment/submit/route.ts:234`.
