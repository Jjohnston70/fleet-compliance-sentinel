# Tooling Implementation Guide

**Project:** Fleet-Compliance Sentinel
**Owner:** True North Data Strategies LLC
**Last Updated:** 2026-04-05

---

## What Was Migrated

Three components from the PROMPTS-PACKS-TYPES library were integrated into the FCS platform:

1. **Prompt Governance Control Plane** -- `tooling/prompts/`
2. **Compliance Role System Prompts** -- `.claude/skills/*/system.prompt`
3. **Operational Playbooks** -- `docs/integration/`

---

## 1. Prompt Governance Control Plane

**Location:** `tooling/prompts/`

### What It Is

The control plane is the rule-of-law layer for all LLM execution in FCS. It defines how AI agents behave, what protocols apply, and what limits are enforced. These files are loaded deterministically (selected, not searched) and are never vectorized or embedded.

### Files

| File | What It Does | When You Use It |
|------|-------------|-----------------|
| `prompt.schema.json` | JSON Schema that validates prompt definitions. If a prompt doesn't match this schema, it's rejected before it can enter the system. | When adding or modifying prompts. Run validator against this schema. |
| `prompt-router.json` | Routes prompts to the correct model class. `direction` protocol -> strategy models (reasoning). `command` protocol -> execution models (fast output). | Read by the Module Gateway runner when a skill fires. Determines which LLM class handles the request. |
| `runtime-policy.json` | Enforces token and cost limits per tier: free (800 tokens/$10), low-cost (2000/$50), battle-tested (6000/$250). | Read by the gateway to cap token usage and prevent cost overruns. |
| `prompt-bundles.json` | Groups roles into product bundles: SMB Operator Pack, Revenue Command Pack, Gov Compliance Pack. Used for entitlement checks and plan gating. | Referenced by the module toggle system to determine which skills are included in each plan tier. |
| `prompt-registry.v1.0.0.json` | Immutable source of truth. 21 registered prompts with full metadata. Frozen 2026-02-07. | Read-only reference for all systems. Changes require a new version file. |
| `prompt-registry-map.json` | Maps FCS skill directories to registry entries and gateway modules. Connects the dots between skills, modules, and the control plane. | Used to resolve which registry prompt applies to which skill when the gateway fires. |
| `prompt-validator.ts` | TypeScript function for build-time validation. | Run during CI or before deploying prompt changes. |

### How to Use

**Check if a skill has governance metadata:**
```bash
cat tooling/prompts/prompt-registry-map.json | jq '.mappings[] | select(.skill_dir == "data-privacy-coach")'
```

**Validate a new prompt entry:**
```typescript
import { validatePrompt } from './tooling/prompts/prompt-validator';
validatePrompt(myNewPrompt); // Throws if invalid
```

**Check tier limits before execution:**
```typescript
import policy from './tooling/prompts/runtime-policy.json';
const maxTokens = policy.tiers[skillTier].max_tokens;
```

### Integration Points

The control plane integrates with FCS at three points:

1. **Module Gateway Runner** (`src/lib/modules-gateway/runner.ts`) -- Reads prompt-router and runtime-policy to route and limit skill execution.
2. **Module Toggle System** (`src/lib/modules.ts`) -- Bundle memberships in prompt-bundles.json map to MODULE_SEEDS skill-command entries.
3. **Skill System Prompts** (`.claude/skills/*/system.prompt`) -- Each system.prompt file references its protocol and tier, which must match the registry.

### Adding a New Prompt to the Registry

1. Create the prompt object matching `prompt.schema.json`
2. Validate with `prompt-validator.ts`
3. Create a new registry version file (e.g., `prompt-registry.v1.1.0.json`)
4. Add a mapping in `prompt-registry-map.json`
5. If the prompt belongs in a bundle, update `prompt-bundles.json`
6. Test through the Module Toggle Console

---

## 2. Skill System Prompts

**Location:** `.claude/skills/*/system.prompt`

### What They Are

System prompts are the governance identity files for each skill. They define what the skill does, what protocol it follows, what tier it operates at, and what output contract it enforces. Every skill-command module in the toggle system maps to one or more skills, each with its own system.prompt.

