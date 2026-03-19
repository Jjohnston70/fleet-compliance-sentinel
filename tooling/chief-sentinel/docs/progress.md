# Progress

## Current Status

Project planning is active. Architecture is defined around the existing Pipeline Punks site instead of a separate app.

## Completed

- Reviewed the existing website stack and confirmed it already uses Next.js with Clerk.
- Confirmed the site styling can be reused for Chief.
- Reviewed the AssetCommand Apps Script implementation and workbook structure.
- Reviewed the root `databases` folder and mapped the major source datasets.
- Identified the `cfr_dot_markdown` output as the initial Penny knowledge base for the demo.
- Identified the current resources flow as a usable protected document/file layer for the demo.
- Defined the core domain model and compliance collections.
- Added compliance template requirements for:
  - State Hazmat
  - Federal Hazmat
  - UCR
  - Operating Authority MC150
  - IFTA
  - IRP
- Reviewed `fetch_fmcsa_data.py` and confirmed it needs refactoring before website use.
- Added `FIRESTORE_LAYOUT.md` with the Firestore collection layout and import order.
- Added `firestore_examples/` with example JSON documents for core collections.
- Added `import_mapping/` Python mapping definitions for the CSV files and workbook sheets.
- Added `validate_import_mapping.py` to validate mapping coverage against the real source files.
- Validated 12 of 12 dataset mappings successfully against the current CSV/workbook sources.
- Added a protected `/chief` route shell inside the existing website.
- Added initial `/chief/assets`, `/chief/compliance`, and `/chief/suspense` route shells.
- Added a signed-in `Chief` navigation link to the website.
- Replaced Penny's whole-file CFR ingest with section-level chunking for live Railway sync.
- Improved Penny retrieval for CFR sections and disabled site-level general fallback by default.
- Updated Penny UI copy/helper prompts to match the CFR/DOT demo corpus.
- Replaced Chief shell routes with a shared demo data layer and rendered demo-backed assets, compliance, and suspense views.
- Added `build_chief_imports.py` to generate normalized collection snapshots from the approved mapping layer.
- Added generated import outputs in `generated_imports/` and a website-side generated module for the Chief routes.
- Rewired the Chief website views to consume the generated import snapshot instead of manual placeholder records.
- Added importer validation outputs in `generated_imports/validation_report.json` and `generated_imports/validation_report.md`.
- Added a generated upload template manifest in `generated_imports/upload_template_manifest.json` plus a website-side generated template module.
- Added a one-command refresh script in `refresh_chief_demo.ps1` to rebuild imports and re-run website lint.
- Added a protected `/api/chief/bulk-template` route that downloads a multi-sheet workbook template for bulk upload.
- Added search/filter controls to `/chief/assets`, `/chief/compliance`, and `/chief/suspense`.
- Added record detail routes for:
  - `/chief/assets/[assetId]`
  - `/chief/compliance/drivers/[personId]`
  - `/chief/compliance/permits/[recordId]`
  - `/chief/suspense/[suspenseItemId]`
- Added deterministic fallback ID generation in the importer when merge-key fields are missing or collide.
- Deployed the updated Penny and Chief routes to production on Vercel.
- Added suspense alert sweep engine (`chief-alert-engine.ts`), cron-secured run endpoint, Clerk-protected preview endpoint, and Vercel daily cron (08:00 UTC). Email delivery uses Resend REST (dry-run when `RESEND_API_KEY` is not set).
- Populated all 6 blank source CSVs (employees, vehicles, tanks, permits, maintenance, emergency contacts) with real demo data. Import now produces 0 warnings, 0 fallbacks. Suspense items grew from 18 to 43.
- Added document linkage cards (category-aware) to asset, driver, and permit detail pages.
- Added maintenance event drill-in route `/chief/maintenance/[eventId]` and activity log drill-in `/chief/activity/[activityId]`.
- Wired activity and maintenance list items in asset detail to their respective drill-in routes.
- Added per-record source quality badges (Complete / Partial / Minimal) to asset, driver, and permit detail pages.
- Added Import Health panel to `/chief` overview showing per-collection record counts from the last import run.

- Added sort selects to `/chief/assets`, `/chief/compliance`, and `/chief/suspense` filter bars (sort params wired into all four filter functions).
- Added quick-filter preset links to `/chief/suspense` (Overdue, Due today, Due this week, High severity, By owner).
- Added `src/lib/chief-fmcsa-client.ts` — server-safe TypeScript fetch client for FMCSA Query Central API (no Streamlit/pandas).
- Added `src/app/api/chief/fmcsa/lookup/route.ts` — Clerk-protected GET `?dot=` proxy route.
- Added `src/app/chief/fmcsa/page.tsx` — carrier safety lookup page with live result display and demo DOT pre-filled.
- Added FMCSA Lookup to the Chief overview module grid and action row.
- Added `FMCSA_API_KEY` to `.env.example`.

## In Progress

- Tightening validation feedback and moving the Chief demo toward editable operational workflows.

## Risks / Notes

- `fetch_fmcsa_data.py` is not directly usable in the website because it depends on Streamlit and missing local helpers.
- Some CSV files are mostly structural placeholders, so imports will need validation and not just blind ingestion.
- `EMPLOYEES.csv` contains sensitive and duplicated fields that must be normalized carefully.
- Workbook dashboard sheets are presentation-only and should not be treated as source-of-truth data.

## Next Milestones

1. Add suspense item generation and email alert flow.
2. Refactor FMCSA logic into a website-safe service.
3. Add resource/document linkage to detail pages.
4. Add inline editing, file intake, and mobile capture flows for operational use.
5. Add Firestore write/export mode on top of the generated snapshot pipeline.
