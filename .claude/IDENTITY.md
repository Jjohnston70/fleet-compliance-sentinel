# IDENTITY.md — Who Is Running This Project

**Classification:** Internal — Agent Context
**Last Updated:** 2026-04-06

---

## The Person You're Working With

**Name:** Jacob Johnston
**Company:** True North Data Strategies (SBA-certified VOSB/SDVOSB)
**Location:** Colorado Springs, CO
**Contact:** jacob@truenorthstrategyops.com | 555-555-5555
**Background:** 20-year Army veteran (Airborne Infantry), service-disabled, Bronze Star recipient. Runs TNDS as a one-person consultancy scaling toward employees with family support (Veronica, Nic, Tristan). Also operates Pipeline Punks (education/publishing), Forward Operating Base (veteran support platform), and Built Different Apparel.

---

## How Jacob Works

**Communication style:** Direct, no-fluff, military-influenced clarity. Outcomes over features. No fence-sitting when asked for opinions. No emojis in documentation. Provide step-by-step logic with clear reasoning. Include full comments and Logger.log() or print outputs for testing. Proactively suggest improvements and better strategies.

**Decision speed:** Fast. Expects options presented as tradeoffs, not open-ended questions. Wants architecture explanations, ASCII flows, risks, and gotchas up front. Will say "just do it" for tactical work and "walk me through it" for strategic decisions.

**What they want from you:** Production-ready deliverables, not proof-of-concept. Error handling, input validation, and clear documentation non-technical clients can follow. Ask whether to rewrite entire scripts or provide entry point before/after locations. Real outcomes beat shiny tools. Always provide reference links when recommending tools.

---

## Why This Project Exists

Fleet-Compliance Sentinel (FCS) is the flagship product of True North Data Strategies. It exists because small fleet operators (5-20 vehicles) are drowning in DOT/FMCSA compliance paperwork, scattered data across texts/paper/spreadsheets, and can't take a day off without things falling apart. FCS gives them a Command Center with real-time visibility into compliance status, employee credentials, training, dispatch, and financial operations — all behind a multi-tenant SaaS platform with SOC 2 controls baked in from day one.

---

## What They're Building Toward

1. SOC 2 Type I certification by June 22, 2026 (observation window started March 24, 2026)
2. First paying fleet compliance client during Q2 2026
3. Google Cloud certifications and VAR reseller path through Carahsoft
4. Scale from consultancy to product company with recurring SaaS revenue
5. Chrome extensions and SaaS tools beyond just client services
6. Pipeline Punks as education/publishing arm for system design and automation
7. Forward Operating Base veteran support platform (nonprofit transition planned)

---

## Domain Knowledge

- DOT/FMCSA fleet compliance: DQ files, hazmat endorsements, CDL tracking, medical card expirations, 49 CFR 172.704 training requirements
- PHMSA hazmat training: ERG 2024, OTIS requirements, security awareness, modal-specific regulations
- SOC 2 compliance: Trust Service Criteria, evidence collection, observation windows, audit readiness
- Multi-tenant B2B SaaS: Clerk org-scoped auth, plan-tier gating, module-based feature flags
- Small business operations: dispatch, asset tracking, invoicing, proposals, contracts, employee onboarding

---

## Project-Specific Context

- FCS is deployed on Vercel (frontend) with a Railway FastAPI backend for Pipeline Penny AI
- Database is Neon PostgreSQL with 19+ migrations, org_id isolation on every query
- Auth is Clerk with admin/member roles, org-scoped session claims
- Billing is Stripe with trial/starter/pro/enterprise tiers
- Module system: 15+ command modules, each gated by plan tier and org toggle
- Onboarding has two flows: org onboarding (company setup) and employee orchestration (7-step pipeline with intake tokens)
- Training LMS is built in with 12 hazmat modules, slide decks, assessments, certificates
- Monitoring: Sentry (errors), Datadog (logs), UptimeRobot (uptime), Upstash Redis (rate limiting)

---

## What "Done" Means to Jacob

Production-ready. Not "it works on my machine." It means: auth is enforced, tenant isolation is verified, audit events are emitted, error handling doesn't swallow failures, documentation exists that a non-technical client can follow, and the SOC 2 auditor could review it cold. Fixed scope, fixed price. No open-ended projects. No surprise invoices.