### Standard Structure

Every system.prompt follows this format:

```
Governance Rules (11 rules -- apply to every response)
  1. Informational guidance only
  2. Deny legal/tax/investment/medical advice
  3. Mark high-risk guidance as non-binding
  4. Never request/expose credentials or PII
  5. Don't reproduce client-confidential details
  6. Direct, concise, actionable output
  7. Canonical terms, explicit permit/deny
  8. Respect authority boundaries
  9. Enforce cost controls within tier
  10. Professional advice disclaimer
  11. No PII processing

Role Identity
  - Skill name and parent (Pipeline Penny)
  - Role focus (one sentence)
  - Protocol (Direction or Command)
  - Tier (free / low-cost / battle-tested)

Depth Modes
  - full: comprehensive execution
  - quick_pass: rapid triage
  - single: one artifact

Scope Gate
  - SKILL_OUT_OF_SCOPE response for off-topic requests

Output Contract
  - Required section headers (always present)

Role-Specific Rules
  - 3-5 domain-specific constraints
```

### Skills with System Prompts (28 total)

**Client-Facing (gateway-routed):**
- data-privacy-coach, risk-manager, financial-analyst, bid-strategist, grant-proposal-writer, grant-proposal-evaluation, invoice-organizer, file-organizer, realty-command, aro-assessment, docgen-command, proposal-generator, copywriter, marketing-strategist, world-model-mapper

**Operator-Only:**
- cyber-security, cloud-engineer, database-admin, python-programmer, data-scientist, sales-strategist, business-dev-manager, pricing-strategist, chief-financial-officer, brand-manager, documentation

### How to Use

**During a Claude Code session with an agent:** The agent reads the system.prompt to understand its role constraints and output format.

**Through Pipeline Penny:** When a user triggers a skill via Penny, the system.prompt is injected as the system message to the LLM.

**Through the Module Gateway:** When a skill-command module fires, the gateway loads the system.prompt from the skill directory and applies protocol routing and tier limits from the control plane.

### Creating a New System Prompt

1. Copy the governance rules block from an existing system.prompt (all 11 rules are identical across skills)
2. Define: role name, focus, protocol (direction/command), tier
3. Define depth modes (full, quick_pass, single)
4. Define the SKILL_OUT_OF_SCOPE gate
5. Define the output contract (required section headers)
6. Add 3-5 role-specific rules
7. Add a matching entry in `tooling/prompts/prompt-registry-map.json`
8. Run through the skill intake pipeline at `.claude/skills/00_skill-intake/`

---

## 3. Operational Playbooks

**Location:** `docs/integration/`

### What They Are

Playbooks are structured, multi-step operational workflows designed to be executed by Pipeline Penny in a Cowork session or manually by an operator. Each playbook defines MCP tool calls, analysis logic, thresholds, and output formatting.

### Available Playbooks

**compliance-gap-check.md** (FCS-native)
- Weekly or on-demand compliance review
- Checks: driver credentials, vehicle inspections, permits, suspense items, platform errors
- Produces a weighted compliance score (0-100) with GREEN/YELLOW/ORANGE/RED rating
- Creates audit evidence for SOC 2

**sentry-error-triage.md** (adapted from Cowork)
- 6-hour cycle error analysis
- Severity scoring (1-5), root cause categorization, fix recommendations
- Deployment risk assessment (safe to deploy / caution / hold)
- Uses Sentry MCP for all data retrieval

**daily-ops-standup.md** (adapted from Cowork)
- Daily at 8:00 AM MT
- Sentry errors + HubSpot pipeline health + calendar + action items
- Posts to Slack #ops-daily

### How to Run a Playbook

**Option 1: Cowork Session (Recommended)**
1. Open a Cowork session
2. Tell the agent: "Run the compliance gap check playbook"
3. The agent reads `docs/integration/compliance-gap-check.md` and executes each step
4. Results are posted to the specified output destination

**Option 2: Scheduled Task**
1. Use the schedule skill to create a recurring task
2. Point it at the playbook file
3. Define the cron schedule (e.g., "Every Monday at 9:00 AM MT")

