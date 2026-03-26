# AUDIT_REPORT.md

## Phase 0 Audit Metadata
- Project: Fleet-Compliance Sentinel (Pipeline Punks / True North Data Strategies)
- Audit Date: 2026-03-20 (America/Denver)
- Audit Scope: static repository audit + live Penny health probe
- Build Cycle Count (this phase): 1
- Actual Time Spent (this cycle): 1.3 hours
- Production Logic Changes: none (audit artifacts and utility script only)

## 1) Inventory (Grouped File Tree + Purpose)

### Pages (`src/app/**/page.tsx`)
- `src/app/page.tsx` - homepage/marketing shell.
- `src/app/accessibility/page.tsx` - accessibility statement page.
- `src/app/assetcommand/page.tsx` - AssetCommand product/lead page.
- `src/app/penny/page.tsx` - authenticated Penny chat entry page.
- `src/app/privacy/page.tsx` - privacy policy page.
- `src/app/terms/page.tsx` - terms page.
- `src/app/sign-in/[[...sign-in]]/page.tsx` - Clerk sign-in route.
- `src/app/sign-up/[[...sign-up]]/page.tsx` - Clerk sign-up route.
- `src/app/resources/page.tsx` - Google Drive-backed resource library (scheduled removal).
- `src/app/resources/[id]/page.tsx` - Google Drive file detail/view page (scheduled removal).
- `src/app/fleet-compliance/page.tsx` - Fleet-Compliance dashboard landing.
- `src/app/fleet-compliance/import/page.tsx` - multi-sheet import UI.
- `src/app/fleet-compliance/assets/page.tsx` - asset list/search page.
- `src/app/fleet-compliance/assets/new/page.tsx` - asset create form page.
- `src/app/fleet-compliance/assets/[assetId]/page.tsx` - asset detail page.
- `src/app/fleet-compliance/employees/page.tsx` - employee list page.
- `src/app/fleet-compliance/employees/new/page.tsx` - employee create form page.
- `src/app/fleet-compliance/compliance/page.tsx` - compliance overview page.
- `src/app/fleet-compliance/compliance/drivers/[personId]/page.tsx` - driver compliance detail page.
- `src/app/fleet-compliance/compliance/permits/[recordId]/page.tsx` - permit detail page.
- `src/app/fleet-compliance/suspense/page.tsx` - suspense queue page.
- `src/app/fleet-compliance/suspense/new/page.tsx` - suspense item create page.
- `src/app/fleet-compliance/suspense/[suspenseItemId]/page.tsx` - suspense item detail page.
- `src/app/fleet-compliance/suspense/[suspenseItemId]/edit/page.tsx` - suspense item edit page.
- `src/app/fleet-compliance/activity/[activityId]/page.tsx` - activity log detail page.
- `src/app/fleet-compliance/maintenance/[eventId]/page.tsx` - maintenance event detail page.
- `src/app/fleet-compliance/invoices/page.tsx` - invoice list page.
- `src/app/fleet-compliance/invoices/new/page.tsx` - invoice create page.
- `src/app/fleet-compliance/alerts/page.tsx` - alert run status/config visibility page.
- `src/app/fleet-compliance/settings/alerts/page.tsx` - alert settings page.
- `src/app/fleet-compliance/fmcsa/page.tsx` - FMCSA carrier lookup page.

### API Routes (`src/app/api/**/route.ts`)
- `src/app/api/fleet-compliance/import/setup/route.ts` - creates/verifies Fleet-Compliance DB table.
- `src/app/api/fleet-compliance/import/parse/route.ts` - parses/validates uploaded Excel data.
- `src/app/api/fleet-compliance/import/save/route.ts` - persists approved import rows.
- `src/app/api/fleet-compliance/bulk-template/route.ts` - exports bulk template workbook.
- `src/app/api/fleet-compliance/alerts/preview/route.ts` - preview payloads for alert runs.
- `src/app/api/fleet-compliance/alerts/run/route.ts` - executes alert sweep (cron/manual).
- `src/app/api/fleet-compliance/alerts/trigger/route.ts` - trigger helper endpoint.
- `src/app/api/fleet-compliance/fmcsa/lookup/route.ts` - FMCSA proxy/lookup endpoint.
- `src/app/api/invoices/setup/route.ts` - invoice table bootstrap.
- `src/app/api/invoices/import/route.ts` - invoice import endpoint.
- `src/app/api/penny/health/route.ts` - health proxy to Railway Penny.
- `src/app/api/penny/catalog/route.ts` - catalog proxy to Railway Penny.
- `src/app/api/penny/query/route.ts` - authenticated Penny query proxy/context injection.

