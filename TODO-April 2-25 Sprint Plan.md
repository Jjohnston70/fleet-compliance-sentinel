# FCS Sprint Plan -- April 2-25, 2026

**True North Data Strategies | Pipeline Punks**
**Project**: Fleet-Compliance Sentinel
**Owner**: Jacob Johnston | jacob@truenorthstrategyops.com
**Version**: 2.0 | 2026-04-01
**Repo Root**: `00-FLEET-COMPLIANCE-SENTINEL`

---

## SPRINT GOAL

Two parallel workstreams running through April:

**Workstream A -- Enterprise Function Calling Hardening**: Harden the module gateway and command-center orchestration to enterprise production standards across 7 control layers. This secures the foundation before broader rollout and SOC 2 Type I audit (eligible June 22).

**Workstream B -- training-command Module Build**: Build a self-contained training LMS inside FCS. Content authored from existing knowledge base (ERG, CFR, PHMSA), delivered as slide decks with assessments, auto-updates compliance records on completion. Starts with hazmat, expands to any compliance topic.

These workstreams are complementary, not competing. The hardening secures the orchestration layer that training-command will eventually route through. Training content authoring (markdown files) is pure content work that runs in parallel without touching gateway code.

---

## CURRENT BASELINE (Audit-Locked 2026-04-01)

**Module Gateway Status**:

- Operational for ML-EIA, ML-SIGNAL, PaperStack, and command-center bridge
- `discover.tools` uses manifest-stub discovery (`discover_<module>`), not full semantic tool selection
- `route.tool_call` validates + records routing but does not execute downstream module business handlers
- Module run auth gates enforce org + admin role at API boundary
- Timeouts and action allowlists implemented
- Full durable call audit + token cost attribution + strict tenant tool ACL: NOT complete
- `financial-command` tool handlers: placeholders

**Penny Status**:

- CFR index refreshed: PHMSA training doc indexed (9 chunks)
- Demo index refreshed: ERG, HubSpot, J.J. Keller, Tenstreet all indexed
- 25,616 chunks in Electron FAISS vector store (full rebuild complete)

**Knowledge Base Status**:

- ERG 2024 full text ingested (813KB, 32K lines)
- PHMSA OTIS training requirements documented (12 required + 19 supplemental modules)
- 34 platforms worth of llms.txt documentation downloaded (104MB+)
- J.J. Keller and Tenstreet competitive intel complete

---

## CROSS-WORKSTREAM CONSTRAINTS (Always On)

- Keep scope additive; avoid broad refactors
- Keep Penny `/api/penny/query` behavior stable
- Keep existing module gateway endpoints stable:
  - `POST /api/modules/run`
  - `GET /api/modules/status/:id`
  - `GET /api/modules/catalog`
- No destructive git commands
- Keep command execution allowlisted and deterministic
- Do not introduce raw arbitrary shell execution paths
- One commit per task using `hardening(taskN)` or `training(phaseN)` prefix

---

# WORKSTREAM A: Enterprise Function Calling Hardening

## Definition of Done

- [x] Layer 1: Context-aware tool registry with capped tool exposure
- [x] Layer 2: Bidirectional schema validation with coercion + structured correction errors
- [x] Layer 3: Execution sandbox with permission checks, rate limits, sanitization, timeout enforcement
- [x] Layer 4: Retry manager with cap=3 and escalation
- [x] Layer 5: Token/cost attribution with budget alerts
- [x] Layer 6: Durable append-only audit logging for all tool calls
- [x] Layer 7: Strict tenant/user tool isolation (visibility + execution)
- [x] Integration tests pass and go/no-go report published

---

### A0 -- Preflight Contract Freeze

**Priority**: BLOCKING (all layers depend on this)
**Estimated Effort**: 2-3 hours

- [x] Freeze orchestration contract and non-negotiable controls before implementation

**File Targets**:

- `todo.md`
- `docs/STATUS.md`
- `docs/integration/ENTERPRISE_FUNCTION_CALLING_HARDENING.md` (new)
- `src/lib/modules-gateway/types.ts`

**Deliverables**:

- Canonical call envelope documented (`requestId`, `orgId`, `userId`, `qualifiedName`, `args`, `attempt`, `status`, `errorCode`)
- Finalized error code taxonomy with retryable/non-retryable classes
- Implementation boundaries locked for Layers 1-7

**Acceptance Tests**:

1. Envelope and error taxonomy documented with examples
2. No API contract break for existing module routes

