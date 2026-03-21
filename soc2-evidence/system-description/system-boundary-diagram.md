# System Boundary Diagram — PipelineX / Chief Sentinel

> SOC 2 Evidence | Phase 0 | Generated 2026-03-21

## Trust Boundary Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        TRUST BOUNDARY: Internet                     │
│                                                                     │
│   ┌──────── ──┐    ┌──────────┐    ┌──────────────┐                 │
│   │  Browser  │    │  Vercel  │    │  FMCSA.gov   │                 │
│   │  (User)   │    │  Cron    │    │  Public API  │                 │
│   └─────┬─────┘    └────┬─────┘    └──────┬───────┘                 │
│         │               │                 │                         │
└─────────┼───────────────┼─────────────────┼─────────────────────────┘
          │ HTTPS         │ Bearer token    │ HTTPS + API key
          ▼               ▼                 │
┌─────────────────────────────────────────────────────────────────────┐
│                  TRUST BOUNDARY: Vercel Edge / CDN                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Next.js 15 Application (App Router)                           │ │
│  │                                                                │ │
│  │  ┌──────────────────┐   ┌──────────────────────────────────┐   │ │
│  │  │   Middleware      │   │   Security Headers (vercel.json)│   │ │
│  │  │   (Clerk auth)   │   │   CSP · HSTS · X-Frame-Options   │   │ │
│  │  └────────┬─────────┘   └──────────────────────────────────┘   │ │
│  │           │                                                    │ │
│  │  ┌────────▼─────────────────────────────────────────────────┐  │ │
│  │  │                     API Routes                           │  │ │
│  │  │                                                          │  │ │
│  │  │  /api/chief/*          Fleet management CRUD             │  │ │
│  │  │  /api/chief/alerts/run Cron-triggered alert sweep        │  │ │
│  │  │  /api/chief/cron-health Health check (admin only)        │  │ │
│  │  │  /api/chief/fmcsa/*   FMCSA carrier lookup ──────────┐   │  │ │
│  │  │  /api/chief/import/*   Bulk XLSX import pipeline     │   │  │ │
│  │  │  /api/penny/query      AI compliance Q&A proxy ───┐  │   │  │ │
│  │  │  /api/invoices/*       Invoice management         │  │   │  │ │
│  │  │  /api/csp-report       CSP violation collector    │  │   │  │ │
│  │  └────────┬───────────────────────────────────────┬───┼──┼───┘ │ │
│  │           │                                       │   │  │     │ │
│  │  ┌────────▼─────────────────────────────────────┐ │   │  │     │ │
│  │  │              Business Logic (src/lib/)        │ │   │  │     │ │
│  │  │                                               │ │   │  │     │ │
│  │  │  chief-db.ts        DB operations             │ │   │  │     │ │
│  │  │  chief-data.ts      Data loading              │ │   │  │     │ │
│  │  │  chief-auth.ts      Role enforcement          │ │   │  │     │ │
│  │  │  chief-alert-engine Alert classification      │ │   │  │     │ │
│  │  │  chief-validators   Input validation          │ │   │  │     │ │
│  │  │  penny-access.ts    Penny role allowlist      │ │   │  │     │ │
│  │  │  penny-ingest.ts    Context builder           │ │   │  │     │ │
│  │  └────────┬──────────────────────────────────────┘ │   │  │     │ │
│  │           │                                        │   │  │     │ │
│  │  ┌────────▼──────────────────────────────────┐     │   │  │     │ │
│  │  │  Workspace Packages (@tnds/*)             │     │   │  │     │ │
│  │  │  types · ingest-core · retrieval-core     │     │   │  │     │ │
│  │  │  memory-core                              │     │   │  │     │ │
│  │  └───────────────────────────────────────────┘     │   │  │     │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                       │   │  │      │
└───────────────────────────────────────────────────────┼───┼──┼──────┘
                                                        │   │  │
          ┌─────────────────────────────────────────────┘   │  │
          │                                                 │  │
          ▼                                                 │  │
┌──────────────────────────┐                                │  │
│  TRUST BOUNDARY: Clerk   │                                │  │
│                          │                                │  │
│  Authentication &        │                                │  │
│  Authorization SaaS      │                                │  │
│                          │                                │  │
│  • Session management    │                                │  │
│  • Org-scoped roles      │                                │  │
│  • JWT validation        │                                │  │
│  • admin / member roles  │                                │  │
└──────────────────────────┘                                │  │
                                                            │  │
          ┌─────────────────────────────────────────────────┘  │
          │                                                    │
          ▼                                                    │
┌──────────────────────────┐  ┌────────────────────────────┐   │
│  TRUST BOUNDARY: Railway │  │  TRUST BOUNDARY: Resend    │   │
│                          │  │                            │   │
│  Pipeline Penny          │  │  Transactional Email       │   │
│  FastAPI Service         │  │  (Alert notifications)     │   │
│                          │  │                            │   │
│  • /health               │  │  • API key auth            │   │
│  • /query (LLM proxy)    │  │  • Compliance alert emails │   │
│  • /catalog              │  │  • Dry-run if key absent   │   │
│                          │  │                            │   │
│  Auth: X-Penny-Api-Key   │  └────────────────────────────┘   │
│  Providers: Anthropic,   │                                   │
│    OpenAI, Gemini,       │                                   │
│    Ollama                │                                   │
└──────────────────────────┘                                   │
                                                               │
          ┌────────────────────────────────────────────────────┘
          │
          ▼
┌──────────────────────────────────┐
│  TRUST BOUNDARY: Neon            │
│                                  │
│  Serverless Postgres             │
│                                  │
│  Tables:                         │
│  • chief_records (JSONB)         │
│  • cron_log (audit trail)        │
│  • chief_error_events            │
│  • invoice tables                │
│                                  │
│  Auth: DATABASE_URL conn string  │
│  TLS: enforced                   │
└──────────────────────────────────┘
```

## Mermaid Diagram

```mermaid
graph TB
    subgraph Internet["TRUST BOUNDARY: Internet"]
        Browser["Browser (User)"]
        VercelCron["Vercel Cron Scheduler"]
        FMCSA["FMCSA.gov Public API"]
    end

    subgraph Vercel["TRUST BOUNDARY: Vercel Edge / CDN"]
        subgraph NextApp["Next.js 15 App Router"]
            Middleware["Middleware\n(Clerk Auth)"]
            Headers["Security Headers\nCSP · HSTS · X-Frame-Options"]

            subgraph Routes["API Routes"]
                ChiefAPI["/api/chief/*\nFleet CRUD"]
                AlertRun["/api/chief/alerts/run\nCron Alert Sweep"]
                CronHealth["/api/chief/cron-health\nHealth Check"]
                FmcsaRoute["/api/chief/fmcsa/*\nCarrier Lookup"]
                ImportRoute["/api/chief/import/*\nBulk XLSX Import"]
                PennyQuery["/api/penny/query\nAI Compliance Q&A"]
                InvoiceAPI["/api/invoices/*\nInvoice Mgmt"]
                CSPReport["/api/csp-report\nCSP Violation Log"]
            end

            subgraph Logic["Business Logic (src/lib/)"]
                ChiefDB["chief-db.ts"]
                ChiefAuth["chief-auth.ts"]
                AlertEngine["chief-alert-engine.ts"]
                PennyAccess["penny-access.ts"]
                PennyIngest["penny-ingest.ts"]
                Validators["chief-validators.ts"]
            end

            subgraph Packages["@tnds/* Workspace Packages"]
                Types["types"]
                Ingest["ingest-core"]
                Retrieval["retrieval-core"]
                Memory["memory-core"]
            end
        end
    end

    subgraph Clerk["TRUST BOUNDARY: Clerk"]
        ClerkAuth["Authentication & Authorization\nSession mgmt · Org-scoped roles\nJWT validation · admin/member"]
    end

    subgraph Railway["TRUST BOUNDARY: Railway"]
        Penny["Pipeline Penny FastAPI\n/health · /query · /catalog"]
        LLM["LLM Providers\nAnthropic · OpenAI\nGemini · Ollama"]
    end

    subgraph Resend["TRUST BOUNDARY: Resend"]
        Email["Transactional Email\nCompliance alert delivery"]
    end

    subgraph Neon["TRUST BOUNDARY: Neon"]
        Postgres["Serverless Postgres"]
        Tables["chief_records · cron_log\nchief_error_events · invoices"]
    end

    %% User flows
    Browser -->|"HTTPS\nClerk session cookie"| Middleware
    VercelCron -->|"HTTPS\nBearer CHIEF_CRON_SECRET"| AlertRun
    Browser -->|"HTTPS\nCSP violation"| CSPReport

    %% Internal flows
    Middleware --> Routes
    Routes --> Logic
    Logic --> Packages

    %% External service flows
    ChiefAuth -.->|"HTTPS\nCLERK_SECRET_KEY"| ClerkAuth
    PennyQuery -->|"HTTPS\nX-Penny-Api-Key"| Penny
    Penny --> LLM
    AlertEngine -->|"HTTPS\nRESEND_API_KEY"| Email
    FmcsaRoute -->|"HTTPS\nFMCSA_API_KEY"| FMCSA
    ChiefDB -->|"TLS PostgreSQL\nDATABASE_URL"| Postgres
    Postgres --- Tables

    %% Styling
    classDef boundary fill:#f9f,stroke:#333,stroke-width:2px
    classDef external fill:#bbf,stroke:#333,stroke-width:2px
    classDef internal fill:#bfb,stroke:#333,stroke-width:1px
    classDef db fill:#fbb,stroke:#333,stroke-width:2px

    class Internet,Vercel,Clerk,Railway,Resend,Neon boundary
    class FMCSA,ClerkAuth,Penny,Email external
    class ChiefAPI,AlertRun,CronHealth,FmcsaRoute,ImportRoute,PennyQuery,InvoiceAPI,CSPReport internal
    class Postgres,Tables db
```

## Data Flow Summary

| Flow              | Source             | Destination             | Protocol       | Auth Method                 |
| ----------------- | ------------------ | ----------------------- | -------------- | --------------------------- |
| User requests     | Browser            | Vercel (Next.js)        | HTTPS          | Clerk session cookie        |
| Cron trigger      | Vercel Scheduler   | `/api/chief/alerts/run` | HTTPS          | Bearer `CHIEF_CRON_SECRET`  |
| DB operations     | Next.js API routes | Neon Postgres           | TLS PostgreSQL | Connection string           |
| Penny queries     | Next.js API        | Railway FastAPI         | HTTPS          | `X-Penny-Api-Key` header    |
| Alert emails      | Next.js API        | Resend API              | HTTPS          | `RESEND_API_KEY`            |
| FMCSA lookups     | Next.js API        | `mobile.fmcsa.dot.gov`  | HTTPS          | `FMCSA_API_KEY` query param |
| CSP reports       | Browser            | `/api/csp-report`       | HTTPS          | None (public endpoint)      |
| Auth verification | Next.js middleware | Clerk API               | HTTPS          | `CLERK_SECRET_KEY`          |

## Trust Boundary Definitions

| Boundary    | Owner                    | Controls                                    |
| ----------- | ------------------------ | ------------------------------------------- |
| Internet    | Public                   | No trust — all input validated at edge      |
| Vercel Edge | PipelineX team           | Middleware auth, CSP, security headers      |
| Clerk       | Clerk Inc. (3rd party)   | Session tokens, org membership, role claims |
| Neon        | Neon Inc. (3rd party)    | Data-at-rest encryption, TLS in transit     |
| Railway     | Railway Inc. (3rd party) | Penny API isolation, LLM provider routing   |
| Resend      | Resend Inc. (3rd party)  | Email delivery, sender verification         |
| FMCSA       | US DOT (government)      | Public carrier safety data                  |

## Secrets Inventory

| Secret              | Storage                   | Rotation         |
| ------------------- | ------------------------- | ---------------- |
| `CLERK_SECRET_KEY`  | Vercel env vars           | Clerk dashboard  |
| `DATABASE_URL`      | Vercel env vars           | Neon dashboard   |
| `PENNY_API_KEY`     | Vercel + Railway env vars | Manual           |
| `CHIEF_CRON_SECRET` | Vercel env vars           | Manual           |
| `RESEND_API_KEY`    | Vercel env vars           | Resend dashboard |
| `FMCSA_API_KEY`     | Vercel env vars           | FMCSA portal     |
