# Chief Module Architecture

## Deployment Origin

| Field | Value |
|---|---|
| GitHub Org | Pipeline-Punks |
| Repository | pipeline-punks-pipelinex-v2 |
| Vercel Project | pipeline-punks-pipelinex-v2 |
| Vercel Team | jjohnston70s-projects |
| Production URL | https://www.pipelinepunks.com |
| Deploy Method | Vercel CLI — `vercel --prod` from the website folder |
| GitHub CI/CD | Not connected — deploys are manual via CLI |

The repo root contains a `.vercel/project.json` that links to the Vercel project. The `tooling/chief-sentinel/` folder is a data and tooling workspace only — it is never deployed directly. Data flows from this folder into the website via `build_chief_imports.py`, which writes generated TypeScript modules directly into `src/lib/`.

## Goal

Build the Example Fleet Co demo inside the existing Pipeline Punks website using the current Clerk authentication and the same visual language as the live site.

This approach keeps the demo simple now and preserves a clean path to a fuller product later.

## Primary Decision

- Frontend shell: existing Next.js website on Vercel
- Auth: existing Clerk setup
- Styling: reuse Pipeline Punks global CSS tokens and layout patterns
- Penny demo: existing Railway backend, but switch knowledge to `cfr_dot_markdown`
- Chief resources/documents: existing protected Google Drive resources flow
- Chief operational data: design for Firestore-compatible collections, even if some demo data starts with imports and static seed data
- Alerts: suspense-item email reminders from the app/backend layer, not Apps Script

## Why This Architecture

- Clerk auth is already wired into the website.
- Protected resources already exist.
- The current site styling is already usable and should be reused.
- The existing Fleet-Compliance Sentinel implementation is a useful source model, but it is tightly coupled to Google Sheets and Apps Script.
- The Firebase functions bundle is only a starter and should not define the architecture.

## Existing Source Systems To Preserve

### Root data sources

- `databases/EMPLOYEES.csv`
- `databases/VEHICLES & EQUIPMENT.csv`
- `databases/STORAGE TANKS.csv`
- `databases/PERMITS & LICENSES.csv`
- `databases/MAINTENANCE SCHEDULE.csv`
- `databases/EMERGENCY CONTACTS.csv`
- `databases/COLORADO CONTACTS.csv`

### Fleet-Compliance Sentinel source system

- `asset-command_vs.001/asset-command-working-testing-03-07-2026.xlsx`
- `asset-command_vs.001/code.md`
- `asset-command_vs.001/Sidebar.html`
- `asset-command_vs.001/Dashboard.html`

### FMCSA source helper

- `fetch_fmcsa_data.py`

Important: `fetch_fmcsa_data.py` should be treated as logic reference only. It currently depends on Streamlit and missing local modules, so it should be refactored into a website/backend-safe FMCSA client before use.

## Domain Model

### Core collections

- `organizations`
- `people`
- `employee_compliance`
- `emergency_contacts`
- `assets`
- `vehicle_assets`
- `tank_assets`
- `activity_logs`
- `maintenance_plans`
- `maintenance_events`
- `attachments`

### Compliance collections

- `compliance_requirement_templates`
- `permit_license_records`
- `suspense_items`
- `fmcsa_snapshots`
- `notifications_log`

### Reference collections

- `reference_contacts`

## Collection Responsibilities

### organizations

Organization-level config for business name, default alert email, timezone, alert rules, and future tenant scoping.

### people

Employee master records from the CSVs and driver-oriented workbook data.

### employee_compliance

Driver and employee compliance details such as CDL, medical card, MVR, hazmat training, TSA checks, endorsements, and related expirations.

### assets

Shared parent collection for all tracked physical items. This should cover fleet units, equipment, fuel cubes, skid tanks, and storage tanks.

### vehicle_assets

Vehicle-specific details such as VIN, plate, inspection dates, vapor tests, mileage, and assigned driver.

### tank_assets

Tank-specific compliance and inventory details such as capacity, permit data, leak testing, calibration, and reorder thresholds.

### activity_logs

Operational events such as checkout, check-in, refuel, location updates, incidents, and meter readings.