**Option 3: Manual Execution**
1. Read the playbook
2. Execute each MCP tool call manually
3. Apply the analysis logic
4. Fill in the report template

### Creating a New Playbook

Use this template:

```markdown
# [Playbook Name]

**Trigger:** [Schedule or on-demand]
**Duration:** [Estimate]
**Output:** [Destination]

---

## Objective
[What this playbook accomplishes]

---

## Step 1: [Action Name]

**Tool:** [MCP tool name]
**Action:** [Specific action]

**Parameters:**
[JSON block]

**Analysis:**
[What to look for, thresholds, flags]

**Output Format:**
[Structured output template]

---

## Step N: Generate Report
[Report template]

---

## Step N+1: Post Results
[Where to send, conditional logic]
```

### Playbook Ideas for Future Development

- **audit-readiness-scan.md** -- Pre-audit checklist against SOC 2 or DOT requirements
- **regulatory-deadline-triage.md** -- Scan for upcoming regulatory deadlines across all data
- **vendor-risk-review.md** -- Assess vendor compliance posture from invoice and contract data
- **incident-response.md** -- Step-by-step incident response for security or compliance events
- **monthly-compliance-report.md** -- Full monthly report for leadership review

---

## Directory Structure After Migration

```
tooling/
  prompts/                         # Prompt governance control plane
    README.md                      # Control plane documentation
    prompt.schema.json             # Prompt validation schema
    prompt-router.json             # Direction/Command routing
    runtime-policy.json            # Tier token/cost limits
    prompt-bundles.json            # Role bundle definitions
    prompt-registry.v1.0.0.json    # Immutable v1.0.0 registry (21 prompts)
    prompt-registry-map.json       # FCS skill <-> registry mapping (15 entries)
    prompt-validator.ts            # TypeScript validator
  skills/                          # (Pre-existing) Client-facing skill wrappers
    README.md
    [15 skill directories]

docs/integration/
  PLAYBOOKS_README.md              # Playbook documentation
  compliance-gap-check.md          # FCS-native compliance review
  sentry-error-triage.md           # Error analysis (from Cowork)
  daily-ops-standup.md             # Daily standup (from Cowork)
  OPERATIONS_RUNBOOK.md            # (Pre-existing) Gateway operations
  MODULE_GATEWAY_CONTRACT.md       # (Pre-existing) Gateway API contract

.claude/skills/
    [38 skill directories, each now with system.prompt]
    MANIFEST.md
    SKILLS-README.md
    00_skill-intake/
```

---

## What Was NOT Migrated (and Why)

| Asset | Location | Why It Stays |
|-------|----------|-------------|
| 296 role prompt files | Desktop/PROMPTS-PACKS-TYPES/roles/ | Product asset for Pipeline Punks, not FCS infrastructure |
| 34 industry packs | Desktop/PROMPTS-PACKS-TYPES/packs/ | General-purpose library, only GovCon pack is FCS-relevant |
| 13 functional types | Desktop/PROMPTS-PACKS-TYPES/types/ | Cross-cutting groupings, not needed for FCS execution |
| Prompt-1, -2, -3 iterations | Desktop/PROMPTS-PACKS-TYPES/Prompt-*/ | Historical versions, current files are canonical |
| prompt-formatter-handoff.md | Desktop/PROMPTS-PACKS-TYPES/Prompt-1/ | One-time conversion tool, job complete |
| HubSpot pipeline playbook | coworker.zip | Sales-specific, not compliance-relevant (adapt if needed later) |
| prompt-registry.json (mutable) | Desktop/PROMPTS-PACKS-TYPES/prompt-jsons/ | Superseded by immutable v1.0.0 -- only frozen versions migrate |

---

## Phase 8: SOPS Migration + Onboarding Orchestration

**Status:** Planning (not yet executed)
**Date:** 2026-04-05
**Source:** Desktop/SOPS/ (30+ files, 6 subfolders) + docs/integration/ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md
**Spec Reference:** ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md (440 lines, 15 sections, 5-phase rollout)

---

### What This Phase Accomplishes

