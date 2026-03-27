# ARCHITECTURE.md

## 1) System Purpose
Fleet-Compliance Sentinel is the fleet and DOT compliance module inside the Pipeline Punks platform. It is a Next.js App Router application on Vercel that combines:
- Fleet-Compliance operational workflows (assets, employees, compliance, suspense, alerts, imports)
- Pipeline Penny (LLM-assisted compliance Q&A)
- Clerk authentication/authorization
- Neon Postgres persistence for Fleet-Compliance collections
- Railway-hosted FastAPI for Penny retrieval and LLM orchestration

## 2) Runtime Topology
- Frontend + API: Next.js 15 on Vercel (`src/app/*`, `src/app/api/*`)
- Auth: Clerk (`@clerk/nextjs`) with middleware protection and role checks
- Primary data store: Neon Postgres (`fleet_compliance_records` table via `@neondatabase/serverless`)
- AI backend: Railway FastAPI service (`railway-backend/app/main.py`)
- Retrieval index: local CFR/doc index utilities in `@tnds/*` workspace packages + `knowledge/`
- Legacy docs layer (scheduled removal): Google Drive-backed `/resources`

## 3) End-to-End Data Flows

### A) Fleet-Compliance bulk upload -> Postgres -> Fleet-Compliance pages
1. User opens `/fleet-compliance/import` and uploads `.xlsx` file.
2. `POST /api/fleet-compliance/import/parse` validates sheets/rows with `src/lib/fleet-compliance-import-schemas.ts`.
3. Approved rows are submitted to `POST /api/fleet-compliance/import/save`.
4. `src/lib/fleet-compliance-db.ts` writes each row into `fleet_compliance_records(collection, data, imported_at, imported_by)`.
5. Fleet-Compliance pages call async readers in `src/lib/fleet-compliance-data.ts`, which query `fleet_compliance_records`, transform rows to UI-specific view models, and render server components.

### B) Fleet-Compliance alert workflow
1. Alert pages and config endpoints use `src/lib/fleet-compliance-alert-engine.ts`.
2. Alert runs can be triggered manually or via cron endpoint `POST /api/fleet-compliance/alerts/run` with bearer secret.
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
- Fleet-Compliance API routes also verify `auth().userId` when Clerk is enabled.

## 5) Data Stores and Persistence
- Neon Postgres:
  - Table: `fleet_compliance_records`
  - Index: `idx_fleet_compliance_records_collection`
  - Accessed in server-side routes and server components via `getSQL()`.
- Railway backend local JSON store:
  - Path default `./data/knowledge.json`
  - Used for Penny document corpus and catalog/status endpoints.
- Browser local storage:
  - Still used by multiple Fleet-Compliance/Penny UI components for draft/status state.

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
- `src/components/`: reusable UI components and Fleet-Compliance forms
- `src/lib/`: domain/business logic and integration adapters
- `railway-backend/`: FastAPI service for Penny
- `packages/`: shared workspace libraries (`@tnds/*` retrieval/ingest/types/memory)
- `scripts/`: repo tooling, ingestion/evals, DB bootstrap
- `tooling/chief-sentinel/`: import-generation, CFR extraction, migration assets, historical docs
- `knowledge/`: large local corpus/chunk storage used for retrieval workflows
- `archive/`: historical snapshots (inactive)

## 8) Current Architectural Constraints (Pre-Telematics)
- `/resources` and Google Drive dependencies are deeply coupled into navigation, middleware, Penny prompts, and static Fleet-Compliance document-link data.
- Secret-bearing `.env` and `.env.local` files are present in the repo workspace and include production-like credentials.
- Production endpoint baseline check (2026-03-20):
  - `https://pipelinepunks.com` -> `200`
  - `https://pipelinepunks.com/chief` -> `200`
  - `https://pipelinepunks.com/api/penny/health` -> `200`
  - `https://pipelinepunks.com/penny` -> `404`

## 9) Telematics Integration Layer (Added 2026-03-27)

### Overview

Fleet-Compliance Sentinel now integrates with telematics providers to ingest vehicle GPS, driver roster, HOS/ELD status, alerts, and DVIR records. The first supported provider is **Verizon Connect Reveal** (Fleetmatics).

The integration follows an **adapter pattern**: a `BaseTelematicsAdapter` abstract base class (`railway-backend/integrations/base_adapter.py`) defines the contract that all telematics provider adapters must implement. Adding a new provider (Geotab, Samsara, Motive) requires implementing this class — zero changes to compliance logic, risk scoring, or API routes above the adapter layer.

The Verizon Connect Reveal adapter (`railway-backend/integrations/verizon_reveal/`) provides:
- `RevealAdapter` — main entry point, credential management, wires together all components
- `RevealCredentialStore` — per-org credential read/write/deactivate with pgcrypto encryption
- `RevealRESTClient` — polling data fetches (vehicles, drivers, HOS, alerts, DVIR)
- `RevealNormalizer` — maps Verizon API payloads to internal normalized models
- `reveal_webhook_router` — FastAPI router for GPS Push Service and alert webhooks

