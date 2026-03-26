<div align="center">

# Fleet-Compliance Sentinel | Pipeline Punks

### Fleet & DOT Compliance Management Platform

Fleet-Compliance Sentinel is a SOC 2 Type I audit-ready multi-tenant SaaS for fleet compliance management, built by True North Data Strategies LLC.

[![Website](https://img.shields.io/badge/Website-pipelinepunks.com-blue?style=for-the-badge)](https://pipelinepunks.com)
[![TNDS](https://img.shields.io/badge/TNDS-truenorthstrategyops.com-0A8EA0?style=for-the-badge)](https://truenorthstrategyops.com)

<img src="public/PipelineX-penny.png" alt="PipelineX Penny" width="260" />

</div>

---

## What This Repo Contains

| Module | Path | Description |
|--------|------|-------------|
| **Fleet-Compliance** | `/fleet-compliance/*` | Fleet management dashboard — assets, drivers, permits, compliance, suspense, invoices, alerts, FMCSA lookups, maintenance tracking |
| **Pipeline Penny** | `/penny` | Document-grounded AI assistant for DOT/CFR compliance questions (multi-LLM: Anthropic, OpenAI, Gemini, Ollama) |
| **Import Pipeline** | `/api/fleet-compliance/import/*` | Multi-sheet XLSX upload with 12 collection schemas, field-level validation, and batch rollback |
| **Alert Engine** | `/api/fleet-compliance/alerts/*` | Daily compliance sweep via Vercel cron with Resend email delivery and dead-man switch monitoring |
| **FMCSA Lookup** | `/api/fleet-compliance/fmcsa/*` | Live carrier safety profile lookup via FMCSA QCMobile API |
| **Billing** | `/api/stripe/webhook` | Stripe subscription lifecycle with automated offboarding |

For comprehensive platform documentation, see [`PLATFORM_OVERVIEW.md`](PLATFORM_OVERVIEW.md).

---

## Stack

| Layer | Technology | Host | SOC 2 |
|-------|-----------|------|-------|
| Frontend + API | Next.js 15.5.14 (App Router) | Vercel | Type II |
| Auth | Clerk (org-scoped, role-based, MFA) | Clerk | Type II |
| Database | Neon Postgres (serverless) | Neon | Type II |
| AI Backend | FastAPI + multi-LLM orchestration | Railway | Compensating controls |
| Error Tracking | Sentry (PII scrubbing) | Sentry | Type II |
| Log Aggregation | Datadog (365-day retention) | Datadog | Type II |
| Rate Limiting | Upstash Redis (sliding window) | Upstash | SOC 2 |
| Email | Resend (compliance alerts) | Resend | -- |
| Billing | Stripe (subscription lifecycle) | Stripe | Type II |
| Uptime | UptimeRobot | UptimeRobot | -- |
| Alerts | Slack (Datadog monitors) | Slack | -- |
| Packages | @tnds/types, ingest-core, retrieval-core, memory-core | Workspace monorepo | -- |

---

## Project Structure

```
src/
  app/             Next.js pages (35+ routes) and API routes (21 endpoints)
  components/      React components (Fleet-Compliance forms, error boundaries, nav)
  lib/             Server utilities (DB, auth, validators, alert engine, Penny ingest, rate limiting)
docs/              Operational reference docs (status, Railway config, evals, migration)
packages/          @tnds workspace packages (types, ingest, retrieval, memory)
scripts/           Build/sync/eval/compliance scripts
knowledge/         Chunked CFR docs for Penny RAG (1,100+ files)
tooling/           Fleet-Compliance Sentinel Python tools (import generator, CFR scraper)
railway-backend/   FastAPI Penny backend (deployed on Railway)
migrations/        SQL migration files (7 migrations)
soc2-evidence/     SOC 2 Type I compliance evidence (60+ artifacts, 10 subdirectories)
evals/             Penny evaluation results and test questions
archive/           Historical snapshots (pre-cleanup artifacts)
```

---

## Key Documentation

| File | Purpose |
|------|---------|
| [`PLATFORM_OVERVIEW.md`](PLATFORM_OVERVIEW.md) | Comprehensive platform overview — all capabilities, compliance, and infrastructure |
| [`INDEX.md`](INDEX.md) | Full repository file index |
| [`docs/STATUS.md`](docs/STATUS.md) | Current phase status, infrastructure status, open findings |
| [`docs/FLEET_COMPLIANCE_TODO_v2.md`](docs/FLEET_COMPLIANCE_TODO_v2.md) | Phase-based implementation tracker (Phases 0-8, all complete) |
| [`docs/RAILWAY_CONFIG.md`](docs/RAILWAY_CONFIG.md) | Railway environment variable reference |
| [`soc2-evidence/system-description/ARCHITECTURE.md`](soc2-evidence/system-description/ARCHITECTURE.md) | System architecture (canonical) |
| [`soc2-evidence/system-description/ENV_EXAMPLE.md`](soc2-evidence/system-description/ENV_EXAMPLE.md) | Environment variable reference (53 vars, canonical) |

---

## Getting Started

```bash
# Install dependencies
npm install

# Check environment variables (validates 53 vars)
npx tsx scripts/check-env.ts

# Run development server
npm run dev

# Build for production
npm run build

# Run compliance checks
npm run compliance:legal-check    # Verify privacy/terms pages
npm run compliance:ops-check      # Check operational gaps
```

---

## Deployment

| Target | Method | Domain |
|--------|--------|--------|
| Vercel (frontend + API) | Auto-deploy on push to `main` | www.pipelinepunks.com |
| Railway (Penny backend) | Auto-deploy from `railway-backend/` on push | pipeline-punks-v2-production.up.railway.app |

See `RAILWAY_CONFIG.md` for required Railway environment variables.

---

## SOC 2 Compliance Status

**Overall Readiness: 8.5/10 — Auditor-Ready**
**Observation Window: 2026-03-24 to 2026-06-22 (90 days)**

| Phase | Scope | Score |
|-------|-------|-------|
| 0 — Baseline Audit | Repo audit, dependency analysis, secret exposure | 9/10 |
| 1 — Infrastructure Hardening | 8 security headers, Google Drive removal, env validation | 9/10 |
| 2 — Data Integrity + Access Control | Auth middleware (12+ routes), field validators, parameterized queries | 8/10 |
| 3 — Audit Logging + Observability | Structured logging (17+ routes), Sentry PII scrub, Datadog drain | 8/10 |
| 4 — Multi-Tenant Org Scoping | Org isolation, trial gating, Stripe webhooks, audit trail | 9/10 |
| 5 — Penny AI Security | Server-side context, prompt injection defense, OWASP LLM assessment | 9/10 |
| 6 — Security Hardening | Rate limiting, dependency audit (0 vulns), secret rotation, pentest guide | 8/10 |
| 7 — Incident Response | IRP (P1-P4), escalation chain, 13-vendor registry, offboarding automation | 9/10 |
| 8 — Compliance Documentation | 8 SOC 2 policies, privacy/terms remediation, CODEOWNERS, legal checks | 9/10 |

Evidence binder: `soc2-evidence/` (60+ artifacts across 9 control domains)

---

## Monitoring & Observability

| Service | Purpose | Integration |
|---------|---------|-------------|
| **Sentry** | Error tracking + performance (10% trace sampling) | `@sentry/nextjs` with PII scrubbing |
| **Datadog** | Log aggregation + analysis (2-index: 7d general, 365d audit) | Vercel log drain + 9-processor pipeline |
| **Slack** | Alert notifications | Datadog monitors → Slack channels |
| **UptimeRobot** | Uptime monitoring | Public endpoint health checks |
| **Cron Health** | Dead-man switch (24h threshold) | `/api/fleet-compliance/cron-health` |

---

## Deployment Origin

| Field | Value |
|-------|-------|
| Organization | True North Data Strategies LLC |
| Security Officer | Jacob Johnston |
| GitHub Org | Pipeline-Punks |
| Repository | pipeline-punks-pipelinex-v2 |
| Vercel Project | pipeline-punks-pipelinex-v2 |
| Production URL | https://www.pipelinepunks.com |
| Deploy Method | Auto-deploy on push to `main` |