### maintenance_plans

Scheduled maintenance definitions imported from the maintenance schedule source.

### maintenance_events

Actual executed maintenance jobs, statuses, costs, vendors, and notes.

### attachments

Photos, PDFs, certificates, inspection forms, and external file references. For the demo, these can point to Google Drive. Later they can move to Firebase Storage if needed.

### compliance_requirement_templates

System-defined compliance cadence rules. Seed with:

- State Hazmat: annual
- Federal Hazmat: every 4 years
- UCR: annual
- Operating Authority MC150: every 2 years, not later than October
- IFTA: quarterly
- IRP: annual

### permit_license_records

Tracked permit and license instances tied to an organization, vehicle, driver, or tank.

### suspense_items

Generated or manually tracked due items used for reminders and dashboards. This drives email alerts.

### fmcsa_snapshots

Carrier profile and safety pull snapshots fetched from the FMCSA API for auditing and status display.

### notifications_log

Records of alert delivery attempts to prevent duplicate or excessive reminder traffic.

## Source Mapping Rules

### Import priority

1. `organizations`
2. `people`
3. `employee_compliance`
4. `assets`
5. `vehicle_assets`
6. `tank_assets`
7. `maintenance_plans`
8. `maintenance_events`
9. `activity_logs`
10. `permit_license_records`
11. `reference_contacts`
12. `emergency_contacts`
13. generated `suspense_items`

### Normalization rules

- Use `orgId` on every collection from day one.
- Treat workbook dashboards and setup sheets as presentation only, not source data.
- Treat workbook `Cost Tracking` as derived data, not source of truth.
- Normalize duplicated date fields from `EMPLOYEES.csv`.
- Do not expose full SSNs to frontend-accessible data.
- Prefer stable IDs over names for relationships whenever possible.

## UI Architecture

### App location

Chief should live inside the existing website as protected routes, for example:

- `/chief`
- `/chief/assets`
- `/chief/drivers`
- `/chief/tanks`
- `/chief/compliance`
- `/chief/suspense`

### Styling

Reuse the Pipeline Punks visual system:

- existing CSS variables
- current typography
- current button classes
- current spacing and container patterns

Do not copy the Apps Script sidebar/dashboard styling directly. Use it as workflow inspiration only.

## Penny Architecture

### Current recommendation

Keep Penny on Railway for now and switch the knowledge base to the generated `cfr_dot_markdown` set.

### Demo behavior

- Clerk-protected Penny access remains in the website
- Railway backend ingests CFR markdown files
- Questions answer against Title 49 CFR markdown instead of the current realty/demo knowledge set
- NotebookLM can be used as a secondary reference experience for Chief staff, but not as the main product surface

## Resources And Files

Use the current protected resources flow in the website for:

- manuals
- permits
- certificates
- photos
- linked Drive files

For the demo, Drive-backed links are acceptable. Native upload management can come in the next build phase.

## Suspense Email Alerts

### Required behavior

- daily scheduled sweep
- due soon reminders
- overdue reminders
- owner-level reminders
- summary email to fleet/compliance manager
- deduping through `notifications_log`

### Initial rule windows

- 30 days
- 14 days
- 7 days
- due today
- overdue

## FMCSA Integration Plan

### Initial scope

- manually trigger FMCSA lookup by DOT number
- fetch carrier basics and profile
- store raw snapshot
- show last fetched carrier status in Chief
- optionally generate alerts when operating status or rating creates concern

### Implementation note

Refactor `fetch_fmcsa_data.py` into a server-safe utility or backend route. Do not reuse Streamlit-specific code directly.

## Delivery Plan

### Phase 1

- Architecture and field mapping
- Track progress and backlog
- Add Chief route shell inside existing site
- Switch Penny knowledge base to `cfr_dot_markdown`

### Phase 2

- Import source data
- Build assets, drivers, tanks, and suspense views
- Add email alerts
- Add Drive-linked attachments

### Phase 3

- FMCSA integration
- richer forms
- inline editing
- mobile capture uploads
- optional Firebase Storage / Firestore backing for full operational workflows

