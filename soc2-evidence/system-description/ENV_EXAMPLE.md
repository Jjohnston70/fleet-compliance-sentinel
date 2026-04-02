# ENV_EXAMPLE.md

Canonical environment-variable reference for Phase 0 audit.

## Category Definitions
- `CRITICAL`: missing variable should fail startup or deployment
- `REQUIRED`: core feature variable; app can boot but major capabilities degrade
- `OPTIONAL`: non-blocking features, tooling, or platform-provided runtime context

## Root App (.env / Vercel)

| Variable | Category | Used By | Placeholder / Notes |
|---|---|---|---|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | CRITICAL | `src/lib/clerk.ts` | `pk_test_xxxxx` |
| `CLERK_SECRET_KEY` | CRITICAL | `src/lib/clerk.ts` | `sk_test_xxxxx` |
| `DATABASE_URL` | CRITICAL | `src/lib/fleet-compliance-db.ts`, `scripts/init-db.mjs`, `scripts/test-import.mjs` | `postgresql://USER:PASSWORD@HOST/DB?sslmode=require` |
| `PENNY_API_URL` | REQUIRED | `src/app/api/penny/{query,health,catalog}`, eval/sync scripts | `https://your-penny-service.up.railway.app` |
| `PENNY_API_KEY` | REQUIRED | Penny proxy + Railway backend auth | `replace-with-strong-shared-secret` |
| `SITE_URL` | REQUIRED | `src/app/robots.ts`, `src/app/sitemap.ts` | `https://pipelinepunks.com` |
| `PENNY_GENERAL_FALLBACK_SESSION_LIMIT` | REQUIRED | `src/app/api/penny/query/route.ts` | `3` |
| `UPSTASH_REDIS_REST_URL` | OPTIONAL | `src/lib/penny-rate-limit.ts` distributed rate limiting | `https://...upstash.io` |
| `UPSTASH_REDIS_REST_TOKEN` | OPTIONAL | `src/lib/penny-rate-limit.ts` distributed rate limiting | `upstash-token` |
| `CORS_ORIGINS` | REQUIRED | Railway backend CORS lock-down | `https://www.pipelinepunks.com,https://pipelinepunks.com` |
| `PENNY_ENABLE_GENERAL_FALLBACK` | OPTIONAL | `src/app/api/penny/query/route.ts` | `true` or `false` |
| `RESEND_API_KEY` | OPTIONAL | Fleet-Compliance alerts email delivery | `re_xxxxx` |
| `FLEET_COMPLIANCE_ALERT_FROM_EMAIL` | OPTIONAL | Fleet-Compliance alerts pages + email sender | `compliance@yourorg.com` |
| `FLEET_COMPLIANCE_ALERT_EMAIL` | OPTIONAL | `src/lib/fleet-compliance-alert-engine.ts` fallback manager | `manager@yourorg.com` |
| `FLEET_COMPLIANCE_CRON_SECRET` | REQUIRED | `POST /api/fleet-compliance/alerts/run` auth | `long-random-secret` |
| `FLEET_COMPLIANCE_ORG_NAME` | OPTIONAL | Alert email display text | `Fleet Compliance` |
| `FMCSA_API_KEY` | OPTIONAL | FMCSA lookup page/endpoint | `your-fmcsa-key` |
| `SENTRY_DSN` | REQUIRED | Sentry server + edge SDK init (`sentry.server.config.ts`) | `https://<key>@o<org>.ingest.us.sentry.io/<project>` |
| `NEXT_PUBLIC_SENTRY_DSN` | REQUIRED | Sentry browser SDK init (`sentry.client.config.ts`) | same DSN as `SENTRY_DSN` |
| `SENTRY_ORG` | REQUIRED | Next.js Sentry plugin release upload | `true-north-data-strategies-llc` |
| `SENTRY_PROJECT` | REQUIRED | Next.js Sentry plugin release upload | `pipeline-punks-nextjs` |
| `SENTRY_AUTH_TOKEN` | REQUIRED | Sentry release/sourcemap upload auth | `sntrys_xxxxx` (server-only secret) |
| `DATADOG_API_KEY` | OPTIONAL | Datadog log drain API key (configured in Vercel Log Drain URL) | `dd-api-key-xxxxx` |
| `DATADOG_SITE` | OPTIONAL | Datadog region site | `us5.datadoghq.com` |
| `ADMIN_EMAIL` | OPTIONAL | Penny role bypass allowlist seed | `admin@yourorg.com` |
| `PENNY_ALLOWED_EMAILS` | OPTIONAL | Additional comma-delimited allowlist | `ops@yourorg.com,cto@yourorg.com` |
| `GOOGLE_SHEET_WEBHOOK_URL` | OPTIONAL | legacy webhook integration docs/config | `https://script.google.com/macros/s/.../exec` |
| `STRIPE_WEBHOOK_SECRET` | REQUIRED | `POST /api/stripe/webhook` signature verification | `whsec_xxxxx` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | OPTIONAL | auth routing config | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | OPTIONAL | auth routing config | `/sign-up` |
| `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL` | OPTIONAL | auth routing config | `/penny` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL` | OPTIONAL | auth routing config | `/penny` |

## Railway Penny Backend (`railway-backend/.env`)

| Variable | Category | Used By | Placeholder / Notes |
|---|---|---|---|
| `PENNY_API_VERSION` | REQUIRED | backend health/status metadata | `0.1.0` |
| `PENNY_API_KEY` | REQUIRED | API key validation for protected endpoints | `replace-with-strong-shared-secret` |
| `LLM_PROVIDER` | REQUIRED | provider routing in `app/main.py` | `anthropic` \\| `openai` \\| `gemini` \\| `ollama` \\| `none` |
| `ANTHROPIC_API_KEY` | OPTIONAL* | provider key | set when `LLM_PROVIDER=anthropic` |
| `ANTHROPIC_MODEL` | OPTIONAL | anthropic model override | `claude-sonnet-4-6` |
| `ANTHROPIC_MAX_TOKENS` | OPTIONAL | anthropic output token cap | `4000` |
| `ENABLE_GENERAL_FALLBACK` | OPTIONAL | backend-level general fallback switch | `true` or `false` |
| `ANTHROPIC_GENERAL_FALLBACK_MODEL` | OPTIONAL | fallback model | `claude-sonnet-4-6` |
| `ANTHROPIC_GENERAL_FALLBACK_MAX_TOKENS` | OPTIONAL | fallback token cap | `1800` |
| `OPENAI_API_KEY` | OPTIONAL* | provider key | set when `LLM_PROVIDER=openai` |
| `OPENAI_MODEL` | OPTIONAL | openai model | `gpt-4o-mini` |
| `OPENAI_MAX_TOKENS` | OPTIONAL | openai output token cap | `4000` |
| `GEMINI_API_KEY` | OPTIONAL* | provider key | set when `LLM_PROVIDER=gemini` |
| `GEMINI_MODEL` | OPTIONAL | gemini model | `gemini-2.5-flash` |
| `GEMINI_MAX_TOKENS` | OPTIONAL | gemini output token cap | `4000` |
| `OLLAMA_BASE_URL` | OPTIONAL* | ollama endpoint | `http://127.0.0.1:11434` |
| `OLLAMA_MODEL` | OPTIONAL | ollama model | `llama3.1` |
| `OLLAMA_MAX_TOKENS` | OPTIONAL | ollama token cap | `4000` |
| `MAX_QUERY_CHARS` | OPTIONAL | request validation | `2500` |
| `FALLBACK_MAX_CHARS` | OPTIONAL | non-LLM fallback size | `6000` |
| `CORS_ORIGINS` | REQUIRED | CORS allowlist | `https://www.pipelinepunks.com,https://pipelinepunks.com` |
| `KNOWLEDGE_STORE_PATH` | REQUIRED | JSON knowledge storage path | `./data/knowledge.json` |

