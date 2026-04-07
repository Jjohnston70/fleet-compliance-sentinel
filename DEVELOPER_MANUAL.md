# Fleet-Compliance Sentinel — Developer Manual

**Organization:** True North Data Strategies LLC
**Product:** Fleet-Compliance Sentinel + Pipeline Penny
**Production URL:** https://www.pipelinepunks.com
**Current Date:** April 7, 2026
**Last Updated:** 2026-04-07

---

## Table of Contents

- [Mission](#mission)
- [Current Status](#current-status)
- [Architecture Overview](#architecture-overview)
- [End-to-End Request Flow](#end-to-end-request-flow)
- [End-to-End Onboarding Flow](#end-to-end-onboarding-flow)
- [Module System Architecture](#module-system-architecture)
- [Sidebar and Navigation Architecture](#sidebar-and-navigation-architecture)
- [Database Schema and Migrations](#database-schema-and-migrations)
- [Authentication and Authorization](#authentication-and-authorization)
- [API Routes Reference](#api-routes-reference)
- [Onboarding Orchestration Architecture](#onboarding-orchestration-architecture)
- [Training Module System](#training-module-system)
- [Pipeline Penny AI Integration](#pipeline-penny-ai-integration)
- [Railway Backend Architecture](#railway-backend-architecture)
- [Knowledge Base Management](#knowledge-base-management)
- [Billing and Subscription Lifecycle](#billing-and-subscription-lifecycle)
- [Monitoring and Observability](#monitoring-and-observability)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Scripts Reference](#scripts-reference)
- [Security](#security)
- [Build and Test Gates](#build-and-test-gates)
- [Known Limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)
- [Key Files Quick Reference](#key-files-quick-reference)

---

## Mission

Fleet-Compliance Sentinel is a multi-tenant B2B SaaS platform for fleet and DOT compliance management. It serves logistics companies, transportation fleets, and government contractors with:

- Compliance tracking and alert automation
- Employee onboarding with intake tokens and orchestration
- Hazmat and training module delivery
- Document quality (DQ) file management
- GovCon intelligence and federal contracting support
- Telematics and vehicle tracking integration
- AI-powered analysis via Pipeline Penny

The platform combines Next.js 15 (App Router) on Vercel with a Python FastAPI backend on Railway for AI operations.

---

## Current Status

- **Framework:** Next.js 15.5.14
- **Node:** ^18.0.0
- **Database:** Neon PostgreSQL (multi-tenant)
- **Auth:** Clerk with org scoping
- **Monitoring:** Sentry + Datadog
- **AI Backend:** FastAPI on Railway
- **Total API Routes:** 96
- **Database Migrations:** 19 active
- **Module Count:** 20+ available modules

---

## Architecture Overview

### High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    ┌──────▼──────┐
                    │ Clerk Auth  │
                    │ (Sessions)  │
                    └──────┬──────┘
                           │ JWT
        ┌──────────────────▼──────────────────┐
        │   Vercel (Next.js 15 App Router)    │
        │  src/app + src/lib + middleware.ts  │
        │                                     │
        ├─────────────────────────────────────┤
        │  • Fleet-Compliance routes (96)    │
        │  • Pipeline Penny proxy routes      │
        │  • Stripe billing endpoints         │
        │  • Module gateway endpoints         │
        └─────────────┬───────────────────────┘
                      │
        ┌─────────────┴──────────────────────────┐
        │                                        │
   ┌────▼──────────┐                    ┌───────▼──────┐
   │ Neon          │                    │ Railway       │
   │ PostgreSQL    │                    │ (FastAPI)     │
   │ (Multi-       │                    │               │
   │  tenant)      │                    │ • Query       │
   │               │                    │ • Modules     │
   │ • Fleet data  │                    │ • GovCon      │
   │ • Onboarding  │                    │ • Telematics  │
   │ • Training    │                    │ • Federal     │
   └────────────────┘                    │   Intel       │
                                         │               │
                                         └───────┬───────┘
                                                 │
                                      ┌──────────▼─────────┐
                                      │ LLM Providers      │
                                      │ (Claude, OpenAI,   │
                                      │  Gemini, Ollama)   │
                                      └────────────────────┘
```

### Multi-Tenant Isolation Strategy

Every data query includes `org_id` filtering. Isolation is enforced at three layers:

| Layer | Control |
|-------|---------|
| **Auth Layer** | Clerk org-scoped sessions + JWT token |
| **Query Layer** | `org_id` parameter in every SQL query |
| **Index Layer** | Composite index on `(org_id, collection)` |
| **Audit Layer** | `org_id` attached to every audit event |

No global data access path exists from the frontend. Breach of org_id isolation is a critical security failure.

---

## End-to-End Request Flow

1. **Browser** initiates request with Clerk JWT
2. **Middleware** (`src/middleware.ts`) verifies public/protected routes
3. **API Route** calls `requireFleetComplianceOrg()` to extract userId/orgId from JWT
4. **Data Layer** executes SQL with `org_id` filter via `fleet-compliance-data.ts`
5. **Audit Logger** records request with PII redaction to stdout
6. **Datadog/Sentry** ingests audit logs and error reports
7. **Response** is returned with security headers from vercel.json

### Failure Modes

- **401 Unauthorized:** JWT missing or invalid → Middleware redirects to `/sign-in`
- **403 Forbidden:** User not in org → `requireFleetComplianceOrg()` throws error
- **500 Internal Error:** Database query fails → Sentry captures, response sanitized

---

## End-to-End Onboarding Flow

Onboarding orchestration spans organization setup and employee enrollment.

### Phase 1: Organization Onboarding (On signup)

```
1. User creates org via Clerk
   │
   ▼
2. org-provisioner.ts runs:
   ├─ Creates organization_config row
   ├─ Seeds module_enablement for org
   ├─ Creates org_contact_info row
   └─ Initializes onboarding run state
   │
   ▼
3. Org ready for employee enrollment
```

### Phase 2: Employee Onboarding (Per-employee)

```
1. Admin issues intake token
   │
   ├─ OnboardingIntakeTokenRepository.issue()
   ├─ Hash token + store in onboarding_intake_tokens
   ├─ Return token hash to admin
   │
   ▼
2. Employee or admin submits intake form
   │
   ├─ POST /api/fleet-compliance/onboarding/intake/[token]
   ├─ Validate token (not revoked, not expired)
   ├─ Parse form data → OnboardingEmployeeInput
   ├─ OnboardingService.createOrUpdateEmployeeProfile()
   ├─ Create OnboardingEmployeeProfile row
   │
   ▼
3. Onboarding run enqueued
   │
   ├─ OnboardingService.createRun()
   ├─ Create OnboardingRunRecord (status: 'queued')
   ├─ Create initial OnboardingStepRecords
   ├─ Publish outbox event (enum: 'run_created')
   │
   ▼
4. Outbox worker processes (outbox-worker.ts)
   │
   ├─ Every 30 seconds, query outbox table (status: 'pending')
   ├─ For each event, dispatch to adapter
   ├─ If adapter succeeds, mark outbox event 'processed'
   ├─ If adapter fails, increment attemptCount, schedule retry
   │
   ▼
5. Adapter layer executes steps
   │
   ├─ adapters/hazmat-adapter.ts
   ├─ adapters/suspense-seed-adapter.ts
   ├─ adapters/alert-binding-adapter.ts
   ├─ adapters/contract-drift-adapter.ts
   │
   ▼
6. Run transitions to 'completed' or 'partial'
   │
   └─ All steps either completed, skipped, or failed
```

### Intake Tokens

- Issued by admin for each employee
- Hash stored in `onboarding_intake_tokens` table
- Expire after 30 days (configurable)
- One token per employee
- Can be revoked by admin
- After intake consumption, triggers employee profile creation and run enqueue

### Outbox Pattern

The outbox table provides at-least-once delivery for onboarding events:

| Column | Purpose |
|--------|---------|
| `id` | Event UUID |
| `eventType` | `run_created`, `run_failed`, etc. |
| `payload` | Event data (runId, employeeProfileId, etc.) |
| `status` | `pending` → `retrying` → `processed` or `failed` |
| `attemptCount` | Retry counter |
| `dedupeKey` | Idempotency key |

---

## Module System Architecture

### Module Catalog

Modules are business features that can be selectively enabled/disabled per organization based on subscription tier. There are 20+ available modules.

### Module Definition (modules.ts)

```typescript
interface ModuleSeed {
  id: string;                    // 'fleet-compliance', 'telematics', etc.
  name: string;                  // Display name
  description: string;           // Feature summary
  category: string;              // 'fleet', 'petroleum', 'business', etc.
  icon: string;                  // Lucide icon name
  routePrefix: string;           // '/fleet-compliance', '/telematics', etc.
  isCore: boolean;               // Core vs. premium
  requiresPlan: PlanTier;        // 'trial', 'starter', 'pro', 'enterprise'
  metadata: Record<...>;         // Extra config
}
```

### Module Enablement Flow

1. **Signup:** `org-provisioner.ts` seeds module_enablement rows based on plan tier
2. **Plan upgrade:** Admin changes subscription → `plan-gate.ts` updates module_enablement
3. **Route check:** Middleware calls `getEnabledModules(orgId)` on every request
4. **Sidebar:** `getVisibleSections()` filters sidebar based on enabled modules

### Plan Tiers and Module Availability

| Module | Trial | Starter | Pro | Enterprise |
|--------|-------|---------|-----|------------|
| fleet-compliance | ✓ | ✓ | ✓ | ✓ |
| penny-ai | ✓ | ✓ | ✓ | ✓ |
| telematics | ✗ | ✓ | ✓ | ✓ |
| dispatch | ✗ | ✗ | ✓ | ✓ |
| petroleum-intel | ✗ | ✗ | ✓ | ✓ |
| financial | ✗ | ✓ | ✓ | ✓ |
| govcon | ✗ | ✗ | ✓ | ✓ |
| training | ✓ | ✓ | ✓ | ✓ |

---

## Sidebar and Navigation Architecture

### Sidebar Sections (sidebar-config.ts)

The sidebar is organized into 6 collapsible sections, each with navigation items that map to modules.

| Section | Key | Default Expanded | Items |
|---------|-----|------------------|-------|
| Operations | ops | true | Dashboard, Assets, Employees, Dispatch, Tasks, Onboarding |
| Compliance | compliance | true | Compliance, DQ Files, Alerts, Suspense, FMCSA |
| Training | training | true | Training Hub, My Training, Admin, Hazmat Reports, Courses |
| Finance | finance | false | Financial, Sales, Proposals, Contracts, Invoices, Realty |
| Intelligence | intel | false | Email Analytics, Readiness, GovCon, Telematics |
| Skills & Tools | skills | false | Readiness, Compliance, Financial, GovCon, Realty, Proposal, Asset |
| Admin | admin | false | Settings, Spend, Import, Feature Modules, Penny AI (+ platform-only: Command Center, Module Tools, Developer Module Console) |

### Visibility Rules

- **adminOnly:** Link hidden for non-admin users
- **platformOnly:** Link hidden for org admins who are not platform admins
- **moduleId:** Link hidden if module disabled for org
- **Section-level adminOnly:** Entire section hidden for non-admins

### Module Management Surfaces

Two module-management pages now exist intentionally:

- **Client-facing settings**: `/fleet-compliance/settings/modules`
  - Audience: organization admins (view-only) and platform admins (management)
  - Scope: app feature modules only (for example telematics, tasks, DQ files, skills)
  - Excludes: module gateway/ML execution controls
  - Write policy: `POST /api/fleet-compliance/dev/modules` is platform-admin only (org admins receive 403)
- **Developer console**: `/fleet-compliance/dev/modules`
  - Audience: platform admins
  - Scope: multi-tenant org selection, app module toggles, and module gateway ACL controls
  - Used for platform/operator debugging and gateway governance

### Platform Module Execution Access

- `/fleet-compliance/tools` (Module Tools) is visible only to platform admins.
- `/api/modules/catalog`, `/api/modules/command-center/tools`, and `/api/modules/run` are platform-admin-only endpoints.
- Org admins use `/fleet-compliance/settings/modules` as a read-only visibility surface for plan-governed app modules.
- Gateway/ML modules (for example `petroleum-intel`, `ml-signals`) are platform tooling and are not client-facing module controls.

### Navigation Implementation

```typescript
// In page components:
import { getVisibleSections } from '@/lib/sidebar-config';

const sections = getVisibleSections(enabledModuleIds, userRole);
// Render only visible sections and items
```

---

## Database Schema and Migrations

### Migration History (19 active migrations)

| # | File | Purpose |
|---|------|---------|
| 1 | `001_cron_log.sql` | Cron job execution logging |
| 2 | `002_soft_delete.sql` | Soft delete support (deleted_at column) |
| 3 | `003_import_batch.sql` | Batch import tracking |
| 4 | `004_org_scoping.sql` | Multi-tenant org scoping |
| 5 | `005_org_lifecycle_controls.sql` | Org provisioning, suspension, archival |
| 6 | `006_rename_chief.sql` | Rename CHIEF identifier |
| 7 | `007_offboarding.sql` | Employee offboarding workflow |
| 8 | `008_telematics_adapter.sql` | Verizon Reveal integration tables |
| 9 | `009_risk_scores.sql` | Risk scoring for alerts |
| 10 | `010_telematics_location_pii_comments.sql` | PII masking for telematics |
| 11 | `011_module_system.sql` | Module catalog + enablement |
| 12 | `012_training_tables.sql` | Training LMS core |
| 13 | `013_hazmat_training_compliance.sql` | HazMat certification tracking |
| 14 | `014_training_certificate_storage.sql` | Certificate persistence backends |
| 15 | `015_hazmat_training_module_catalog.sql` | HazMat course catalog |
| 16 | `016_organization_contact_address.sql` | Org contact info + address |
| 17 | `017_onboarding_orchestration.sql` | Onboarding runs, steps, tasks |
| 18 | `018_onboarding_phase3_adapters.sql` | Adapter state + suspense seeding |
| 19 | `019_onboarding_intake_tokens.sql` | Intake tokens + outbox pattern |

### Core Tables

| Table | Purpose |
|-------|---------|
| `organizations` | Org records with lifecycle state |
| `organization_config` | Settings per org |
| `organization_contact_info` | Address, phone, name |
| `users` | User references (Clerk integration) |
| `module_catalog` | Available modules (readonly seed) |
| `module_enablement` | Which modules enabled for each org |
| `assets` | Fleet vehicles |
| `employees` | Employee records |
| `alerts` | Compliance alerts |
| `cron_log` | Cron execution history |
| `training_modules` | Course definitions |
| `training_assignments` | Employee → Course enrollment |
| `training_progress` | Module completion tracking |
| `hazmat_training_records` | Certification tracking |
| `onboarding_employee_profiles` | Employee intake data |
| `onboarding_runs` | Orchestration run records |
| `onboarding_steps` | Run step execution |
| `onboarding_tasks` | Action items (CRM sync) |
| `onboarding_intake_tokens` | Invite tokens (hashed) |
| `onboarding_outbox_events` | At-least-once event delivery |
| `telematics_locations` | GPS tracking data |
| `verizon_reveal_sync_log` | Telematics sync history |

---

## Authentication and Authorization

### Clerk Integration

Clerk handles user signup, signin, org management, and JWT issuance.

**Clerk Middleware** (`src/middleware.ts`):
- Protects all routes matching `/penny(.*)`, `/fleet-compliance(.*)`, `/api/fleet-compliance(.*)`
- Public routes: `/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/api/penny/health`
- Self-authed routes (bypass Clerk): `/api/fleet-compliance/alerts/run`, `/api/fleet-compliance/telematics-sync`

### Organization Scoping

Users belong to organizations in Clerk. Each org has one or more users:

```typescript
// In API route:
const { userId, orgId } = await requireFleetComplianceOrg(req);
// orgId extracted from Clerk session, verified against JWT
```

### Role-Based Access Control

Two roles per org:

| Role | Capabilities |
|------|-------------|
| **admin** | View all module toggles, settings, training admin, import data, command center |
| **member** | View assigned modules only, no admin controls |

Enforced via:
1. Sidebar config filtering (`adminOnly: true`)
2. API route checks in request handlers
3. UI-level visibility rules

### Multi-Factor Authentication

Clerk supports MFA via TOTP, SMS, or backup codes. Configured per org or per user.

---

## API Routes Reference

The platform has 96 API routes. Key endpoints are organized by domain.

### Fleet-Compliance Core (18 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/fleet-compliance` | Dashboard summary |
| POST | `/api/fleet-compliance/assets` | Create/list assets |
| GET | `/api/fleet-compliance/employees` | List employees |
| POST | `/api/fleet-compliance/alerts/trigger` | Manually trigger alert |
| GET | `/api/fleet-compliance/alerts/preview` | Preview alert payload |
| POST | `/api/fleet-compliance/alerts/run` | Cron job (8am daily) |
| POST | `/api/fleet-compliance/cron-health` | Health check endpoint |
| GET | `/api/fleet-compliance/spend` | Billing dashboard |
| GET | `/api/fleet-compliance/fmcsa/lookup` | FMCSA safety ratings |

### Onboarding (12 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/fleet-compliance/onboarding` | Create org onboarding |
| GET | `/api/fleet-compliance/onboarding` | Get org onboarding state |
| GET | `/api/fleet-compliance/onboarding/employees` | List employee profiles |
| POST | `/api/fleet-compliance/onboarding/employees` | Create employee profile |
| GET | `/api/fleet-compliance/onboarding/employees/[id]` | Get profile |
| POST | `/api/fleet-compliance/onboarding/employees/[id]/invite` | Issue intake token |
| POST | `/api/fleet-compliance/onboarding/intake/[token]` | Submit intake form |
| GET | `/api/fleet-compliance/onboarding/intake-tokens` | List tokens |
| POST | `/api/fleet-compliance/onboarding/outbox/process` | Process outbox events |
| GET | `/api/fleet-compliance/onboarding/runs` | List runs |
| GET | `/api/fleet-compliance/onboarding/runs/[id]` | Get run detail |
| POST | `/api/fleet-compliance/onboarding/runs/[id]/retry` | Retry failed run |

### Document Quality (DQ) Files (7 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/fleet-compliance/dq/files` | List DQ files |
| POST | `/api/fleet-compliance/dq/files` | Upload DQ file |
| GET | `/api/fleet-compliance/dq/files/[id]` | Get file detail |
| GET | `/api/fleet-compliance/dq/files/[id]/checklist` | Get checklist |
| POST | `/api/fleet-compliance/dq/documents` | List documents |
| POST | `/api/fleet-compliance/dq/documents/generate` | Generate document |
| GET | `/api/fleet-compliance/dq/gaps` | Gap analysis |

### GovCon Compliance (12 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/fleet-compliance/govcon` | GovCon dashboard |
| POST | `/api/fleet-compliance/govcon` | Create govcon record |
| GET | `/api/fleet-compliance/govcon/[id]` | Get record detail |
| GET | `/api/fleet-compliance/govcon/company` | Company profile |
| GET | `/api/fleet-compliance/govcon/compliance` | Compliance posture |
| GET | `/api/fleet-compliance/govcon/contacts` | Team contacts |
| GET | `/api/fleet-compliance/govcon/deadlines` | Opportunity deadlines |
| POST | `/api/fleet-compliance/govcon/intake` | Intake questionnaire |
| GET | `/api/fleet-compliance/govcon/intel` | Federal intelligence |
| POST | `/api/fleet-compliance/govcon/federal-intel/run-all` | Refresh intel |
| GET | `/api/fleet-compliance/govcon/maturity` | Readiness assessment |
| GET | `/api/fleet-compliance/govcon/bid-documents` | Bid documents |

### Training (10 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/v1/training/health` | Training system health |
| GET | `/api/v1/training/[code]/deck` | Get module content |
| POST | `/api/v1/training/[code]/deck/complete` | Mark complete |
| POST | `/api/v1/training/[code]/assessment/submit` | Submit quiz |
| GET | `/api/v1/training/[code]/assessment/attempts` | View attempts |
| POST | `/api/v1/training/assignments` | Create assignment |
| GET | `/api/v1/training/progress` | Employee progress |
| GET | `/api/v1/training/certificates` | Certificate list |
| POST | `/api/v1/hazmat-training/[id]` | Enroll in HazMat |
| GET | `/api/v1/hazmat-training/org/[id]/summary` | HazMat summary |

### Pipeline Penny (4 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/penny/health` | Backend health check |
| POST | `/api/penny/query` | Query AI (supports `skill_mode`, `llm_provider`, `llm_model`) |
| GET | `/api/penny/catalog` | Knowledge catalog (merged local + backend) |
| GET | `/api/penny/skills` | Org-enabled Penny workflow/skill modes |

### Modules (5 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| GET | `/api/modules/catalog` | Module catalog (platform admin only) |
| GET | `/api/modules/status/[id]` | Module status |
| POST | `/api/modules/run` | Execute module (platform admin only) |
| GET | `/api/modules/artifact` | Fetch artifact |
| GET | `/api/modules/command-center/tools` | Command center tools (platform admin only) |

### Stripe Billing (3 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/stripe/checkout` | Create checkout session |
| POST | `/api/stripe/portal` | Customer portal URL |
| POST | `/api/stripe/webhook` | Webhook handler |

### Import & Data (4 routes)

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/fleet-compliance/import/setup` | Initialize import |
| POST | `/api/fleet-compliance/import/parse` | Parse CSV |
| POST | `/api/fleet-compliance/import/save` | Persist data |
| POST | `/api/fleet-compliance/import/rollback` | Undo import |

---

## Onboarding Orchestration Architecture

The onboarding system is built on a service + repository + adapter pattern with outbox-based event delivery.

### Components

**OnboardingService** (`src/lib/onboarding/service.ts`):
- High-level business logic
- `createEmployeeProfile()` - Register employee
- `createRun()` - Start orchestration
- `retryRun()` - Resume failed runs
- Publishes outbox events on transitions

**OnboardingRepository** (`src/lib/onboarding/repository.ts`):
- Data layer for all onboarding tables
- CRUD for profiles, runs, steps, tasks
- `insertOutboxEvent()` - Queue event

**OnboardingIntakeService** (`src/lib/onboarding/intake-service.ts`):
- Handles intake token validation
- Parses intake form submission
- Idempotency checks
- Error handling and retries

**Adapters** (`src/lib/onboarding/adapters/`):
- Transform run events into actions
- `hazmat-adapter.ts` - Enroll in HazMat
- `suspense-seed-adapter.ts` - Add suspense records
- `alert-binding-adapter.ts` - Bind employee to alerts
- `contract-drift-adapter.ts` - Check contract compliance

**OutboxWorker** (`src/lib/onboarding/outbox-worker.ts`):
- Runs every 30 seconds
- Polls pending outbox events
- Dispatches to appropriate adapter
- Retries on failure (max 5 attempts)
- Marks processed on success

---

## Training Module System

The training system (LMS) supports multi-module courses with assessments and certificates.

### Core Components

**Training Module Catalog** (`src/lib/training-module-metadata.ts`):
- Defines available courses
- Module code, title, description
- Deck markdown + assessment questions
- Certificate requirements

**Training Assignment**:
- Assign course to employee
- Tracks due date, completion deadline
- Required for employment (e.g., HazMat)

**Progress Tracking**:
- Employee → Module → Status
- Quiz attempts + scores
- Certificate issued on passing

**Certificate Storage** (`src/lib/training-certificate.ts`):
- Backend configurable: `database` or `local_files`
- Supports PDF + metadata

**HazMat Compliance** (`src/lib/hazmat-training.ts`):
- Mandatory endorsement tracking
- Certificate expiration date
- Annual recertification requirement
- Reports: expiring, expired, missing

---

## Pipeline Penny AI Integration

### Architecture

Pipeline Penny is a FastAPI backend running on Railway that provides AI-powered analysis, queries, and task orchestration.

### API Endpoints

**Health Check**
```
GET /api/penny/health
Returns: { status: 'ok', version: '0.1.0' }
```

**Query**
```
POST /api/penny/query
Body: {
  query: string,
  chat_history?: Array<{ role: 'user'|'assistant'|'system', content: string }>,
  skill_mode?: string,        // Selected workflow/skill id from /api/penny/skills
  llm_provider?: string,      // anthro/openai/gemini/ollama (UI-configured)
  llm_model?: string
}
Returns: { response: string, mode: string, citations: [...], ... }
```

**Catalog**
```
GET /api/penny/catalog
Returns: { skills: [...], templates: [...] }
```

**Skill Modes**
```
GET /api/penny/skills
Returns: {
  ok: true,
  modes: [
    { id: '', label: 'General Assistant', moduleId: null, moduleName: null },
    { id: 'risk-manager', label: 'Risk Manager', moduleId: 'ai-readiness', moduleName: 'AI Readiness' },
    ...
  ]
}
```

`/api/penny/skills` is org-scoped and only returns modes for enabled `skills` modules.
Penny chat uses this endpoint to populate the Workflow dropdown and sends the selected value as `skill_mode` on each query request.

### Rate Limiting

Rate limiting via `penny-rate-limit.ts`:
- Redis-backed (Upstash)
- Per-user, per-org limits
- Fallback mode for over-limit requests

---

## Railway Backend Architecture

The FastAPI backend on Railway handles heavy AI operations, federal intel gathering, and telematics integration.

### Service Structure

```
railway-backend/
├── app/
│   ├── main.py                    # FastAPI app setup
│   ├── federal_intel_router.py    # GovCon endpoints
│   ├── modules_router.py          # Module execution
│   ├── telematics_router.py       # Verizon Reveal
│   │
│   └── integrations/
│       ├── base_adapter.py        # Base class
│       ├── federal_intel/         # Federal contracting data
│       │   ├── sam.py             # SAM.gov integrations
│       │   ├── grants.py          # Federal grants DB
│       │   ├── sbir.py            # SBIR/STTR programs
│       │   ├── psc.py             # Product Service Code
│       │   ├── regulations.py     # FAR/DFARS compliance
│       │   └── ...
│       └── verizon_reveal/        # Telematics adapter
│           ├── auth.py
│           ├── rest_client.py
│           ├── normalizer.py
│           └── webhook_receiver.py
```

### GovCon Federal Intel

The federal intelligence system integrates multiple federal data sources:

| Adapter | Data Source |
|---------|-------------|
| `sam.py` | SAM.gov contractor registration |
| `grants.py` | Federal grants database |
| `sbir.py` | SBIR/STTR program data |
| `psc.py` | Product Service Code scoring |
| `regulations.py` | FAR/DFARS rule matching |
| `labor_rates.py` | Davis-Bacon wage rates |
| `subawards.py` | Sub-award analysis |
| `usaspending.py` | USASpending.gov awards |

### Telematics Integration

Verizon Reveal provides vehicle GPS and driver behavior data.

---

## Knowledge Base Management

Pipeline Penny operates on a knowledge base indexed for RAG retrieval.

### Knowledge Structure

```
railway-backend/
├── data/
│   ├── vector_store_ollama/
│   │   └── index.faiss          # FAISS vector index
│   └── original_content/
│       ├── 01_realty-command/
│       ├── 02_compliance/
│       ├── ...
│       └── _index/
│           ├── manifest.json    # Phase 1 index
│           ├── manifest-phase2.json
│           └── manifest-phase3.json
```

### Ingest Pipeline

**Command:**
```bash
npm run sync:knowledge
node scripts/sync-local-knowledge.mjs
```

---

## Billing and Subscription Lifecycle

### Stripe Integration

Stripe manages subscription plans and billing.

### Subscription Plans

| Plan | Price | Modules | Seats |
|------|-------|---------|-------|
| Trial | Free | Core only | 3 |
| Starter | $99/mo | +Telematics, Financial | 10 |
| Pro | $299/mo | +Dispatch, Petroleum, GovCon | 25 |
| Enterprise | Custom | All | Unlimited |

### Webhook Handling

Stripe POSTs events to `/api/stripe/webhook`:
- `customer.subscription.created` → Provision org
- `customer.subscription.updated` → Update modules
- `customer.subscription.deleted` → Suspend org

---

## Monitoring and Observability

### Sentry Error Tracking

Sentry captures errors, performance metrics, and releases across Next.js and Railway.

### Datadog Monitoring

Datadog ingests audit logs from stdout.

### CSP Reporting

Content Security Policy violations reported to `/api/csp-report` endpoint.

---

## Deployment

### Vercel (Next.js Frontend)

```
vercel.json
├── framework: nextjs
├── headers: [CSP, HSTS, X-Frame-Options, etc.]
└── crons:
    ├── /api/fleet-compliance/alerts/run (0 8 * * *)
    └── /api/fleet-compliance/telematics-sync (0 2 * * *)
```

### Railway (FastAPI Backend)

```
railway-backend/
├── Dockerfile
├── requirements.txt
├── Procfile (uvicorn on :8000)
└── .env (Railway environment variables)
```

---

## Environment Variables

### Core Web App (Next.js / Vercel)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk public key |
| `CLERK_SECRET_KEY` | Clerk secret |
| `DATABASE_URL` | Neon PostgreSQL |
| `SITE_URL` | Base URL |
| `FLEET_PLATFORM_ADMIN_USER_IDS` | Comma-separated Clerk user IDs allowed to use platform-only module tooling |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | Default post-login redirect (`/fleet-compliance`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | Default post-signup redirect (`/fleet-compliance`) |

### Penny AI Proxy

| Variable | Purpose |
|----------|---------|
| `PENNY_API_URL` | Railway FastAPI URL |
| `PENNY_API_KEY` | Shared secret |
| `PENNY_GENERAL_FALLBACK_SESSION_LIMIT` | Limit for general mode |
| `PENNY_ENABLE_GENERAL_FALLBACK` | Enable fallback |
| `MODULE_GATEWAY_USE_REMOTE` | Use remote module gateway |

### Stripe Billing

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe public key |
| `STRIPE_WEBHOOK_SECRET` | Webhook signing secret |
| `STRIPE_STARTER_PRICE_ID` | Starter plan price ID |
| `STRIPE_PRO_PRICE_ID` | Pro plan price ID |

### Monitoring

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` | Server-side Sentry |
| `NEXT_PUBLIC_SENTRY_DSN` | Client-side Sentry |
| `SENTRY_ORG` | Sentry org |
| `SENTRY_PROJECT` | Sentry project |
| `SENTRY_AUTH_TOKEN` | Sentry auth |

### Telematics (Verizon Reveal)

| Variable | Purpose |
|----------|---------|
| `TELEMATICS_CRON_SECRET` | Sync job auth |
| `RAILWAY_SYNC_URL` | Railway webhook URL |
| `TELEMATICS_DEMO_MODE` | Use demo data |
| `REVEAL_ORG_ID` | Verizon org ID |
| `REVEAL_USERNAME` | Verizon login |
| `REVEAL_PASSWORD` | Verizon password |

### Railway FastAPI Backend

| Variable | Purpose |
|----------|---------|
| `PENNY_API_VERSION` | 0.1.0 |
| `LLM_PROVIDER` | anthropic, openai, gemini, ollama |
| `ANTHROPIC_API_KEY` | Claude API key |
| `ANTHROPIC_MODEL` | claude-sonnet-4-6 |
| `OPENAI_API_KEY` | OpenAI key |
| `GEMINI_API_KEY` | Google Gemini key |
| `OLLAMA_BASE_URL` | Local Ollama |
| `CORS_ORIGINS` | Allowed origins |

---

## Scripts Reference

### Development

| Script | Purpose |
|--------|---------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |

### Preflight & Validation

| Script | Purpose |
|--------|---------|
| `npm run preflight:skill-packs` | Validate skill pack integrity |
| `npm run compliance:legal-check` | Validate privacy/terms pages |
| `npm run compliance:ops-check` | Check operational gaps |
| `npm run db:check-training-schema` | Validate training schema |

### Knowledge & Training

| Script | Purpose |
|--------|---------|
| `npm run sync:knowledge` | Sync knowledge base to local |
| `npm run build:cfr-index` | Build CFR regulatory index |
| `npm run docs:vendors` | Download vendor docs |
| `npm run eval:penny` | Run Pipeline Penny evals |

### Testing

| Script | Purpose |
|--------|---------|
| `npm run test:onboarding-phase1` | Test onboarding core logic |
| `npm run test:onboarding-drift` | Test contract drift detection |
| `npm run test:onboarding-alerts` | Test alert binding |
| `npm run test:onboarding-phase6` | Test phase 6 release gate |

---

## Security

### Local Development Hardening

1. **Environment Isolation:** Use `.env.local` (never commit)
2. **Database Access:** Rotate `DATABASE_URL` credentials quarterly
3. **Clerk Configuration:** Dev keys only in `.env.local`
4. **AI Provider Credentials:** API keys never in code

### Production Security Posture

1. **Network Security:** HTTPS enforced, CSP headers, X-Frame-Options
2. **Data Protection:** Encryption at rest/in transit, PII redaction in logs
3. **Authentication:** Clerk JWT validation, org scoping enforced
4. **Audit Trail:** Every API call logged, Sentry captures errors

### SOC 2 Compliance

FCS is designed to support SOC 2 Type II certification with access controls, monitoring, and audit trails.

---

## Build and Test Gates

### Pre-Commit Checks

```bash
npm run lint
npm run preflight:skill-packs
npm run compliance:legal-check
```

### Pre-Deploy Checks

```bash
npm run build
npm run test:onboarding-*
npm run compliance:ops-check
npm run db:check-training-schema
```

---

## Known Limitations

1. **Hard Delete:** No support for permanent record deletion; use soft delete
2. **Intake Token Expiration:** 30-day fixed; not configurable per org
3. **Training Module Sequencing:** No prerequisite enforcement
4. **Telematics Demo Mode:** Demo data only; cannot mix with live Verizon data
5. **Module Gateway:** Remote module execution not yet fully implemented
6. **Offline Mode:** No offline-first support
7. **Batch Size:** Import batch limit 10K rows
8. **Certificate Storage:** Limited to database or local files

---

## Troubleshooting

### Common Issues

**Clerk JWT Not Validating**
- Check `CLERK_SECRET_KEY` matches Clerk dashboard
- Clear browser cookies and retry login

**Database Connection Timeout**
- Verify `DATABASE_URL` is correct (Neon console)
- Check firewall rules allow connection from Vercel IP

**Penny API Not Responding**
- Check Railway backend is running: `GET /api/penny/health`
- Verify `PENNY_API_URL` points to Railway, not localhost

**Onboarding Stuck in "running"**
- Check outbox_worker logs
- Verify adapter code doesn't throw uncaught errors
- Call `POST /api/fleet-compliance/onboarding/runs/[runId]/retry`

**Module Not Showing in Sidebar**
- Verify `module_enablement.enabled = true` for org
- Check plan tier allows module
- Clear localStorage sidebar state

**Sentry Not Capturing Errors**
- Check `SENTRY_DSN` matches Sentry project
- Verify `SENTRY_AUTH_TOKEN` is valid

---

## Key Files Quick Reference

| File | Purpose |
|------|---------|
| `src/middleware.ts` | Route protection, public allowlist |
| `src/lib/modules.ts` | Module catalog and seeds |
| `src/lib/sidebar-config.ts` | Navigation section configuration |
| `src/lib/org-provisioner.ts` | Org setup on signup |
| `src/lib/plan-gate.ts` | Plan tier → module mapping |
| `src/lib/fleet-compliance-db.ts` | Core SQL queries, org scoping |
| `src/lib/fleet-compliance-data.ts` | Domain-specific data access |
| `src/lib/fleet-compliance-auth.ts` | Role + org verification |
| `src/lib/audit-logger.ts` | Structured logging |
| `src/lib/onboarding/service.ts` | Onboarding orchestration |
| `src/lib/onboarding/repository.ts` | Onboarding data layer |
| `src/lib/onboarding/intake-service.ts` | Token validation + form parsing |
| `src/lib/onboarding/outbox-worker.ts` | Event processing worker |
| `src/lib/onboarding/adapters/*.ts` | Step execution |
| `src/lib/training-module-metadata.ts` | Course catalog |
| `src/lib/training-certificate.ts` | Certificate generation + storage |
| `src/lib/hazmat-training.ts` | HazMat compliance tracking |
| `src/lib/penny-context.ts` | Penny API client |
| `docs/USER_MANUAL.md` | End-user operations and permissions guide |
| `src/components/fleet-compliance/UserManualModal.tsx` | In-app user manual content |
| `next.config.js` | Next.js config + Sentry integration |
| `vercel.json` | Vercel deployment + headers + crons |
| `.env.example` | Environment variable template |
| `migrations/*.sql` | Database schema (19 files) |
| `railway-backend/app/main.py` | FastAPI entry point |
| `package.json` | Dependencies + scripts |
| `tsconfig.json` | TypeScript config |

---

**End of Developer Manual**

For questions or updates, contact the True North Data Strategies development team.
