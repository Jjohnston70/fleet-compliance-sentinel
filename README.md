<div align="center">

# Fleet-Compliance Sentinel | Pipeline Punks

### Fleet and DOT Compliance Platform

[![Website](https://img.shields.io/badge/Website-pipelinepunks.com-blue?style=for-the-badge)](https://www.pipelinepunks.com)
[![Status Page](https://img.shields.io/badge/Status-Live-0A8EA0?style=for-the-badge)](https://status.pipelinepunks.com)
[![TNDS](https://img.shields.io/badge/TNDS-truenorthstrategyops.com-0A8EA0?style=for-the-badge)](https://truenorthstrategyops.com)

<img src="public/PipelineX-penny.png" alt="PipelineX Penny" width="260" />

</div>

Fleet-Compliance Sentinel is a multi-tenant SaaS built by True North Data Strategies LLC for fleet compliance operations, telematics risk monitoring, and DOT/CFR guidance via Pipeline Penny.

## Current State (2026-04-01)

- Active sprint: April 2-25 (Workstream A: Enterprise Function Calling Hardening + Workstream B: Training-Command Module Build)
- SOC 2 observation window: 2026-03-24 to 2026-06-22
- Branch protection: active on `main` (PR workflow enforced)
- Merged under branch protection: PRs #1 through #14
- Status page: live at `https://status.pipelinepunks.com`
- Module gateway: operational for ML-EIA, ML-SIGNAL, PaperStack, and command-center bridge
- Telematics production pipeline: validated end-to-end
- Penny knowledge base: 25,616 chunks in vector store (CFR + ERG + demo corpora)

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Fleet-Compliance Dashboard | `/fleet-compliance/*` | Assets, drivers, permits, suspense, invoices, spend, alerts, FMCSA |
| Telematics Risk | `/fleet-compliance/telematics` | Verizon Connect Reveal telemetry sync + risk scoring UI |
| Pipeline Penny | `/penny` | Document-grounded compliance assistant (Anthropic/OpenAI/Gemini/Ollama) |
| Module Tools | `/fleet-compliance/tools` | Gateway operator UI for running ML-EIA, ML-SIGNAL, PaperStack, and command-center modules |
| Import Pipeline | `/api/fleet-compliance/import/*` | XLSX parse/validate/save/rollback workflow |
| Alert Engine | `/api/fleet-compliance/alerts/*` | Daily cron sweep + preview/trigger endpoints |
| Billing | `/api/stripe/*` | Checkout, customer portal, subscription webhook lifecycle |
| Training-Command (in progress) | `/fleet-compliance/training` | Self-contained LMS for hazmat and compliance training with slide decks, assessments, and auto-updated compliance records |

## Stack

| Layer | Technology | Host | Notes |
|-------|-----------|------|------|
| Frontend + API | Next.js `^15.5.14` | Vercel | App Router, 27+ API endpoints |
| Auth | Clerk `^6.39.1` | Clerk | Org-scoped auth and RBAC |
| Database | Neon Postgres | Neon | Multi-tenant data + audit events |
| AI Backend | FastAPI | Railway | Penny retrieval + Verizon Reveal adapter |
| Module Gateway | Node.js (in-process) | Vercel | Orchestration layer for ML-EIA, ML-SIGNAL, PaperStack, command-center |
| Error Monitoring | Sentry `^10.46.0` | Sentry | Full SDK: errors, replay, logs, tunnel route, source maps |
| Log Monitoring | Datadog | Datadog | Vercel drain + long-retention audit index |
| Uptime | UptimeRobot Solo | UptimeRobot | 3 monitors, 1-minute checks, public status page |
| Rate Limiting | Upstash Redis | Upstash | Sliding window for Penny queries |
| Email | Resend | Resend | Compliance alert delivery |
| Billing | Stripe | Stripe | Subscription lifecycle + offboarding hooks |

## Active Sprint (April 2-25)

| Workstream | Focus | Status |
|-----------|-------|--------|
| **A** | Enterprise Function Calling Hardening — 7 control layers (tool registry, schema validation, execution sandbox, retry manager, token/cost attribution, audit logging, tenant isolation) | In Progress |
| **B** | Training-Command Module Build — self-contained LMS starting with hazmat, content from ERG/CFR/PHMSA, slide decks with assessments, auto-updates compliance records | In Progress |

## Monitoring and Security Highlights

- Sentry fully integrated (`@sentry/nextjs`) across client/server/edge
- Session Replay configured (10% normal, 100% error sessions)
- Ad-blocker bypass tunnel enabled at `/monitoring`
- `sendDefaultPii` set to `false` and Sentry IP storage prevention enabled
- UptimeRobot Solo plan with monitors for:
  - `https://www.pipelinepunks.com`
  - `https://www.pipelinepunks.com/api/penny/health`
  - `https://pipeline-punks-v2-production.up.railway.app/health`
- OWASP ZAP baseline complete: 59 PASS, 8 WARN, 0 FAIL

## Repo Structure

```text
src/               Next.js app, API routes, components, shared libs
railway-backend/   FastAPI backend + Verizon Reveal integration
packages/          Monorepo workspace packages (@tnds/types, ingest-core, retrieval-core, memory-core)
knowledge/         CFR docs, demo index, ERG hazmat, domain configs
scripts/           Build scripts, evals, compliance checks, vendor docs
migrations/        SQL migrations (10)
soc2-evidence/     Compliance evidence set (73 files)
docs/              Operational runbooks, status docs, integration contracts
tooling/           Python/data tooling, command-center, ML modules, PaperStack
public/            Static assets, logos, security.txt
archive/           Historical snapshots and retired prompts/docs
```

## Key Documentation

| File | Purpose |
|------|---------|
| `PLATFORM_OVERVIEW.md` | Canonical platform and control overview |
| `TODO-April 2-25 Sprint Plan.md` | Active sprint plan with task prompts |
| `INDEX.md` | Current repository map and counts |
| `docs/STATUS.md` | Current execution status and milestone log |
| `docs/ROTATION_RUNBOOK.md` | Secret rotation procedures |
| `docs/GIT_WORKFLOW.md` | PR-only workflow and merge discipline |
| `docs/FEATURE_SPEC_HAZMAT_TRAINING_COMPLIANCE.md` | Hazmat training compliance feature spec |
| `docs/integration/` | Module gateway contracts, runbooks, and checklists (8 docs) |
| `soc2-evidence/system-description/ENV_EXAMPLE.md` | Canonical environment-variable reference |

## Local Setup

```bash
npm install
npx tsx scripts/check-env.ts
npm run dev
```

## Build and Verification

```bash
npm run build
npm run compliance:legal-check
npm run compliance:ops-check
```
