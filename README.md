<div align="center">

# Fleet-Compliance Sentinel | Pipeline Punks

### Fleet and DOT Compliance Platform

[![Website](https://img.shields.io/badge/Website-pipelinepunks.com-blue?style=for-the-badge)](https://www.pipelinepunks.com)
[![Status Page](https://img.shields.io/badge/Status-Live-0A8EA0?style=for-the-badge)](https://status.pipelinepunks.com)
[![TNDS](https://img.shields.io/badge/TNDS-truenorthstrategyops.com-0A8EA0?style=for-the-badge)](https://truenorthstrategyops.com)

<img src="public/PipelineX-penny.png" alt="PipelineX Penny" width="260" />

</div>

Fleet-Compliance Sentinel is a multi-tenant SaaS built by True North Data Strategies LLC for fleet compliance operations, telematics risk monitoring, and DOT/CFR guidance via Pipeline Penny.

## Current State (2026-03-27)

- SOC 2 operational task batch: complete
- Observation window: 2026-03-24 to 2026-06-22
- Branch protection: active on `main` (PR workflow enforced)
- Merged under branch protection: PRs #1 through #5
- Status page: live at `https://status.pipelinepunks.com`

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Fleet-Compliance Dashboard | `/fleet-compliance/*` | Assets, drivers, permits, suspense, invoices, spend, alerts, FMCSA |
| Telematics Risk | `/fleet-compliance/telematics` | Verizon Connect Reveal telemetry sync + risk scoring UI |
| Pipeline Penny | `/penny` | Document-grounded compliance assistant (Anthropic/OpenAI/Gemini/Ollama) |
| Import Pipeline | `/api/fleet-compliance/import/*` | XLSX parse/validate/save/rollback workflow |
| Alert Engine | `/api/fleet-compliance/alerts/*` | Daily cron sweep + preview/trigger endpoints |
| Billing | `/api/stripe/*` | Checkout, customer portal, subscription webhook lifecycle |

## Stack

| Layer | Technology | Host | Notes |
|-------|-----------|------|------|
| Frontend + API | Next.js `^15.5.14` | Vercel | App Router, 27 API endpoints |
| Auth | Clerk `^6.38.2` | Clerk | Org-scoped auth and RBAC |
| Database | Neon Postgres | Neon | Multi-tenant data + audit events |
| AI Backend | FastAPI | Railway | Penny retrieval + Verizon Reveal adapter |
| Error Monitoring | Sentry `^10.46.0` | Sentry | Full SDK: errors, replay, logs, tunnel route, source maps |
| Log Monitoring | Datadog | Datadog | Vercel drain + long-retention audit index |
| Uptime | UptimeRobot Solo | UptimeRobot | 3 monitors, 1-minute checks, public status page |
| Rate Limiting | Upstash Redis | Upstash | Sliding window for Penny queries |
| Email | Resend | Resend | Compliance alert delivery |
| Billing | Stripe | Stripe | Subscription lifecycle + offboarding hooks |

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
migrations/        SQL migrations (10)
soc2-evidence/     Compliance evidence set (73 files)
docs/              Operational runbooks and status docs
tooling/           Python/data tooling and templates
archive/           Historical snapshots and retired prompts/docs
```

## Key Documentation

| File | Purpose |
|------|---------|
| `PLATFORM_OVERVIEW.md` | Canonical platform and control overview |
| `INDEX.md` | Current repository map and counts |
| `docs/STATUS.md` | Current execution status and milestone log |
| `docs/ROTATION_RUNBOOK.md` | Secret rotation procedures |
| `docs/GIT_WORKFLOW.md` | PR-only workflow and merge discipline |
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