1. Migrate high-value SOPS content into FCS as operational reference material, onboarding task templates, and notification templates.
2. Implement the Onboarding Orchestration system (event-driven state machine for employee/driver onboarding with training, task, notification, and suspense adapters).
3. Establish a clear boundary between **internal workflows** (operator/admin) and **external client-facing workflows** (client portal, intake forms).
4. Gate every workflow behind the module toggle system so orgs only see what their plan and admin have enabled.

---

### 4.1 Workflow Classification

Every workflow in this phase is classified as **internal** or **external**. The module toggle page (`/fleet-compliance/dev/modules`) controls visibility for both. Internal workflows are admin-only. External workflows are client-facing and accessed via token-authenticated or org-member routes.

#### Internal Workflows (Admin/Operator Only)

| Workflow | Description | Module Toggle ID | Min Plan | Sidebar Section | Route |
|----------|-------------|-----------------|----------|-----------------|-------|
| Onboarding Admin Queue | View/manage all employee onboarding runs, retry failed steps, override statuses | `onboarding` | pro | Operations | `/fleet-compliance/onboarding` |
| Employee Profile Create | Admin-initiated employee creation that triggers onboarding orchestrator | `onboarding` | pro | Operations | `/fleet-compliance/employees/new` |
| Training Assignment Admin | View/manage training plans, assignments, and compliance deadlines | `training` | pro | Training | `/fleet-compliance/training/manage` |
| Compliance Gap Check | Scheduled/on-demand compliance audit (playbook) | `compliance-docs` | pro | Compliance | Playbook (no dedicated route) |
| Notification Template Mgmt | Manage onboarding email templates (welcome, reminders, escalations) | `email-analytics` | pro | Admin | `/fleet-compliance/settings/notifications` |
| Onboarding Task Templates | Define task seed templates for new employee onboarding | `tasks` | starter | Operations | `/fleet-compliance/settings/onboarding-tasks` |
| Compliance Reference Library | Browse migrated TNDS compliance governance packages | `compliance-docs` | pro | Compliance | `/fleet-compliance/compliance/reference` |
| Diagnostic Assessment | 28-question operational diagnostic (from SOPS Diagnostic Cheat Sheet) | `readiness` | starter | Intelligence | `/fleet-compliance/readiness/diagnostic` |
| SOP Workflow Library | Internal SOPs for Direction Protocol, Command Protocol, Battle Rhythm | `fleet-compliance` (core) | trial | Admin | `/fleet-compliance/command-center/sops` |

#### External Workflows (Client-Facing)

| Workflow | Description | Module Toggle ID | Min Plan | Auth Method | Route |
|----------|-------------|-----------------|----------|-------------|-------|
| Client Intake Portal | Self-service employee/driver intake form (token-authenticated) | `onboarding` | pro | Signed intake token | `/fleet-compliance/onboarding/intake/[token]` |
| Employee Self-Service Training | Employee views their assigned training, progress, and deadlines | `training` | pro | Clerk org member | `/fleet-compliance/training/my` |
| Onboarding Status Check | Employee/manager views onboarding run progress | `onboarding` | pro | Clerk org member | `/fleet-compliance/onboarding/status/[runId]` |
| Document Upload Portal | Client uploads CDL, medical cert, hazmat endorsement docs | `dq-files` | starter | Clerk org member | `/fleet-compliance/dq/upload` |
| Compliance Dashboard (Client) | Client org view of their compliance posture and alert summary | `fleet-compliance` (core) | trial | Clerk org member | `/fleet-compliance` |

#### Module Toggle Enforcement

All workflows check `isModuleEnabled(orgId, moduleId)` before rendering routes or executing adapters. The enforcement points are:

1. **Sidebar visibility:** `getVisibleSections()` in `sidebar-config.ts` hides links when module is disabled.
2. **Route guard:** Page-level `isModuleEnabled()` check redirects to upgrade prompt if module not enabled.
3. **API guard:** Every `/api/fleet-compliance/onboarding/*` endpoint checks module toggle before processing.
4. **Adapter guard:** Onboarding orchestrator checks module toggles before invoking adapters (e.g., skip TaskAdapter if `tasks` module is disabled for org; skip training assignment if `training` module is disabled).

---

### 4.2 SOPS Content Migration Plan

#### Tier 1: Migrate to FCS (high value)