### Components (`src/components/**`)
- `src/components/Navigation.tsx` - top navigation links.
- `src/components/CookieConsent.tsx` - cookie consent banner/local storage persistence.
- `src/components/fleet-compliance/ImportReviewer.tsx` - import review/approval UI.
- `src/components/fleet-compliance/AlertsRunPanel.tsx` - alert run controls/status panel.
- `src/components/fleet-compliance/AssetStatusOverride.tsx` - client-side asset status override state.
- `src/components/fleet-compliance/FmcsaResultSaver.tsx` - stores FMCSA lookup snapshots locally.
- `src/components/fleet-compliance/FmcsaSnapshotCard.tsx` - displays saved FMCSA snapshots.
- `src/components/fleet-compliance/InlineNoteEditor.tsx` - inline note draft editor.
- `src/components/fleet-compliance/LocalRecordsPanel.tsx` - local record panel (currently unused).
- `src/components/fleet-compliance/SuspenseCardStatus.tsx` - suspense status badge from local state.
- `src/components/fleet-compliance/SuspenseResolveButton.tsx` - resolve button + local persistence.
- `src/components/fleet-compliance/forms/AssetForm.tsx` - asset create/edit form.
- `src/components/fleet-compliance/forms/EmployeeForm.tsx` - employee create/edit form.
- `src/components/fleet-compliance/forms/InvoiceForm.tsx` - invoice create/edit form.
- `src/components/fleet-compliance/forms/SuspenseItemForm.tsx` - suspense create/edit form.
- `src/components/fleet-compliance/forms/AlertSettingsForm.tsx` - alert settings form.

### Lib Utilities (`src/lib/**`)
- `src/lib/fleet-compliance-db.ts` - Neon connection + table CRUD helpers.
- `src/lib/fleet-compliance-data.ts` - server-side Fleet-Compliance read models/transformers.
- `src/lib/fleet-compliance-import-schemas.ts` - import schema definitions + row validation.
- `src/lib/chief-upload-template.generated.ts` - generated import template metadata.
- `src/lib/fleet-compliance-imported-data.generated.ts` - generated import dataset module.
- `src/lib/fleet-compliance-alert-engine.ts` - alert composition/sending logic.
- `src/lib/fleet-compliance-fmcsa-client.ts` - FMCSA API client.
- `src/lib/invoice-db.ts` - invoice DB helpers.
- `src/lib/penny-access.ts` - role/access gating helpers for Penny.
- `src/lib/penny-ingest.ts` - retrieval context and ingestion helpers.
- `src/lib/clerk.ts` - Clerk enablement/runtime checks.
- `src/lib/drive.ts` - Google Drive OAuth + list/get methods (scheduled removal).
- `src/lib/chief-local-store.ts` - localStorage wrappers.
- `src/lib/chief-knowledge-timeline.ts` - timeline store API (currently unused).
- `src/lib/chief-demo-data.ts` - legacy demo data module (currently unused).

### Tooling / Scripts / Config
- `scripts/*` (8 files including new `scripts/check-env.ts`) - DB init, evals, knowledge sync/index prep, environment checks.
- `railway-backend/*` - standalone FastAPI Penny backend, Docker/Railway deploy config, backend env contract.
- `packages/@tnds/*` - workspace libs for shared types, ingest, retrieval, and memory.
- `tooling/chief-sentinel/*` - data prep, CFR extraction, generated import artifacts, docs, and Firebase bundle.
- `knowledge/` - 1117 files (local corpus/raw/full/chunked docs; non-runtime web app pages).
- `archive/` - historical snapshot files not used by active runtime.

## 2) Dependency Audit

