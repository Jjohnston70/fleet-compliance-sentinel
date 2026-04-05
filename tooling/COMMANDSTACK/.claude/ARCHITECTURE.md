# ARCHITECTURE.md — Fleet Compliance Sentinel

**Version:** 2.0 | **Last Updated:** 2026-04-04
**Status:** Production + Active Evolution to CommandStack Platform
**Full doc:** `/docs/ARCHITECTURE.md`

---

## System Overview

Fleet Compliance Sentinel is a multi-tenant DOT compliance SaaS for petroleum and pipeline operators.
Pipeline Penny is the embedded RAG AI assistant trained on CFR 49 regulations.

**Assessment:** Production-grade for operations. Prototype-grade for AI. Score: 6.5/10 (World Model analysis).

---

## Service Map

```
[User Browser]
      |
[Next.js 14 — Vercel]          ← Frontend + API routes
      |
[Clerk Auth Layer]             ← Auth, sessions, RBAC, org management
      |
[FastAPI — Railway]            ← AI backend, Penny RAG pipeline
      |
[Neon Postgres]                ← Primary relational store (multi-tenant)
[FAISS]                        ← Vector store (25,616 CFR chunks, local to Railway)
      |
[Datadog]                      ← Audit logging (SOC 2 backbone)
[Sentry]                       ← Error tracking (no PII allowed)
[UptimeRobot]                  ← Availability monitoring
      |
[Resend]                       ← System email (notifications only)
[Stripe]                       ← Subscription billing
[GitHub]                       ← Change management + CI/CD
```

---

## Control Ownership

| Area | Tool | What It Controls |
|------|------|-----------------|
| Identity | Clerk | Auth, sessions, RBAC, org isolation |
| App Layer | Vercel | Frontend, API routes, edge |
| AI Backend | Railway | Penny RAG pipeline, FastAPI |
| Database | Neon | Tenant data (org_id isolated) |
| Vector Store | FAISS | CFR 49 chunk retrieval |
| Audit Logging | Datadog | All data access events |
| Error Tracking | Sentry | Exceptions (sanitized) |
| Monitoring | UptimeRobot | Uptime SLA |
| Email | Resend | Alerts, notifications |
| Billing | Stripe | Subscription lifecycle |
| Code | GitHub | Change management, PR approvals |

---

## Data Flow — Penny Query

```
User submits compliance question
      |
Next.js API route (auth check + org_id extraction)
      |
FastAPI /api/penny/query
      |
FAISS vector search (top-k CFR chunks)
      |
[NEW] Citation validation (post-generation, against vector store)
      |
Claude / LLM synthesis
      |
Response returned + audit logged
      |
[NEW] Outcome tracking (7-day follow-up)
```

---

## Current State — Production Strengths

| Capability | Status | Notes |
|-----------|--------|-------|
| Telematics (Verizon Reveal) | Production | Real-time GPS, risk scoring |
| Automated compliance alerts | Production | Daily cron, date-based triggers |
| Training LMS + hazmat certs | Production | Auto-updates cert status on completion |
| Driver qualification (DQ) files | Production | Manual import |
| Module gateway | Production | Closed feedback loop on latency/errors |
| Audit logging (Datadog) | Production | SOC 2 backbone |

---

## Current State — Critical Gaps (Fix Now)

| Gap | Impact | Effort | Priority |
|-----|--------|--------|---------|
| Knowledge freshness monitoring | Penny gives outdated CFR advice | 2-3 days | CRITICAL |
| Citation validation | Penny cites hallucinated regulations | 2 days | CRITICAL |
| Outcome tracking | No validation that advice prevented violations | 1 week | CRITICAL |
| Penny prediction validation | Open loop — no accuracy measurement | 1 week | HIGH |

---

## Evolution Roadmap

### Now — Week 1-2 (No Architecture Change)
- Knowledge freshness: Daily hash comparison of CFR sources
- Citation validation: Post-generation check against FAISS vector store
- Outcome tracking: 7-day follow-up email via alert engine

### Month 1 — Graph-Augmented RAG
- Neo4j: 100+ regulatory relationships extracted
- LightRAG: Dual retrieval (vector + graph)
- Intent classifier: Route simple vs. multi-hop queries
- A/B test: 50/50 split, measure improvement

### Month 2 — Scale + Validate
- 500+ Neo4j relationships
- Automate graph extraction
- Outcome tracking data: target 30% response rate
- Fleet Command module extraction (CommandStack prep)

### Month 3 — Decision Gate
- Evaluate: Continue FCS evolution OR migrate to CommandStack
- Decision is data-driven — not assumption-driven
- Document rationale, commit to chosen path

---

## CommandStack Context

CommandStack is the parallel platform build (Option B — 3-month timeline):
- Month 1: Platform core + graph RAG (LightRAG/Neo4j)
- Month 2: Fleet Command as first module
- Month 3: Realty Command + production launch at commandstack.com

FCS evolution and CommandStack build run in parallel. Month 3 gate decides relationship between them.

---

## Performance Targets

| Metric | Current | Target |
|--------|---------|--------|
| Vector query p95 | 1.2s | 1.0s |
| Hybrid query p95 | N/A | 1.5s |
| Single-hop accuracy | 78% | 85% |
| Multi-hop accuracy | 42% | 75% |
| Citation accuracy | Unknown | 95% validated |

---

## Key Files

| File | Location | Purpose |
|------|---------|---------|
| Full architecture | `/docs/ARCHITECTURE.md` | Complete World Model analysis + roadmap |
| Security rules | `.claude/SECURITY.md` | SOC 2 controls, hard rules |
| Stack versions | `.claude/STACK.md` | Versions, packages, conventions |
| Dev commands | `.claude/COMMANDS.md` | Run, build, deploy, test |
| Active context | `.claude/memory/activeContext.md` | What's being worked on now |