**Commit**: `hardening(task0): contract freeze and envelope docs`

**Prompt (Use At Task Start)**:

```text
Task 0: Preflight contract freeze.
Context:
- Repo root is 00-FLEET-COMPLIANCE-SENTINEL.
- Existing gateway endpoints and UI are in production use.
- command-center bridge currently supports discover/search/schema/route/status/dashboard/usage actions.
Constraints:
- Additive changes only; no broad refactor.
- Keep existing endpoints stable.
- Do not break Penny behavior.
Deliverables:
- Canonical orchestration call envelope and error taxonomy in docs.
- Type updates in modules-gateway types.
Outputs:
- Contract lock used by Layer 1-7 implementation.
At task end:
- Update todo.md checkboxes.
- Update docs/STATUS.md.
```

---

### A1 -- Layer 1: Tool Registry (Context-Aware Selection)

**Priority**: High (foundation for all tool interactions)
**Estimated Effort**: 1-2 days
**Depends On**: A0

- [x] Implement smart tool selection so model sees only relevant tools per request (cap 10-15)

**File Targets**:

- `tooling/command-center/src/services/discovery-service.ts`
- `tooling/command-center/src/services/search-service.ts`
- `tooling/command-center/src/services/router-service.ts`
- `tooling/command-center/src/config/module-manifest.ts`
- `tooling/command-center/src/tools.ts`
- `tooling/command-center/src/api/handlers.ts`
- `src/lib/modules-gateway/command-center-bridge.ts`
- `src/app/api/modules/command-center/tools/route.ts`
- `src/lib/modules-gateway/persistence.ts`

**Deliverables**:

- Real tool registry ingestion from module definitions (not stub-only discover entries)
- Relevance-scored selection path with hard cap
- Cache strategy for repeated intent/tool retrieval

**Acceptance Tests**:

1. `discover.tools` returns real tool entries (not only `discover_<module>`)
2. Tool selection returns <= configured cap
3. `npm --prefix tooling/command-center run build` passes
4. `npm --prefix tooling/command-center run test` passes

**Commit**: `hardening(layer1): context-aware tool registry and selection caps`

**Prompt (Use At Task Start)**:

```text
Task 1: Layer 1 tool registry hardening.
Context:
- command-center currently discovers modules from static manifest and stubs discover_<module> tools.
- Need production-grade context-aware tool selection.
Constraints:
- Keep public command-center action names stable.
- Keep module gateway API contracts stable.
- No arbitrary tool exposure.
Deliverables:
- Real registry ingestion + relevance selection + capped tool response.
- Persistence/cache support for discovery snapshots.
Outputs:
- 10-15 relevant tools per request path with deterministic behavior.
At task end:
- Update todo.md and docs/STATUS.md.
- Add/adjust tests for selection behavior.
```

---

### A2 -- Layer 7: Multi-Tenant Tool Isolation (Visibility + Execution)

**Priority**: High (isolation before execution controls)
**Estimated Effort**: 1-2 days
**Depends On**: A0

- [x] Enforce explicit per-org/per-user tool ACL at both selection and execution

**File Targets**:

- `src/lib/fleet-compliance-auth.ts`
- `src/lib/modules-gateway/types.ts`
- `src/lib/modules-gateway/runner.ts`
- `src/app/api/modules/run/route.ts`
- `src/app/api/modules/catalog/route.ts`
- `src/app/api/modules/command-center/tools/route.ts`
- `src/lib/modules-gateway/persistence.ts`
- `tooling/command-center/src/api/handlers.ts`
- `tooling/command-center/src/services/discovery-service.ts`

**Deliverables**:

- ACL data model for org/user -> module/tool/action mapping
- Deny-by-default enforcement on run + route
- Catalog and command-center tool listings filtered by ACL

**Acceptance Tests**:

1. Same user across two orgs receives different tool catalogs
2. Disallowed tool call fails with explicit permission error
3. Allowed tool call succeeds under same runtime conditions

**Commit**: `hardening(layer7): tenant tool isolation and ACL enforcement`

**Prompt (Use At Task Start)**:

```text
Task 2: Layer 7 multi-tenant isolation.
Context:
- API boundary already requires org + admin role, but tool-level ACL is not strict.
- Need isolation at visibility and execution layers.
Constraints:
- Deny-by-default.
- Preserve existing auth flows and Clerk integration.
- No cross-tenant leakage in list/search/run responses.
Deliverables:
- ACL schema + filtered catalog + execution enforcement.
Outputs:
- Explicit tenant/user tool isolation in production paths.
At task end:
- Update todo.md and docs/STATUS.md.
- Document ACL rules in integration docs.
```

