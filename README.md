# pipeline-punks-pipelinex-v2

PipelineX rebuild repository for the Pipeline Penny product site and chat experience.

## What this repo contains

- Next.js 15 frontend (`src/`) for:
  - Marketing/product pages
  - Clerk auth
  - Protected `/penny` chat experience
  - Protected `/resources` page (Google Drive-backed)
- FastAPI backend (`railway-backend/`) for Pipeline Penny:
  - `/health`, `/status`, `/catalog`, `/ingest`, `/query`
  - JSON knowledge store at `railway-backend/data/knowledge.json`
- Knowledge sync utility (`scripts/sync-local-knowledge.mjs`) to ingest markdown docs into the backend.

## Tech stack

- Frontend: Next.js 15, React 18, TypeScript, Clerk
- Backend: FastAPI, Pydantic, httpx, Uvicorn
- Deploy targets: Vercel (frontend) + Railway (backend)

## Repository layout

```text
src/
  app/
    api/penny/health/route.ts
    api/penny/query/route.ts
    api/penny/catalog/route.ts
    penny/page.tsx
    penny/PennyChat.tsx
  lib/
    clerk.ts
    penny-access.ts
  middleware.ts
railway-backend/
  app/main.py
  data/knowledge.json
  .env.example
scripts/
  sync-local-knowledge.mjs
RAILWAY_DEPLOY_CHECKLIST.md
```

## Access model (Penny)

Penny access is role-based using Clerk metadata.

- Allowed roles: `admin`, `demo`, `client`
- Other signed-in users see access pending on `/penny`
- Middleware protects:
  - `/penny`
  - `/resources`
  - `/api/penny/query`

## Local setup

### 1) Frontend

```bash
npm install
copy .env.example .env.local
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 2) Backend

```bash
cd railway-backend
python -m venv .venv
. .venv/Scripts/Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

Backend runs at `http://localhost:8000`.

## Frontend environment variables (`.env.local`)

Required:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `PENNY_API_URL` (local: `http://localhost:8000`)
- `PENNY_API_KEY` (must match Railway/backend key when key auth is enabled)

Also used in this project:

- `NEXT_PUBLIC_CLERK_SIGN_IN_URL`
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL`
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` (set to `/penny`)
- `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` (set to `/penny`)
- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`
- `GOOGLE_DRIVE_PUBLIC_RESOURCES_FOLDER_ID`
- `GOOGLE_DRIVE_PUBLIC_RESOURCES_DRIVE_LINK`
- `GOOGLE_SHEET_WEBHOOK_URL` (optional)
- `SITE_URL`

## Backend environment variables (`railway-backend/.env`)

Required:

- `PENNY_API_KEY`

Optional/recommended:

- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` (default `claude-3-5-haiku-latest`)
- `CORS_ORIGINS`
- `MAX_QUERY_CHARS`
- `KNOWLEDGE_STORE_PATH`

## API behavior summary

- `GET /health`: public health + config signal
- `GET /status`: API key protected backend status
- `GET /catalog`: API key protected knowledge catalog (categories + docs)
- `POST /ingest`: API key + `X-User-Role: admin` required, upserts docs
- `POST /query`: API key protected query endpoint with source titles

Frontend proxy routes:

- `GET /api/penny/health`
- `GET /api/penny/catalog`
- `POST /api/penny/query`

## Knowledge sync workflow

Use the included script to ingest markdown docs from a local knowledge folder into Penny backend.

```bash
npm run sync:knowledge
```

Script supports env overrides:

- `PENNY_API_URL`
- `PENNY_API_KEY`
- `KNOWLEDGE_ROOT`
- `KNOWLEDGE_CATEGORIES`
- `KNOWLEDGE_BATCH_SIZE`
- `KNOWLEDGE_MAX_CHARS`
- `KNOWLEDGE_FILE_LIMIT`

## Deployment

### Railway (backend)

1. Create a Railway project from this repo.
2. Set Root Directory to `railway-backend`.
3. Add backend env vars.
4. Deploy and verify `/health`.

### Vercel (frontend)

1. Connect this repo to Vercel.
2. Add frontend env vars (`PENNY_API_URL`, `PENNY_API_KEY`, Clerk, Google Drive).
3. Deploy.

Use `RAILWAY_DEPLOY_CHECKLIST.md` for post-deploy smoke checks.
