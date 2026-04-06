# Fleet-Compliance Onboarding Orchestration Implementation Spec

Status: Approved implementation baseline  
Date: 2026-04-06  
Owners: Fleet-Compliance platform team  
Supersedes: Onboarding implementation planning content previously split across `tooling/IMPLEMENTATION.md`

## 0) Document Scope and Canonical Source Rule

This document is the canonical implementation spec for onboarding orchestration.

1. Onboarding architecture, data model, APIs, adapters, and rollout tasks are governed here.
2. If onboarding content in `tooling/IMPLEMENTATION.md` diverges, this document wins.
3. `tooling/IMPLEMENTATION.md` remains a broad platform history/reference file, not the onboarding build contract.

## 1) Goal

Implement one cohesive onboarding workflow that:

1. Onboards a new client org into Fleet-Compliance.
2. Supports client-facing employee and driver onboarding.
3. Automatically ties onboarding to Employees, Training, Tasks, Email, Suspense, and Alerts.
4. Enforces driver + hazmat 90-day training requirement from hire/start date.
5. Leaves clean extension points for future modules/tools.
6. Operates deterministically for compliance-critical actions (no LLM in state transitions).

## 2) Current State (Validated in Repo)

### 2.1 What exists today

1. Org onboarding page/API captures org metadata and sets `organizations.onboarding_complete=true`.
2. Employee roster is currently fed by imported `fleet_compliance_records` collections (`employees`, `drivers`), not canonical onboarding tables.
3. Hazmat/training tables and APIs exist:
   - `training_plans`, `training_assignments`, `training_progress`
   - `hazmat_training_modules`, `hazmat_training_records`
4. Suspense/alerts already derive training-related items from training assignment deadlines and hazmat recurrence due dates.
5. Module catalog + module toggles exist (`src/lib/modules.ts`).
6. Skills/Tools route exists (`/fleet-compliance/tools`) with module-aware filtering.

### 2.2 Gaps to close

1. Org onboarding does not create/invite employees.
2. Employee create/edit is not canonical onboarding orchestration.
3. No automatic training assignment when employee is driver + hazmat.
4. No deterministic task/email creation on employee onboarding.
5. No end-to-end onboarding run state machine with step-level retries.
6. Sidebar module filtering is not fully wired to org module state in all navigation paths.

## 3) Architecture Principles

1. Deterministic first: all state transitions, rule evaluation, and adapter dispatch must be non-LLM.
2. Event-driven orchestration: state machine emits auditable events and step outputs.
3. Idempotent execution: each step supports safe retries with dedupe keys.
4. Tenant isolation: every read/write scoped by `org_id`.
5. Module-aware behavior: adapters and route access check module toggles before execution.
6. Graceful degradation: task/email integrations support primary and fallback paths.

## 4) Platform Context (Merged from Implementation Guide)

Onboarding orchestration must align with platform governance already integrated in FCS:

1. Prompt governance control plane (`tooling/prompts/*`) governs AI generation routing/cost.
2. Canonical skills + skill packs (`.claude/skills`, `.claude/skill-packs`) govern capability exposure.
3. Module toggles (`src/lib/modules.ts`) control per-org feature visibility and entitlement.
4. Operational playbook patterns in `docs/integration/` define runbook style and execution discipline.

Rule:

1. Prompt router/runtime policy can be used for AI-authored guidance or messaging content.
2. Prompt router/runtime policy cannot be used to decide compliance state transitions.

### 4.1 `.claude` Skill-Pack to Module Mapping Contract

Onboarding orchestration must respect skill-pack metadata in:

1. `.claude/skill-packs/fleet-compliance.json`
2. `.claude/skill-packs/govcon.json`
3. `.claude/skill-packs/realty.json`

Contract requirements:

1. `module_domain` must map to an existing module taxonomy in `src/lib/modules.ts`.
2. Every `client_facing.skill` must map to an existing skill directory in `.claude/skills`.
3. Every `gateway_module` value must map to an enabled module-gateway target before invocation.
4. `penny_enabled=false` means onboarding can log recommendations but cannot auto-invoke Penny-run actions.

Preflight validation gate (required before release):

1. Fail build if any skill-pack references a missing skill directory.
2. Fail build if any gateway module mapping is unresolved.

### 4.2 Protocol Boundary and Handoff Rule

Direction and Command protocol references in `.claude/skills/direction-protocol/*` and `.claude/skills/command-protocol/*` are informative for onboarding staging, but onboarding runtime remains deterministic.