---

### A3 -- Layer 2: Schema Validation (Bidirectional + Coercion)

**Priority**: Medium-High
**Estimated Effort**: 1 day
**Depends On**: A1

- [x] Add coercion-first validation and structured model-corrective errors for input/output

**File Targets**:

- `src/lib/modules-gateway/registry.ts`
- `src/lib/modules-gateway/types.ts`
- `src/lib/modules-gateway/runner.ts`
- `tooling/command-center/src/services/router-service.ts`
- `tooling/command-center/src/api/handlers.ts`
- `docs/integration/MODULE_GATEWAY_CONTRACT.md`

**Deliverables**:

- Input coercion (`string->number/bool` where safe) + hard validation
- Output schema verification for routed tool results
- Structured validation errors designed for self-correction loops

**Acceptance Tests**:

1. Known malformed payloads are coerced or rejected with structured details
2. Enum and required-field failures return explicit per-field messages
3. Build passes: `npm run lint` and `npm run build`

**Commit**: `hardening(layer2): bidirectional validation and coercion`

**Prompt (Use At Task Start)**:

```text
Task 3: Layer 2 schema validation.
Context:
- Current validation is strict type check but limited coercion and no output validation.
- Need model-corrective, structured errors.
Constraints:
- Keep existing action schemas backward-compatible where possible.
- Avoid silent unsafe coercions.
Deliverables:
- Coercion + input/output validators and normalized error payloads.
- Contract docs updated with examples.
Outputs:
- Bidirectional schema safety and recoverable failures.
At task end:
- Update todo.md and docs/STATUS.md.
- Add validation test fixtures.
```

---

### A4 -- Layer 3: Execution Sandbox (Permissions, Rate Limit, Sanitization, Timeouts)

**Priority**: Medium-High
**Estimated Effort**: 1-2 days
**Depends On**: A2

- [x] Add full sandbox controls around every tool execution path

**File Targets**:

- `src/lib/modules-gateway/runner.ts`
- `src/lib/modules-gateway/registry.ts`
- `src/lib/modules-gateway/types.ts`
- `src/app/api/modules/run/route.ts`
- `src/lib/modules-gateway/persistence.ts`
- `src/lib/penny-rate-limit.ts` (pattern reference, reuse approach or shared helper)
- `docs/integration/OPERATIONS_RUNBOOK.md`

**Deliverables**:

- Per-org/per-tool rate limits
- Concurrent run guardrails
- Unified sanitization policy (expand beyond PaperStack-only path checks)
- Existing timeout policy retained and validated

**Acceptance Tests**:

1. Rate-limit hit returns deterministic throttling error
2. Path traversal attempts blocked for file-based actions
3. Long-running task times out and emits expected error code

**Commit**: `hardening(layer3): execution sandbox limits and sanitization`

**Prompt (Use At Task Start)**:

```text
Task 4: Layer 3 execution sandbox.
Context:
- Timeouts and allowlists exist, but tenant/function rate limits and full sanitization policy are incomplete.
Constraints:
- No arbitrary command execution.
- Preserve current successful module workflows.
Deliverables:
- Rate limiting, concurrency guards, sanitization, and timeout enforcement for all calls.
Outputs:
- Production-safe sandbox behavior with deterministic failures.
At task end:
- Update todo.md and docs/STATUS.md.
- Add ops runbook entries for throttling/timeouts.
```

---

### A5 -- Layer 4: Retry Manager (Cap=3 + Escalation)

**Priority**: Medium
**Estimated Effort**: 1 day
**Depends On**: A3 (needs structured error codes for retry classification)

- [x] Implement structured retry orchestration with hard cap and escalation queue

**File Targets**:

- `src/lib/modules-gateway/runner.ts`
- `src/lib/modules-gateway/types.ts`
- `src/lib/modules-gateway/persistence.ts`
- `src/app/api/modules/run/route.ts`
- `tooling/command-center/src/api/handlers.ts`
- `docs/integration/COMMAND_CENTER_BRIDGE.md`

**Deliverables**:

- Retry policy by error class (retryable vs non-retryable from A0 taxonomy)
- Retry count persisted with run metadata
- Escalation artifact when retries exhausted

**Acceptance Tests**:

1. Retryable failure retries up to 3 attempts then escalates
2. Non-retryable failure does not retry
3. Retry history visible in run status payload

