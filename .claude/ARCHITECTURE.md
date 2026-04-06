# ARCHITECTURE.md — Fleet-Compliance Sentinel

**Version:** 1.0 | **Last Updated:** 2026-04-06
**Status:** Production (SOC 2 observation window active, first paying client targeted Q2 2026)
**Full doc:** `/docs/ARCHITECTURE.md`

---

## System Overview

Fleet-Compliance Sentinel (FCS) is a multi-tenant B2B SaaS platform that gives small fleet operators (5-20 vehicles) real-time visibility into DOT/FMCSA compliance, employee credentials, training, dispatch, and financial operations. Built on Next.js 15 App Router with Clerk org-scoped auth, Neon PostgreSQL, and a modular command architecture gated by plan tier.

---

## Service Map

```
                    [Browser / Client]
                          |
                    [Clerk Auth SDK]
                          |
                   [Vercel Edge / CDN]
                          |
              [Next.js 15 App Router]
              /         |         \
    [API Routes]  [Server Components]  [Client Components]
         |              |                     |
    [Fleet-Compliance   |              [React 18 + Tailwind]
     Auth Middleware]    |
         |              |
    [Module Gateway] ---|--- [Penny Proxy] --> [Railway FastAPI Backend]
         |                                          |
    [Neon PostgreSQL]                    [Anthropic / OpenAI / Gemini]
    (org_id isolation)                   [Knowledge Vector Store]
         |
    [Stripe Billing]
    [Resend Email]
    [Upstash Redis]
    [Sentry / Datadog]
    [UptimeRobot]
```

---

## Control Ownership

| Area | Tool | What It Controls |
|------|------|-----------------|
| Authentication | Clerk | User identity, org membership, session claims, role resolution |
| Authorization | Fleet-Compliance Auth | Admin/member role enforcement, API route guards, module access |
| Database | Neon PostgreSQL | All persistent state, 19+ migrations, org_id tenant isolation |
| Billing | Stripe | Plan tiers (trial/starter/pro/enterprise), checkout, webhooks |
| AI Engine | Railway FastAPI + Penny | LLM queries, knowledge retrieval, training content, org context |
| Module Gateway | Custom registry/runner | Action allowlisting, ACL, retry, sandbox, cost tracking, audit |
| Monitoring | Sentry + Datadog | Error tracking, session replay, structured logs, audit index |
| Uptime | UptimeRobot | 3 monitors, 1-min checks, public status page |
| Rate Limiting | Upstash Redis | Per-org API throttling, Penny session limits |
| Email/Alerts | Resend | Compliance alerts, training notifications, onboarding invites |
| Deployment | Vercel | Auto-deploy on merge to main, preview deploys on PR |
| Source Control | GitHub | Branch protection on main, PR-required workflow |

---

## Data Flow — Employee Onboarding Intake

```
Admin issues intake token
    |
    v
[issueSignedIntakeToken] --> [createOnboardingIntakeToken (DB)]
    |
    v
Intake URL sent to employee (or via invite email)
    |
    v
Employee opens /intake/[token]
    |
    v
[verifySignedIntakeToken] --> [lookupByToken] --> validate status/expiry/org binding
    |
    v
Employee submits self-service form
    |
    v
[claimOnboardingIntakeToken] (optimistic lock)
    |
    v
[createEmployeeAndStartRun] or [updateEmployeeAndStartRun]
    |
    v
7-step deterministic pipeline:
  1. validate-input
  2. create-employee-profile (or update)
  3. assign-training
  4. generate-tasks
  5. send-notifications
  6. emit-audit-events
  7. finalize-run
    |
    v
[consumeOnboardingIntakeToken] --> [sendOnboardingInvite] (if enabled)
    |
    v
Outbox events queued for async processing (retry/backoff)
```

---

## Current State — Production

