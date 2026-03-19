# Chief Module — Testing & Next Steps

Updated: 2026-03-19

## Test Tomorrow (Post-Consolidation)

- [ ] Verify Vercel build passes (latest push: `8934e2f`)
- [ ] Visit `pipelinepunks.com/chief` — confirm empty state renders (no demo data)
- [ ] Download bulk template from `/api/chief/bulk-template` — verify all sheets present
- [ ] Upload `chief-bulk-upload-filled.xlsx` via `/chief/import` — test each collection:
  - [ ] Drivers
  - [ ] Assets Master
  - [ ] Vehicles & Equipment
  - [ ] Permits & Licenses
  - [ ] Employees
  - [ ] Storage Tanks
  - [ ] Maintenance Schedule
  - [ ] Activity Log
  - [ ] Maintenance Tracker
- [ ] Confirm validation flags fire correctly (required fields, date format, oneOf values)
- [ ] Approve rows and download JSON — verify shape is Firestore-ready
- [ ] Test local records panels still work (employees, assets, suspense, invoices via localStorage)
- [ ] Test FMCSA lookup at `/chief/fmcsa` (requires `FMCSA_API_KEY` env var)
- [ ] Test alert preview at `/chief/alerts`
- [ ] Confirm no "demo" language anywhere in the UI

## Data Pipeline

- [ ] Populate source CSVs with real data (currently in `tooling/chief-sentinel/databases/`)
- [ ] Run `py build_chief_imports.py` from `tooling/chief-sentinel/` to regenerate imported data
- [ ] Review `generated_imports/validation_report.json` — decide which warnings become hard failures

## Chief App — Next Features

- [ ] Employee edit page — `/chief/employees/[id]/edit` (link wired, page not built)
- [ ] Invoice edit page — `/chief/invoices/[id]/edit` (link wired, page not built)
- [ ] Per-record source-quality badges on detail pages
- [ ] Sortable columns / saved filter presets for assets, compliance, suspense
- [ ] Resource/document linkage per asset and compliance record

## Alerts

- [ ] Suspense item auto-generation rules from compliance deadlines
- [ ] Email template refinement
- [ ] Notification log to prevent duplicate sends
- [ ] FMCSA alert integration — auto-generate suspense if carrier safety rating drops

## Penny

- [ ] Improve retrieval and prompt routing for plain-language compliance questions
- [ ] Add source section display or deep-linking for returned CFR answers
- [ ] Deeper Chief data context wired into Penny

## Files / Resources

- [ ] Define attachment model (Google Drive links or Firestore Storage)
- [ ] Identify required Chief manuals, permits, certificates for protected resources
- [ ] Inline rendering vs Drive open decision

## Infrastructure — Vercel Postgres Import Pipeline

### Phase 1: Database Setup
- [ ] Add `@vercel/postgres` dependency
- [ ] Create Vercel Postgres database in Vercel dashboard (Pro account)
- [ ] Add `POSTGRES_URL` env var to Vercel project settings
- [ ] Create `src/lib/chief-db.ts` — connection helper + table init
- [ ] Create schema for all 11 Chief collections (9 existing + Colorado Contacts + Emergency Contacts)

### Phase 2: Multi-Sheet Parsing
- [ ] Update `/api/chief/import/parse` to parse ALL sheets from uploaded XLSX (skip README, Config)
- [ ] Auto-match sheet names to collection schemas via `sheetName` field
- [ ] Return combined results: per-sheet validation with pass/warn counts
- [ ] Add import schemas for Colorado Contacts and Emergency Contacts

### Phase 3: Save-to-Database Flow
- [ ] Build `/api/chief/import/save` API route — accepts approved rows, writes to Vercel Postgres
- [ ] Update ImportReviewer UI:
  - [ ] Show all sheets in a tabbed or accordion view after parsing
  - [ ] Replace "Download Approved" with "Save to Database" (keep download as secondary)
  - [ ] Per-sheet approve/reject with batch controls
- [ ] Add success/error feedback after save

### Phase 4: Read from Database
- [ ] Update `chief-demo-data.ts` to query Vercel Postgres instead of generated file
- [ ] Remove dependency on `chief-imported-data.generated.ts`
- [ ] Verify all Chief pages render from live database

## Other Infrastructure
- [ ] Mobile capture forms — `input[capture]` for camera/barcode on assets
- [ ] Native file uploads to storage

## Sentinel Template Cleanup

Once testing passes, these items can be deleted from `chief-sentinel-main/` to use it as a standalone module/template:

- [ ] `generated_imports/` — now lives in `tooling/chief-sentinel/`
- [ ] `databases/` — now lives in `tooling/chief-sentinel/`
- [ ] `import_mapping/` — now lives in `tooling/chief-sentinel/`
- [ ] `cfr_dot_markdown/` — now lives in `tooling/chief-sentinel/`
- [ ] `firestore_examples/` — now lives in `tooling/chief-sentinel/`
- [ ] `firebase_functions_bundle/` — now lives in `tooling/chief-sentinel/`
- [ ] `build_chief_imports.py` — now lives in `tooling/chief-sentinel/`
- [ ] `validate_import_mapping.py` — now lives in `tooling/chief-sentinel/`
- [ ] `cfr_dot_scaper.py` — now lives in `tooling/chief-sentinel/`
- [ ] `fetch_fmcsa_data.py` — now lives in `tooling/chief-sentinel/`
- [ ] `refresh_chief_demo.ps1` — now lives in `tooling/chief-sentinel/`
- [ ] All `.md` doc files (ARCHITECTURE, FIRESTORE_LAYOUT, etc.) — now in `tooling/chief-sentinel/docs/`
- [ ] `Chief_Logo.png`, `.kmz`, `.docx` — now in `tooling/chief-sentinel/assets/`
- [ ] `asset-command_vs.001/` — confirmed not used, safe to delete entirely
- [ ] `__pycache__/` — build artifact, delete

**Keep in sentinel folder** (template skeleton):
- `command-center-portal-starter.html` — FastAPI+HTMX prototype reference
- `chief-bulk-upload-filled.xlsx` — filled test data for import testing