**Commit**: `hardening(layer4): retry manager and escalation`

**Prompt (Use At Task Start)**:

```text
Task 5: Layer 4 retry manager.
Context:
- Current flow returns immediate failure; no structured retries/escalation.
Constraints:
- Hard retry cap = 3.
- No silent repeated calls beyond cap.
Deliverables:
- Retry engine + escalation record + status visibility.
Outputs:
- Controlled recovery path and human handoff after cap.
At task end:
- Update todo.md and docs/STATUS.md.
- Document retry matrix and escalation behavior.
```

---

### A6 -- Layer 5: Cost Tracking (Token Attribution + Budget Alerts)

**Priority**: Medium
**Estimated Effort**: 1 day
**Depends On**: A4 (needs sandbox to gate cost recording)

- [x] Add durable token/cost accounting and threshold alerting by org/user/use-case

**File Targets**:

- `src/app/api/penny/query/route.ts`
- `src/lib/modules-gateway/persistence.ts`
- `src/lib/modules-gateway/types.ts`
- `src/lib/audit-logger.ts`
- `docs/integration/OPERATIONS_RUNBOOK.md`
- `docs/STATUS.md`

**Deliverables**:

- Usage table for prompt/completion/total tokens + computed cost
- Attribution keys: orgId, userId, requestId, model, feature/use-case
- Budget threshold alerts (warning and critical)

**Acceptance Tests**:

1. Penny query stores token/cost record when backend usage data is available
2. Budget threshold crossing emits alert event
3. Usage records queryable by org and period

**Commit**: `hardening(layer5): token cost tracking and budget alerts`

**Prompt (Use At Task Start)**:

```text
Task 6: Layer 5 cost tracking.
Context:
- Current audit logs include latency and metadata, but no durable token/cost attribution.
Constraints:
- Keep request latency impact minimal.
- Do not log sensitive payloads in cost tables.
Deliverables:
- Durable usage/cost records and threshold alerting.
Outputs:
- Per-tenant AI cost governance and reporting.
At task end:
- Update todo.md and docs/STATUS.md.
- Add runbook section for budgets and alerts.
```

---

### A7 -- Layer 6: Audit Logging (Durable, Complete, Append-Only)

**Priority**: High (SOC 2 requirement)
**Estimated Effort**: 1 day
**Depends On**: A0 (envelope schema)

- [x] Implement full durable tool-call audit history from day one

**File Targets**:

- `src/lib/audit-logger.ts`
- `src/lib/modules-gateway/persistence.ts`
- `src/lib/modules-gateway/runner.ts`
- `src/app/api/modules/status/[id]/route.ts`
- `src/app/api/modules/run/route.ts`
- `docs/integration/ENTERPRISE_FUNCTION_CALLING_HARDENING.md`

**Deliverables**:

- Append-only invocation log for all tool calls
- Fields: function/tool name, args (redacted), result status, tenant/org, user, requestId, runId, duration
- Retention and export policy documented

**Acceptance Tests**:

1. Every module run creates durable audit rows
2. Audit rows include org/user/request correlation fields
3. Redaction rules remove sensitive fields consistently

**Commit**: `hardening(layer6): durable audit logging`

**Prompt (Use At Task Start)**:

```text
Task 7: Layer 6 audit logging hardening.
Context:
- Current module runs are in-memory and partial persistence exists for insights/catalog snapshots.
Constraints:
- Append-only semantics for invocation audit.
- Redact sensitive fields before persistence.
Deliverables:
- Durable invocation logging for all tool executions.
- Correlation-ready fields for investigations.
Outputs:
- Compliance-grade audit trail for function calling.
At task end:
- Update todo.md and docs/STATUS.md.
- Add retention/export guidance.
```

---

### A8 -- Final Integration Validation + Go/No-Go

**Priority**: BLOCKING (gate for rollout)
**Estimated Effort**: 0.5-1 day
**Depends On**: A1-A7 all complete

- [x] Run integrated validation for Layers 1-7 and publish go/no-go report

**File Targets**:

- `docs/integration/ENTERPRISE_HARDENING_TEST_REPORT.md` (new)
- `docs/STATUS.md`
- `todo.md`

**Deliverables**:

- Test matrix covering: tenant isolation, tool selection cap, schema coercion/validation, sandbox throttling/timeouts/sanitization, retries + escalation, cost records + budget alert, durable audit traces

**Acceptance Tests**:

1. `npm --prefix tooling/command-center run build`
2. `npm --prefix tooling/command-center run test`
3. `npm run lint`
4. `npm run build`
5. API smoke checks (authenticated): catalog/run/status/artifact/command-center tools

**Commit**: `hardening(final): integration validation and go/no-go report`

**Prompt (Use At Task Start)**:

```text
Task 8: Final integration validation and go/no-go.
Context:
- Layers 1-7 implementation is complete in branch under review.
Constraints:
- No broad new features in this step.
- Focus on validation, defects, and release readiness.
Deliverables:
- End-to-end test report with pass/fail evidence.
- Final status update with explicit go/no-go recommendation.
Outputs:
- Production readiness decision for enterprise function-calling rollout.
At task end:
- Update todo.md final checkboxes.
- Update docs/STATUS.md with hardening summary.
```

---

# WORKSTREAM B: training-command Module Build

## THE VISION

Build a self-contained training module inside FCS where fleet operators can assign, deliver, track, and test employee training without depending on external platforms like OTIS. Training content is generated from the knowledge base already built (ERG 2024, CFR docs, PHMSA modules). Content lives as markdown, gets converted to slide decks via the Electron deck engine, and includes built-in assessments. When an employee completes training and passes the test, compliance status auto-updates. Fully self-contained per client org.

This is not a one-off hazmat feature. It's a training platform that starts with hazmat (because we have the content) and expands to any compliance topic: defensive driving, drug/alcohol awareness, DVIR procedures, cargo securement, new hire onboarding, DOT audit prep.

## Definition of Done

- [x] 12 hazmat training markdown files authored with assessments
- [x] Deck generation pipeline converts markdown to slide JSON
- [x] Web-based deck viewer for employee training delivery
- [x] Assessment engine with scoring and retake logic
- [x] Training assignment and progress tracking (3 new DB tables)
- [ ] Compliance auto-update on assessment pass
- [ ] Certificate PDF generation
- [ ] Penny can query training content and completion status

---

### B1 -- Training Content Authoring (Hazmat Modules)

**Priority**: High (no code dependencies -- can start Day 1)
**Estimated Effort**: 3-4 days total (split across weeks)
**Depends On**: Nothing (pure content)

- [x] Create 12 hazmat training markdown files from existing knowledge base

**Source Material Already Ingested**:

- ERG 2024 full text (813KB, 32K lines) -- `erg-hazmat/ERG2024-full.md`
- PHMSA OTIS training requirements -- `05_FMCSA-DOT/phmsa-otis-hazmat-training-requirements.md`
- 49 CFR Part 172 (Shipping Papers, Marking, Labeling, Placarding)
- 49 CFR Part 177/397 (Highway Carrier Requirements)
- 49 CFR Part 382 (Controlled Substances)
- 49 CFR Part 383 (CDL Standards)
- 49 CFR Part 391 (Driver Qualifications)
- 49 CFR Part 395 (Hours of Service)
- 49 CFR Part 396 (Inspection/Maintenance)
- 49 CFR Part 387 (Financial Responsibility)

**Training Markdown Template**:

```markdown
---
module_code: "TNDS-HZ-001"
title: "Hazardous Materials Table"
category: "hazmat"
cfr_reference: "49 CFR 172.101"
erg_section: "Yellow/Blue Pages"
phmsa_equivalent: "Module 1.0"
estimated_duration_minutes: 30
passing_score: 80
version: "1.0"
created: "2026-04-02"
---

# Module Title

## Learning Objectives

- Objective 1
- Objective 2
- Objective 3

## Section 1: [Topic]

[Training content -- teach the concept, not just reference the regulation]
[Use plain language, examples, scenarios]

---

## Section 2: [Topic]

[Continue building knowledge]

---

## Key Takeaways

- Takeaway 1
- Takeaway 2

## Assessment Questions

### Q1

**Type**: multiple_choice
**Question**: [Question text]
**A**: [Option]
**B**: [Option] (correct)
**C**: [Option]
**D**: [Option]
**Explanation**: [Why the answer is correct, with CFR reference]
**CFR Reference**: 49 CFR XXX.XXX
```

**Files to Create**:

- [x] `TNDS-HZ-000-hmr-introduction.md`
- [x] `TNDS-HZ-001-hazmat-table.md`
- [x] `TNDS-HZ-002-shipping-papers.md`
- [x] `TNDS-HZ-003-packaging.md`
- [x] `TNDS-HZ-004-marking.md`
- [x] `TNDS-HZ-005-labeling.md`
- [x] `TNDS-HZ-006-placarding.md`
- [x] `TNDS-HZ-007a-carrier-highway.md`
- [x] `TNDS-HZ-007b-carrier-air.md`
- [x] `TNDS-HZ-007c-carrier-rail.md`
- [x] `TNDS-HZ-007d-carrier-vessel.md`
- [x] `TNDS-HZ-008-security.md`