### New Data Flows

#### E) Telematics Sync Flow (Cron)

1. Vercel cron triggers `GET /api/fleet-compliance/telematics-sync` with `TELEMATICS_CRON_SECRET` bearer token.
2. Route validates token (timing-safe comparison), then calls `POST /telematics/sync` on Railway with `X-Penny-Api-Key` header.
3. Railway `telematics_router.py` executes `scripts/reveal_sync_neon.py` via subprocess.
4. Sync script authenticates to Verizon Connect REST API (`fim.api.us.fleetmatics.com`) using per-org credentials.
5. Verizon returns vehicle roster, driver roster, GPS segments, current locations, and ELD settings.
6. Script writes normalized data to Neon telematics tables (`telematics_vehicles`, `telematics_drivers`, `telematics_gps_events`).
7. Script writes sync audit record to `telematics_sync_log`.
8. Next.js route logs to `cron_log` and emits `auditLog()` event.

#### F) Webhook Flow (GPS Push Service)

1. Verizon GPS Push Service sends real-time GPS events to `POST /api/telematics/reveal/gps` on Railway.
2. Webhook receiver resolves `Username` field to `org_id` via `telematics_credentials` lookup.
3. Event is normalized via `RevealNormalizer.gps_event()` and processed asynchronously (FastAPI background task).
4. Normalized GPS event is written to `telematics_gps_events` table.
5. Alert webhooks follow the same pattern via `POST /api/telematics/reveal/alerts`.

#### G) Risk Score Flow

1. Authenticated user calls `GET /api/fleet-compliance/telematics-risk`.
2. Route verifies Clerk session and resolves `orgId` via `requireFleetComplianceOrg()`.
3. Route queries `telematics_vehicles`, `telematics_drivers`, and `telematics_gps_events` tables (all scoped by `org_id`).
4. Risk scores (0-100) are computed per vehicle and per driver based on GPS staleness, fleet age, ELD status, and event frequency.
5. Response includes `{ vehicles, drivers, summary }` with risk levels (HIGH/MEDIUM/LOW).
6. `auditLog()` event emitted with `action: 'data.read'`.

### New Database Tables

| Table | Migration | Purpose |
|---|---|---|
| `telematics_credentials` | 008 | Per-org provider credentials, encrypted via pgcrypto |
| `telematics_vehicles` | 008 | Normalized vehicle roster synced from provider |
| `telematics_drivers` | 008 | Normalized driver roster (contains PII: name, license, email, phone) |
| `telematics_hos_logs` | 008 | HOS/ELD duty status records (8-day FMCSA rolling window) |
| `telematics_alerts` | 008 | Exception/alert events (speeding, HOS violation, geofence, etc.) |
| `telematics_dvir_records` | 008 | Driver Vehicle Inspection Reports |
| `telematics_gps_events` | 008 | Real-time GPS events (high-volume, needs retention policy) |
| `telematics_sync_log` | 008 | Sync job audit trail (started, completed, records, status) |
| `telematics_risk_scores` | 009 | Computed risk scores per entity (vehicle/driver) |

### New Environment Variables

| Variable | Location | Purpose |
|---|---|---|
| `REVEAL_USERNAME` | Railway | Verizon Connect integration username |
| `REVEAL_PASSWORD` | Railway | Verizon Connect integration password |
| `REVEAL_APP_ID` | Railway | Verizon Connect FIM Application ID |
| `APP_ENCRYPTION_KEY` | Railway | Symmetric key for pgcrypto credential encryption |
| `TELEMATICS_CRON_SECRET` | Vercel | Bearer token for telematics sync cron route |

### Adapter Pattern

The `BaseTelematicsAdapter` abstract class defines 6 data methods (`get_vehicles`, `get_drivers`, `get_hos_logs`, `get_alerts`, `get_dvir_records`, `validate_credentials`) and a `provider_name` property. All methods accept `org_id` for multi-tenant credential lookup and return normalized internal models from `models/telematics_event.py`.

To add a new provider:
1. Create `railway-backend/integrations/{provider_name}/` directory.
2. Implement `BaseTelematicsAdapter` with provider-specific REST/webhook client and normalizer.
3. Register adapter in sync script or adapter factory.
4. No changes required to compliance logic, risk scoring, API routes, or database schema.

### Credential Security Model

- Credentials stored in `telematics_credentials` table with `password_enc` column.
- Encryption: `pgp_sym_encrypt(password, current_setting('app.encryption_key'))` using pgcrypto AES-256.
- Per-org isolation: unique constraint `(org_id, provider)`.
- Consent tracking: `consent_recorded_at` records client authorization date.
- Lifecycle: onboard (encrypt + store) → validate (lightweight API test) → use (Basic Auth) → deactivate (soft delete).
- Passwords never logged, never serialized, never sent to Penny/LLM.
