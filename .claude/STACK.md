# STACK.md — Fleet-Compliance Sentinel

**Last Updated:** 2026-04-06
**Rule:** If it's not listed here, ask before adding it.

---

## Runtime Versions

| Technology | Version | Notes |
|-----------|---------|-------|
| Node.js | 20.x LTS | Required by Next.js 15 |
| TypeScript | ^5.3.3 | Strict mode enabled |
| Python | 3.11+ | Railway backend (FastAPI), tooling scripts |
| npm | 10.x | Workspace-enabled monorepo |

---

## Package Manager

**npm** — use this everywhere. Do not switch managers mid-project.

---

## Frontend

| Package | Purpose |
|---------|---------|
| next ^15.5.14 | App Router, server components, API routes |
| react ^18.3.1 | UI library |
| react-dom ^18.3.1 | DOM rendering |
| @clerk/nextjs ^7.0.8 | Authentication, org-scoped sessions |
| tailwindcss ^3.4.19 | Utility-first CSS |
| react-markdown ^10.1.0 | Markdown rendering (training decks, Penny) |
| remark-gfm ^4.0.1 | GitHub-flavored markdown tables/lists |
| recharts ^2.15.4 | Dashboard charts and analytics visualizations |
| zod ^3.25.76 | Schema validation (forms, API input) |

**Conventions:**
- Server components by default; add `'use client'` only when hooks or browser APIs are needed.
- No barrel exports. Import directly from the file that defines the symbol.
- Tailwind for all styling. No CSS modules, no styled-components, no inline style objects.
- Components in `src/components/fleet-compliance/` for FCS-specific UI.
- Pages in `src/app/fleet-compliance/` using App Router file conventions.

---

## Backend

| Package | Purpose |
|---------|---------|
| @neondatabase/serverless ^1.0.2 | PostgreSQL driver (Neon serverless) |
| pg ^8.20.0 | PostgreSQL client (connection pooling) |
| stripe ^21.0.0 | Billing, checkout, webhooks |
| @upstash/ratelimit ^2.0.8 | Per-org API rate limiting |
| @upstash/redis ^1.37.0 | Redis client for rate limiter |
| @sentry/nextjs ^10.46.0 | Error tracking, session replay, tunnel |
| docx ^8.5.0 | Word document generation |
| exceljs ^4.4.0 | Excel report generation |
| pdf-lib ^1.17.1 | PDF creation (certificates) |
| pdf-parse ^2.4.5 | PDF text extraction |
| mammoth ^1.11.0 | Word document parsing |
| csv-parse ^6.1.0 | CSV import processing |
| handlebars ^4.7.9 | Email/certificate templates |
| cheerio ^1.2.0 | HTML parsing for content processing |

**Conventions:**
- All API routes in `src/app/api/` using Next.js route handlers.
- Every API route starts with auth check via `requireFleetComplianceOrg()`.
- Every database query scoped to `org_id`. No exceptions.
- Parameterized SQL only. No string interpolation in queries.
- Structured error responses: `{ error: string }` with appropriate HTTP status.

---

## Database

**ORM/Driver:** Neon serverless driver + raw parameterized SQL via tagged template literals (`sql\`...\``)

**Hard rules:**
- Every query scoped to `org_id`. No exceptions.
- Schema changes via migration files — never raw DDL in production.
- No raw SQL strings in application code. Use the `getSQL()` tagged template driver.
- Migrations numbered sequentially in `src/lib/migrations/` (001 through 019+).
- Always include `created_at` and `updated_at` timestamps on new tables.
- Use `ON CONFLICT` for idempotent upserts where applicable.

**Schema location:** `src/lib/migrations/*.sql`
**Migrations:** Applied via init-db script; numbered `001_` through `019_`+

---

## Infrastructure

| Service | Purpose | Config Location |
|---------|---------|----------------|
| Vercel | Frontend hosting, auto-deploy | `vercel.json`, project settings |
| Railway | Penny FastAPI backend | `railway-backend/`, Railway dashboard |
| Neon | PostgreSQL database | `DATABASE_URL` env var |
| Clerk | Authentication/authorization | `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` |
| Stripe | Billing and subscriptions | `STRIPE_SECRET_KEY`, webhook secret |
| Upstash | Redis rate limiting | `UPSTASH_REDIS_REST_URL`, token |
| Sentry | Error tracking + replay | `SENTRY_DSN`, `SENTRY_AUTH_TOKEN` |
| Datadog | Log aggregation | `DATADOG_API_KEY` |
| UptimeRobot | Uptime monitoring | External dashboard |
| Resend | Transactional email | `RESEND_API_KEY` |
| Verizon Reveal | Telematics data | `REVEAL_*` env vars |

---

## Environment Variables

| Variable | Where It Lives | Used By |
|---------|--------------|---------|
| DATABASE_URL | Vercel env, .env.local | All DB queries |
| CLERK_SECRET_KEY | Vercel env, .env.local | Auth middleware |
| NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY | Vercel env, .env.local | Clerk client SDK |
| STRIPE_SECRET_KEY | Vercel env, .env.local | Billing API |
| STRIPE_WEBHOOK_SECRET | Vercel env, .env.local | Webhook verification |
| PENNY_API_URL | Vercel env, .env.local | Penny proxy route |
| PENNY_API_KEY | Vercel env, Railway | Shared secret |
| SENTRY_DSN | Vercel env, .env.local | Error tracking |
| RESEND_API_KEY | Vercel env, .env.local | Email alerts |
| FLEET_COMPLIANCE_CRON_SECRET | Vercel env, .env.local | Cron auth |
| UPSTASH_REDIS_REST_URL | Vercel env, .env.local | Rate limiting |
| ANTHROPIC_API_KEY | Railway env | LLM calls |

See `.env.example` for the complete list (53+ variables).

---

## Code Conventions

**TypeScript:**
- Strict mode. No `any` unless absolutely necessary and commented.
- Prefer `interface` over `type` for object shapes.
- Use `unknown` for catch blocks, narrow with `instanceof`.
- Async/await everywhere. No raw `.then()` chains.
- Named exports only. No default exports except page/layout components.

**Python (Railway backend):**
- Type hints on all function signatures.
- FastAPI with Pydantic models for request/response validation.
- Structured logging via Python `logging` module.

**Naming:**
- Files: `kebab-case.ts` for modules, `PascalCase.tsx` for components.
- Functions: `camelCase`. Classes: `PascalCase`. Constants: `UPPER_SNAKE_CASE`.
- Database columns: `snake_case`. Tables: `snake_case` plural.
- API routes: `kebab-case` URL segments.

**Comments:**
- Explain why, not what.
- Compliance-critical logic gets a comment citing the control it serves.
- Example: `// SOC 2 CC6.1 — org_id isolation required on every query`