**Location**: `00-FLEET-COMPLIANCE-SENTINEL/knowledge/training-content/hazmat/`

**Commit**: `training(phase1): hazmat training content modules`

---

### B2 -- Database Tables (Training Plans, Assignments, Progress)

**Priority**: High (schema needed before any UI/API work)
**Estimated Effort**: 0.5 day
**Depends On**: Nothing

- [x] Create 3 new tables + seed data

**New Tables**:

```sql
-- Training plans (sets of modules an org can assign)
CREATE TABLE training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  plan_name TEXT NOT NULL,
  description TEXT,
  modules JSONB NOT NULL,           -- ordered array of module_codes
  passing_score_override INT,       -- null = use per-module default
  deadline_days INT,                -- days from assignment to due
  is_required BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Training assignments (plan assigned to employee)
CREATE TABLE training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id),
  employee_id UUID NOT NULL REFERENCES employees(id),
  plan_id UUID NOT NULL REFERENCES training_plans(id),
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned',  -- assigned|in_progress|complete|overdue
  completed_at TIMESTAMPTZ,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  UNIQUE(org_id, employee_id, plan_id)
);

-- Training progress (per-module within an assignment)
CREATE TABLE training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES training_assignments(id),
  module_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',  -- not_started|viewing|deck_complete|assessment_passed|assessment_failed
  deck_started_at TIMESTAMPTZ,
  deck_completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  assessment_score INT,
  assessment_passed BOOLEAN,
  assessment_completed_at TIMESTAMPTZ,
  attempts_count INT DEFAULT 0,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, module_code)
);
```

**Seed Data**: "PHMSA Hazmat Required" plan with all 12 module codes

**Commit**: `training(phase2): training plan and progress schema`

---

### B3 -- Assessment Question Parser + Schema

**Priority**: High (needed before content authoring is useful)
**Estimated Effort**: 0.5 day
**Depends On**: B1 (at least 1 module to test against)

- [x] Create `tools/parse-assessment.py` -- extracts questions from training markdown into assessment JSON
- [x] Define `TrainingAssessment` data model
- [x] Store assessments alongside deck JSON (one assessment per training module)

**Question Types**:

- Multiple choice (single answer)
- Multiple select (check all that apply)
- True/False
- Scenario-based (situation description + question)

**Commit**: `training(phase3): assessment question parser and schema`

---

### B4 -- Deck Generation Pipeline

**Priority**: Medium-High
**Estimated Effort**: 1 day
**Depends On**: B1 (needs training markdown to convert)

- [x] Create `tools/training-to-deck.py` -- converts training markdown to DeckRecord-compatible JSON
  - Reads markdown, splits on `---` slide break markers
  - Maps YAML frontmatter to deck metadata
  - Outputs to format compatible with Electron deck engine (`DeckRecord` interface)
  - Batch mode for processing entire training-content directory

- [x] Add TNDS training theme to deck engine
  - Navy/Teal branded
  - Learning objective slide template
  - Key takeaway slide template
  - Section divider slide template

**Commit**: `training(phase4): markdown-to-deck converter pipeline`

---

### B5 -- Web Deck Viewer + Assessment UI

**Priority**: Medium-High (the driver-facing delivery layer)
**Estimated Effort**: 2-3 days
**Depends On**: B4 (needs deck JSON), B3 (needs assessment schema)

- [x] Build `TrainingDeckViewer.tsx`
  - Reads deck JSON from API
  - Slide navigation with prev/next/progress bar
  - Tracks time spent per slide (compliance reporting)
  - Marks training as "in_progress" on first slide view
  - Slide notes as expandable "Learn More" sections
  - Mobile-responsive (drivers use phones/tablets)
  - View-only for trainees

- [x] Build `TrainingAssessment.tsx`
  - Presented after trainee completes all slides
  - Randomizes question order
  - One question at a time, no back-navigation
  - Scores on completion with pass/fail threshold from frontmatter
  - On pass: triggers compliance record update
  - On fail: shows wrong answers with explanations, offers retake
  - Records attempt history for audit trail
  - Configurable retake cooldown (default: 24 hours)