### 2.1 Root `package.json` status
| Package | Version | Imported in code | Placement |
|---|---:|---|---|
| `@clerk/nextjs` | `^6.38.2` | Yes | `dependencies` correct |
| `@neondatabase/serverless` | `^1.0.2` | Yes | `dependencies` correct |
| `googleapis` | `^171.4.0` | Yes (`src/lib/drive.ts`) | `dependencies` correct until Drive removal |
| `lucide-react` | `^0.544.0` | No | likely removable from `dependencies` |
| `next` | `15.5.9` | Yes | `dependencies` correct |
| `react` | `^18.3.1` | Yes | `dependencies` correct |
| `react-dom` | `^18.3.1` | Not directly imported | keep in `dependencies` for Next runtime |
| `react-markdown` | `^10.1.0` | Yes | `dependencies` correct |
| `remark-gfm` | `^4.0.1` | Yes | `dependencies` correct |
| `typescript` | `^5.3.3` | Not runtime import | should be `devDependencies` |
| `xlsx` | `^0.18.5` | Yes | `dependencies` correct |
| `@tnds/types` | `*` | Yes | workspace dependency |
| `@tnds/ingest-core` | `*` | Yes | workspace dependency |
| `@tnds/retrieval-core` | `*` | Yes | workspace dependency |
| `@tnds/memory-core` | `*` | Yes | workspace dependency |
| `mammoth` | `^1.11.0` | Yes (`packages/tnds-ingest-core`) | `dependencies` correct |
| `pdf-parse` | `^2.4.5` | Yes (`packages/tnds-ingest-core`) | `dependencies` correct |
| `csv-parse` | `^6.1.0` | Yes (`packages/tnds-ingest-core`) | `dependencies` correct |
| `cheerio` | `^1.2.0` | Yes (`packages/tnds-ingest-core`) | `dependencies` correct |

### 2.2 Dev dependencies
All current dev deps are appropriately classified. Most are config/build-time and therefore not imported in runtime files.

### 2.3 Missing-from-package checks
- Root app code: no unresolved third-party imports found.
- Nested Firebase functions bundle has `firebase-admin` and `firebase-functions` imports; those are correctly declared in `tooling/chief-sentinel/firebase_functions_bundle/functions/package.json`.
- Workspace packaging risk: `packages/tnds-ingest-core` imports `mammoth/pdf-parse/csv-parse/cheerio` but only root package declares them. This works in monorepo installs but is brittle if package is published or isolated.

## 3) Google Drive Removal Scope (File + Line + Action)

### 3.1 Direct runtime integration (must remove in Phase 1)
| File | Lines | Action |
|---|---|---|
| `src/lib/drive.ts` | 1, 30-31, 34, 36, 49, 69-70 | Delete module and all callers; remove `googleapis` usage. |
| `src/app/resources/page.tsx` | 29-30, 37, 42, 63 | Remove route page entirely. |
| `src/app/resources/[id]/page.tsx` | 40, 67, 81 | Remove route page entirely. |
| `src/middleware.ts` | 2, 11 | Remove `/resources(.*)` protection matcher and comment reference. |
| `src/app/api/penny/query/route.ts` | 204, 265, 274 | Remove Drive file-list fallback and `/resources` response guidance. |
| `src/components/Navigation.tsx` | 79 | Remove `Resources` nav item. |
| `src/app/sitemap.ts` | 10 | Remove `/resources` sitemap entry. |
| `src/app/fleet-compliance/page.tsx` | 74, 76, 152, 276 | Remove/replace Resources card and copy that references Google Drive. |

### 3.2 Data model copy/links still tied to `/resources`
| File | Lines | Action |
|---|---|---|
| `src/lib/fleet-compliance-data.ts` | 801, 818-821, 824-827, 830-831, 836-837, 841-846, 851-852, 855-856, 858, 860-861, 864-865, 867, 871-872 | Replace `href: '/resources'` links with new document strategy or remove links until replacement exists. |
| `src/lib/chief-demo-data.ts` | 349, 554-557, 560-563, 566-567, 572-573, 577-582, 587-588, 591-592, 595, 598-599, 602-603, 606, 611-612 | Same as above; likely remove entire file as dead code. |

### 3.3 Package/config/docs references
| File | Lines | Action |
|---|---|---|
| `package.json` | 20 | Remove `googleapis` after code removal. |
| `.env.example` | 23-28 | Remove legacy Drive vars or move to deprecated section. |
| `README.md` | 39, 68, 88, 91 | Update product docs after route removal. |

## 4) Hardcoded Values Audit

