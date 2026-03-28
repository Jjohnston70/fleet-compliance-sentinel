# Fleet-Compliance Sentinel | Pipeline Punks

## Complete Platform Overview — Sale Readiness Document

**Organization:** True North Data Strategies LLC
**Product:** Fleet-Compliance Sentinel + Pipeline Penny
**Production URL:** https://www.pipelinepunks.com
**SOC 2 Type I Readiness:** Operational task batch complete (observation window active since 2026-03-24)
**Last Updated:** 2026-03-28

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Capabilities](#2-product-capabilities)
3. [Technology Stack](#3-technology-stack)
4. [Infrastructure & Hosting](#4-infrastructure--hosting)
5. [Database Architecture](#5-database-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [API Surface](#7-api-surface)
8. [AI Engine — Pipeline Penny](#8-ai-engine--pipeline-penny)
9. [Monitoring, Logging & Observability](#9-monitoring-logging--observability)
10. [Security Posture](#10-security-posture)
11. [SOC 2 Compliance Program](#11-soc-2-compliance-program)
12. [Vendor & Subprocessor Registry](#12-vendor--subprocessor-registry)
13. [Billing & Subscription Management](#13-billing--subscription-management)
14. [Data Lifecycle & Retention](#14-data-lifecycle--retention)
15. [Operational Tooling](#15-operational-tooling)
16. [Deployment & CI/CD](#16-deployment--cicd)
17. [Evidence Binder Inventory](#17-evidence-binder-inventory)
18. [Platform Metrics Summary](#18-platform-metrics-summary)

---

## 1. Executive Summary

Fleet-Compliance Sentinel is a **production-grade, multi-tenant B2B SaaS platform** purpose-built for DOT/FMCSA fleet compliance management. It serves fleet operators who need to track vehicles, drivers, permits, maintenance, and regulatory deadlines — with an AI-powered compliance assistant that answers questions grounded in federal CFR regulations and the operator's own fleet data.

The platform consists of two integrated modules:

| Module | Purpose |
|--------|---------|
| **Fleet-Compliance** | Full-stack fleet management dashboard — assets, drivers, permits, compliance tracking, suspense items, maintenance logs, invoices, FMCSA carrier lookups, and automated compliance alert emails |
| **Pipeline Penny** | Document-grounded AI assistant for DOT/FMCSA compliance questions, powered by multi-LLM orchestration (Anthropic Claude, OpenAI, Google Gemini, Ollama) with retrieval-augmented generation over 1,100+ CFR document chunks and real-time operator fleet context |

**Key differentiators:**
- SOC 2 Type I operational batch complete with 70+ evidence artifacts across control domains
- Multi-tenant org isolation enforced at auth, query, and database layers
- Automated compliance alerting (daily cron sweep with email delivery)
- FMCSA SAFER API integration for live carrier safety lookups
- Verizon Connect Reveal telematics integration with risk scoring dashboard
- AI security hardened against prompt injection (OWASP LLM Top 10 assessed)
- Full data lifecycle automation (trial, subscription, offboarding, deletion)

---

## 2. Product Capabilities

### 2.1 Fleet-Compliance Module

#### Asset & Vehicle Management
- Master asset inventory with vehicle details (VIN, plate, year/make/model, mileage, assigned driver)
- Storage tank tracking (capacity, permits, leak testing dates, calibration schedules)
- Equipment categorization and status tracking
- Soft-delete with restore capability and full audit trail

#### Driver Compliance Monitoring
- CDL expiration tracking with renewal alerts
- Medical card expiration monitoring
- Motor Vehicle Record (MVR) status
- Hazmat endorsement tracking
- TSA clearinghouse compliance status
- Drug/alcohol testing records (49 CFR Part 382)

#### Permit & License Renewal
- DOT/state permit tracking with expiration dates
- Renewal cadence scheduling (annual, biennial, custom)
- Multi-jurisdiction compliance (Colorado-specific + federal)
- Permit status dashboard with color-coded urgency

#### Suspense Items (Compliance Action Items)
- Open item queue with severity levels and due dates
- Owner assignment and accountability tracking
- Resolution workflow with audit trail
- Alert window classification: overdue, due-today, 7-day, 14-day, 30-day

#### Automated Compliance Alerts
- Daily sweep via Vercel cron job (08:00 UTC)
- HTML-formatted email alerts via Resend API with color-coded severity
- Configurable alert thresholds and email recipients per organization
- Manual trigger capability for admin users
- Dry-run preview mode for alert testing
- Dead-man switch monitoring (25-hour stale threshold)

#### FMCSA Carrier Safety Lookups
- Live integration with FMCSA QCMobile API
- Carrier profile, BASIC scores, authority status, cargo-carried data
- Safety rating and violation history
- Out-of-service (OOS) rate tracking
- Snapshot persistence for historical comparison

#### Bulk Data Import Pipeline
- Multi-sheet XLSX upload with field-level validation
- 12 collection schemas (drivers, assets, vehicles, permits, employees, storage tanks, maintenance schedule, activity log, maintenance tracker, maintenance line items, contacts, emergency contacts)
- Import batch tracking with UUID-based rollback capability
- Review/approve workflow before database commit
- Template download for standardized data entry

#### Maintenance & Invoice Tracking
- Service record management with vendor, cost, and completion tracking
- Invoice import from XLSX with line item parsing
- Parts, labor, shop supplies, and tax breakdowns
- Work description categorization

#### Activity Logging
- Operational event tracking (checkout, refuel, location, incidents)
- Per-asset activity timeline
- Driver-linked activity association

#### Telematics Risk Module
- Fleet telematics dashboard at `/fleet-compliance/telematics`
- Verizon Connect Reveal ingestion adapter in Railway backend (`railway-backend/integrations/verizon_reveal/`)
- Risk scoring endpoint and UI badges (`/api/fleet-compliance/telematics-risk`, `TelematicsRiskBadge`)
- Scheduled sync route (`/api/fleet-compliance/telematics-sync`) secured by `TELEMATICS_CRON_SECRET`

### 2.2 Pipeline Penny — AI Compliance Assistant

#### Document-Grounded Q&A
- Retrieval-augmented generation (RAG) over 1,100+ CFR document chunks
- 13 CFR parts indexed: Parts 040, 360, 365, 367, 382, 383, 384, 387, 391, 395, 396, 397
- Multi-format document ingestion: PDF, DOCX, XLSX, CSV, HTML
- Chunked retrieval with source citations in responses
- Auto-detection of CFR references (e.g., "395.1", "391.25") with related term injection

#### Operator-Specific Context
- Server-side injection of real-time fleet data (drivers, assets, permits, open suspense items)
- Context cap at 8,000 characters with intelligent truncation
- Driver anonymization (IDs only, no PII in LLM context)
- Organization-scoped data isolation

#### Multi-LLM Support
- **Anthropic Claude** (primary provider)
- **OpenAI GPT-4o-mini** (secondary)
- **Google Gemini 2.5 Flash** (optional)
- **Ollama** (local/self-hosted option)
- Provider selection configurable per deployment
- Unified security prompt applied across all providers

#### General Knowledge Fallback
- DOT-only gate for fallback queries (non-fleet questions refused)
- Session-based fallback limit (configurable, default 3 per session)
- Explicit refusal instructions for off-topic requests

#### Security Hardening
- System prompt with 6 security rules prepended to every LLM call
- Prompt injection defense: keyword filter (fast-reject) + LLM-level rules
- `react-markdown` output sanitization (`skipHtml` + `html: () => null`)
- OWASP LLM Top 10 assessment completed (LLM01, LLM02, LLM05 satisfied)
- 4 adversarial prompt injection tests — all refused cleanly

### 2.3 Public-Facing Pages

| Page | Purpose |
|------|---------|
| `/` | Marketing homepage with product features and CTA |
| `/privacy` | Privacy policy (fleet data categories, AI no-training statement, 30/60-day retention, 10 subprocessors) |
| `/terms` | Terms of service (data ownership, availability commitments, cancellation lifecycle) |
| `/accessibility` | WCAG 2.1 accessibility statement |
| `/assetcommand` | AssetCommand product page (Google Sheets fleet management add-on) |
| `/sign-in`, `/sign-up` | Clerk-powered authentication pages |

---

## 3. Technology Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Next.js | 15.5.14 | React framework (App Router, server components) |
| React | 18.3.1 | UI library |
| TypeScript | 5.3.3 | Type safety |
| Tailwind CSS | 3.4.19 | Utility-first CSS |
| react-markdown | 10.1.0 | Markdown rendering (Penny responses) |
| remark-gfm | 4.0.1 | GitHub-flavored markdown support |
| ExcelJS | 4.4.0 | XLSX parsing for bulk imports |

### Backend (Penny API)
| Technology | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11 | Runtime |
| FastAPI | 0.116.1 | Web framework |
| Uvicorn | 0.35.0 | ASGI server |
| Pydantic | 2.11.7 | Request/response validation |
| httpx | 0.28.1 | HTTP client for LLM API calls |

### Database & Data
| Technology | Purpose |
|-----------|---------|
| Neon PostgreSQL | Primary data store (serverless, SOC 2 Type II certified) |
| @neondatabase/serverless | Node.js driver with WebSocket pooling |
| JSONB columns | Flexible schema for fleet data collections |
| Parameterized queries | 100% SQL injection prevention |

### Auth & Identity
| Technology | Purpose |
|-----------|---------|
| Clerk | Organization-scoped authentication, RBAC, MFA support |
| @clerk/nextjs 6.39.1 | Next.js middleware integration |
| JWT verification | Session validation on every protected request |

### Document Processing
| Technology | Purpose |
|-----------|---------|
| mammoth 1.11.0 | DOCX parsing for knowledge ingestion |
| pdf-parse 2.4.5 | PDF extraction for knowledge ingestion |
| csv-parse 6.1.0 | CSV parsing for bulk imports |
| cheerio 1.2.0 | HTML parsing for document ingestion |

### Workspace Packages (Monorepo)
| Package | Purpose |
|---------|---------|
| @tnds/types | Shared TypeScript type definitions |
| @tnds/ingest-core | Document ingestion (PDF, DOCX, CSV, HTML) |
| @tnds/retrieval-core | Chunked retrieval for Penny RAG |
| @tnds/memory-core | Timeline store API (ready for expansion) |

---

## 4. Infrastructure & Hosting

### Vercel (Frontend + API Routes)
- **Deployment:** Automatic on git push to `main`
- **Runtime:** Node.js (server components) + Edge (middleware)
- **Security headers:** 8 headers configured in `vercel.json`
- **Cron jobs:** Daily compliance alert sweep (08:00 UTC) + telematics sync (02:00 UTC)
- **CDN:** Global edge network for static assets
- **SSL:** Automatic HTTPS with certificate management

### Railway (Penny AI Backend)
- **Service:** Docker-based FastAPI deployment
- **Plan:** Hobby tier (Pro upgrade recommended before first client)
- **Sleep:** Disabled (`sleepApplication: false`)
- **Replicas:** 1
- **Volume:** 5GB allocated, 151MB used (`/app/data` for knowledge store)
- **Restart policy:** ON_FAILURE, max 10 retries
- **Domain:** `pipeline-punks-v2-production.up.railway.app`
- **Deployment:** Auto-deploy from `railway-backend/` on push
- **Health:** `/health` endpoint returns service status, knowledge doc count, LLM provider config

### Neon PostgreSQL (Database)
- **Type:** Serverless Postgres with automatic scaling
- **Connection:** WebSocket-based via `@neondatabase/serverless`
- **Backups:** Automatic hourly snapshots (Neon-managed)
- **Encryption:** At-rest and in-transit (Neon SOC 2 Type II certified)
- **Connection string:** Managed via Vercel environment variable integration
- **Tables:** 9 primary tables + indexes

### Upstash Redis (Rate Limiting)
- **Purpose:** Distributed sliding-window rate limiting for Penny queries
- **Limit:** 20 queries per 60 seconds per user
- **Fallback:** In-memory rate limiting if Upstash unavailable
- **Data:** Ephemeral counters only (no PII stored)

### UptimeRobot (Availability Monitoring)
- **Plan:** Solo
- **Status page:** `https://status.pipelinepunks.com`
- **Monitors:** 3 public monitors at 1-minute intervals (website, Penny health, Railway health)
- **DNS:** `status` CNAME -> `stats.uptimerobot.com`

---

## 5. Database Architecture

### Schema Overview

```
fleet_compliance_records
├── id (SERIAL PK)
├── collection (TEXT) — logical collection type
├── org_id (TEXT) — multi-tenant isolation key
├── data (JSONB) — flexible record payload
├── import_batch_id (UUID) — rollback tracking
├── deleted_at (TIMESTAMPTZ) — soft delete marker
├── imported_at (TIMESTAMPTZ)
└── imported_by (TEXT)
    Indexes: (collection), (org_id, collection), (import_batch_id)

organizations
├── id (TEXT PK) — Clerk org ID
├── name (TEXT)
├── plan (TEXT) — trial | active | canceled
├── trial_started_at, trial_ends_at (TIMESTAMPTZ)
├── onboarding_complete (BOOLEAN)
├── metadata (JSONB)
├── data_deletion_scheduled_at (TIMESTAMPTZ)
├── created_at, updated_at (TIMESTAMPTZ)

subscriptions
├── id (SERIAL PK)
├── org_id (TEXT FK → organizations)
├── stripe_customer_id (TEXT)
├── plan, status (TEXT)
├── current_period_ends_at (TIMESTAMPTZ)
├── created_at (TIMESTAMPTZ)
    Index: (org_id, created_at DESC)

org_audit_events
├── id (BIGSERIAL PK)
├── org_id, event_type, actor_user_id (TEXT)
├── actor_type (TEXT) — user | system | stripe | cron
├── metadata (JSONB)
├── created_at (TIMESTAMPTZ)

organization_contacts
├── org_id (TEXT)
├── primary_contact (TEXT) — email for alerts

cron_log
├── job_name, status, message (TEXT)
├── executed_at (TIMESTAMPTZ)
├── records_processed (INT)

error_events
├── id (SERIAL PK)
├── org_id, page, message, stack, user_id (TEXT)
├── recorded_at (TIMESTAMPTZ)

invoices
├── id (SERIAL PK)
├── org_id, vendor, invoice_date, po_number, terms
├── customer_name, customer_address, unit_number, vin
├── year, make, model, parts_total, labor_total
├── shop_supplies, subtotal, sales_tax, grand_total
├── source_file, deleted_at, imported_at (TIMESTAMPTZ)

invoice_line_items / invoice_work_descriptions
├── (related to invoices by invoice_id)
```

### Logical Data Collections (JSONB in fleet_compliance_records)
| Collection | Contents |
|------------|----------|
| `people` | Employee/driver master records |
| `employee_compliance` | CDL, medical card, MVR, hazmat, TSA expirations |
| `assets` | Vehicles, equipment, storage tanks |
| `vehicle_assets` | VIN, plate, inspection dates, mileage, assigned driver |
| `tank_assets` | Capacity, permits, leak testing, calibration |
| `permit_license_records` | DOT/state permits, renewal cadences |
| `suspense_items` | Open compliance action items with owners, due dates, severity |
| `maintenance_events` | Service records with vendor, costs, completion status |
| `maintenance_plans` | Scheduled maintenance definitions |
| `activity_logs` | Operational events (checkout, refuel, location, incidents) |
| `fmcsa_snapshots` | FMCSA carrier lookup history |
| `attachments` | File references |

### SQL Migrations (Executed)
| Migration | Purpose |
|-----------|---------|
| `001_cron_log.sql` | Cron execution logging table |
| `002_soft_delete.sql` | Soft delete with `deleted_at` column |
| `003_import_batch.sql` | UUID-based import batch tracking |
| `004_org_scoping.sql` | Multi-tenant org isolation columns + indexes |
| `005_org_lifecycle_controls.sql` | Organizations, subscriptions, audit events tables |
| `006_rename_chief.sql` | Rename from legacy "Chief" branding |
| `007_offboarding.sql` | Data deletion scheduling + lifecycle automation |
| `008_telematics_adapter.sql` | Telematics adapter persistence schema |
| `009_risk_scores.sql` | Telematics risk scoring tables and indexes |
| `010_telematics_location_pii_comments.sql` | PII annotation and data-handling comments |

---

## 6. Authentication & Authorization

### Clerk Integration
| Feature | Implementation |
|---------|---------------|
| **Session management** | Org-scoped JWTs with custom claims |
| **Middleware protection** | `/penny/*`, `/fleet-compliance/*`, `/api/penny/query*`, `/api/fleet-compliance/*`, `/api/invoices/*` |
| **Public routes** | `/`, `/sign-in`, `/sign-up`, `/privacy`, `/terms`, `/api/penny/health` |
| **MFA support** | Available via Clerk dashboard configuration |
| **Dev mode safeguard** | Clerk disabled if production key detected on localhost |

### Role-Based Access Control (RBAC)

**Fleet-Compliance Roles:**
| Role | Capabilities |
|------|-------------|
| `admin` | Full CRUD on all fleet data, import/rollback, alert configuration, cron triggers |
| `member` | Read access to fleet data, create suspense items |

**Penny Roles:**
| Role | Capabilities |
|------|-------------|
| `admin` | Full Penny access, all knowledge base queries |
| `client` | Org-scoped queries, fleet context included |
| Email bypass | Configurable approved email list for exceptions |

### Auth Middleware Functions
- `requireFleetComplianceOrg()` — Validates Clerk session, extracts userId/orgId
- `requireFleetComplianceOrgWithRole(role)` — Above + role enforcement (admin-only on writes)
- `resolvePennyRole()` — Extracts role from Clerk session claims (metadata.role, publicMetadata.role, org_role)
- `canAccessPenny()` — Gate check combining role + email bypass

### API Route Protection
- All fleet-compliance API routes verify `auth().userId` via Clerk middleware
- Cron endpoint uses timing-safe bearer token comparison (`crypto.timingSafeEqual`)
- Stripe webhook uses HMAC-SHA256 signature verification
- Penny API proxy adds `X-Penny-Api-Key` header for Railway authentication

---

## 7. API Surface

### Pipeline Penny (AI Assistant) — 3 Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/penny/health` | GET | Public | Health check proxy to Railway backend |
| `/api/penny/query` | POST | Clerk + role | Chat query with rate limiting, org context injection, LLM proxy |
| `/api/penny/catalog` | GET | Clerk + admin/client | List available knowledge documents with pagination |

### Fleet-Compliance (Compliance Management) — 18 Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/fleet-compliance/assets` | GET | Clerk | List org fleet assets |
| `/api/fleet-compliance/bulk-template` | GET | Clerk | Generate and download XLSX bulk-import template |
| `/api/fleet-compliance/alerts/preview` | GET | Clerk | Preview alerts that would be sent |
| `/api/fleet-compliance/alerts/trigger` | POST | Clerk + admin | Manually trigger alert for a suspense item |
| `/api/fleet-compliance/alerts/run` | POST | Cron secret | Daily alert sweep across all orgs (Vercel cron) |
| `/api/fleet-compliance/cron-health` | GET | Clerk | Check last cron execution status (24hr threshold) |
| `/api/fleet-compliance/fmcsa/lookup` | GET | Clerk | Query FMCSA carrier data by USDOT number |
| `/api/fleet-compliance/import/setup` | POST | Clerk + admin | Initialize fleet_compliance_records tables |
| `/api/fleet-compliance/import/parse` | POST | Clerk + admin | Parse and validate uploaded XLSX before commit |
| `/api/fleet-compliance/import/save` | POST | Clerk + admin | Persist parsed records with batch UUID |
| `/api/fleet-compliance/import/rollback` | POST | Clerk + admin | Delete records by import_batch_id |
| `/api/fleet-compliance/invoices/parse-pdf` | POST | Clerk + admin | Parse invoice PDF into structured line items |
| `/api/fleet-compliance/onboarding` | POST | Clerk | Complete org onboarding |
| `/api/fleet-compliance/errors/client` | POST | Clerk | Capture client-side errors to error_events table |
| `/api/fleet-compliance/spend` | GET | Clerk | Return spend analytics for dashboard pages |
| `/api/fleet-compliance/telematics-sync` | GET | Cron secret | Pull Verizon Reveal telematics events and normalize |
| `/api/fleet-compliance/telematics-risk` | GET | Clerk | Return org telematics risk score + trend data |
| `/api/fleet-compliance/[collection]/[id]/restore` | POST | Clerk + admin | Soft-restore deleted records |

### Invoices — 2 Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/invoices/setup` | POST | Clerk + admin | Initialize invoice tables |
| `/api/invoices/import` | POST | Clerk + admin | Import invoice data from XLSX |

### Stripe Billing — 3 Endpoints

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/stripe/webhook` | POST | Stripe HMAC | Stripe subscription event handler |
| `/api/stripe/checkout` | POST | Clerk | Create checkout session for selected plan |
| `/api/stripe/portal` | POST | Clerk | Create customer portal session |

### Infrastructure — 1 Endpoint

| Route | Method | Auth | Purpose |
|-------|--------|------|---------|
| `/api/csp-report` | POST | Public | Content Security Policy violation reporting |

**Total: 27 API endpoints**

---

## 8. AI Engine — Pipeline Penny

### Architecture

```
User (Browser)
  │
  ▼
/api/penny/query (Next.js API Route)
  ├── Clerk auth verification
  ├── Rate limiting (20 req/60s via Upstash Redis)
  ├── Org context building (fleet data → 8KB max)
  ├── Penny role resolution
  │
  ▼
Railway FastAPI Backend (/query)
  ├── Knowledge retrieval (1,100+ CFR chunks)
  ├── CFR citation detection + related term injection
  ├── Security rules prepended to prompt
  ├── LLM provider routing:
  │   ├── Anthropic Claude (primary)
  │   ├── OpenAI GPT-4o-mini
  │   ├── Google Gemini 2.5 Flash
  │   └── Ollama (local)
  │
  ▼
Response (with sources + citations)
```

### Knowledge Base
- **1,100+ chunked documents** indexed for retrieval
- **13 CFR Parts** covering DOT/FMCSA regulations:
  - Part 040: Drug & Alcohol Testing Procedures
  - Part 360: FMCSA Fees
  - Part 365: Operating Authority
  - Part 367: Foreign Motor Carrier Registration
  - Part 382: Controlled Substances & Alcohol
  - Part 383: CDL Standards
  - Part 384: State CDL Compliance
  - Part 387: Financial Responsibility
  - Part 391: Driver Qualifications
  - Part 395: Hours of Service
  - Part 396: Inspection, Repair & Maintenance
  - Part 397: Hazardous Materials Driving
- **512 knowledge documents** loaded in Railway backend (as of last health check)
- **Custom document ingestion** via PDF, DOCX, XLSX, CSV, HTML parsers

### Operator Context Injection
```
--- OPERATOR FLEET DATA ---
DRIVERS (N total):
- Driver ID: ABC123 | CDL Expires: 2026-12-31 | Medical: 2026-06-15 | Status: Clear
ASSETS (M total):
- Asset ID: VH-001 | Type: Vehicle | Status: Active | Last Inspection: 2026-01-15
PERMITS (K total):
- Permit: DOT Operating Authority | Expires: 2026-09-30 | Status: Active
OPEN SUSPENSE ITEMS (L items):
- Item: CDL Renewal | Due: 2026-04-15 | Severity: High | Owner: Fleet Manager
--- END OPERATOR DATA ---
```

### Rate Limiting
| Parameter | Value |
|-----------|-------|
| Limit | 20 queries per 60 seconds per user |
| Primary backend | Upstash Redis (distributed sliding window) |
| Fallback | In-memory sliding window (single-instance) |
| Response headers | `X-RateLimit-Remaining`, `Retry-After` |
| Exceeded response | HTTP 429 with retry information |

---

## 9. Monitoring, Logging & Observability

### Sentry (Error Tracking & Performance)
| Feature | Configuration |
|---------|--------------|
| **Integration** | `@sentry/nextjs ^10.46.0` with server, client, and edge configs |
| **DSN** | Via `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` environment variables |
| **Release tracking** | Tagged with `VERCEL_GIT_COMMIT_SHA` |
| **Environment** | From `VERCEL_ENV` or `NODE_ENV` |
| **Trace sample rate** | 10% of transactions |
| **Session Replay** | 10% of normal sessions, 100% of error sessions |
| **Structured Logs** | Enabled via Sentry SDK integration |
| **Ad-blocker bypass** | `tunnelRoute: /monitoring` configured in `next.config.js` |
| **Source maps** | Upload enabled with `widenClientFileUpload: true` |
| **PII controls** | `sendDefaultPii: false` on server/edge + Sentry setting `Prevent Storing IP Addresses: ENABLED` |
| **Context enrichment** | `setSentryRequestContext()` sets userId and orgId on every API request |
| **Error boundaries** | React error boundary in Fleet-Compliance module captures + reports errors |

### Datadog (Log Aggregation & Analysis)
| Feature | Configuration |
|---------|--------------|
| **Log drain** | Vercel → Datadog integration |
| **Index strategy** | Two-index cost-split approach |
| **`audit-logs-soc2` index** | 15 days retention (trial) → 365 days (after Pro upgrade) |
| **`vercel-general-7d` index** | 7 days retention for general logs |
| **Pipeline** | 9 processors parsing audit JSON into queryable facets |
| **Facets** | action, userId, orgId, resourceType, severity, environment |

### Structured Audit Logging
| Feature | Detail |
|---------|--------|
| **Function** | `auditLog()` centralized logger |
| **Format** | JSON to stdout (captured by Vercel → Datadog) |
| **Coverage** | 17+ API routes emit audit events on both success and failure paths |
| **Fields** | timestamp, action, userId, orgId, resourceType, resourceId, metadata, severity, environment |
| **PII redaction** | 8-key deny-list with `includes`-style matchers (name, email, SSN, DOB, address, phone, license, medical) |
| **Action types** | `data.read`, `data.write`, `data.delete`, `import.*`, `auth.*`, `cron.*`, `penny.query`, `admin.action`, `rate_limit.exceeded` |

### Slack Alerts
| Feature | Detail |
|---------|--------|
| **Integration** | Datadog monitors → Slack channel notifications |
| **Alert types** | Error rate spikes, cron failures, rate limit exceeded events |
| **Escalation** | Configurable via Datadog monitor rules |

### UptimeRobot (External Availability)
| Feature | Detail |
|---------|--------|
| **Plan** | Solo |
| **Status page** | `https://status.pipelinepunks.com` |
| **Monitor count** | 3 (website, Penny health, Railway health) |
| **Check interval** | 1 minute |
| **Public comms** | Incidents and uptime exposed via public status page |

### Cron Health Monitoring
| Feature | Detail |
|---------|--------|
| **Endpoint** | `/api/fleet-compliance/cron-health` |
| **Mechanism** | Reads last entry from `cron_log` table |
| **Threshold** | 24-hour stale warning (dead-man switch) |
| **Response** | Status, hours since last run, last execution details |

### Client Error Capture
| Feature | Detail |
|---------|--------|
| **Endpoint** | `/api/fleet-compliance/errors/client` |
| **Storage** | `error_events` table (org_id, page, message, stack, user_id, recorded_at) |
| **Source** | React error boundaries and unhandled exceptions |

### CSP Violation Reporting
| Feature | Detail |
|---------|--------|
| **Endpoint** | `/api/csp-report` |
| **Source** | Browser Content Security Policy `report-uri` directive |
| **Logging** | Violations logged as structured JSON |

---

## 10. Security Posture

### Transport Security
| Control | Implementation |
|---------|---------------|
| **HTTPS enforcement** | HSTS header: `max-age=63072000; includeSubDomains; preload` (2 years) |
| **CSP** | Restrictive policy: `default-src 'self'`, frame-ancestors 'none', object-src 'none' |
| **X-Frame-Options** | `DENY` (clickjacking prevention) |
| **X-Content-Type-Options** | `nosniff` (MIME sniffing prevention) |
| **Referrer-Policy** | `strict-origin-when-cross-origin` |
| **Permissions-Policy** | `camera=(), microphone=(), geolocation=()` (sensor lockdown) |
| **CORS** | Railway backend locked to production origin |
| **Upgrade-Insecure** | CSP `upgrade-insecure-requests` directive |

### Application Security
| Control | Implementation |
|---------|---------------|
| **SQL injection** | 100% parameterized queries across all database operations |
| **XSS prevention** | `react-markdown` with `skipHtml` + `html: () => null`; CSP blocks inline scripts |
| **CSRF** | Clerk session tokens + SameSite cookies |
| **Input validation** | Field-level validators for all 12 import collection schemas |
| **Rate limiting** | 20 req/60s per user via Upstash Redis (distributed) |
| **Secret comparison** | Timing-safe (`crypto.timingSafeEqual`) for cron bearer token |
| **Webhook verification** | Stripe HMAC-SHA256 signature validation |
| **PII redaction** | Automatic in audit logs (8-key deny-list) |
| **Error sanitization** | Sentry `scrubSentryEvent()` removes PII before transmission |

### AI/LLM Security (OWASP LLM Top 10)
| OWASP ID | Threat | Mitigation |
|----------|--------|------------|
| LLM01 | Prompt Injection | Keyword filter (fast-reject) + 6 system-level security rules + explicit refusal instructions |
| LLM02 | Sensitive Info Disclosure | Server-side context only; driver anonymization (IDs only); 8KB context cap |
| LLM05 | Insecure Output Handling | `react-markdown` sanitization; `skipHtml`; HTML renderer returns null |
| LLM06 | Excessive Agency | No tool use; read-only responses; no system commands |
| LLM09 | Overreliance | Source citations in responses; general fallback limited to 3/session |

### Dependency Security
| Status | Detail |
|--------|--------|
| **npm audit** | 0 vulnerabilities (after `next@15.5.14` upgrade + `xlsx` → `exceljs` replacement) |
| **Removed** | `xlsx@0.18.5` (prototype pollution + ReDoS vulnerabilities) |
| **Removed** | `googleapis` (Google Drive coupling eliminated) |
| **Removed** | `lucide-react` (unused dependency) |
| **Moved** | `typescript` to `devDependencies` |
| **Dev-only** | `minimatch`/`flatted` transitive vulnerabilities via ESLint (not in production bundle) |

### Secret Management
| Practice | Implementation |
|----------|---------------|
| **Storage** | Vercel + Railway environment variable stores (not in code) |
| **Rotation schedule** | 18 secrets with 90/180-day rotation cycles documented |
| **Categories** | 4 critical (Clerk, DB, Penny API key, cron secret) + 14 standard |
| **Execution evidence** | 2026-03-27 batch completed with 9 rotations recorded in SOC2 evidence; 2026-03-28 telematics production stabilization completed |
| **Runbook** | `docs/ROTATION_RUNBOOK.md` is the canonical rotation procedure |
| **Validation** | `scripts/check-env.ts` runs at startup; CRITICAL vars exit process if missing |
| **Env reference** | Canonical matrix maintained in `soc2-evidence/system-description/ENV_EXAMPLE.md` |

---

## 11. SOC 2 Compliance Program

### Program Overview

**Readiness Status:** Operational SOC 2 task batch complete (2026-03-27) and telematics production pipeline validated (2026-03-28)
**SOC 2 Clock Started:** 2026-03-24 (Phase 3 Datadog drain deployed)
**90-Day Observation Window Ends:** 2026-06-22
**Type I Earliest Engagement:** 2026-06-22
**Type II Earliest Engagement:** 2027-03-24

### Audit Phase History

| Phase | Scope | Score | Status |
|-------|-------|-------|--------|
| **Phase 0** | Baseline repository audit, dependency audit, secret exposure analysis | 9/10 | Complete |
| **Phase 1** | Infrastructure hardening — 8 security headers, Google Drive removal, error boundaries, env validation | 9/10 | Complete |
| **Phase 2** | Data integrity & access control — auth middleware on 12+ routes, field validators, parameterized queries | 8/10 | Complete |
| **Phase 3** | Audit logging & observability — structured JSON logging, Sentry PII scrubbing, Datadog drain, runbook | 8/10 | Complete |
| **Phase 4** | Multi-tenant org scoping — org isolation, trial gating, Stripe webhooks, org lifecycle audit trail | 9/10 | Complete |
| **Phase 5** | Penny AI security — server-side context, prompt injection defense, output sanitization, OWASP LLM assessment | 9/10 | Complete |
| **Phase 6** | Security hardening — rate limiting, dependency audit, secret rotation schedule, pentest guide, GitHub security | 8/10 | Complete |
| **Phase 7** | Incident response & business continuity — IRP, escalation chain, subprocessor registry, offboarding automation | 9/10 | Complete |
| **Phase 8** | Compliance documentation & policy — 8 SOC 2 policies, privacy/terms remediation, CODEOWNERS, legal checks | 9/10 | Complete |

### SOC 2 Control Matrix

| Control | Description | Status |
|---------|-------------|--------|
| **CC1.2** | Commitment to Competence | **Satisfied** — Security Officer role defined, responsibilities documented |
| **CC2.1** | Information and Communication | **Satisfied** — 8 policies versioned, privacy/terms pages compliant |
| **CC2.2** | Internal Communication | **Satisfied** — Policies reference code files, CODEOWNERS routes reviews |
| **CC4.1** | Risk Assessment | **Satisfied** — 9 phases of audit findings as evidence |
| **CC5.1** | Control Activities | **Satisfied** — Auth middleware, org isolation, rate limiting, validation, logging |
| **CC6.1** | Logical Access | **Satisfied** — Clerk auth + org scoping enforced, rotation schedule documented |
| **CC6.2** | Access Provisioning | **Satisfied** — Org provisioning, trial state, plan changes emit audit events |
| **CC6.3** | Access Removal | **Satisfied** — Canceled orgs blocked, automated 30/60-day data deletion |
| **CC6.7** | Transmission Security | **Satisfied** — 8 security headers, HSTS, CSP, HTTPS enforced |
| **CC7.1** | Vulnerability Detection | **Satisfied** — 0 npm vulnerabilities, dependency audit documented |
| **CC7.2** | System Monitoring | **Satisfied** — Sentry + Datadog + audit logging + cron health |
| **CC7.3** | Incident Response | **Satisfied** — IRP with 4 severity levels, GDPR Article 33 step |
| **CC8.1** | Change Management | **Satisfied** — PR-only workflow, CODEOWNERS, Vercel auto-deploy |
| **CC9.1** | Vendor Management | **Satisfied** — 13-vendor registry with compensating controls |
| **P1.1** | Privacy Notice | **Satisfied** — Fleet data categories, AI no-training, subprocessors disclosed |
| **P4.3** | Data Retention | **Satisfied** — Automated offboarding lifecycle, Stripe-triggered |
| **A1.1** | Availability | **Satisfied** — Health checks, cron monitoring, error boundaries |
| **PI1.1** | Processing Integrity | **Satisfied** — 12/12 collection validators, parameterized queries |

### 8 Formal SOC 2 Policies (Auditor-Ready)

1. **Information Security Policy** — Names exact stack + 7 baseline controls
2. **Access Control Policy** — References `fleet-compliance-auth.ts`, plan-gate.ts
3. **Data Classification Policy** — 4 levels: Public, Internal, Confidential, Restricted
4. **Change Management Policy** — PR-only workflow, Vercel auto-deploy, emergency procedure
5. **Business Continuity Policy** — RTO 4h, RPO 24h, 5 critical systems named
6. **Vendor Management Policy** — Links to subprocessor registry, 4 selection criteria
7. **Incident Response Policy** — P1-P4 procedures + GDPR Article 33 step
8. **Acceptable Use Policy** — Permitted data types, prohibited data, enforcement

### Automated Compliance Checks
| Check | Script | Purpose |
|-------|--------|---------|
| Legal regression | `npm run compliance:legal-check` | Validates privacy + terms pages contain required disclosures (7 checks) |
| Operational gaps | `npm run compliance:ops-check` | Detects remaining external action items |
| Environment validation | `scripts/check-env.ts` | Validates 53 env vars at startup |

---

## 12. Vendor & Subprocessor Registry

| Vendor | Data Processed | SOC 2 Certified | Risk Level | Key Mitigations |
|--------|---------------|-----------------|------------|-----------------|
| **Neon** | All DB data (fleet records, audit events, subscriptions) | Type II | Low | Encrypted at rest/transit, automatic backups |
| **Vercel** | App code, logs, env vars | Type II | Low | SLA, auto-deploy CI, edge CDN |
| **Clerk** | User identity, org membership, MFA | Type II | Low | JWT verification, API key secrets |
| **Railway** | Query text + org context (anonymized driver IDs, CDL dates) | None | High | HTTPS, 8KB context cap, anonymous IDs, API key auth |
| **Anthropic** | Ephemeral query + context | None | Medium | Zero-retention API policy, HTTPS, prompt security rules |
| **OpenAI** | Ephemeral query (if selected) | None | Medium | Zero-retention API policy, HTTPS |
| **Google Gemini** | Ephemeral query (if selected) | Not verified | Low | Optional provider, same prompt controls |
| **Stripe** | Payment method, subscription state, customer email | Type II | Low | HMAC-SHA256 webhook verification |
| **Resend** | Email templates, alert recipient addresses | Not listed | Low | Email-only, no fleet data stored |
| **Sentry** | Error context, stacktraces, breadcrumbs | Type II | Low | PII scrubbing on ingest |
| **Datadog** | Audit logs (structured JSON) | Type II | Low | Two-index retention strategy (7d/365d) |
| **Upstash** | Rate limit counters (userId keys) | SOC 2 | Low | Ephemeral data only |
| **UptimeRobot** | Public endpoint URLs, monitor metadata | Not listed | Low | No customer PII, monitoring-only |

**Highest risk vendor:** Railway (no SOC 2, but comprehensive compensating controls documented — HTTPS, context cap, anonymous IDs, API key authentication, no PII in transmitted context)

---

## 13. Billing & Subscription Management

### Stripe Integration
| Feature | Implementation |
|---------|---------------|
| **Webhook endpoint** | `/api/stripe/webhook` |
| **Signature verification** | HMAC-SHA256 with `crypto.timingSafeEqual` |
| **Events handled** | `customer.subscription.created`, `.updated`, `.deleted` |
| **Database sync** | Records plan, customer ID, period end in `subscriptions` table |
| **Audit trail** | All Stripe events logged to `org_audit_events` |
| **Idempotency** | Event ID uniqueness constraint prevents duplicate processing |

### Plan Lifecycle
```
Trial (30 days) → Active (Stripe subscription) → Past Due → Canceled → Offboarding → Deletion
```

| State | Access | Data |
|-------|--------|------|
| `trial` | Full access | Retained |
| `active` | Full access | Retained |
| `past_due` | Full access (grace) | Retained |
| `canceled` | Blocked at auth gate | Soft-deleted after 30 days |
| `offboarded` | N/A | Hard-deleted after 60 days total |

### Plan Gate Enforcement
- `plan-gate.ts` checks org plan status on every protected page load
- Returns `accessState`: `active`, `trial_expired`, or `canceled`
- Trial expiration and state changes emit audit events via `org-audit.ts`
- `FleetComplianceExpiredGate` component shows access-denied page with deletion countdown

---

## 14. Data Lifecycle & Retention

### Organization Lifecycle Events (Tracked in org_audit_events)
| Event Type | Trigger |
|------------|---------|
| `org.provisioned` | First login creates org record |
| `org.onboarding.completed` | Onboarding wizard finished |
| `org.trial.active` | Trial period begins (30 days) |
| `org.trial.expired` | Trial period ends |
| `org.subscription.activated` | Stripe subscription confirmed |
| `org.subscription.canceled` | Stripe cancellation event |
| `org.offboarding.scheduled` | 30-day soft-delete timer started |
| `org.data.soft_deleted` | Records marked with `deleted_at` |
| `org.data.hard_deleted` | Records physically removed (day 60) |

### Data Retention Policies
| Data Type | Retention | Mechanism |
|-----------|-----------|-----------|
| Fleet compliance records | Active subscription duration | Retained while plan active |
| Soft-deleted records | 30 days post-cancellation | `deleted_at` timestamp, restorable |
| Hard-deleted records | Permanent removal at day 60 | Physical deletion from database |
| Audit events | Indefinite (DB) + 365 days (Datadog) | Compliance evidence preservation |
| Cron logs | Indefinite | Operational monitoring |
| Error events | Indefinite | Debugging and compliance |
| Penny query content | Ephemeral (not stored) | Never persisted to database |
| Rate limit counters | 120 seconds (2x window) | Auto-expiring Redis keys |

### Offboarding Automation
- `offboarding-lifecycle.ts` manages the full cancellation flow
- Stripe webhook triggers `org.subscription.canceled` event
- Cron job checks for canceled orgs past 30-day grace period
- Soft-delete marks all `fleet_compliance_records` with `deleted_at`
- Hard-delete physically removes records after 60 days total
- Row counts tracked in audit event metadata for compliance evidence
- Individual record deletion procedure documented for GDPR requests

---

## 15. Operational Tooling

### Operational Runbooks
- `docs/ROTATION_RUNBOOK.md` — secret rotation procedures for Clerk, Neon, Vercel, Railway, Sentry, and telematics credentials
- `docs/GIT_WORKFLOW.md` — enforced PR workflow under main branch protection
- `docs/UPTIME_SETUP.md` — UptimeRobot Solo configuration and status page baseline

### Fleet-Compliance Sentinel (Python Tooling)
| Tool | Purpose |
|------|---------|
| `build_chief_imports.py` | Main ETL: reads CSV/Excel sources, generates TypeScript data modules |
| `cfr_dot_scraper.py` | Fetches CFR parts from Federal Register |
| `cfr_dot_scaper1.py` | Alternative CFR scraper |
| `fetch_fmcsa_data.py` | FMCSA WebServices client reference |
| `validate_import_mapping.py` | Schema validation for import mappings |
| `refresh_chief_demo.ps1` | Windows PowerShell data refresh script |

### CFR Knowledge Library
- 13 CFR parts in Markdown format (`tooling/fleet-compliance-sentinel/cfr_dot_markdown/`)
- Indexed by `scripts/build-cfr-index.mjs` for Penny RAG retrieval
- 1,100+ chunked documents in `knowledge/` directory

### NPM Scripts
| Script | Purpose |
|--------|---------|
| `npm run dev` | Next.js development server |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run compliance:legal-check` | Verify privacy/terms pages contain required disclosures |
| `npm run compliance:ops-check` | Check for remaining operational gaps |
| `npm run sync:knowledge` | Sync knowledge base to Railway |
| `npm run build:cfr-index` | Build CFR Markdown index for retrieval |
| `npm run eval:penny` | Run Penny evaluation suite |
| `npm run docs:vendors` | Download vendor documentation |

### Data Sources (CSV Seeds)
| File | Contents |
|------|----------|
| EMPLOYEES.csv | Employee master records |
| VEHICLES & EQUIPMENT.csv | Vehicle and equipment inventory |
| STORAGE TANKS.csv | Storage tank inventory |
| PERMITS & LICENSES.csv | Permit and license records |
| MAINTENANCE SCHEDULE.csv | Maintenance schedule definitions |
| EMERGENCY CONTACTS.csv | Emergency contact directory |
| COLORADO CONTACTS.csv | Colorado-specific regulatory contacts |

---

## 16. Deployment & CI/CD

### Vercel Deployment
| Feature | Configuration |
|---------|--------------|
| **Trigger** | Automatic on `git push` to `main` |
| **Framework** | Next.js 15 (auto-detected) |
| **Build command** | `next build` |
| **Output** | `.next/` directory |
| **Environment** | Production, Preview, Development |
| **Cron jobs** | `/api/fleet-compliance/alerts/run` at `0 8 * * *` + `/api/fleet-compliance/telematics-sync` at `0 2 * * *` |
| **Headers** | 8 security headers applied via `vercel.json` |
| **Domain** | `www.pipelinepunks.com` |

### Railway Deployment
| Feature | Configuration |
|---------|--------------|
| **Trigger** | Auto-deploy from `railway-backend/` on push |
| **Build** | Dockerfile-based (`python:3.11-slim`) |
| **Command** | `uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}` |
| **Restart** | ON_FAILURE, max 10 retries |
| **Volume** | 5GB at `/app/data` (knowledge store) |
| **Domain** | `pipeline-punks-v2-production.up.railway.app` |
| **Plan** | Hobby (Pro upgrade recommended) |

### Change Management Controls
| Control | Implementation |
|---------|---------------|
| **PR-only merges** | All changes via pull request (branch protection) |
| **CODEOWNERS** | Security-sensitive files require Security Officer review |
| **PR verification evidence** | 13 PRs (#1-#13) merged through branch-protection workflow |
| **Workflow runbook** | `docs/GIT_WORKFLOW.md` documents branch, PR, and merge process |
| **Automated checks** | Legal regression + operational gap checks in CI |
| **Emergency procedure** | Documented in Change Management Policy (hotfix branch → expedited review) |

---

## 17. Evidence Binder Inventory

All SOC 2 evidence is maintained in `/soc2-evidence/` with 73 artifacts across 10 subdirectories:

| Directory | Files | Contents |
|-----------|-------|----------|
| `access-control/` | 19 | Auth code evidence, isolation tests, prompt injection tests, secret rotation log, Clerk readiness checklist |
| `audit-findings/` | 13 | Phase 0-9 findings, post-phase audits, full audit summary |
| `change-management/` | 2 | Branch protection verification, GitHub security guide |
| `compliance-milestones/` | 1 | SOC 2 observation window dates |
| `incident-response/` | 4 | IRP (4 severity levels, GDPR Art 33), runbook (8+ playbooks), status page setup |
| `monitoring/` | 10 | Audit logs, cron health, Sentry production evidence, UptimeRobot status page evidence |
| `penetration-testing/` | 5 | OWASP ZAP guide, baseline attempt, completed baseline reports (.html/.json/.md) |
| `policies/` | 14 | 8 SOC 2 policies + gap analyses + action plans |
| `system-description/` | 4 | Architecture, audit report, env example, system boundary diagram |
| `vendor-management/` | 1 | 13-vendor subprocessor registry with compensating controls |

---

## 18. Platform Metrics Summary

### Codebase
| Metric | Value |
|--------|-------|
| TypeScript/TSX files | 129 |
| API endpoints | 27 |
| Frontend pages/routes | 33 |
| React components | 26 |
| Library modules | 26 |
| FastAPI backend | 957 lines (`railway-backend/app/main.py`) |
| SQL migrations | 10 |
| Database tables | 9 |
| NPM dependencies | 0 vulnerabilities |
| Environment variables | 53 canonical + extended tooling/telematics template vars |

### Knowledge & AI
| Metric | Value |
|--------|-------|
| CFR parts indexed | 13 |
| Knowledge documents | 512 (Railway) |
| Chunked retrieval docs | 1,100+ |
| LLM providers | 4 (Anthropic, OpenAI, Gemini, Ollama) |
| Rate limit | 20 queries/60 seconds/user |
| Context cap | 8,000 characters |
| Import collection schemas | 12 |
| OWASP LLM controls | 5 verified |

### Compliance & Security
| Metric | Value |
|--------|-------|
| SOC 2 audit phases | 9 (all complete) |
| SOC 2 policies | 8 (auditor-ready) |
| Evidence artifacts | 73 |
| Security headers | 8 |
| Audit log coverage | 17+ API routes |
| Subprocessors registered | 13 |
| Secret rotation targets | 20 |
| Automated compliance checks | 3 scripts |

### Infrastructure
| Metric | Value |
|--------|-------|
| Hosting providers | 3 (Vercel, Railway, Neon) |
| Monitoring services | 3 (Sentry, Datadog, UptimeRobot) |
| Auth provider | Clerk (SOC 2 Type II) |
| Payment processor | Stripe (SOC 2 Type II) |
| Email provider | Resend |
| Rate limiter | Upstash Redis |
| Cron jobs | 2 (daily alert sweep + telematics sync) |
| Production uptime | Active since 2026-03-20 |

---

## Deployment Architecture Diagram

```
                    ┌──────────────────────────────────────────────────┐
                    │              INTERNET / USERS                     │
                    └──────────────────────┬───────────────────────────┘
                                           │
                              ┌────────────▼────────────┐
                              │   Clerk (Auth + MFA)    │
                              │   SOC 2 Type II         │
                              └────────────┬────────────┘
                                           │ JWT
                    ┌──────────────────────▼───────────────────────────┐
                    │           VERCEL (Next.js 15)                     │
                    │  ┌─────────────────────────────────────────────┐ │
                    │  │  Middleware (Clerk auth + route protection)  │ │
                    │  └─────────────────────┬───────────────────────┘ │
                    │           ┌────────────┼────────────┐            │
                    │  ┌────────▼──────┐ ┌──▼──────────┐ ┌▼─────────┐ │
                    │  │ Fleet-Comp.   │ │ Penny API   │ │ Stripe   │ │
                    │  │ API Routes    │ │ Routes      │ │ Routes   │ │
                    │  │ (18 endpoints)│ │ (3 endpts)  │ │ (3 endpts)│ │
                    │  └───────┬───────┘ └──────┬──────┘ └────┬─────┘ │
                    │          │                 │             │        │
                    │  ┌───────▼─────────────────▼─────────────▼─────┐ │
                    │  │        Audit Logger (PII Redaction)          │ │
                    │  └─────────────────────┬───────────────────────┘ │
                    │                        │                         │
                    │  ┌─────────┐  ┌────────▼──────┐  ┌───────────┐  │
                    │  │ Sentry  │  │ Vercel Logs   │  │ CSP       │  │
                    │  │ Errors  │  │ → Datadog     │  │ Reports   │  │
                    │  └─────────┘  └───────────────┘  └───────────┘  │
                    │  Cron: /alerts/run @ 08:00 UTC + /telematics-sync @ 02:00 UTC │
                    └──────┬──────────────────┬───────────────────────┘
                           │                  │
              ┌────────────▼────┐    ┌────────▼──────────┐
              │   Neon Postgres │    │  Railway (FastAPI) │
              │   SOC 2 Type II │    │  Penny AI Backend  │
              │                 │    │                    │
              │ fleet_comp_     │    │ /health            │
              │   records       │    │ /query → LLM       │
              │ organizations   │    │ /catalog            │
              │ subscriptions   │    │                    │
              │ org_audit_events│    │ Volume: 5GB        │
              │ cron_log        │    │ 512 knowledge docs │
              │ error_events    │    └───────┬────────────┘
              │ invoices        │            │
              └─────────────────┘    ┌───────▼────────────┐
                                     │   LLM Providers    │
              ┌─────────────────┐    │ ├─ Anthropic Claude│
              │ Upstash Redis   │    │ ├─ OpenAI GPT-4o   │
              │ Rate Limiting   │    │ ├─ Google Gemini    │
              │ 20 req/60s/user │    │ └─ Ollama (local)  │
              └─────────────────┘    └────────────────────┘

              ┌─────────────────┐    ┌────────────────────┐
              │  Resend (Email) │    │  Stripe (Billing)  │
              │  Alert Delivery │    │  SOC 2 Type II     │
              └─────────────────┘    └────────────────────┘

              ┌─────────────────┐    ┌────────────────────┐
              │  Datadog        │    │  Slack              │
              │  Log Analysis   │    │  Alert Notifications│
              │  SOC 2 Type II  │    │                     │
              └─────────────────┘    └────────────────────┘

              ┌─────────────────┐
              │  UptimeRobot    │
              │  Uptime Monitor │
              └─────────────────┘
```

---

## Contact

**Organization:** True North Data Strategies LLC
**Security Officer:** Jacob Johnston
**GitHub Org:** Pipeline-Punks
**Repository:** pipeline-punks-pipelinex-v2
**Production:** https://www.pipelinepunks.com
**Corporate:** https://truenorthstrategyops.com