- [x] Assessment API endpoints:
  ```
  POST   /api/v1/training/{module_code}/assessment/submit
  GET    /api/v1/training/{module_code}/assessment/attempts
  GET    /api/v1/training/{employee_id}/assessments/summary
  ```

**Commit**: `training(phase5): deck viewer and assessment UI components`

---

### B6 -- Training Management UI (Admin + Employee)

**Priority**: Medium
**Estimated Effort**: 2 days
**Depends On**: B2 (tables), B5 (viewer/assessment ready)

- [ ] Build `TrainingManagement.tsx` (admin/manager view)
  - Create/edit training plans
  - Assign plans to individual or bulk employees
  - Set deadlines (specific date or "X days from assignment")
  - Org-wide training dashboard (completion rates, overdue, in progress)
  - Filter by plan, employee, status, date range

- [ ] Build `MyTraining.tsx` (employee/driver self-service view)
  - Shows assigned plans and progress
  - Launch button per module (opens deck viewer -> assessment)
  - Progress bar per plan and module
  - Certificate download for passed modules
  - "What's due next" prioritized view

**Commit**: `training(phase6): training management and employee self-service UI`

---

### B7 -- Compliance Auto-Update + Suspense Integration

**Priority**: High (the bridge between training and compliance)
**Estimated Effort**: 1 day
**Depends On**: B5 (assessment engine), Hazmat Compliance Tracker (FEATURE_SPEC)

- [ ] On assessment pass:
  - Auto-create/update `hazmat_training_records` entry
  - Set status "complete", credit_pathway "fcs_training"
  - Calculate next_due_date (completion_date + recurrence_cycle)
  - Generate completion certificate
  - Upload certificate to object storage
  - Clear Suspense items for this module/employee
  - Send completion notification to org admin via Resend

- [ ] On training deadline approach:
  - Feed into existing Suspense alert system (90/30/0 day warnings)
  - Email reminders to employee and admin

**Note**: This task depends on the Hazmat Training Compliance Tracker tables from `FEATURE_SPEC_HAZMAT_TRAINING_COMPLIANCE.md` being in place. If running in parallel, the `hazmat_training_records` migration needs to land first.

**Commit**: `training(phase7): compliance auto-update and suspense integration`

---

### B8 -- Certificate PDF Generation

**Priority**: Medium
**Estimated Effort**: 0.5 day
**Depends On**: B7

- [ ] Build certificate generator (Python script or FastAPI endpoint)
  - TNDS branded PDF (Navy/Teal, logo, compass rose)
  - Fields: Employee name, module title, completion date, score, CFR reference, org name
  - Unique certificate ID for verification
  - Signature line for fleet manager
  - "This training is equivalent to PHMSA Module X.X" statement where applicable

- [ ] Storage: `/{org_id}/training-certs/{employee_id}/{module_code}_{date}.pdf`
- [ ] Accessible from both admin and employee views

**Commit**: `training(phase8): TNDS branded certificate PDF generation`

---

### B9 -- Penny Integration + Reporting

**Priority**: Medium (polish layer)
**Estimated Effort**: 1 day
**Depends On**: B1 (content), B7 (compliance data)

- [ ] Ingest training markdown into Penny's indexes (CFR index + demo index)
- [ ] Penny answers: "What does Module 6.0 cover?", "Has John completed hazmat training?", "When is the team's training due?"

- [ ] Training compliance reports:
  - Org-wide completion report (CSV + PDF export)
  - Per-employee training transcript
  - DOT audit package (one-click export)
  - Training hours report

- [ ] SOC 2 evidence: access controls, audit trail, retention policy

**Commit**: `training(phase9): penny integration and compliance reporting`

---

# COMBINED SCHEDULE

## Week 1: April 2-4 (Foundation)

| Day       | Workstream A (Hardening)                            | Workstream B (Training)                                       |
| --------- | --------------------------------------------------- | ------------------------------------------------------------- |
| Wed Apr 2 | **A0**: Contract freeze + envelope docs             | **B1**: Write first 4 training markdowns (0.0, 1.0, 2.0, 6.0) |
| Thu Apr 3 | **A1**: Layer 1 tool registry                       | **B2**: Database tables + seed data                           |
| Fri Apr 4 | **A1** continued + **A2**: Layer 7 tenant isolation | **B3**: Assessment parser + schema                            |

## Week 2: April 7-11 (Core Build)