### 4.1 Hardcoded URLs in runtime code
| File | Line(s) | Value / Type | Risk |
|---|---|---|---|
| `src/app/assetcommand/page.tsx` | 6 | Gumroad URL hardcoded | low (marketing link), but not env-managed |
| `src/app/assetcommand/page.tsx` | 8 | Google Apps Script URL hardcoded | medium (integration endpoint pinned in code) |
| `src/app/page.tsx` | 68, 204, 219, 240 | hardcoded TNDS URLs | low |
| `src/app/layout.tsx` | 30, 32, 36 | hardcoded metadata base URL | low/medium (multi-env drift risk) |
| `src/lib/fleet-compliance-fmcsa-client.ts` | 199 | FMCSA base URL constant | low (expected API constant) |
| `src/lib/fleet-compliance-alert-engine.ts` | 128 | Resend API endpoint constant | low (expected API constant) |
| `scripts/sync-local-knowledge.mjs` | 205 | hardcoded Railway fallback URL | medium (environment drift) |
| `scripts/run-penny-evals.mjs` | 109 | hardcoded Railway fallback URL | medium (environment drift) |

### 4.2 Secret exposure findings (redacted)
- `.env` and `.env.local` contain live-looking production secrets and credentials (Clerk secret key, Google OAuth secret/refresh token, Neon DB credentials, Vercel OIDC token, etc.).
- This is the highest-severity finding of Phase 0.
- Required remediation in Phase 1/6 track:
  - rotate all exposed credentials,
  - ensure `.env` and `.env.local` are excluded from commit history,
  - move secrets to Vercel/Railway secret stores only.

### 4.3 Hardcoded org/user IDs
- No explicit hardcoded org IDs or user IDs found in active app code.

### 4.4 Demo/test data in production paths
| File | Line(s) | Finding |
|---|---|---|
| `src/lib/penny-access.ts` | 3 | role allowlist includes `demo`. |
| `src/app/penny/page.tsx` | 56 | explicit `demo` role behavior branch. |
| `src/app/api/penny/query/route.ts` | 165 | fallback behavior tied to `demo` role. |
| `src/lib/chief-upload-template.generated.ts` | multiple `sampleRows` | production route serves sample-driven template payloads. |

## 5) TODO / FIXME / HACK / demo Comment Audit
- Scan target: code files (`ts/tsx/js/mjs/py`), excluding markdown/data assets.
- Findings:
  - `TODO`: none in active code comments.
  - `FIXME`: none in active code comments.
  - `HACK`: none in active code comments.
  - `demo` comment reference found:
    - `src/lib/fleet-compliance-data.ts:9` (`chief-demo-data.ts` reference in comment).

## 6) Dead Code Candidates (Heuristic + Verification)

### High-confidence unused files
| File | Evidence |
|---|---|
| `src/components/fleet-compliance/LocalRecordsPanel.tsx` | no imports found in `src/`.
| `src/lib/chief-demo-data.ts` | referenced only in comments, not imported as executable module.
| `src/lib/chief-knowledge-timeline.ts` | exports are not imported anywhere in active app routes.
| `PennyChat.tsx` (repo root) | duplicate file; active route imports `src/app/penny/PennyChat.tsx`.

### Notes
- Dead-code detection was static and conservative; confirm with lint/build graph before deletion.

## 7) `localStorage` / `sessionStorage` Usage

### `localStorage` usage (active)
- `src/components/CookieConsent.tsx:14,21`
- `src/lib/chief-local-store.ts:18,27,56,65`
- `src/components/fleet-compliance/SuspenseResolveButton.tsx:23,36`
- `src/components/fleet-compliance/SuspenseCardStatus.tsx:11`
- `src/components/fleet-compliance/InlineNoteEditor.tsx:21,41,57`
- `src/components/fleet-compliance/FmcsaSnapshotCard.tsx:19`
- `src/components/fleet-compliance/FmcsaResultSaver.tsx:11`
- `src/components/fleet-compliance/AssetStatusOverride.tsx:22,39,41,54`
- `src/app/penny/PennyChat.tsx:97,114`

### `sessionStorage`
- No active usages found.

## 8) Environment Variable Inventory

### Summary
- Total env vars referenced in code: 53
- Complete categorized reference is documented in `ENV_EXAMPLE.md`.

