# PROGRESS.md — Fleet-Compliance Sentinel

**Last Updated:** 2026-04-06
**Update this file when phases complete or major decisions are made.**

---

## Phase Status

| Phase | Status | Target |
|-------|--------|--------|
| Phase 0 — Baseline Audit | Complete (9/10) | 2026-03-20 |
| Phase 1 — Infrastructure Hardening | Complete (9/10) | 2026-03-20 |
| Phase 2 — Data Integrity + Access Control | Complete (8/10) | 2026-03-21 |
| Phase 3 — Audit Logging + Observability | Complete (8/10) | 2026-03-24 |
| Phase 4 — Multi-Tenant Org Scoping | Complete (9/10) | 2026-03-25 |
| Phase 5 — Penny AI Security | Complete (9/10) | 2026-03-25 |
| Phase 6 — Security Hardening | Complete (8/10) | 2026-03-25 |
| Phase 7 — Incident Response + Business Continuity | Complete (9/10) | 2026-03-25 |
| Phase 8 — Compliance Documentation + Policy | Complete (9/10) | 2026-03-25 |
| Module Integration Sprint (Phases 1-6) | Complete | 2026-03-31 |
| Workstream A — Enterprise Function Calling Hardening (A0-A8) | Complete | 2026-04-01 |
| Workstream B — Training Command (B1-B9) | Complete | 2026-04-01 |
| Training Production Readiness Audit | Complete (findings documented) | 2026-04-02 |
| Onboarding Phase 5 Hardening (P5-T1 to P5-T3) | Complete | 2026-04-06 |
| Onboarding Phase 6 Release Gate (P6-T1 to P6-T4) | In Progress | 2026-04-06 |
| Documentation Refresh | Complete | 2026-04-06 |
| SOC 2 Type I Audit | Observation window active | 2026-06-22 |

---

## What's Production

- Clerk org-scoped authentication with admin/member roles
- Neon PostgreSQL with 19+ migrations and org_id isolation on every query
- Stripe billing: trial/starter/pro/enterprise tiers with checkout and webhooks
- Module gateway with 7 hardening layers (ACL, validation, sandbox, retry, cost, audit, tenant isolation)
- 15+ command modules gated by plan tier and org toggle
- Training LMS: 12 hazmat modules with decks, assessments, certificates, compliance auto-update
- Employee onboarding: 7-step deterministic pipeline with intake tokens and outbox pattern
- Pipeline Penny AI: CFR retrieval, org context, training index, knowledge catalog
- Compliance alerts: daily cron sweep with email notifications via Resend
- Telematics: Verizon Reveal sync adapter with risk dashboard
- Monitoring: Sentry (errors/replay), Datadog (logs), UptimeRobot (uptime)
- Rate limiting: Upstash Redis per-org throttling
- Sidebar: module-aware filtering by enabled modules and user role

---

## What's Known Broken

- C-1: Training schema rollout not deployment-safe (missing-table failures for new orgs)
- C-2: Assessment pass/fail is client-trusted (no server-side score validation)
- C-3: Completion/cert issuance possible without assignment/deck completion
- C-6: New orgs have zero assignable training plans
- H-1: Training management data exposed to non-admin members
- H-3: Answer key exposed to client bundle
- H-4: Certificate storage on ephemeral local disk (lost on redeploy)
- S-1: Tailwind utility pipeline missing from global stylesheet (unstyled training components)
- Onboarding Phase 6 release gate tasks P6-T2 through P6-T4 in progress

---

## Architectural Decisions Made

| Decision | What Was Decided | Why | Date |
|---------|-----------------|-----|------|
| Neon over Supabase | Use Neon serverless PostgreSQL | Better Vercel integration, serverless driver, lower cost at scale | 2026-03 |
| Clerk for auth | Clerk org-scoped auth over NextAuth | Built-in org/role management, session claims, webhook support | 2026-03 |
| Parameterized SQL over ORM | Raw tagged template SQL over Prisma/Drizzle | Simpler, more control, better audit visibility, fewer abstraction bugs | 2026-03 |
| Module gateway pattern | Custom registry/runner over generic API gateway | Needed allowlisted actions, ACL, cost tracking, audit trail per module | 2026-03 |
| Onboarding state machine | Deterministic 7-step pipeline over event-driven saga | Simpler to reason about, easier to test, clearer failure modes | 2026-04 |
| Outbox pattern for async events | Database outbox with retry/backoff over direct webhook calls | Reliable delivery, idempotent processing, no lost events | 2026-04 |
| Intake tokens over magic links | Signed JWT + hash-based tokens for self-service intake | Supports offline issuance, admin control, expiry, audit trail | 2026-04 |
| Onboarding at trial tier | Available to all plan tiers, not pro-only | Every org needs employee onboarding from day one | 2026-04 |
| Training content from markdown | Author training in markdown, generate decks/assessments | Versionable, diffable, easy to update, bulk authoring | 2026-04 |
| Railway for Penny backend | Separate FastAPI service over Next.js API route | Isolate LLM costs, independent scaling, Python ML ecosystem | 2026-03 |

---

## Vendor / Integration Decisions

| Integration | Decision | Notes |
|------------|---------|-------|
| Vercel | Production hosting | Auto-deploy on merge to main, preview deploys on PR |
| Railway | Penny AI backend | FastAPI, LLM provider abstraction (Anthropic/OpenAI/Gemini) |
| Stripe | Billing | 4 tiers, checkout sessions, customer portal, webhooks |
| Resend | Transactional email | Compliance alerts, onboarding invites, training notifications |
| Sentry | Error tracking | PII hardened, session replay, tunnel route, 10%/100% sampling |
| Datadog | Log aggregation | us5 site, audit/general index split, log drain |
| UptimeRobot | Uptime monitoring | Solo plan, 3 monitors, 1-min checks, public status page |
| Upstash | Rate limiting | Redis-backed, per-org throttling |
| Verizon Reveal | Telematics | Sync adapter, demo mode fallback, webhook support planned |
| Carahsoft | Future VAR path | Google Cloud certifications in progress |

---

## Success Metrics

- SOC 2 Type I certification achieved by June 22, 2026
- First 3-5 paying fleet compliance clients by end of Q2 2026
- Zero PII-in-logs incidents during observation window
- All 6 critical training findings resolved before first client
- 99.9% uptime target maintained
- Penny query latency under 5 seconds p95
- Complete monthly compliance evidence collection on schedule

---

## Evidence Archive

Compliance evidence is stored at: `/compliance/`

```
/compliance/
  /monthly/
  /weekly/
  /incidents/
  /access-control/
  /logging/
```