| Day        | Workstream A (Hardening)          | Workstream B (Training)                |
| ---------- | --------------------------------- | -------------------------------------- |
| Mon Apr 7  | **A2** continued                  | **B1**: Remaining 8 training markdowns |
| Tue Apr 8  | **A3**: Layer 2 schema validation | **B4**: Deck generation pipeline       |
| Wed Apr 9  | **A4**: Layer 3 execution sandbox | **B5**: Deck viewer component          |
| Thu Apr 10 | **A4** continued                  | **B5**: Assessment UI component        |
| Fri Apr 11 | **A5**: Layer 4 retry manager     | **B5**: Assessment API endpoints       |

## Week 3: April 14-18 (Integration)

| Day        | Workstream A (Hardening)      | Workstream B (Training)                   |
| ---------- | ----------------------------- | ----------------------------------------- |
| Mon Apr 14 | **A6**: Layer 5 cost tracking | **B6**: Training management UI (admin)    |
| Tue Apr 15 | **A7**: Layer 6 audit logging | **B6**: Employee self-service UI          |
| Wed Apr 16 | **A7** continued              | **B7**: Compliance auto-update + Suspense |
| Thu Apr 17 | Buffer / defect fixes         | **B8**: Certificate generation            |
| Fri Apr 18 | Buffer / defect fixes         | **B9**: Penny integration                 |

## Week 4: April 21-25 (Validation + Polish)

| Day        | Workstream A (Hardening)       | Workstream B (Training)            |
| ---------- | ------------------------------ | ---------------------------------- |
| Mon Apr 21 | **A8**: Integration validation | **B9**: Reporting + SOC 2 evidence |
| Tue Apr 22 | **A8**: Go/no-go report        | Buffer / defect fixes              |
| Wed-Fri    | Hardening defect resolution    | Content admin panel (stretch)      |

---

## FUTURE BACKLOG (Post-Sprint)

**Training Content Expansion**:

- [ ] DQF training track (from CFR 391)
- [ ] HOS training track (from CFR 395)
- [ ] Drug & Alcohol Awareness (from CFR 382/040)
- [ ] DVIR Procedures (from CFR 396)
- [ ] Cargo Securement basics
- [ ] Defensive Driving fundamentals
- [ ] New Hire Orientation template (customizable per client)
- [ ] DOT Audit Preparation (from J.J. Keller ideas)

**Training Platform Features**:

- [ ] Content admin panel (B10 -- manage/upload training markdown)
- [ ] Client-specific content customization (per-org modules)
- [ ] Penny as training assistant during modules (scoped Q&A)
- [ ] PPTX export from deck engine
- [ ] SCORM export for external LMS compatibility
- [ ] Video embed support in deck viewer
- [ ] `financial-command` tool handler implementation

**Infrastructure**:

- [ ] Object storage setup (S3/R2) if not already configured
- [ ] Training module registration in module gateway (training-command as a gateway module)

---

## COMMIT STRUCTURE REFERENCE

```
hardening(task0): contract freeze and envelope docs
hardening(layer1): context-aware tool registry and selection caps
hardening(layer7): tenant tool isolation and ACL enforcement
hardening(layer2): bidirectional validation and coercion
hardening(layer3): execution sandbox limits and sanitization
hardening(layer4): retry manager and escalation
hardening(layer5): token cost tracking and budget alerts
hardening(layer6): durable audit logging
hardening(final): integration validation and go/no-go report
training(phase1): hazmat training content modules
training(phase2): training plan and progress schema
training(phase3): assessment question parser and schema
training(phase4): markdown-to-deck converter pipeline
training(phase5): deck viewer and assessment UI components
training(phase6): training management and employee self-service UI
training(phase7): compliance auto-update and suspense integration
training(phase8): TNDS branded certificate PDF generation
training(phase9): penny integration and compliance reporting
```

---

## DEPENDENCIES MAP

```
A0 (contract) ─────┬──> A1 (registry) ──> A3 (validation) ──> A5 (retry)
                    │                                             │
                    ├──> A2 (isolation) ──> A4 (sandbox) ──> A6 (cost)
                    │                                             │
                    └──> A7 (audit) ──────────────────────────────┤
                                                                  v
                                                          A8 (go/no-go)

B1 (content) ──> B3 (assessment parser) ──> B5 (viewer + assessment UI)
                                                        │
B2 (tables) ────────────────────────────> B6 (mgmt UI) ──> B7 (compliance bridge) ──> B8 (certs)
                                                                                        │
B4 (deck gen) ──> B5                                                              B9 (penny + reports)
```

---

_True North Data Strategies | Turning Data into Direction_
_Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com_