### Vars referenced in code but missing from both current `.env.example` files
- `ADMIN_EMAIL`
- `FLEET_COMPLIANCE_ALERT_EMAIL`
- `KNOWLEDGE_BATCH_SIZE`
- `KNOWLEDGE_CATEGORIES`
- `KNOWLEDGE_FILE_LIMIT`
- `KNOWLEDGE_MAX_CHARS`
- `KNOWLEDGE_REPLACE`
- `KNOWLEDGE_ROOT`
- `NODE_ENV` (platform-provided)
- `PENNY_ALLOWED_EMAILS`
- `PENNY_ENABLE_GENERAL_FALLBACK`
- `RAILWAY_CHUNK_MAX_CHARS`
- `RAILWAY_CHUNK_MIN_CHARS`
- `RAILWAY_DOCS_REPO_DIR`
- `VERCEL_ENV` (platform-provided)

## 9) Railway Penny Backend Audit

### 9.1 Service identification
- Service URL from repo env config: `https://pipeline-punks-v2-production.up.railway.app`
- Railway CLI identity: `jacob@truenorthstrategyops.com`
- Linked project context (from `railway-backend/`):  
  - Project: `pipeline-punks-v2`  
  - Environment: `production`  
  - Service: `pipeline-punks-v2`  
  - Service ID: `b90cea28-6c92-4dd8-8f15-f0e102917029`
- Domain: `pipeline-punks-v2-production.up.railway.app`
- Deployment host confirms Railway edge (`Server: railway-edge`).

### 9.2 Health endpoint
- Endpoint checked: `GET https://pipeline-punks-v2-production.up.railway.app/health`
- Status: `200`
- Observed response fields:
  - `status: ok`
  - `version: 0.1.0`
  - `knowledge_docs: 512`
  - `llm_provider_default: anthropic`
  - `anthropic_configured: true`
  - `openai_configured: true`
  - `gemini_configured: false`
  - `api_key_required: true`

### 9.3 Tier / sleep / deploy metadata (CLI-verified)
- Current plan: `hobby` (from deployment metadata).
- Sleep behavior: `sleepApplication: false` (configured not to sleep).
- Replicas: `1` (`numReplicas: 1`).
- Runtime: `V2`.
- Latest successful deployment:
  - Deployment ID: `80772a37-0034-4c74-a417-a776407e1085`
  - Created: `2026-03-20T16:13:51.453Z`
  - Commit: `c63f2283c2c0c4741583d19928f6b7e227ea96d3` on `main`
  - Commit author: `Jjohnston70`
- Volume mount:
  - Name: `pipeline-punks-v2-volume`
  - Mount path: `/app/data`
  - Allocated size: `5000 MB`
  - Current usage: `151.38816 MB`

### 9.4 Current backend settings
- `PENNY_API_VERSION`: `0.1.0`
- `LLM_PROVIDER`: `anthropic` (default)
- Backend required env contract documented in `railway-backend/.env.example` and `ENV_EXAMPLE.md`.

### 9.5 Known backend/open issues
- `GET /status` returns `401` without `X-Penny-Api-Key` (expected).
- Repo root is not linked to Railway, but `railway-backend/` is linked correctly and exposes project metadata.

## 10) `scripts/check-env.ts` Implementation + Validation

### Delivered script
- Added `scripts/check-env.ts` with category-aware env checks:
  - `CRITICAL` -> logs `ERROR` and exits with code `1` if missing
  - `REQUIRED` -> logs `WARNING`
  - `OPTIONAL` -> logs `WARNING`

### Validation
- `npx tsc --noEmit scripts/check-env.ts` -> pass (no TypeScript errors)
- `npx tsx scripts/check-env.ts` -> executed successfully with expected missing-var output and critical exit code behavior.

## Regression Baseline Snapshot (Pre-Phase-1)
- `https://pipelinepunks.com` -> `200` (title returned)
- `https://pipelinepunks.com/chief` -> `200` (title returned)
- `https://pipelinepunks.com/api/penny/health` -> `200`
- `https://pipelinepunks.com/penny` -> `404` (baseline issue to investigate)

## Priority Findings Summary
1. High: live secrets present in `.env`/`.env.local` (rotate and relocate).
2. High: Google Drive coupling is broad (`/resources`, middleware, Penny proxy, Fleet-Compliance link data, docs).
3. Medium: active `localStorage` dependencies in multiple Fleet-Compliance/Penny components.
4. Medium: dependency drift (`typescript` in `dependencies`; `lucide-react` unused).
5. Medium: env contract drift (`15` referenced vars not documented in current examples).
