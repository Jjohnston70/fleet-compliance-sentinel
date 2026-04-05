# STACK.md — Fleet Compliance Sentinel

**Last Updated:** 2026-04-04
**Rule:** If it's not listed here, ask before adding it.

---

## Runtime Versions

| Technology | Version | Notes |
|-----------|---------|-------|
| Node.js | 20.x | Do not use Node 18 or 22 |
| Python | 3.11 | Railway backend |
| TypeScript | 5.x strict mode | Strict is enforced — no `any` without justification |
| Next.js | 14.x | App Router — not Pages Router |
| FastAPI | 0.111 | Railway AI backend |
| Tailwind CSS | 3.x | Utility classes only |

---

## Package Manager

**npm** — not yarn, not pnpm. Use npm everywhere. If a package install fails, debug it — don't switch managers.

---

## Frontend (Next.js / Vercel)

| Package | Purpose |
|---------|---------|
| Next.js 14 | Framework (App Router) |
| Clerk | Auth, sessions, org management |
| Tailwind CSS | Styling |
| Drizzle ORM | Database queries (type-safe) |
| Stripe | Billing |
| Resend | Transactional email |
| Sentry | Error tracking |

**Conventions:**
- App Router only. No `pages/` directory.
- Server components by default. Client components only when required.
- `use client` must be justified — state, event handlers, browser APIs.
- API routes live in `app/api/`. Every route requires auth middleware.
- No secrets in client bundle. Use `NEXT_PUBLIC_` prefix only for non-sensitive config.

---

## Backend (FastAPI / Railway)

| Package | Purpose |
|---------|---------|
| FastAPI 0.111 | API framework |
| FAISS | Vector store (CFR chunks) |
| LangChain | RAG pipeline orchestration |
| Anthropic SDK | Claude API calls |
| Pydantic | Data validation |
| Uvicorn | ASGI server |

**Conventions:**
- Every endpoint requires `org_id` in request context — enforced by auth dependency.
- No PII in log outputs. Use `logger.info("penny.query", extra={"org_id": org_id})` not user names.
- Input validation via Pydantic models — no raw dict access.
- Context limit: 8KB max injected into Penny's prompt.

---

## Database (Neon Postgres)

**ORM:** Drizzle ORM (TypeScript) — used in Next.js API routes.

**Hard rules:**
- Every query scoped to `org_id`. No exceptions.
- Schema changes via migration files — never raw `ALTER TABLE` in production.
- No raw SQL strings in application code. Use Drizzle query builder.
- Connection pooling via Neon serverless driver.

**Schema location:** `/src/db/schema/`
**Migrations:** `/src/db/migrations/`

---

## Vector Store (FAISS)

- 25,616 CFR 49 chunks indexed
- Local to Railway container
- Query via FastAPI `/api/penny/query`
- Do not modify chunk structure without updating PENNY_LIBRARY manifests

---

## Auth (Clerk)

- All auth flows through Clerk — do not build custom auth.
- RBAC: `admin`, `member` roles enforced at route level.
- Org isolation: `orgId` extracted from Clerk session, passed to every DB query.
- Webhook events for billing sync (Stripe → Clerk org metadata).

---

## Infrastructure

| Service | Purpose | Config Location |
|---------|---------|----------------|
| Vercel | Frontend deploy | `vercel.json` |
| Railway | FastAPI backend | `railway.toml` |
| Neon | Postgres database | `DATABASE_URL` env var |
| Datadog | Audit logging | `DD_API_KEY` env var |
| Sentry | Error tracking | `SENTRY_DSN` env var |
| GitHub | CI/CD, change management | `.github/workflows/` |

---

## Environment Variables

**Pattern:** Never hardcode. Always read from environment.

| Variable | Where It Lives | Used By |
|---------|--------------|---------|
| `DATABASE_URL` | Vercel + Railway | DB connection |
| `CLERK_SECRET_KEY` | Vercel | Auth backend |
| `NEXT_PUBLIC_CLERK_*` | Vercel | Auth frontend |
| `ANTHROPIC_API_KEY` | Railway | Penny LLM calls |
| `DD_API_KEY` | Railway | Audit logging |
| `SENTRY_DSN` | Vercel + Railway | Error tracking |
| `STRIPE_SECRET_KEY` | Vercel | Billing |
| `STRIPE_WEBHOOK_SECRET` | Vercel | Webhook validation |
| `RESEND_API_KEY` | Vercel | Email |
| `CRON_SECRET` | Vercel | Cron job protection |

---

## Code Conventions

**TypeScript:**
- Strict mode. No `any` without a comment explaining why.
- Explicit return types on exported functions.
- Interfaces over type aliases for object shapes.

**Python:**
- PEP 8 style.
- Type hints on all function signatures.
- Pydantic models for all request/response shapes.
- No bare `except:` — catch specific exceptions.

**Naming:**
- Files: `kebab-case.ts` / `snake_case.py`
- Components: `PascalCase`
- Functions/variables: `camelCase` (TS) / `snake_case` (Python)
- Database columns: `snake_case`
- Environment variables: `SCREAMING_SNAKE_CASE`

**Comments:**
- Explain why, not what.
- Compliance-critical logic gets a comment citing the control it serves.
- Example: `// SOC 2 CC6.1 — tenant isolation enforced here`
