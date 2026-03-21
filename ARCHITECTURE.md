# ARCHITECTURE.md

## 1) System Purpose
Chief Sentinel is the fleet and DOT compliance module inside the Pipeline Punks platform. It is a Next.js App Router application on Vercel that combines:
- Chief operational workflows (assets, employees, compliance, suspense, alerts, imports)
- Pipeline Penny (LLM-assisted compliance Q&A)
- Clerk authentication/authorization
- Neon Postgres persistence for Chief collections
- Railway-hosted FastAPI for Penny retrieval and LLM orchestration

## 2) Runtime Topology
- Frontend + API: Next.js 15 on Vercel (`src/app/*`, `src/app/api/*`)
- Auth: Clerk (`@clerk/nextjs`) with middleware protection and role checks
- Primary data store: Neon Postgres (`chief_records` table via `@neondatabase/serverless`)
- AI backend: Railway FastAPI service (`railway-backend/app/main.py`)
- Retrieval index: local CFR/doc index utilities in `@tnds/*` workspace packages + `knowledge/`
- Legacy docs layer (scheduled removal): Google Drive-backed `/resources`

## 3) End-to-End Data Flows

### A) Chief bulk upload -> Postgres -> Chief pages
1. User opens `/chief/import` and uploads `.xlsx` file.
2. `POST /api/chief/import/parse` validates sheets/rows with `src/lib/chief-import-schemas.ts`.
3. Approved rows are submitted to `POST /api/chief/import/save`.
4. `src/lib/chief-db.ts` writes each row into `chief_records(collection, data, imported_at, imported_by)`.
5. Chief pages call async readers in `src/lib/chief-data.ts`, which query `chief_records`, transform rows to UI-specific view models, and render server components.

### B) Chief alert workflow
1. Alert pages and config endpoints use `src/lib/chief-alert-engine.ts`.
2. Alert runs can be triggered manually or via cron endpoint `POST /api/chief/alerts/run` with bearer secret.
3. If `RESEND_API_KEY` exists, notifications are sent via Resend API; otherwise behavior is dry-run/fallback.

### C) Penny query flow
1. Authenticated user calls `POST /api/penny/query`.
2. Route verifies Clerk session, resolves role (`src/lib/penny-access.ts`), enforces access policy.
3. Route builds grounded context via `src/lib/penny-ingest.ts` and `@tnds/retrieval-core` when index data exists.
4. Route proxies request to Railway (`PENNY_API_URL`) with `X-Penny-Api-Key`.
5. Railway FastAPI (`/query`) retrieves knowledge snippets and executes configured provider (`anthropic/openai/gemini/ollama/none`).
6. Next route merges sources and returns response to `src/app/penny/PennyChat.tsx`.

### D) Legacy resources flow (scheduled removal)
1. `/resources` and `/resources/[id]` call `src/lib/drive.ts`.
2. `googleapis` OAuth2 client uses `GOOGLE_DRIVE_*` env vars.
3. Penny query route can list Drive files for resource-list prompts.

## 4) Auth and Access Control
- Request-level protection in `src/middleware.ts` for:
  - `/penny(.*)`
  - `/resources(.*)`
  - `/api/penny/query(.*)`
- Clerk enablement is conditional (`src/lib/clerk.ts`) to avoid local-dev mismatch with live keys.
- Penny role allowlist is `admin|demo|client`, with optional admin email bypass.
- Chief API routes also verify `auth().userId` when Clerk is enabled.

## 5) Data Stores and Persistence
- Neon Postgres:
  - Table: `chief_records`
  - Index: `idx_chief_records_collection`
  - Accessed in server-side routes and server components via `getSQL()`.
- Railway backend local JSON store:
  - Path default `./data/knowledge.json`
  - Used for Penny document corpus and catalog/status endpoints.
- Browser local storage:
  - Still used by multiple Chief/Penny UI components for draft/status state.

## 6) External Integrations
- Clerk (auth)
- Neon Postgres (database)
- Railway (Penny API hosting)
- Anthropic/OpenAI/Gemini/Ollama providers (config-driven in Railway backend)
- FMCSA public API (`mobile.fmcsa.dot.gov`)
- Resend email API
- Google Drive API (legacy resources path)

## 7) Directory Responsibilities
- `src/app/`: Next.js pages, metadata routes, and API routes
- `src/components/`: reusable UI components and Chief forms
- `src/lib/`: domain/business logic and integration adapters
- `railway-backend/`: FastAPI service for Penny
- `packages/`: shared workspace libraries (`@tnds/*` retrieval/ingest/types/memory)
- `scripts/`: repo tooling, ingestion/evals, DB bootstrap
- `tooling/chief-sentinel/`: import-generation, CFR extraction, migration assets, historical docs
- `knowledge/`: large local corpus/chunk storage used for retrieval workflows
- `archive/`: historical snapshots (inactive)

## 8) Current Architectural Constraints
- `/resources` and Google Drive dependencies are deeply coupled into navigation, middleware, Penny prompts, and static Chief document-link data.
- Secret-bearing `.env` and `.env.local` files are present in the repo workspace and include production-like credentials.
- Production endpoint baseline check (2026-03-20):
  - `https://pipelinepunks.com` -> `200`
  - `https://pipelinepunks.com/chief` -> `200`
  - `https://pipelinepunks.com/api/penny/health` -> `200`
  - `https://pipelinepunks.com/penny` -> `404`