Rules:

1. Onboarding cannot execute delivery-side adapter actions before prerequisites are validated.
2. Any optional AI-generated prep artifacts must not bypass required onboarding checks.
3. Handoff outputs must be explicit and versioned in run-step output payloads.

### 4.3 Agent Responsibility Matrix (Implementation Support)

Use `.claude/agents/*` roles for implementation workflow support:

| Agent Role | Responsibility in this implementation |
|---|---|
| `builder` / implementation engineer | Build migrations, APIs, and orchestrator components |
| `pipeline-x-integrator` | Validate cross-module and adapter integration contracts |
| `auditor` | Validate acceptance tests, idempotency, and tenant isolation evidence |
| `curriculum-designer` | Produce operator/client onboarding enablement artifacts once workflows are stable |

### 4.4 Routing Control Plane Mode

Current baseline uses application-level guards and deterministic orchestration logic, not Claude hook callbacks in `.claude/settings.json`.

Required behavior:

1. All onboarding routing and entitlement checks remain in application code paths.
2. If hook-based routing is introduced later, it must be additive and cannot replace server-side guards.

## 5) Workflow Classification and Route Model

### 5.1 Internal workflows (admin/operator)

| Workflow | Module ID | Route | Target state |
|---|---|---|---|
| Org setup onboarding | `onboarding` | `/fleet-compliance/onboarding` | Keep existing purpose |
| Onboarding run queue | `onboarding` | `/fleet-compliance/onboarding/admin` | New |
| Employee profile create | `onboarding` | `/fleet-compliance/employees/new` | Upgrade to server-backed orchestration |
| Training admin | `training` | `/fleet-compliance/training/manage` | Reuse existing |
| Notification templates | `email-analytics` | `/fleet-compliance/settings/notifications` | New |
| Onboarding task config | `tasks` | `/fleet-compliance/settings/onboarding-tasks` | New |
| Compliance reference library | `compliance-docs` | `/fleet-compliance/compliance/reference` | New |
| SOP library | core | `/fleet-compliance/command-center/sops` | New |

### 5.2 External workflows (client-facing)

| Workflow | Module ID | Route | Auth |
|---|---|---|---|
| Intake portal | `onboarding` | `/fleet-compliance/onboarding/intake/[token]` | Signed token |
| Employee training view | `training` | `/fleet-compliance/training/my` | Clerk org member |
| Onboarding status | `onboarding` | `/fleet-compliance/onboarding/status/[runId]` | Clerk org member |
| DQ uploads | `dq-files` | `/fleet-compliance/dq/upload` | Clerk org member |

### 5.3 Module enforcement points

1. Sidebar visibility.
2. Page-level route guard.
3. API-level guard.
4. Adapter-level guard.

## 6) Data Model

### 6.1 Canonical onboarding tables (required)

```sql
CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_employee_id TEXT,
  clerk_user_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  work_email TEXT,
  department TEXT,
  job_title TEXT,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  is_driver BOOLEAN NOT NULL DEFAULT FALSE,
  hazmat_required BOOLEAN NOT NULL DEFAULT FALSE,
  hazmat_endorsement TEXT,
  cdl_class TEXT,
  cdl_expiration DATE,
  medical_expiration DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, external_employee_id),
  UNIQUE (org_id, clerk_user_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_profiles_org ON employee_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_org_driver_hazmat ON employee_profiles(org_id, is_driver, hazmat_required);
```

```sql
CREATE TABLE IF NOT EXISTS employee_onboarding_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  source TEXT NOT NULL,
  initiated_by TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_summary TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_runs_org_status ON employee_onboarding_runs(org_id, status, created_at DESC);
```

```sql
CREATE TABLE IF NOT EXISTS employee_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempt_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, step_key)
);
```

```sql
CREATE TABLE IF NOT EXISTS onboarding_outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_id UUID REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_pending ON onboarding_outbox_events(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_org ON onboarding_outbox_events(org_id, created_at DESC);
```

### 6.2 Fallback persistence table (required for TaskAdapter fallback)

```sql
CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  external_task_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_org ON onboarding_tasks(org_id, created_at DESC);
```

### 6.3 Migration file location

Use root migrations directory with next sequence number:

1. `migrations/017_onboarding_orchestration.sql` (or next available).
2. Do not create migrations under `src/lib/migrations`.