| Source | Destination | Purpose | Integration Point |
|--------|-------------|---------|-------------------|
| `ENTIRE TNDS COMPLIANCE GOV/` (7 packages, 65+ docs) | `docs/compliance-reference/` | Compliance reference library backing compliance-gap-check, data-privacy-coach, and risk-manager skills | Compliance Reference Library workflow; compliance-gap-check playbook reads from these |
| `New-Client-Checklist.md` (12 phases) | `tooling/onboarding/task-templates/default-onboarding.json` | Default task seed template for TaskAdapter (Rule B in onboarding spec) | TaskAdapter reads template to create onboarding tasks per employee |
| `EMAIL-TEMPLATES/` (11 templates) | `tooling/onboarding/notification-templates/` | Transactional email templates for NotificationAdapter (Rule C in onboarding spec) | NotificationAdapter selects template by event type (welcome, check-in, go-live, etc.) |
| `Internal Docs/Diagnostic Cheat Sheet` (28 questions) | `.claude/skills/aro-assessment/diagnostic-framework.json` | Structured assessment questionnaire for ARO Assessment skill upgrade | aro-assessment skill loads framework as interview structure |
| `Internal Docs/Direction Protocol SOP` | `docs/integration/direction-protocol-sop.md` | Operator reference for sales qualification process | SOP Workflow Library; training-assistant agent reference |
| `Internal Docs/Command Protocol SOP` | `docs/integration/command-protocol-sop.md` | Operator reference for delivery execution process | SOP Workflow Library; training-assistant agent reference |
| `Internal Docs/Service Architecture Mapping` | `docs/integration/service-architecture-mapping.md` | Architecture reference for how Command modules map to delivery | Developer Manual supplement |

#### Tier 2: Extract and Adapt (medium value)

| Source | What to Extract | Destination | When |
|--------|----------------|-------------|------|
| `Discovery-Call-Script.md` | Qualification criteria + note-taking template | `.claude/skills/bid-strategist/qualification-framework.json` | After Phase 8 core |
| `Sales System/` service docs | Scope definitions for 3 Command Protocol tiers | `tooling/prompts/service-tier-definitions.json` | After Phase 8 core |
| `Client-Services-Agreement.md` | Agreement structure/sections | `.claude/skills/docgen-command/templates/service-agreement.json` | After Phase 8 core |
| `Tech-Support-Outsourcing.md` | SLA severity definitions + response times | `tooling/onboarding/sla-definitions.json` | After Phase 8 core |

#### Tier 3: Do Not Migrate

| Source | Reason |
|--------|--------|
| 7 Real Estate SOPs (01-07) | Vertical-specific. Belongs in realty-command reference if needed later. |
| `Model-A-Setup.md` | Pre-FCS Google Workspace infrastructure. Not relevant. |
| Pricing guides, sales proposals, printable docs | Sales collateral, not platform infrastructure. |
| `Google Stuff/` | Chrome extension dev, separate product track. |
| `Github-Enterprise.md` | Portfolio reference. Already reflected in FCS architecture. |
| Stubs (Client_Upgrade_Email.md, Compliance_Report_Template.md, consent_flow_explainer.txt) | Empty or single-line files. |

---

### 4.3 Onboarding Orchestration Implementation Plan

Full spec: `docs/integration/ONBOARDING_ORCHESTRATION_IMPLEMENTATION_SPEC.md`

#### Open Decision Resolutions (Section 14 of spec)

These must be resolved before build. Recommended answers:

| Decision | Recommendation | Rationale |
|----------|---------------|-----------|
| Task system source of truth | Local persisted tasks with later sync to task-command | Onboarding must be deterministic. Cannot depend on command-center availability. Reconcile async. |
| User invitation flow | Delayed invite after intake completion | Don't burn a Clerk seat until employee has submitted intake. Saves cost, avoids orphaned invites. |
| Employee identity strategy | Strict 1:1 (external_employee_id -> clerk_user_id) | Multi-identity adds complexity for zero current use case. Extend later if needed. |
| Notification ownership | Onboarding owns direct transactional sends via Resend. Copy to email-command for analytics. | Critical onboarding path must not depend on email-command module being enabled. |

