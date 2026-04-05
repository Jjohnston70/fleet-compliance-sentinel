# Fleet-Compliance Sentinel — Developer Manual

**Organization:** True North Data Strategies LLC
**Product:** Fleet-Compliance Sentinel + Pipeline Penny
**Production URL:** https://www.pipelinepunks.com
**Last Updated:** 2026-04-03

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Local Development Setup](#2-local-development-setup)
3. [Project Structure](#3-project-structure)
4. [Technology Stack](#4-technology-stack)
5. [Database Schema & Migrations](#5-database-schema--migrations)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Routes Reference](#7-api-routes-reference)
8. [Module Gateway System](#8-module-gateway-system)
9. [Pipeline Penny (AI Engine)](#9-pipeline-penny-ai-engine)
10. [Railway Backend (FastAPI)](#10-railway-backend-fastapi)
11. [Knowledge Base Management](#11-knowledge-base-management)
12. [Training Module (LMS)](#12-training-module-lms)
13. [Sidebar & Module Toggle System](#13-sidebar--module-toggle-system)
14. [Billing & Subscription Lifecycle](#14-billing--subscription-lifecycle)
15. [Monitoring & Observability](#15-monitoring--observability)
16. [Deployment & CI/CD](#16-deployment--cicd)
17. [Environment Variables](#17-environment-variables)
18. [Scripts Reference](#18-scripts-reference)
19. [SOC 2 Compliance](#19-soc-2-compliance)
20. [Troubleshooting Guide](#20-troubleshooting-guide)
21. [Common Errors & Solutions](#21-common-errors--solutions)
22. [Key Files Quick Reference](#22-key-files-quick-reference)

---

## 1. Architecture Overview

Fleet-Compliance Sentinel is a **multi-tenant B2B SaaS platform** built on Next.js (App Router) with a FastAPI backend for AI operations. The system uses a monorepo structure with npm workspaces.

### High-Level Architecture

```
User Browser
    │
    ▼
Clerk (Auth + MFA) ─── JWT ───▶ Vercel (Next.js 15)
                                  │
                    ┌─────────────┼─────────────────┐
                    │             │                  │
              Fleet-Comp    Penny API          Stripe Routes
              API Routes    Routes (3)         (3 endpoints)
              (18 endpts)       │
                    │           ▼
                    │     Railway (FastAPI)
                    │       │
                    ▼       ▼
              Neon Postgres    LLM Providers
              (Multi-tenant)   (Claude/OpenAI/Gemini/Ollama)
```

### Request Flow

1. **Browser** → Clerk session verification via middleware
2. **Middleware** (`src/middleware.ts`) → Route protection, public route allowlist
3. **API Route** → `requireFleetComplianceOrg()` extracts userId/orgId from Clerk JWT
4. **Data Layer** → `fleet-compliance-data.ts` queries Neon with org_id isolation
5. **Audit Logger** → Every API call logged with PII redaction to stdout → Datadog

### Multi-Tenant Isolation

Every data query includes `org_id` filtering. There is no global data access path from the frontend. The isolation chain:

- **Auth layer:** Clerk org-scoped sessions
- **Query layer:** `org_id` parameter in every SQL query
- **Database layer:** Index on `(org_id, collection)` for performance
- **Audit layer:** org_id attached to every audit event

---

## 2. Local Development Setup

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+
- PostgreSQL connection (Neon provides free tier)
- Clerk account (free tier for dev)

### Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd 00-FLEET-COMPLIANCE-SENTINEL

# Install dependencies (includes workspace packages)
npm install

# Validate environment variables
npx tsx scripts/check-env.ts

# Start development server
npm run dev
```

### Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in required variables (see [Section 17](#17-environment-variables))
3. At minimum you need:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY`
   - `DATABASE_URL` (Neon connection string)
   - `SITE_URL` (usually `http://localhost:3000` for dev)

### Build & Verify

```bash
# Full production build (builds CFR + demo indexes first)
npm run build

# Lint check
npm run lint

# Compliance checks
npm run compliance:legal-check    # Privacy/terms page validation
npm run compliance:ops-check      # Operational gap detection
```

### Railway Backend (Optional for Penny)

```bash
cd railway-backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `PENNY_API_URL=http://localhost:8000` in `.env.local` to connect.

---

## 3. Project Structure

```
00-FLEET-COMPLIANCE-SENTINEL/
├── src/                          # Next.js application
│   ├── app/                      # App Router (pages + API routes)
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout (Clerk, Sentry, CSS)
│   │   ├── fleet-compliance/     # Main dashboard module
│   │   │   ├── page.tsx          # Dashboard
│   │   │   ├── telematics/       # Telematics risk dashboard
│   │   │   ├── training/         # Training LMS pages
│   │   │   └── tools/            # Module Tools operator UI
│   │   ├── penny/                # AI assistant chat
│   │   └── api/                  # API routes
│   │       ├── fleet-compliance/ # 18 endpoints
│   │       ├── modules/          # Module gateway API
│   │       ├── penny/            # Penny API proxy
│   │       ├── stripe/           # Billing webhooks
│   │       └── v1/               # Training API (new)
│   ├── components/               # React components
│   │   ├── fleet-compliance/     # 26 fleet components
│   │   │   ├── UserManualModal   # In-app user manual
│   │   │   ├── forms/            # Input forms (6)
│   │   │   └── ...
│   │   └── training/             # Training components
│   └── lib/                      # Shared libraries
│       ├── fleet-compliance-data.ts    # MAIN data layer (~60K lines)
│       ├── fleet-compliance-auth.ts    # Auth middleware
│       ├── fleet-compliance-db.ts      # DB connection pool
│       ├── fleet-compliance-alert-engine.ts  # Alert scoring
│       ├── audit-logger.ts             # Audit logging w/ PII redaction
│       ├── modules.ts                  # Module gateway orchestration
│       ├── modules-gateway/            # Gateway internals
│       │   ├── types.ts                # Call envelope + error taxonomy
│       │   ├── registry.ts             # Tool registry
│       │   ├── runner.ts               # Execution orchestration
│       │   ├── command-center-bridge.ts
│       │   ├── remote.ts               # Remote execution
│       │   └── persistence.ts          # Audit log storage
│       ├── penny-context.ts            # RAG context builder
│       ├── penny-ingest.ts             # Document ingestion
│       ├── penny-catalog.ts            # Knowledge index
│       ├── penny-access.ts             # Access control
│       ├── penny-rate-limit.ts         # Rate limiting
│       ├── sidebar-config.ts           # Sidebar navigation config
│       ├── plan-gate.ts                # Subscription gates
│       ├── org-provisioner.ts          # Org setup
│       ├── offboarding-lifecycle.ts    # Data deletion
│       ├── stripe.ts                   # Stripe wrapper
│       └── training-*.ts               # Training module libs
│
├── railway-backend/              # FastAPI backend (Python)
│   ├── app/
│   │   ├── main.py               # FastAPI app + Penny RAG
│   │   ├── telematics_router.py  # Verizon Reveal routes
│   │   └── modules_router.py     # Module execution routes
│   └── integrations/
│       └── verizon_reveal/       # Reveal adapter
│
├── packages/                     # Monorepo workspace packages
│   ├── tnds-types/               # Shared TypeScript types
│   ├── tnds-ingest-core/         # Document ingestion primitives
│   ├── tnds-retrieval-core/      # Chunked retrieval for Penny
│   └── tnds-memory-core/         # Memory/timeline (future)
│
├── knowledge/                    # Knowledge base for Penny
│   ├── cfr-docs/                 # 13 CFR parts in Markdown
│   ├── cfr-index/chunks.json     # Vectorized CFR index
│   ├── demo-index/chunks.json    # Demo knowledge index
│   ├── data/original_content/    # Source documents (ERG, etc.)
│   └── training-content/         # Training materials
│
├── migrations/                   # SQL migrations (16 files)
├── soc2-evidence/                # SOC 2 evidence (73 files)
├── docs/                         # Operational runbooks
│   └── integration/              # Integration contracts
├── tooling/                      # ML modules + command-center
├── scripts/                      # Build & utility scripts
├── public/                       # Static assets
├── .claude/                      # Claude Code agent configs
│   └── agents/
│       └── pipeline-x-integrator.md  # Package integration agent
└── archive/                      # Historical snapshots
```

### Claude Code Agents (`.claude/agents/`)

The `.claude/agents/` directory contains specialized instruction files for Claude Code sessions. These are **developer/operator tools only** — they are not client-facing, do not run in production, and are never shipped as part of the Fleet-Compliance Sentinel product. Each agent file defines a persona with specific domain knowledge, constraints, and verification protocols that Claude Code adopts during a session.

The canonical agent library lives at `AGENTS-TNDS/` on the development workstation (outside this repo). Agents are copied into `.claude/agents/` when they are deployed for use on this project. The agent recommendation matrix is documented in `FCS-Agent-Deployment-Recommendations.docx` at the project root.

**Currently deployed:**
- `pipeline-x-integrator.md` — Systematic integration of @tnds/* workspace packages from legacy codebases. 12-task checklist with build verification protocol.

**Recommended for deployment (see recommendation doc for full rationale):**
- Tier 1 (Critical): `code-security-auditor`, `typescript-developer`, `database-designer`
- Tier 2 (High Value): `code-reviewer`, `backend-developer`, `frontend-developer`, `auditor`
- Tier 3 (As Needed): `python-developer`, `code-documenter`, `code-debugger`, `curriculum-designer`, `builder`

---

## 4. Technology Stack

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | ^15.5.14 | App Router, server components, API routes |
| React | ^18.3.1 | UI library |
| TypeScript | ^5.3.3 | Type safety |
| Tailwind CSS | ^3.4.19 | Utility-first CSS |
| Recharts | ^2.15.4 | Charting (Spend Dashboard, trends) |
| react-markdown | ^10.1.0 | Penny response rendering |
| ExcelJS | ^4.4.0 | XLSX parsing for bulk imports |

### Backend (Railway)
| Package | Version | Purpose |
|---------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | 0.116.1 | Web framework |
| Uvicorn | 0.35.0 | ASGI server |
| httpx | 0.28.1 | LLM API calls |

### Data & Auth
| Service | Purpose |
|---------|---------|
| Neon PostgreSQL | Serverless DB (SOC 2 Type II) |
| Clerk | Org-scoped auth + RBAC |
| Upstash Redis | Rate limiting |
| Stripe | Subscription billing |
| Resend | Email delivery |

### Monitoring
| Service | Purpose |
|---------|---------|
| Sentry | Errors, replay, logs, source maps |
| Datadog | Log aggregation + audit analysis |
| UptimeRobot | External uptime monitoring |

### Workspace Packages
| Package | Import | Purpose |
|---------|--------|---------|
| `@tnds/types` | `import { ... } from '@tnds/types'` | Shared TypeScript types |
| `@tnds/ingest-core` | `import { ... } from '@tnds/ingest-core'` | PDF/DOCX/CSV/HTML ingestion |
| `@tnds/retrieval-core` | `import { ... } from '@tnds/retrieval-core'` | Chunked retrieval for RAG |
| `@tnds/memory-core` | `import { ... } from '@tnds/memory-core'` | Timeline store (future) |

---

## 5. Database Schema & Migrations

### Connection

Database connections use `@neondatabase/serverless` with WebSocket pooling:

```typescript
// src/lib/fleet-compliance-db.ts
import { Pool } from '@neondatabase/serverless';
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
```

All queries use parameterized SQL — no string interpolation. This is a hard security requirement.

### Core Tables

| Table | Purpose | Key Columns |
|-------|---------|-------------|
| `fleet_compliance_records` | All fleet data (JSONB) | `id`, `collection`, `org_id`, `data`, `import_batch_id`, `deleted_at` |
| `organizations` | Org profiles | `id` (Clerk org ID), `name`, `plan`, `trial_ends_at`, `onboarding_complete` |
| `subscriptions` | Stripe subscription state | `org_id`, `stripe_customer_id`, `plan`, `status` |
| `org_audit_events` | Audit trail | `org_id`, `event_type`, `actor_user_id`, `actor_type`, `metadata` |
| `organization_contacts` | Alert email config | `org_id`, `primary_contact` |
| `cron_log` | Cron execution records | `job_name`, `status`, `executed_at`, `records_processed` |
| `error_events` | Client-side errors | `org_id`, `page`, `message`, `stack`, `user_id` |
| `invoices` | Invoice records | `org_id`, `vendor`, `invoice_date`, `grand_total`, `unit_number` |
| `invoice_line_items` | Invoice line items | `invoice_id`, `description`, `amount` |
| `invoice_work_descriptions` | Work descriptions | `invoice_id`, `description` |

### Logical Collections (JSONB)

The `fleet_compliance_records` table stores different entity types via the `collection` column:

| Collection | Contents |
|------------|----------|
| `people` | Employee/driver master records |
| `employee_compliance` | CDL, medical card, MVR, hazmat, TSA expirations |
| `assets` | Vehicles, equipment, storage tanks |
| `vehicle_assets` | VIN, plate, inspection dates, mileage |
| `tank_assets` | Capacity, permits, leak testing |
| `permit_license_records` | DOT/state permits, renewal cadences |
| `suspense_items` | Compliance action items with severity + due dates |
| `maintenance_events` | Service records |
| `maintenance_plans` | Scheduled maintenance |
| `activity_logs` | Operational events |
| `fmcsa_snapshots` | FMCSA carrier lookup history |
| `attachments` | File references |

### Migrations

Migrations are in `migrations/` and are applied manually. They are numbered sequentially:

| # | File | Purpose |
|---|------|---------|
| 001 | `001_cron_log.sql` | Cron execution logging |
| 002 | `002_soft_delete.sql` | `deleted_at` column for soft delete |
| 003 | `003_import_batch.sql` | UUID-based import batch tracking |
| 004 | `004_org_scoping.sql` | Multi-tenant `org_id` column + indexes |
| 005 | `005_org_lifecycle_controls.sql` | Organizations, subscriptions, audit tables |
| 006 | `006_rename_chief.sql` | Rename from legacy "Chief" branding |
| 007 | `007_offboarding.sql` | Data deletion scheduling |
| 008 | `008_telematics_adapter.sql` | Telematics persistence schema |
| 009 | `009_risk_scores.sql` | Risk scoring tables |
| 010 | `010_telematics_location_pii_comments.sql` | PII annotation |
| 011 | `011_module_system.sql` | Module execution tracking |
| 012 | `012_training_tables.sql` | Training core tables |
| 013 | `013_hazmat_training_compliance.sql` | Hazmat compliance tables |
| 014 | `014_training_certificate_storage.sql` | Certificate storage |
| 015 | `015_hazmat_training_module_catalog.sql` | Training module catalog |
| 016 | `016_organization_contact_address.sql` | Org contact metadata |

#### Running Migrations

Migrations are run directly against Neon. Connect to the Neon SQL editor (or `psql`) and execute each `.sql` file in order:

```bash
# Example using psql
psql $DATABASE_URL -f migrations/016_organization_contact_address.sql
```

#### Creating New Migrations

1. Create `migrations/NNN_description.sql` (next sequential number)
2. Write idempotent SQL (use `IF NOT EXISTS`, `CREATE OR REPLACE` where possible)
3. Test on a branch database first
4. Apply to production via Neon SQL editor
5. Update this manual and `PLATFORM_OVERVIEW.md` with the new migration

---

## 6. Authentication & Authorization

### Clerk Integration

Auth is handled by `@clerk/nextjs`. The middleware protects all `/fleet-compliance/*`, `/penny/*`, and `/api/*` routes.

**Key files:**
- `src/lib/clerk.ts` — Clerk client initialization
- `src/lib/fleet-compliance-auth.ts` — Auth middleware functions
- `src/middleware.ts` — Route protection configuration

### Auth Middleware Functions

```typescript
// Validates session, returns { userId, orgId }
const { userId, orgId } = await requireFleetComplianceOrg();

// Same + role enforcement (admin-only routes)
const { userId, orgId } = await requireFleetComplianceOrgWithRole('admin');

// Penny-specific role resolution
const role = await resolvePennyRole(); // 'admin' | 'client'
const canAccess = canAccessPenny(role, email);
```

### Roles

| Role | Fleet-Compliance | Penny | Module Tools |
|------|-----------------|-------|-------------|
| `admin` | Full CRUD, import/rollback, alerts, cron | Full access | Full access |
| `member` | Read access, create suspense items | Org-scoped queries | No access |

### Route Protection

| Route Pattern | Auth |
|---------------|------|
| `/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms` | Public |
| `/fleet-compliance/*` | Clerk session required |
| `/penny/*` | Clerk session + Penny role |
| `/api/fleet-compliance/*` | Clerk session (+ admin for writes) |
| `/api/fleet-compliance/alerts/run` | Cron bearer token (timing-safe) |
| `/api/stripe/webhook` | Stripe HMAC-SHA256 signature |
| `/api/penny/health` | Public |

### Adding New Protected Routes

1. The route is automatically protected by Clerk middleware if it matches `/fleet-compliance/*` or `/api/fleet-compliance/*`
2. In the API route handler, call `requireFleetComplianceOrg()` to get the authenticated context
3. For admin-only routes, use `requireFleetComplianceOrgWithRole('admin')`
4. Always pass `orgId` to data layer functions for tenant isolation

---

## 7. API Routes Reference

### Fleet-Compliance Endpoints (18)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/fleet-compliance/assets` | GET | Clerk | List org fleet assets |
| `/api/fleet-compliance/bulk-template` | GET | Clerk | Download XLSX import template |
| `/api/fleet-compliance/alerts/preview` | GET | Clerk | Dry-run alert preview |
| `/api/fleet-compliance/alerts/trigger` | POST | Admin | Manual alert trigger |
| `/api/fleet-compliance/alerts/run` | POST | Cron | Daily alert sweep (all orgs) |
| `/api/fleet-compliance/cron-health` | GET | Clerk | Cron last-run status |
| `/api/fleet-compliance/fmcsa/lookup` | GET | Clerk | FMCSA carrier data lookup |
| `/api/fleet-compliance/import/setup` | POST | Admin | Init database tables |
| `/api/fleet-compliance/import/parse` | POST | Admin | Parse + validate XLSX |
| `/api/fleet-compliance/import/save` | POST | Admin | Persist parsed records |
| `/api/fleet-compliance/import/rollback` | POST | Admin | Undo import batch |
| `/api/fleet-compliance/invoices/parse-pdf` | POST | Admin | Parse invoice PDF |
| `/api/fleet-compliance/onboarding` | POST | Clerk | Complete onboarding |
| `/api/fleet-compliance/errors/client` | POST | Clerk | Client error capture |
| `/api/fleet-compliance/spend` | GET | Clerk | Spend analytics |
| `/api/fleet-compliance/telematics-sync` | GET | Cron | Pull Verizon data |
| `/api/fleet-compliance/telematics-risk` | GET | Clerk | Risk scores |
| `/api/fleet-compliance/[collection]/[id]/restore` | POST | Admin | Restore soft-deleted |

### Penny Endpoints (3)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/penny/health` | GET | Public | Backend health check |
| `/api/penny/query` | POST | Clerk + role | Chat query with RAG |
| `/api/penny/catalog` | GET | Clerk + role | Knowledge catalog |

### Module Gateway Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/modules/run` | POST | Admin | Execute module action |
| `/api/modules/catalog` | GET | Admin | List available modules |
| `/api/modules/status/[id]` | GET | Admin | Poll execution status |
| `/api/modules/artifact` | GET | Admin | Fetch generated artifacts |
| `/api/modules/command-center/tools` | GET | Admin | Command-center bridge |
| `/api/modules/dashboard/ml-eia` | GET | Admin | ML-EIA dashboard data |

### Stripe Endpoints (3)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/stripe/webhook` | POST | Stripe HMAC | Subscription events |
| `/api/stripe/checkout` | POST | Clerk | Create checkout session |
| `/api/stripe/portal` | POST | Clerk | Customer portal session |

### Training API (v1)

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/v1/training/*` | Various | Clerk | Training CRUD operations |
| `/api/v1/hazmat-training/*` | Various | Clerk | Hazmat training management |

### Adding New API Routes

1. Create `src/app/api/fleet-compliance/<route>/route.ts`
2. Import and call `requireFleetComplianceOrg()` or `requireFleetComplianceOrgWithRole('admin')`
3. Use the data layer functions from `src/lib/fleet-compliance-data.ts`
4. Add audit logging via `auditLog()` from `src/lib/audit-logger.ts`
5. Return JSON responses with appropriate status codes

```typescript
// Example: src/app/api/fleet-compliance/example/route.ts
import { NextResponse } from 'next/server';
import { requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export async function GET() {
  const { userId, orgId } = await requireFleetComplianceOrg();

  // Your logic here (always filter by orgId)

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'example',
    severity: 'info',
  });

  return NextResponse.json({ data: [] });
}
```

---

## 8. Module Gateway System

### Overview

The Module Gateway is a unified orchestration layer for running backend tooling modules from the Next.js frontend. It connects four registered modules:

| Module | Actions | Runtime | Location |
|--------|---------|---------|----------|
| ML-EIA-PETROLEUM-INTEL | 9 | Python | `tooling/ML-EIA-PETROLEUM-INTEL/` |
| ML-SIGNAL-STACK-TNCC | 8 | Python | `tooling/ML-SIGNAL-STACK-TNCC/` |
| MOD-PAPERSTACK-PP | 13 | Python + Node | `tooling/MOD-PAPERSTACK-PP/` |
| command-center | 13 | Node (in-process) | `tooling/command-center/` |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/modules.ts` | Main module gateway orchestration |
| `src/lib/modules-gateway/types.ts` | Call envelope + error taxonomy |
| `src/lib/modules-gateway/registry.ts` | Tool registry (capped exposure) |
| `src/lib/modules-gateway/runner.ts` | Execution orchestration |
| `src/lib/modules-gateway/command-center-bridge.ts` | In-process CC integration |
| `src/lib/modules-gateway/remote.ts` | Remote execution via Railway |
| `src/lib/modules-gateway/persistence.ts` | Run audit log storage |
| `docs/integration/MODULE_GATEWAY_CONTRACT.md` | Frozen API contract |
| `docs/integration/OPERATIONS_RUNBOOK.md` | Operations guide |

### Execution Flow

1. Frontend calls `POST /api/modules/run` with module ID, action, and arguments
2. Gateway validates against the action allowlist
3. For in-process modules (command-center): executes directly
4. For external modules (ML-EIA, ML-SIGNAL, PaperStack): subprocess or remote execution
5. Status polling via `GET /api/modules/status/:correlationId`
6. Results include stdout/stderr, result payload, and artifact metadata

### Enterprise Hardening (7 Layers — In Progress)

| Layer | Control | File |
|-------|---------|------|
| 1 | Context-aware tool registry | `modules-gateway/registry.ts` |
| 2 | Bidirectional schema validation | `modules-gateway/types.ts` |
| 3 | Execution sandbox | `modules-gateway/runner.ts` |
| 4 | Retry manager (cap=3) | `modules-gateway/runner.ts` |
| 5 | Token/cost attribution | TBD |
| 6 | Durable audit logging | `modules-gateway/persistence.ts` |
| 7 | Tenant tool isolation | `modules-gateway/registry.ts` |

### Command Center

The command center (`tooling/command-center/`) provides tool discovery and routing:

| File | Purpose |
|------|---------|
| `src/config/module-manifest.ts` | Static module registry (14 entries) |
| `src/services/discovery-service.ts` | Module + tool discovery |
| `src/services/search-service.ts` | Tool search |
| `src/services/router-service.ts` | Tool routing |
| `src/api/handlers.ts` | Route handling |

**Current State:** Discovery works (returns stub tools per module). Routing validates and logs but does not execute downstream handlers yet. Full handler wiring is the next integration step.

### Adding a New Module to the Gateway

1. Create the module directory under `tooling/<module-name>/`
2. Define tools in `src/tools.ts` with JSON schema parameters
3. Register the module in `tooling/command-center/src/config/module-manifest.ts`
4. Add the action allowlist in `src/lib/modules-gateway/registry.ts`
5. Add environment variables to `docs/integration/MODULE_ENV_MATRIX.md`
6. Test through the Module Tools UI at `/fleet-compliance/tools`

---

## 9. Pipeline Penny (AI Engine)

### Architecture

```
Browser → /api/penny/query (Next.js)
  ├── Clerk auth
  ├── Rate limiting (20 req/60s via Upstash Redis)
  ├── Org context building (fleet data → 8KB max)
  └── Proxy to Railway → /query (FastAPI)
      ├── Knowledge retrieval (1,100+ CFR chunks)
      ├── CFR citation detection + related term injection
      ├── Security rules (6 rules prepended)
      └── LLM provider routing → Response with sources
```

### Key Files (Next.js Side)

| File | Purpose |
|------|---------|
| `src/app/api/penny/query/route.ts` | Query proxy endpoint |
| `src/app/api/penny/catalog/route.ts` | Knowledge catalog endpoint |
| `src/app/api/penny/health/route.ts` | Health check proxy |
| `src/lib/penny-context.ts` | Builds operator fleet context (8KB cap) |
| `src/lib/penny-ingest.ts` | Document ingestion pipeline |
| `src/lib/penny-catalog.ts` | Knowledge index management |
| `src/lib/penny-access.ts` | Penny-specific access control |
| `src/lib/penny-rate-limit.ts` | Upstash Redis rate limiting |
| `src/app/penny/PennyChat.tsx` | Chat UI component |

### Key Files (Railway Side)

| File | Purpose |
|------|---------|
| `railway-backend/app/main.py` | FastAPI app with /query, /health, /catalog |

### LLM Provider Configuration

| Provider | Env Vars | Model |
|----------|----------|-------|
| Anthropic (primary) | `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | claude-sonnet-4-6 |
| OpenAI | `OPENAI_API_KEY`, `OPENAI_MODEL` | gpt-4o-mini |
| Gemini | `GEMINI_API_KEY`, `GEMINI_MODEL` | gemini-2.5-flash |
| Ollama (local) | `OLLAMA_BASE_URL`, `OLLAMA_MODEL` | llama3.1 |

### Security Controls

- 6 system-level security rules prepended to every LLM call
- Keyword filter for fast-reject of injection attempts
- `react-markdown` output sanitization (`skipHtml` + `html: () => null`)
- Driver anonymization (IDs only, no PII in LLM context)
- Context cap at 8,000 characters
- General fallback limited to 3 per session
- OWASP LLM Top 10 assessed (LLM01, LLM02, LLM05, LLM06, LLM09)

### Adding Knowledge Documents

1. Place source files in `knowledge/data/original_content/<category>/`
2. Run `npm run build:cfr-index` (for CFR docs) or update demo index build
3. Rebuild indexes: `npm run build` (runs both index builders as part of build)
4. Sync to Railway: `npm run sync:knowledge`

---

## 10. Railway Backend (FastAPI)

### Location

All backend code is in `railway-backend/`.

### Structure

```
railway-backend/
├── app/
│   ├── main.py                  # FastAPI app (1,146 lines)
│   │   ├── /health              # Service health + doc count
│   │   ├── /query               # RAG query endpoint
│   │   └── /catalog             # Knowledge catalog
│   ├── telematics_router.py     # Verizon Reveal routes
│   └── modules_router.py        # Module execution routes
├── integrations/
│   └── verizon_reveal/          # Verizon Reveal adapter
│       ├── adapter.py           # Main adapter logic
│       ├── auth.py              # Reveal authentication
│       ├── normalizer.py        # Data normalization
│       ├── rest_client.py       # REST API client
│       └── webhook_receiver.py  # Webhook handler
├── models/
│   └── telematics_event.py      # Data models
├── scripts/
│   └── reveal_sync_neon.py      # Sync utility
└── data/                        # Knowledge store volume
```

### Deployment

- **Host:** Railway (Hobby plan)
- **Build:** Docker (`python:3.11-slim`)
- **Start:** `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}`
- **Volume:** 5GB at `/app/data` (knowledge store)
- **Domain:** `pipeline-punks-v2-production.up.railway.app`
- **Auto-deploy:** On push to `railway-backend/` directory

### Local Development

```bash
cd railway-backend
pip install -r requirements.txt

# Set required env vars
export PENNY_API_KEY=your-shared-secret
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=your-key
export KNOWLEDGE_STORE_PATH=./data/knowledge.json

uvicorn app.main:app --reload --port 8000
```

### Authentication

Railway backend authenticates incoming requests using the `X-Penny-Api-Key` header. The Next.js proxy adds this header automatically using `PENNY_API_KEY`.

---

## 11. Knowledge Base Management

### Structure

```
knowledge/
├── cfr-docs/              # Source CFR Markdown (13 parts)
├── cfr-index/chunks.json  # Built CFR index (~3.9 MB)
├── demo-index/chunks.json # Built demo index (~15 MB)
├── data/original_content/ # Source documents
│   ├── 01_realty-command/  # 127 files
│   ├── erg-hazmat/         # ERG 2024 (2 files)
│   └── hubspot/            # HubSpot API docs
├── domains/               # Domain configurations
├── training-content/      # Training materials
│   ├── assessments/
│   ├── decks/
│   └── hazmat/
└── 05_Railway/            # Railway docs reference
```

### Index Build Pipeline

```bash
# Build CFR index from knowledge/cfr-docs/ → knowledge/cfr-index/chunks.json
npm run build:cfr-index

# Build demo index from knowledge/data/original_content/ → knowledge/demo-index/chunks.json
# (runs as part of npm run build)
tsx scripts/build-demo-index.mjs

# Sync indexes to Railway volume
npm run sync:knowledge
```

### CFR Parts Indexed

Parts 040, 360, 365, 367, 382, 383, 384, 387, 391, 395, 396, 397 (13 total)

### Adding New Knowledge Sources

1. Create a directory under `knowledge/data/original_content/<name>/`
2. Add source files (PDF, DOCX, CSV, HTML, or Markdown)
3. Update `scripts/build-demo-index.mjs` if needed for custom parsing
4. Rebuild: `npm run build`
5. Sync to Railway: `npm run sync:knowledge`
6. Verify via `GET /api/penny/catalog` — new documents should appear

---

## 12. Training Module (LMS)

### Overview

Self-contained compliance training LMS inside Fleet-Compliance Sentinel. Currently focused on hazmat training, expandable to any compliance topic.

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/hazmat-training.ts` | Hazmat compliance tracking |
| `src/lib/training-module-metadata.ts` | Module catalog (31 modules) |
| `src/lib/training-assessment.ts` | Assessment logic |
| `src/lib/training-certificate.ts` | Certificate generation |
| `src/lib/training-schema.ts` | Schema validation |
| `src/lib/training-report-export.ts` | Report export |
| `src/app/fleet-compliance/training/` | Training UI pages |
| `src/app/api/v1/training/` | Training API routes |
| `src/app/api/v1/hazmat-training/` | Hazmat training API |
| `src/components/training/` | Training components |

### Database Tables

- `hazmat_training_records` — Completion records per employee
- `hazmat_training_modules` — Module catalog (31 entries)
- Training certificates stored per `TRAINING_CERT_STORAGE_BACKEND`

### Training Content

- **12 PHMSA required modules** (DOT hazmat training requirements)
- **6 NFPA Awareness modules**
- **12 NFPA Operations modules**
- **1 supplemental module**
- Content authored from ERG 2024, CFR Parts, PHMSA training requirements

### Sidebar Configuration

Training has its own sidebar group with 5 items:
- Training Hub (all users)
- My Training (all users)
- Training Admin (admin only)
- Hazmat Reports (admin only)
- Courses & Workshops (module-toggled)

---

## 13. Sidebar & Module Toggle System

### How the Sidebar Works

The sidebar is configured in `src/lib/sidebar-config.ts`. It defines 6 groups:

| Group | Key | Default Expanded | Admin Only |
|-------|-----|-----------------|------------|
| Operations | `ops` | Yes | No |
| Compliance | `compliance` | Yes | No |
| Training | `training` | Yes | No |
| Finance | `finance` | No | No |
| Intelligence | `intel` | No | No |
| Admin | `admin` | No | Yes |

### Module Toggles

Items with a `moduleId` property are conditionally shown based on the org's enabled modules. The `getVisibleSections()` function filters sections based on:

1. **Role check:** Admin-only sections/items hidden from members
2. **Module check:** Items with `moduleId` hidden if that module is disabled

### Adding a New Sidebar Item

1. Add the item to the appropriate section in `src/lib/sidebar-config.ts`
2. If it should be toggleable, set `moduleId` to match a module catalog ID
3. If admin-only, set `adminOnly: true`
4. Create the corresponding page route under `src/app/fleet-compliance/<path>/`
5. Update the user manual in `UserManualModal.tsx`

---

## 14. Billing & Subscription Lifecycle

### Plan States

```
Trial (30 days) → Active → Past Due → Canceled → Offboarding → Deletion
```

| State | Access | Data Retention |
|-------|--------|---------------|
| `trial` | Full | Retained |
| `active` | Full | Retained |
| `past_due` | Full (grace) | Retained |
| `canceled` | Blocked | Soft-deleted after 30 days |
| `offboarded` | N/A | Hard-deleted after 60 days |

### Key Files

| File | Purpose |
|------|---------|
| `src/lib/stripe.ts` | Stripe client wrapper |
| `src/lib/plan-gate.ts` | Subscription state checks |
| `src/lib/org-provisioner.ts` | Org creation |
| `src/lib/offboarding-lifecycle.ts` | Data deletion automation |
| `src/lib/org-audit.ts` | Org lifecycle audit events |
| `src/app/api/stripe/webhook/route.ts` | Stripe event handler |
| `src/app/api/stripe/checkout/route.ts` | Checkout session creation |
| `src/app/api/stripe/portal/route.ts` | Customer portal session |

### Stripe Events Handled

- `customer.subscription.created` → Record subscription
- `customer.subscription.updated` → Update plan/status
- `customer.subscription.deleted` → Trigger offboarding

### Adding New Plan Features

1. Create the price in Stripe Dashboard
2. Add price ID to environment variables (`STRIPE_*_PRICE_ID`)
3. Update `plan-gate.ts` if new access rules are needed
4. Add plan-specific UI gating in components

---

## 15. Monitoring & Observability

### Sentry

| Feature | Config |
|---------|--------|
| SDK | `@sentry/nextjs ^10.46.0` |
| Configs | `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts` |
| Trace rate | 10% of transactions |
| Replay | 10% normal, 100% error sessions |
| Tunnel | `/monitoring` (ad-blocker bypass) |
| PII | `sendDefaultPii: false` + IP storage prevention |
| Source maps | Upload enabled |
| Context | `setSentryRequestContext()` sets userId/orgId per request |

### Audit Logging

```typescript
import { auditLog } from '@/lib/audit-logger';

auditLog({
  action: 'data.write',          // Action type
  userId: 'user_xxx',            // Clerk user ID
  orgId: 'org_xxx',              // Clerk org ID
  resourceType: 'assets',        // What was affected
  resourceId: '123',             // Specific record (optional)
  metadata: { count: 5 },        // Extra context (optional)
  severity: 'info',              // info | warning | error
});
```

**Action types:** `data.read`, `data.write`, `data.delete`, `import.*`, `auth.*`, `cron.*`, `penny.query`, `admin.action`, `rate_limit.exceeded`

**PII redaction:** 8-key deny-list (name, email, SSN, DOB, address, phone, license, medical) automatically scrubs audit metadata.

### Datadog

- Vercel log drain → Datadog
- Two-index strategy: `audit-logs-soc2` (365-day retention) + `vercel-general-7d` (7-day)
- 9 pipeline processors parse audit JSON into queryable facets

### UptimeRobot

- 3 monitors at 1-minute intervals:
  - `https://www.pipelinepunks.com`
  - `https://www.pipelinepunks.com/api/penny/health`
  - `https://pipeline-punks-v2-production.up.railway.app/health`
- Public status page: `https://status.pipelinepunks.com`

### Cron Health

- `GET /api/fleet-compliance/cron-health` — checks `cron_log` for last execution
- 24-hour stale threshold (dead-man switch)
- Returns status, hours since last run, last execution details

---

## 16. Deployment & CI/CD

### Vercel (Frontend + API)

| Setting | Value |
|---------|-------|
| Trigger | Git push to `main` |
| Framework | Next.js 15 (auto-detected) |
| Build | `next build` (preceded by index builds) |
| Domain | `www.pipelinepunks.com` |
| Cron | `/api/fleet-compliance/alerts/run` at `0 8 * * *` |
| Cron | `/api/fleet-compliance/telematics-sync` at `0 2 * * *` |
| Headers | 8 security headers via `vercel.json` |

### Railway (Backend)

| Setting | Value |
|---------|-------|
| Trigger | Push to `railway-backend/` |
| Build | Dockerfile (`python:3.11-slim`) |
| Command | `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}` |
| Domain | `pipeline-punks-v2-production.up.railway.app` |
| Volume | 5GB at `/app/data` |

### Git Workflow

- **Branch protection** on `main` — PR-only merges
- **CODEOWNERS** — Security-sensitive files require Security Officer review
- All changes through pull requests (documented in `docs/GIT_WORKFLOW.md`)
- Commit convention: `hardening(taskN)` or `training(phaseN)` for sprint work
- 14 PRs merged under branch protection (#1 through #14)

### Deployment Checklist

1. Ensure `npm run build` succeeds locally
2. Run `npm run compliance:legal-check` and `npm run compliance:ops-check`
3. Create PR to `main`
4. PR review (CODEOWNERS enforced for sensitive files)
5. Merge → auto-deploy to Vercel
6. Verify deployment via status page and Sentry

---

## 17. Environment Variables

All variables are documented in `.env.example`. The `scripts/check-env.ts` validation script enforces required variables at startup.

### Critical (App Fails Without These)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk frontend auth |
| `CLERK_SECRET_KEY` | Clerk backend auth |
| `DATABASE_URL` | Neon PostgreSQL connection |
| `SITE_URL` | Production URL |

### Pipeline Penny

| Variable | Purpose |
|----------|---------|
| `PENNY_API_URL` | Railway backend URL |
| `PENNY_API_KEY` | Shared secret for Railway auth |
| `PENNY_GENERAL_FALLBACK_SESSION_LIMIT` | Max fallback queries per session |
| `PENNY_ALLOW_NO_ORG` | Allow queries without org context |
| `UPSTASH_REDIS_REST_URL` | Rate limiting backend |
| `UPSTASH_REDIS_REST_TOKEN` | Rate limiting auth |

### Stripe

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe frontend |
| `STRIPE_WEBHOOK_SECRET` | Webhook signature verification |
| `STRIPE_STARTER_PRICE_ID` | Starter plan price |
| `STRIPE_PRO_PRICE_ID` | Pro plan price |

### Alerts & Cron

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Email delivery |
| `FLEET_COMPLIANCE_ALERT_FROM_EMAIL` | From address |
| `FLEET_COMPLIANCE_ALERT_EMAIL` | Manager email |
| `FLEET_COMPLIANCE_CRON_SECRET` | Cron endpoint auth |
| `FLEET_COMPLIANCE_ORG_NAME` | Org name in emails |

### Monitoring

| Variable | Purpose |
|----------|---------|
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking |
| `SENTRY_ORG` | Sentry organization |
| `SENTRY_PROJECT` | Sentry project name |
| `SENTRY_AUTH_TOKEN` | Source map upload |
| `DATADOG_API_KEY` | Log drain auth |

### Telematics

| Variable | Purpose |
|----------|---------|
| `TELEMATICS_CRON_SECRET` | Sync endpoint auth |
| `TELEMATICS_DEMO_MODE` | `true` for demo data |
| `REVEAL_USERNAME` / `REVEAL_PASSWORD` | Verizon Reveal creds |
| `APP_ENCRYPTION_KEY` | pgcrypto encryption key |

### Module Gateway

| Variable | Purpose |
|----------|---------|
| `MODULE_GATEWAY_USE_REMOTE` | Enable remote execution |
| `MODULE_GATEWAY_REMOTE_URL` | Railway execution URL |
| `MODULE_GATEWAY_REMOTE_API_KEY` | Remote auth key |

### Railway Backend (separate .env)

| Variable | Purpose |
|----------|---------|
| `LLM_PROVIDER` | Default LLM (anthropic/openai/gemini/ollama) |
| `ANTHROPIC_API_KEY` | Claude API key |
| `OPENAI_API_KEY` | OpenAI API key |
| `GEMINI_API_KEY` | Gemini API key |
| `KNOWLEDGE_STORE_PATH` | Knowledge JSON path |
| `CORS_ORIGINS` | Allowed CORS origins |

---

## 18. Scripts Reference

| Command | Script | Purpose |
|---------|--------|---------|
| `npm run dev` | `next dev` | Development server |
| `npm run build` | Builds CFR + demo indexes, then `next build` | Production build |
| `npm run lint` | `next lint` | ESLint check |
| `npm run compliance:legal-check` | `scripts/check-legal-pages.mjs` | Validate privacy/terms pages |
| `npm run compliance:ops-check` | `scripts/ops-check.mjs` | Detect operational gaps |
| `npm run build:cfr-index` | `scripts/build-cfr-index.mjs` | Build CFR chunk index |
| `npm run eval:penny` | `scripts/run-penny-evals.mjs` | Run Penny evaluation suite |
| `npm run sync:knowledge` | `scripts/sync-local-knowledge.mjs` | Sync knowledge to Railway |
| `npm run docs:vendors` | `scripts/download-vendor-docs.mjs` | Download vendor docs |
| `npm run db:check-training-schema` | `scripts/check-training-schema.mjs` | Validate training schema |
| `npx tsx scripts/check-env.ts` | `scripts/check-env.ts` | Validate 53 env vars |

### One-Off Scripts

| Script | Purpose |
|--------|---------|
| `scripts/reveal_sync_neon.py` | Manual Verizon Reveal → Neon sync |
| `scripts/build-demo-index.mjs` | Build demo knowledge index |
| `scripts/prepare-vendor-docs-package.mjs` | Package vendor docs into zip |

---

## 19. SOC 2 Compliance

### Program Status

- **Observation window:** 2026-03-24 to 2026-06-22 (90 days)
- **Type I eligible:** 2026-06-22
- **Type II eligible:** 2027-03-24
- **Evidence artifacts:** 73 files in `soc2-evidence/`
- **Audit phases completed:** 9 (all scored 8-9/10)

### Evidence Directory

| Directory | Files | Contents |
|-----------|-------|----------|
| `soc2-evidence/access-control/` | 19 | Auth evidence, isolation tests, secret rotation |
| `soc2-evidence/audit-findings/` | 13 | Phase findings + remediation |
| `soc2-evidence/change-management/` | 2 | Branch protection, CODEOWNERS |
| `soc2-evidence/compliance-milestones/` | 1 | Observation window dates |
| `soc2-evidence/incident-response/` | 4 | IRP, runbook, status page |
| `soc2-evidence/monitoring/` | 10 | Sentry, UptimeRobot, cron health |
| `soc2-evidence/penetration-testing/` | 5 | OWASP ZAP reports |
| `soc2-evidence/policies/` | 14 | 8 SOC 2 policies + analyses |
| `soc2-evidence/system-description/` | 4 | Architecture, env matrix |
| `soc2-evidence/vendor-management/` | 1 | 13-vendor subprocessor registry |

### 8 SOC 2 Policies

1. Information Security Policy
2. Access Control Policy
3. Data Classification Policy
4. Change Management Policy
5. Business Continuity Policy
6. Vendor Management Policy
7. Incident Response Policy
8. Acceptable Use Policy

### Automated Compliance Checks

```bash
npm run compliance:legal-check   # Privacy/terms page validation (7 checks)
npm run compliance:ops-check     # Operational gap detection
npx tsx scripts/check-env.ts     # Environment variable validation (53 vars)
```

### SOC 2 Impact of Code Changes

When modifying code, consider SOC 2 evidence impact:

- **New API route?** → Ensure auth middleware is applied (CC5.1, CC6.1)
- **New env var?** → Add to `.env.example` and `check-env.ts` (CC5.1)
- **New vendor?** → Update subprocessor registry (CC9.1)
- **Auth change?** → Update access control evidence (CC6.1, CC6.2)
- **Data deletion change?** → Update retention documentation (P4.3)
- **New cron job?** → Add monitoring (CC7.2)

---

## 20. Troubleshooting Guide

### Build Failures

**Symptom:** `npm run build` fails with module not found errors
```
Solution:
1. Run `npm install` to ensure all workspace packages are linked
2. Check that packages/ directories have valid package.json files
3. Verify @tnds/* imports point to correct workspace packages
```

**Symptom:** Build fails during CFR/demo index generation
```
Solution:
1. Check that knowledge/cfr-docs/ contains .md files
2. Check that knowledge/data/original_content/ exists
3. Run index builders separately to isolate the issue:
   npm run build:cfr-index
   tsx scripts/build-demo-index.mjs
```

### Database Connection Issues

**Symptom:** `Error: connect ECONNREFUSED` or pool timeout
```
Solution:
1. Verify DATABASE_URL in .env.local
2. Check Neon console for branch status (may be suspended)
3. Verify SSL mode: ?sslmode=require in connection string
4. Check Vercel env vars match local if testing deployed version
```

**Symptom:** `relation "fleet_compliance_records" does not exist`
```
Solution:
1. Run migrations in order: psql $DATABASE_URL -f migrations/001_cron_log.sql
2. Or use the setup endpoint: POST /api/fleet-compliance/import/setup
```

### Auth Issues

**Symptom:** 401 on all API routes
```
Solution:
1. Verify NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY
2. Check Clerk dashboard for correct instance
3. Ensure middleware.ts is not blocking the route
4. For local dev: CLERK_SECRET_KEY must be a test key (sk_test_*)
```

**Symptom:** `orgId is null` in auth context
```
Solution:
1. User must be a member of a Clerk organization
2. Check Clerk dashboard → Organizations → verify user membership
3. Verify org creation through onboarding flow
```

### Penny AI Not Responding

**Symptom:** Penny health check fails or queries timeout
```
Solution:
1. Check Railway service status (may be sleeping or crashed)
2. Verify PENNY_API_URL and PENNY_API_KEY match Railway config
3. Check Railway logs for Python errors
4. Verify LLM API keys are valid (ANTHROPIC_API_KEY, etc.)
5. Check rate limiting: user may have hit 20 req/60s limit
```

**Symptom:** Penny returns empty or irrelevant answers
```
Solution:
1. Check knowledge store: GET /api/penny/catalog should show docs
2. Rebuild indexes: npm run build:cfr-index
3. Sync to Railway: npm run sync:knowledge
4. Check Railway volume is mounted at /app/data
```

### Cron Jobs Not Running

**Symptom:** Alerts not sending, telematics not syncing
```
Solution:
1. Check cron health: GET /api/fleet-compliance/cron-health
2. Verify FLEET_COMPLIANCE_CRON_SECRET matches Vercel cron config
3. Check Vercel dashboard → Cron Jobs for execution logs
4. Check cron_log table for error entries
5. Verify Resend API key for alert delivery
```

### Module Gateway Errors

**Symptom:** Module execution fails with "action not allowed"
```
Solution:
1. Verify the action is in the allowlist (modules-gateway/registry.ts)
2. Check user has admin role
3. Verify module environment variables (docs/integration/MODULE_ENV_MATRIX.md)
```

**Symptom:** Module execution hangs or times out
```
Solution:
1. Check MODULE_GATEWAY_USE_REMOTE setting
2. For local: ensure Python tooling has dependencies installed
3. For remote: verify MODULE_GATEWAY_REMOTE_URL and API key
4. Check timeout setting (default varies by module)
```

### Import Failures

**Symptom:** XLSX import fails with validation errors
```
Solution:
1. Download the canonical template: GET /api/fleet-compliance/bulk-template
2. Compare your file against the template column headers
3. Check date formats: YYYY-MM-DD required
4. Check status enums: Active/Inactive/Terminated (case-sensitive)
5. Check for duplicate primary keys in your data
```

**Symptom:** Import succeeds but data not visible
```
Solution:
1. Verify org_id: import data is scoped to the authenticated org
2. Check the collection filter on the list page
3. Look for soft-deleted records (deleted_at is not null)
```

### Stripe/Billing Issues

**Symptom:** Webhook events not processing
```
Solution:
1. Verify STRIPE_WEBHOOK_SECRET matches the Stripe dashboard
2. Check Stripe dashboard → Webhooks for delivery logs
3. Verify the webhook URL is correct and accessible
4. Check Vercel function logs for signature errors
```

### Telematics Issues

**Symptom:** Telematics shows no data
```
Solution:
1. Check TELEMATICS_DEMO_MODE — set to "true" for demo data
2. For live data: verify REVEAL_USERNAME/PASSWORD/APP_ID
3. Check Railway telematics router logs
4. Verify telematics-sync cron is running (02:00 UTC)
```

---

## 21. Common Errors & Solutions

| Error | Cause | Fix |
|-------|-------|-----|
| `CRITICAL: Missing env var: DATABASE_URL` | Missing env var | Add to `.env.local` |
| `ClerkExpiredSessionError` | Token expired | User needs to re-sign-in |
| `neon: connection refused` | Neon branch suspended | Wake branch in Neon console |
| `429 Too Many Requests` | Penny rate limit | Wait 60 seconds |
| `Module action not in allowlist` | Unregistered action | Add to registry.ts allowlist |
| `import batch rollback failed` | Invalid batch UUID | Check import_batch_id exists |
| `FMCSA lookup failed` | Bad USDOT number or API down | Verify DOT number format |
| `Stripe signature verification failed` | Wrong webhook secret | Regenerate in Stripe dashboard |
| `Knowledge store empty` | Missing index build | Run `npm run build:cfr-index` |
| `TypeError: Cannot read orgId` | User not in an org | Complete onboarding flow |
| `ERR_MODULE_NOT_FOUND: @tnds/*` | Workspace not linked | Run `npm install` |
| `next build: Type error` | TypeScript strict mode | Fix type errors before build |
| `CORS error on Railway` | Origin not allowed | Add origin to `CORS_ORIGINS` env var |

---

## 22. Key Files Quick Reference

### Data Layer
| File | Lines | What It Does |
|------|-------|-------------|
| `src/lib/fleet-compliance-data.ts` | ~60K | All fleet CRUD operations |
| `src/lib/fleet-compliance-db.ts` | ~50 | DB pool management |
| `src/lib/fleet-compliance-auth.ts` | ~120 | Auth middleware |
| `src/lib/fleet-compliance-alert-engine.ts` | ~16K | Alert scoring + email |
| `src/lib/fleet-compliance-validators.ts` | ~500 | Field validators |
| `src/lib/fleet-compliance-import-schemas.ts` | ~400 | Import collection schemas |

### AI & Knowledge
| File | What It Does |
|------|-------------|
| `src/lib/penny-context.ts` | Builds fleet context for LLM (8KB cap) |
| `src/lib/penny-ingest.ts` | Document ingestion pipeline |
| `src/lib/penny-catalog.ts` | Knowledge index management |
| `src/lib/penny-rate-limit.ts` | Upstash rate limiting |
| `railway-backend/app/main.py` | FastAPI backend (RAG + LLM routing) |

### Module Gateway
| File | What It Does |
|------|-------------|
| `src/lib/modules.ts` | Main orchestration |
| `src/lib/modules-gateway/registry.ts` | Tool allowlist + registry |
| `src/lib/modules-gateway/runner.ts` | Execution engine |
| `src/lib/modules-gateway/types.ts` | Call envelope types |

### UI & Navigation
| File | What It Does |
|------|-------------|
| `src/lib/sidebar-config.ts` | Sidebar sections + module toggles |
| `src/components/fleet-compliance/FleetComplianceSidebar.tsx` | Sidebar component |
| `src/components/fleet-compliance/FleetComplianceShell.tsx` | Layout shell |
| `src/components/fleet-compliance/UserManualModal.tsx` | In-app user manual |

### Config & Infrastructure
| File | What It Does |
|------|-------------|
| `next.config.js` | Next.js + Sentry configuration |
| `vercel.json` | Security headers + cron jobs |
| `package.json` | Dependencies + scripts |
| `.env.example` | All env vars documented |
| `scripts/check-env.ts` | Env validation (53 vars) |

### Documentation
| File | What It Does |
|------|-------------|
| `README.md` | Product summary |
| `PLATFORM_OVERVIEW.md` | Full 20-section platform doc |
| `INDEX.md` | Repository map |
| `DEVELOPER_MANUAL.md` | This file |
| `docs/STATUS.md` | Execution status log |
| `docs/ROTATION_RUNBOOK.md` | Secret rotation procedures |
| `docs/GIT_WORKFLOW.md` | PR workflow |
| `docs/integration/MODULE_GATEWAY_CONTRACT.md` | Gateway API contract |
| `docs/integration/OPERATIONS_RUNBOOK.md` | Gateway operations |

---

## Contact

**Organization:** True North Data Strategies LLC
**Security Officer:** Jacob Johnston
**Phone:** 555-555-5555
**Email:** jacob@truenorthstrategyops.com
**GitHub Org:** Pipeline-Punks
**Production:** https://www.pipelinepunks.com
**Corporate:** https://truenorthstrategyops.com