`*` At least one provider path must be correctly configured for non-`none` operation.

## Tooling / Script Variables

| Variable | Category | Used By | Placeholder / Notes |
|---|---|---|---|
| `KNOWLEDGE_ROOT` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | local source corpus path |
| `KNOWLEDGE_CATEGORIES` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | comma-separated domain list |
| `KNOWLEDGE_BATCH_SIZE` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | `20` |
| `KNOWLEDGE_MAX_CHARS` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | `18000` |
| `KNOWLEDGE_FILE_LIMIT` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | `200` |
| `KNOWLEDGE_REPLACE` | OPTIONAL | `scripts/sync-local-knowledge.mjs` | `true`/`false` |
| `RAILWAY_DOCS_REPO_DIR` | OPTIONAL | `scripts/prepare-railway-docs.mjs` | local checkout path |
| `RAILWAY_CHUNK_MAX_CHARS` | OPTIONAL | `scripts/prepare-railway-docs.mjs` | `3500` |
| `RAILWAY_CHUNK_MIN_CHARS` | OPTIONAL | `scripts/prepare-railway-docs.mjs` | `1200` |

## Platform-Provided Runtime Variables

| Variable | Category | Used By | Notes |
|---|---|---|---|
| `NODE_ENV` | OPTIONAL | `src/lib/clerk.ts`, `src/app/api/penny/query/route.ts` | auto-set by Node/Next |
| `VERCEL_ENV` | OPTIONAL | `src/lib/clerk.ts` | auto-set by Vercel |
| `VERCEL_GIT_COMMIT_SHA` | OPTIONAL | Sentry release tag | auto-set by Vercel |

## Minimal Starter Template (Root)

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
DATABASE_URL=postgresql://USER:PASSWORD@HOST/DB?sslmode=require
PENNY_API_URL=https://your-penny-service.up.railway.app
PENNY_API_KEY=replace-with-strong-shared-secret
SITE_URL=https://pipelinepunks.com
PENNY_GENERAL_FALLBACK_SESSION_LIMIT=3
FLEET_COMPLIANCE_CRON_SECRET=replace-with-long-random-secret
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
SENTRY_DSN=https://<key>@o<org>.ingest.us.sentry.io/<project>
NEXT_PUBLIC_SENTRY_DSN=https://<key>@o<org>.ingest.us.sentry.io/<project>
SENTRY_ORG=true-north-data-strategies-llc
SENTRY_PROJECT=pipeline-punks-nextjs
SENTRY_AUTH_TOKEN=sntrys_xxxxx
```

## Minimal Starter Template (Railway Backend)

```env
PENNY_API_VERSION=0.1.0
PENNY_API_KEY=replace-with-strong-shared-secret
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=replace-with-provider-key
ANTHROPIC_MODEL=claude-sonnet-4-6
ANTHROPIC_MAX_TOKENS=4000
ENABLE_GENERAL_FALLBACK=true
CORS_ORIGINS=https://www.pipelinepunks.com,https://pipelinepunks.com
KNOWLEDGE_STORE_PATH=./data/knowledge.json
```