#### Phase 1: Data and Baseline APIs

**New tables (4):**
- `employee_profiles` -- Canonical employee/driver identity table
- `employee_onboarding_runs` -- State machine run records (queued, running, completed, partial, failed, canceled)
- `employee_onboarding_steps` -- Step-level records (invite_user, assign_training, create_tasks, send_notifications, seed_suspense)
- `onboarding_outbox_events` -- Event-driven outbox for adapter dispatch

**New API routes (6):**
- `POST /api/fleet-compliance/onboarding/employees` -- Create profile + start run
- `PATCH /api/fleet-compliance/onboarding/employees/{id}` -- Update profile + rerun rules
- `POST /api/fleet-compliance/onboarding/employees/{id}/invite` -- Invite to Clerk org
- `GET /api/fleet-compliance/onboarding/runs` -- List runs for org
- `GET /api/fleet-compliance/onboarding/runs/{runId}` -- Run detail with steps
- `POST /api/fleet-compliance/onboarding/runs/{runId}/retry` -- Retry failed run

**Module toggle gate:** All routes check `isModuleEnabled(orgId, 'onboarding')`.

**Migration file:** `src/lib/migrations/008-onboarding-orchestration.sql`

#### Phase 2: Rule Engine + Training Integration

**Rule A: Driver + Hazmat Auto-Assignment**
- Trigger: `employee_profiles.is_driver = true AND hazmat_required = true`
- Action: Resolve org training plan -> assign via training API -> deadline = `hire_date + 90d`
- Module gate: Checks `isModuleEnabled(orgId, 'training')`. If training disabled, step is skipped and logged.

**Rule B: Task Seeding**
- Source template: `tooling/onboarding/task-templates/default-onboarding.json` (migrated from New-Client-Checklist.md)
- Creates: CDL verify (day 7), medical cert verify (day 14), hazmat verify (day 30), training check (day 60), completion check (day 90)
- Module gate: Checks `isModuleEnabled(orgId, 'tasks')`. If disabled, persists tasks in local `onboarding_tasks` table (fallback path per open decision).

**Rule C: Notifications**
- Source templates: `tooling/onboarding/notification-templates/` (migrated from EMAIL-TEMPLATES/)
- Day 0: Onboarding kickoff (employee + manager + org contact)
- Day 60: Reminder if incomplete
- Day 80: Escalation if incomplete
- Day 90: Due-day notice
- Delivery: Resend transactional API (direct). Copy to email-command analytics if `email-analytics` module enabled.

**Rule D: Suspense/Alerts**
- Seeds training assignment rows so existing suspense generation picks them up automatically.
- No new suspense table needed -- relies on existing `sourceType=training_assignment` and `sourceType=hazmat_training` patterns.

#### Phase 3: Task + Notification Adapters

**TrainingAdapter** (required)
- Resolves org training plan (prefer org-scoped, fallback to default PHMSA plan)
- Creates training_assignment + training_progress rows via existing service
- Stores assignment ID in onboarding step output JSONB
- Module gate: `training`

**TaskAdapter** (required)
- Primary: Invoke task-command module gateway when available
- Fallback: Persist to local onboarding_tasks table
- Reconcile: Background job syncs local tasks to task-command when module comes online
- Module gate: `tasks`

**NotificationAdapter** (required)
- Sends via Resend transactional API
- Template resolution from `tooling/onboarding/notification-templates/`
- Delivery outcome stored in step output JSONB
- Analytics copy to email-command if `email-analytics` module enabled

**SuspenseSeedAdapter** (required)
- Seeds training deadline rows into existing tables
- Alert engine auto-generates reminders from these rows
- No module gate (suspense is part of core `fleet-compliance` module)

#### Phase 4: Client Intake Portal (External Workflow)

**Token system:**
- `POST /api/fleet-compliance/onboarding/intake-tokens` -- Admin generates signed, time-limited, single-use token
- `GET /api/fleet-compliance/onboarding/intake/[token]` -- Public form (no Clerk auth required)
- `POST /api/fleet-compliance/onboarding/intake/[token]` -- Submit intake, create/update employee_profiles, optionally start onboarding run

