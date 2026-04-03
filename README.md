<div align="center">

# Fleet-Compliance Sentinel | Pipeline Punks

### Fleet and DOT Compliance Platform

[![Website](https://img.shields.io/badge/Website-pipelinepunks.com-blue?style=for-the-badge)](https://www.pipelinepunks.com)
[![Status Page](https://img.shields.io/badge/Status-Live-0A8EA0?style=for-the-badge)](https://status.pipelinepunks.com)
[![TNDS](https://img.shields.io/badge/TNDS-truenorthstrategyops.com-0A8EA0?style=for-the-badge)](https://truenorthstrategyops.com)

<img src="public/PipelineX-penny.png" alt="PipelineX Penny" width="260" />

</div>

Fleet-Compliance Sentinel is a production-grade, multi-tenant B2B SaaS platform built by True North Data Strategies LLC for DOT/FMCSA fleet compliance management, telematics risk monitoring, compliance training, and AI-powered regulatory guidance via Pipeline Penny.

## Current State (2026-04-03)

- Active sprint: April 2-25 (Workstream A: Enterprise Hardening complete; Workstream B: Training-Command B1-B9 complete)
- SOC 2 observation window: 2026-03-24 to 2026-06-22 (81 days remaining)
- Branch protection: active on `main` (PR workflow enforced)
- Merged under branch protection: PRs #1 through #14
- Status page: live at `https://status.pipelinepunks.com`
- Module gateway: operational with 7-layer enterprise hardening (tool registry, schema validation, sandbox, retry, cost tracking, audit logging, tenant isolation)
- Training LMS: B1-B9 complete (12 hazmat modules, assessment engine, certificates, compliance auto-update, Penny integration)
- Telematics production pipeline: validated end-to-end (Verizon Connect Reveal)
- Penny knowledge base: 25,616 chunks in vector store (13 CFR parts + ERG + demo corpora)
- Production readiness audit: 6 critical, 5 high findings identified — triage in progress

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Fleet-Compliance Dashboard | `/fleet-compliance` | Assets, drivers, permits, suspense, invoices, spend, alerts, FMCSA, DQ files |
| Training LMS | `/fleet-compliance/training` | Self-contained compliance training with slide decks, assessments, certificates, and auto-updated compliance records (31 hazmat modules) |
| Telematics Risk | `/fleet-compliance/telematics` | Verizon Connect Reveal telemetry sync + risk scoring UI |
| Pipeline Penny | `/penny` | Document-grounded AI compliance assistant (Anthropic/OpenAI/Gemini/Ollama) |
| Module Tools | `/fleet-compliance/tools` | Gateway operator UI for ML-EIA, ML-SIGNAL, PaperStack, command-center (43 actions) |
| Command Center | `/fleet-compliance/command-center` | Tool discovery catalog (109 tools across 13 command modules) |
| Import Pipeline | `/api/fleet-compliance/import/*` | XLSX parse/validate/save/rollback with 13 collection schemas |
| Alert Engine | `/api/fleet-compliance/alerts/*` | Daily cron sweep + preview/trigger with color-coded email delivery |
| Billing | `/api/stripe/*` | Checkout, customer portal, subscription webhook lifecycle with offboarding automation |

## Stack

| Layer | Technology | Host | Notes |
|-------|-----------|------|------|
| Frontend + API | Next.js `^15.5.14` | Vercel | App Router, 27+ API endpoints, 33 page routes |
| Auth | Clerk `^7.0.8` | Clerk | Org-scoped auth, RBAC (admin/member), MFA-ready |
| Database | Neon Postgres | Neon | Multi-tenant with 16 migrations, JSONB data layer |
| AI Backend | FastAPI | Railway | Penny RAG retrieval + Verizon Reveal adapter |
| Module Gateway | Node.js (in-process) | Vercel | 7-layer enterprise-hardened orchestration |
| Error Monitoring | Sentry `^10.46.0` | Sentry | Errors, replay, logs, tunnel route, source maps |
| Log Monitoring | Datadog | Datadog | Vercel drain + 365-day audit index |
| Uptime | UptimeRobot Solo | UptimeRobot | 3 monitors, 1-minute checks, public status page |
| Rate Limiting | Upstash Redis | Upstash | Sliding window (20 req/60s/user) for Penny |
| Email | Resend | Resend | Compliance alert delivery |
| Billing | Stripe | Stripe | Subscription lifecycle + automated offboarding |

## Active Sprint (April 2-25)

| Workstream | Focus | Status |
|-----------|-------|--------|
| **A** | Enterprise Function Calling Hardening — 7 control layers (A0-A8) | Complete |
| **B** | Training-Command Module Build — hazmat LMS (B1-B9) | Complete |
| **Triage** | Production readiness audit findings (6 critical, 5 high) | In Progress |

## Monitoring and Security

- Sentry fully integrated (`@sentry/nextjs`) across client/server/edge
- Session Replay: 10% normal, 100% error sessions
- Ad-blocker bypass tunnel at `/monitoring`
- PII controls: `sendDefaultPii: false`, Sentry IP storage prevention, 8-key audit redaction
- UptimeRobot Solo: 3 monitors at 1-minute intervals + public status page
- OWASP ZAP baseline: 59 PASS, 8 WARN, 0 FAIL
- OWASP LLM Top 10: 5 controls verified (LLM01, LLM02, LLM05, LLM06, LLM09)
- SOC 2 Type I: 73 evidence artifacts, 8 policies, 9 audit phases complete

## Repo Structure

```text
src/               Next.js app (33 pages, 27+ API routes, 26 components, 30+ lib modules)
railway-backend/   FastAPI backend (Penny RAG + Verizon Reveal adapter)
packages/          Monorepo workspace (@tnds/types, ingest-core, retrieval-core, memory-core)
knowledge/         CFR docs (13 parts), ERG 2024, demo index, training content
scripts/           Build scripts, evals, compliance checks, env validation
migrations/        SQL migrations (16)
soc2-evidence/     SOC 2 compliance evidence (73 files across 10 domains)
docs/              Operational runbooks, integration contracts (25 files)
tooling/           ML modules, command-center, PaperStack, 13 command modules
public/            Static assets, logos, security.txt
archive/           Historical snapshots from 4 cleanup cycles
```

## Key Documentation

| File | Purpose |
|------|---------|
| `PLATFORM_OVERVIEW.md` | Canonical 20-section platform and control overview (1,447 lines) |
| `DEVELOPER_MANUAL.md` | Developer troubleshooting and architecture guide (22 sections) |
| `INDEX.md` | Current repository map with file counts |
| `TODO-April 2-25 Sprint Plan.md` | Active sprint plan with task prompts |
| `docs/STATUS.md` | Execution status log and milestone history |
| `docs/ROTATION_RUNBOOK.md` | Secret rotation procedures (18 secrets) |
| `docs/GIT_WORKFLOW.md` | PR-only workflow and merge discipline |
| `docs/FEATURE_SPEC_HAZMAT_TRAINING_COMPLIANCE.md` | Hazmat training compliance feature spec |
| `docs/integration/` | Module gateway contracts, runbooks, checklists, and audit reports (11 docs) |
| `.env.example` | Sectioned environment variable template (53+ vars) |

## In-App User Manual

The platform includes a built-in interactive user manual accessible from the sidebar. It covers all 37 modules organized by sidebar group (Operations, Compliance, Training, Finance, Intelligence, Admin) with a clickable table of contents.

## Local Setup

```bash
npm install
npx tsx scripts/check-env.ts    # Validates 53 env vars
npm run dev
```

## Build and Verification

```bash
npm run build                     # Builds CFR + demo indexes, then Next.js
npm run compliance:legal-check    # Privacy/terms page validation
npm run compliance:ops-check      # Operational gap detection
npm run db:check-training-schema  # Training table validation
```

## Contact

**True North Data Strategies LLC** | SBA-certified VOSB/SDVOSB
Phone: 555-555-5555 | Email: jacob@truenorthstrategyops.com