## 7) Event Contract and State Machine

### 7.1 Required event envelope

```json
{
  "event_id": "uuid",
  "event_type": "employee.onboarding.started",
  "org_id": "org_x",
  "run_id": "uuid",
  "occurred_at": "iso8601",
  "actor_user_id": "user_x",
  "payload": {}
}
```

### 7.2 Required event types

1. `employee.profile.created`
2. `employee.profile.updated`
3. `employee.onboarding.started`
4. `employee.onboarding.step.requested`
5. `employee.training.assignment.requested`
6. `employee.training.assignment.completed`
7. `employee.tasks.seeded`
8. `employee.notifications.queued`
9. `employee.suspense.seeded`
10. `employee.onboarding.completed`
11. `employee.onboarding.failed`

### 7.3 Run and step statuses

1. Run: `queued | running | completed | partial | failed | canceled`
2. Step: `queued | running | completed | failed | skipped`

## 8) Automation Rules

### Rule A: Driver + hazmat assignment

Trigger:

1. `is_driver = true`
2. `hazmat_required = true`

Action:

1. Resolve org training plan (`PHMSA Hazmat Required Training` preferred).
2. Create assignment via internal training service.
3. Deadline = `hire_date + 90 days` (or start date when explicitly provided).
4. Seed/confirm `training_progress`.
5. Emit completion event.

### Rule B: Task seeding

Create compliance tasks:

1. Verify CDL documents.
2. Verify medical certificate.
3. Verify hazmat endorsement.
4. Verify training start.
5. Verify completion certificate upload.

Checkpoints:

1. Day 7
2. Day 14
3. Day 30
4. Day 60
5. Day 90

### Rule C: Notifications

Cadence:

1. Day 0 kickoff.
2. Day 60 reminder.
3. Day 80 escalation.
4. Day 90 due date notice.
5. Overdue notices via existing alert windows.

### Rule D: Suspense/alerts

1. Onboarding seeds rows that existing suspense/alert engines consume.
2. No replacement of existing suspense engine.
3. Onboarding is a producer, not a second alert engine.

## 9) Adapter Contracts

### 9.1 TrainingAdapter (required)

1. Resolve plan.
2. Create assignment.
3. Verify persisted assignment ID.
4. Write step output.

### 9.2 TaskAdapter (required)

1. Primary path: task-command/gateway route when available.
2. Fallback path: `onboarding_tasks` local persistence.
3. Reconcile job syncs local tasks when primary path is restored.

### 9.3 NotificationAdapter (required)

1. Direct transactional sends (Resend).
2. Optional analytics copy into email-command when enabled.
3. Persist delivery outcomes in step output.
4. Do not assume direct inbox/calendar ingestion for onboarding automation paths.

### 9.4 SuspenseSeedAdapter (required)

1. Ensure training deadlines are in existing sources consumed by suspense pipeline.
2. Validate alert preview includes newly seeded records.

## 10) API Contracts

### 10.1 Admin APIs

1. `POST /api/fleet-compliance/onboarding/employees`
2. `PATCH /api/fleet-compliance/onboarding/employees/{employeeProfileId}`
3. `POST /api/fleet-compliance/onboarding/employees/{employeeProfileId}/invite`
4. `GET /api/fleet-compliance/onboarding/runs`
5. `GET /api/fleet-compliance/onboarding/runs/{runId}`
6. `POST /api/fleet-compliance/onboarding/runs/{runId}/retry`

### 10.2 Client intake APIs

1. `POST /api/fleet-compliance/onboarding/intake-tokens`
2. `GET /api/fleet-compliance/onboarding/intake/{token}`
3. `POST /api/fleet-compliance/onboarding/intake/{token}`

### 10.3 API guard requirements

Every onboarding API must:

1. Resolve org/user context.
2. Enforce `onboarding` module toggle (or relevant adapter module).
3. Enforce role permissions (admin vs member vs token).
4. Emit audit event on mutations.

## 11) Security, Audit, and Observability

### 11.1 Security controls

1. Strict tenant scoping by `org_id`.
2. Clerk role checks.
3. Intake token signed + expiry + one-time consumption.
4. PII minimization in logs.

### 11.2 Idempotency controls

1. Unique `(run_id, step_key)` in steps.
2. Unique `(run_id, task_key)` in fallback tasks.
3. Idempotency key strategy for external adapters.

### 11.3 Metrics/logs/alerts

Metrics:

1. Runs started/completed/failed by org.
2. Step latency.
3. Adapter success rates.
4. Retry volume.

Alerts:

1. Failure-rate spikes.
2. Adapter timeout spikes.
3. Driver+hazmat runs with no training assignment.

## 12) SOPS Content Migration (Onboarding-Relevant)

### 12.1 Tier 1 (required for this implementation)

1. `New-Client-Checklist.md` -> `tooling/onboarding/task-templates/default-onboarding.json`
2. `EMAIL-TEMPLATES/*` -> `tooling/onboarding/notification-templates/*`
3. Direction/Command SOP references -> `docs/integration/*` operator docs
4. Compliance governance reference library -> `docs/compliance-reference/*`

### 12.2 Tier 2 (post-core)

1. Discovery/qualification extraction into skill support assets.
2. Service tier definitions for prompt and package governance.
3. SLA extraction into onboarding SLA config.

### 12.3 Tier 3 (excluded)

1. Realty-specific SOPs.
2. Legacy platform setup docs unrelated to current architecture.
3. Sales collateral and stubs.

## 13) Open Decision Resolutions (Locked)

1. Task source of truth: local persisted tasks + async sync to task-command.
2. Invite timing: delayed invite after intake completion (default), admin override allowed.
3. Identity strategy: strict 1:1 `external_employee_id -> clerk_user_id` for v1.
4. Notification ownership: onboarding service sends direct transactional messages; email-command gets optional analytics copy.

## 14) Phase-by-Phase Implementation TODOs

Each TODO includes context, constraints, deliverables, and outputs.

### Phase 1: Data and Baseline APIs

| TODO | Context | Constraints | Deliverables | Outputs |
|---|---|---|---|---|
| P1-T0 Add `.claude` preflight validation for skill-pack mapping | Skill packs and module mappings affect runtime routing | Must fail closed on missing skill directories or unresolved gateway mappings | Preflight script/check in CI + local run command | Deployment blocked on invalid pack/module references |
| P1-T1 Create onboarding schema migration | Existing onboarding lacks canonical runtime state | Must use root `migrations/` sequencing and be backward compatible | `017_onboarding_orchestration.sql` with required tables/indexes | New DB tables available in staging |
| P1-T2 Implement onboarding employee create/update endpoints | Current employee flow is not orchestration-backed | Must enforce org scope and role checks | API handlers for create/update + validation | Employee profile writes trigger onboarding run |
| P1-T3 Implement run listing/detail/retry APIs | Need operator visibility and recovery path | Retry must be idempotent and step-scoped | `runs`, `run detail`, `retry` endpoints | Admin queue can inspect/retry failures |
| P1-T4 Add audit instrumentation for API mutations | Compliance traceability required | No PII leakage in audit payloads | Audit events for create/update/retry | Auditable mutation trail |

Phase 1 tests:

1. Migration applies cleanly on empty and non-empty org datasets.
2. API rejects cross-org access attempts.
3. Create/update starts run and writes step records.
4. Retry does not duplicate successful steps.
5. Preflight check fails on intentionally broken skill-pack references.

### Phase 2: Rule Engine and Training Integration

| TODO | Context | Constraints | Deliverables | Outputs |
|---|---|---|---|---|
| P2-T1 Build rules engine for A-D | Rules are currently manual/dispersed | Deterministic only; no LLM-driven decisions | `rules-engine.ts` with typed rule evaluation | Repeatable onboarding decisions |
| P2-T2 Build TrainingAdapter | Driver+hazmat must auto-assign 90-day training | Respect `training` module gate | Adapter with plan resolve + assignment + verification | Training assignments auto-created |
| P2-T3 Integrate suspense seeding path | Alerts depend on seeded rows | Must reuse existing suspense/alert pipeline | SuspenseSeedAdapter + validation hooks | Alerts/suspense include onboarding-driven deadlines |

Phase 2 tests:

1. Driver+hazmat user gets assignment at `hire_date + 90`.
2. Non-driver or non-hazmat profile skips assignment.
3. Suspense items are generated from seeded training deadlines.
4. Training-disabled module causes graceful step skip with audit log.

### Phase 3: Task and Notification Adapters