**Intake form fields:**
1. Identity and contact (name, email, phone)
2. Driver/CDL flags (is_driver, cdl_class, cdl_expiration)
3. Hazmat requirement flags (hazmat_required, hazmat_endorsement)
4. Hire/start date
5. Required documents checklist (CDL copy, medical cert, hazmat endorsement)

**Module gate:** `onboarding` module must be enabled for the org that issued the token.

**Security:**
- Token signed with org_id baked in -- cannot be used cross-org
- Single-use enforcement (token marked consumed after successful submit)
- Expiry enforcement (configurable, default 72 hours)
- PII minimization in logs (no names or contact info in structured logs)

#### Phase 5: Hardening

**Acceptance tests (5 scenarios from spec):**
1. New org + first non-driver employee -- run completes without training assignment
2. Driver + hazmat onboarding -- training assigned with 90-day deadline, suspense item created
3. Partial adapter failure + retry -- idempotent behavior, eventual completion
4. Intake token flow -- token issuance, submission, profile creation, run start, expiry enforcement
5. Multi-tenant isolation -- no cross-org visibility in runs, tasks, training, or alerts

**Observability:**
- Structured logs: `org_id`, `run_id`, `step_key`, `attempt`
- Metrics: runs started/completed/failed, step duration, adapter success rates, retry counts
- Alerts: run failure spike, adapter timeout spike, zero training assignments for driver+hazmat runs

**Documentation updates:**
- DEVELOPER_MANUAL.md Section 23 -- add onboarding orchestrator architecture
- UserManualModal.tsx -- add onboarding workflow sections
- New playbook: `docs/integration/onboarding-health-check.md`

---

### 4.4 New Module Toggle Entries

No new MODULE_SEEDS entries are required. The onboarding orchestration uses existing module IDs:

| Existing Module ID | Used By | Already In MODULE_SEEDS |
|-------------------|---------|------------------------|
| `onboarding` | Onboarding Admin Queue, Employee Profile Create, Client Intake Portal, Onboarding Status Check | Yes (pro tier) |
| `training` | TrainingAdapter, Training Assignment Admin, Employee Self-Service Training | Yes (pro tier) |
| `tasks` | TaskAdapter, Onboarding Task Templates | Yes (starter tier) |
| `email-analytics` | NotificationAdapter analytics copy, Notification Template Mgmt | Yes (pro tier) |
| `compliance-docs` | Compliance Reference Library, Compliance Gap Check | Yes (pro tier) |
| `readiness` | Diagnostic Assessment (upgraded ARO skill) | Yes (starter tier) |
| `dq-files` | Document Upload Portal | Yes (starter tier) |
| `fleet-compliance` | Core dashboard, SOP Workflow Library, Suspense Seed | Yes (core, trial tier) |

The module toggle page at `/fleet-compliance/dev/modules` already controls all of these. Admins toggle modules on/off per org, and the onboarding orchestrator respects those toggles at every adapter invocation.

---

### 4.5 New Sidebar Items

| Section | New Item | href | moduleId | Internal/External |
|---------|----------|------|----------|-------------------|
| Compliance | Compliance Reference | `/fleet-compliance/compliance/reference` | `compliance-docs` | Internal |
| Intelligence | Diagnostic Assessment | `/fleet-compliance/readiness/diagnostic` | `readiness` | Internal |
| Admin | Notification Templates | `/fleet-compliance/settings/notifications` | `email-analytics` | Internal |
| Admin | Onboarding Task Config | `/fleet-compliance/settings/onboarding-tasks` | `tasks` | Internal |
| Admin | SOP Library | `/fleet-compliance/command-center/sops` | (none -- core) | Internal |

No new sidebar items needed for external workflows (they are accessed via token URLs or standard org-member routes already linked).

---

### 4.6 New Files Created by This Phase