| Capability | Status | Notes |
|-----------|--------|-------|
| Clerk org-scoped auth | Live | Admin/member roles, session claims |
| Neon PostgreSQL multi-tenant | Live | 19+ migrations, org_id on every query |
| Stripe billing integration | Live | Trial/starter/pro/enterprise, webhooks |
| Module gateway (7 hardening layers) | Live | ACL, validation, sandbox, retry, cost, audit, tenant isolation |
| Training LMS (12 hazmat modules) | Live | Decks, assessments, certificates, compliance auto-update |
| Employee onboarding orchestration | Live | 7-step pipeline, intake tokens, outbox pattern |
| Pipeline Penny AI | Live | CFR retrieval, org context, training index, catalog |
| Compliance alerts/cron | Live | Daily sweep, email notifications via Resend |
| Telematics (Verizon Reveal) | Live | Sync adapter, risk dashboard, demo mode fallback |
| Sentry error tracking | Live | PII hardening, session replay, tunnel route |
| Datadog logging | Live | Audit/general index split, log drain |
| UptimeRobot monitoring | Live | 3 monitors, public status page |

---

## Current State — Known Gaps

| Gap | Impact | Effort | Priority |
|-----|--------|--------|---------|
| C-1: Training schema rollout not deployment-safe | Live missing-table failures on new orgs | Medium | Critical |
| C-2: Assessment pass/fail is client-trusted | Compliance liability — client can fabricate pass | Medium | Critical |
| C-3: Completion/cert without assignment/deck completion | Bypass training requirements | Medium | Critical |
| C-6: New orgs have zero assignable training plans | Training unusable for new customers | Low | Critical |
| H-1: Training management data exposed to non-admin | Data leakage to members | Low | High |
| H-3: Answer key exposed to client | Assessment integrity compromise | Low | High |
| H-4: Certificate storage is ephemeral local disk | Certs lost on redeploy | Medium | High |
| M-2: /fleet-compliance/tools hydration issue | UI rendering inconsistency | Low | Medium |
| S-1: Tailwind utility pipeline missing from global stylesheet | Unstyled training components | Low | Low |

---

## Evolution Roadmap

### Near Term (April-May 2026)
- Fix C-1 through C-6 training critical findings before first paying client
- Server-side assessment score validation (C-2)
- Complete Phase 6 release-gate evidence pack for onboarding
- Compliance evidence folder structure creation and first monthly collection

### Mid Term (June-August 2026)
- SOC 2 Type I audit (eligible June 22, 2026)
- Onboard first 3-5 paying fleet compliance clients
- Google Cloud certification path
- Certificate storage migration to durable object storage (S3/GCS)

### Long Term (Q3-Q4 2026)
- SOC 2 Type II observation period
- Carahsoft VAR reseller partnership
- Chrome extension product line
- Forward Operating Base platform build-out
- Employee hiring and team scaling

---

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| API route response (p95) | ~200ms | <300ms |
| Page load (LCP) | ~1.5s | <2.5s |
| Uptime | 99.8% | 99.9% |
| Error rate (Sentry) | <0.5% | <0.1% |
| Penny query latency | ~3s | <5s |
| Training deck render | ~500ms | <1s |

---

## Key Files

| File | Location | Purpose |
|------|---------|---------|
| Full architecture | `/docs/ARCHITECTURE.md` | Complete system design |
| Security rules | `.claude/SECURITY.md` | Compliance controls, hard rules |
| Stack versions | `.claude/STACK.md` | Versions, packages, conventions |
| Dev commands | `.claude/COMMANDS.md` | Run, build, deploy, test |
| Active context | `.claude/activeContext.md` | What's being worked on now |
| Progress tracker | `.claude/PROGRESS.md` | Phase status and decisions |
| Module gateway contract | `docs/integration/MODULE_GATEWAY_CONTRACT.md` | Gateway API contract |
| Hardening report | `docs/integration/ENTERPRISE_FUNCTION_CALLING_HARDENING.md` | 7-layer hardening spec |
| Training audit | `docs/integration/TRAINING_GATEWAY_AUDIT_2026-04.md` | Training production readiness |