| TODO | Context | Constraints | Deliverables | Outputs |
|---|---|---|---|---|
| P3-T1 Implement TaskAdapter primary path | Tasks must sync with broader task operations | Must tolerate task-command unavailability | Task gateway integration client | Tasks created in primary task system when available |
| P3-T2 Implement TaskAdapter fallback/reconcile | Onboarding cannot fail if task-command is unavailable | Must preserve idempotency and replay safety | Local persistence + reconciliation job | No task loss during outages |
| P3-T3 Implement NotificationAdapter + templates | Onboarding requires timed communications | Must support module-aware analytics copy | Resend integration + template resolver | Deterministic transactional messaging |
| P3-T4 Add outbox processing and retry policy | Adapter failures need controlled retry | Bounded retries + error taxonomy required | Outbox worker + retry schedule policy | Recoverable async processing |

Phase 3 tests:

1. Task primary path success persists external IDs.
2. Task fallback path works when primary fails.
3. Reconcile job backfills external task IDs correctly.
4. Notification sends at required checkpoints and logs outcomes.
5. Outbox retries recover transient failures without duplication.

### Phase 4: Client Intake Portal

| TODO | Context | Constraints | Deliverables | Outputs |
|---|---|---|---|---|
| P4-T1 Build intake token issuance API | External onboarding needs secure entry path | Signed, expiring, one-time token required | Token issue endpoint + storage/consumption model | Secure intake links |
| P4-T2 Build intake GET/POST endpoints | Intake must feed canonical onboarding profile/run | Strict org binding from token payload | Intake endpoints with schema validation | Intake submissions create/update profiles |
| P4-T3 Build intake UI route | Client-facing flow must be simple and complete | Mobile-ready and failure-state safe | `/fleet-compliance/onboarding/intake/[token]` page | Production intake UX |
| P4-T4 Wire delayed invite policy | Invitations should follow verified intake | Admin override supported | Invite trigger policy + endpoint usage | Reduced orphaned invites and seat waste |

Phase 4 tests:

1. Token cannot be reused after successful submit.
2. Expired tokens are rejected.
3. Cross-org token misuse is rejected.
4. Intake submit starts run and executes rule pipeline.
5. Delayed invite behavior matches policy.

### Phase 5: Hardening, Ops, and Docs

| TODO | Context | Constraints | Deliverables | Outputs |
|---|---|---|---|---|
| P5-T1 Wire module gates end-to-end | Module toggle behavior must be consistent | UI, route, API, adapter gates must agree | Guard utilities and usage across surfaces | Predictable entitlement behavior |
| P5-T2 Add observability dashboards/alerts | Need operational control at scale | Metrics names stable and actionable | Dashboards + alert rules + runbook notes | Fast failure detection/recovery |
| P5-T3 Update operator docs/manual entries | Teams need usable runbooks | Docs must match implemented behavior | Manual updates + onboarding playbook | Reduced onboarding execution errors |
| P5-T4 Execute full E2E matrix | Launch gate requires confidence | No unresolved P1-P4 blockers | Automated + manual test evidence bundle | Release readiness sign-off |

Phase 5 tests:

1. All acceptance scenarios pass across two orgs.
2. Module disable/enable transitions behave correctly without data corruption.
3. Alerting triggers on simulated failure patterns.
4. Documentation walkthrough can be followed by operator without code changes.

## 15) Acceptance Scenarios (Release Gate)

1. New org + first non-driver employee: run completes without training assignment and with tasks/notifications.
2. Driver + hazmat onboarding: assignment created with 90-day deadline; suspense/alert coverage present.
3. Partial adapter failure + retry: idempotent retry reaches completed.
4. Intake token flow: issue, submit, expire, and one-time enforcement validated.
5. Multi-tenant isolation: no cross-org read/write in runs/tasks/training/alerts.

## 16) CI/Build Verification Gate (Before Push)

Only mark implementation complete after:

1. Phase tests are green for implemented phases.
2. Full TypeScript/Next build succeeds locally.
3. No migration drift or schema compile errors.

Required command:

```bash
npm run build
```

Expected output class:

1. Build exits `0`.
2. No type errors.
3. No route compile failures.
4. No unresolved imports from onboarding additions.

## 17) Definition of Done

1. Org onboarding and employee onboarding are connected under one deterministic orchestration model.
2. Driver + hazmat employees always receive compliant 90-day training assignment behavior.
3. Tasks, notifications, suspense, and alerts are seeded automatically with retry-safe behavior.
4. Full step-level auditability and observability are available.
5. Module-aware controls are consistent across UI, APIs, and adapters.
6. Acceptance matrix and local build gate pass before GitHub push/Vercel deploy.