```
tooling/
  onboarding/
    task-templates/
      default-onboarding.json          # Migrated from New-Client-Checklist.md (12 phases -> structured JSON)
    notification-templates/
      welcome-kickoff.html              # Day 0 onboarding kickoff email
      two-week-checkin.html             # Day 14 check-in
      sixty-day-reminder.html           # Day 60 incomplete warning
      eighty-day-escalation.html        # Day 80 escalation
      ninety-day-due.html               # Day 90 completion due
      go-live-confirmation.html         # Onboarding complete confirmation
      offboarding.html                  # Employee offboarding (future)
    sla-definitions.json                # Extracted from Tech-Support-Outsourcing.md

docs/
  compliance-reference/
    README.md                           # Index of compliance governance packages
    package-1-internal-compliance/      # Migrated from SOPS/ENTIRE TNDS COMPLIANCE GOV/
    package-2-security-handbook/
    package-3-data-handling-privacy/
    package-4-government-contracting/
    package-5-google-partner/
    package-6-business-operations/
    package-7-advanced-compliance/
  integration/
    direction-protocol-sop.md           # Migrated from SOPS/Internal Docs/
    command-protocol-sop.md             # Migrated from SOPS/Internal Docs/
    service-architecture-mapping.md     # Migrated from SOPS/Internal Docs/
    onboarding-health-check.md          # New playbook for onboarding run monitoring

src/
  lib/
    migrations/
      008-onboarding-orchestration.sql  # 4 new tables + indexes
    onboarding/
      orchestrator.ts                   # State machine: run lifecycle management
      rules-engine.ts                   # Rule A-D evaluation
      adapters/
        training-adapter.ts             # Training plan resolution + assignment
        task-adapter.ts                 # Task seeding (primary + fallback paths)
        notification-adapter.ts         # Resend transactional + email-command copy
        suspense-seed-adapter.ts        # Suspense/alert row seeding
  app/
    api/fleet-compliance/onboarding/
      employees/route.ts                # POST create, PATCH update
      employees/[id]/invite/route.ts    # POST invite
      runs/route.ts                     # GET list
      runs/[runId]/route.ts             # GET detail
      runs/[runId]/retry/route.ts       # POST retry
      intake-tokens/route.ts            # POST generate token
      intake/[token]/route.ts           # GET form, POST submit

.claude/skills/
  aro-assessment/
    diagnostic-framework.json           # 28-question framework from Diagnostic Cheat Sheet
```

---

### 4.7 Execution Order

| Step | What | Dependencies | Estimated Effort |
|------|------|-------------|-----------------|
| 1 | Migrate compliance reference library to `docs/compliance-reference/` | None | Low (file copy + README) |
| 2 | Convert New-Client-Checklist.md to `default-onboarding.json` task template | None | Medium (restructure 12 phases to JSON) |
| 3 | Convert EMAIL-TEMPLATES/ to notification templates in `tooling/onboarding/notification-templates/` | None | Medium (11 templates to HTML) |
| 4 | Extract diagnostic framework from Diagnostic Cheat Sheet to `aro-assessment/diagnostic-framework.json` | None | Low (structured extraction) |
| 5 | Migrate Direction/Command Protocol SOPs to `docs/integration/` | None | Low (file copy + path normalization) |
| 6 | Create migration SQL (4 tables) and run | Steps 1-5 complete | Medium |
| 7 | Build orchestrator state machine + rules engine | Step 6 | High |
| 8 | Build TrainingAdapter | Step 7 + existing training service | Medium |
| 9 | Build TaskAdapter (primary + fallback) | Step 7 + step 2 (templates) | Medium |
| 10 | Build NotificationAdapter | Step 7 + step 3 (templates) | Medium |
| 11 | Build SuspenseSeedAdapter | Step 7 + existing suspense tables | Low |
| 12 | Build admin API routes (6 endpoints) | Step 7 | Medium |
| 13 | Build client intake portal (token + form + submit) | Step 12 | Medium |
| 14 | Add sidebar items + route guards | Steps 12-13 | Low |
| 15 | Update DEVELOPER_MANUAL.md + UserManualModal.tsx | Steps 12-13 | Low |
| 16 | Acceptance tests (5 scenarios) | All above | High |
| 17 | Observability + alerts + onboarding-health-check playbook | Step 16 | Medium |

Steps 1-5 can run in parallel. Steps 8-11 can run in parallel. Step 16 depends on everything before it.

---

## Contact

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
True North Data Strategies LLC | SBA-certified VOSB/SDVOSB
