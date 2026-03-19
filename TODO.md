# PipelineX / Chief Module — Status & Next Steps

Updated: 2026-03-19

## Completed Today (2026-03-19)

- [x] Neon Postgres provisioned via Vercel CLI (`neon-cerise-horizon`)
- [x] `@neondatabase/serverless` added as dependency
- [x] `chief_records` table created (JSONB, single-table design)
- [x] `/api/chief/import/parse` — multi-sheet XLSX parsing (all 11 sheets at once)
- [x] `/api/chief/import/save` — write approved rows to Postgres
- [x] `/api/chief/import/setup` — table initialization endpoint
- [x] Added Colorado Contacts + Emergency Contacts schemas (11 total)
- [x] ImportReviewer UI — tabbed multi-sheet review, "Save to Database" primary action
- [x] `chief-data.ts` async data layer — all pages query Postgres live
- [x] All 12 Chief pages rewired from empty generated file to Postgres
- [x] Alert engine refactored to accept data as parameter
- [x] Removed all `LocalRecordsPanel` components (localStorage → Postgres)
- [x] Employee page rewritten with DB-backed employee + driver tables
- [x] Asset status dropdown: Active, In Shop Reactive, In Shop Scheduled, Out of Service, Other
- [x] Invoice page placeholder for PDF upload feature
- [x] PennyChat.tsx smart-quote build fix
- [x] 95 rows imported across 11 collections from bulk XLSX
- [x] Vercel build passes, deployed to production

## Architecture

```
Upload Flow:
  XLSX file → /api/chief/import/parse (multi-sheet) → ImportReviewer (tabbed review)
    → /api/chief/import/save → Neon Postgres (chief_records table)

Read Flow:
  Server component → loadChiefData() → Neon Postgres → typed records
    → ChiefAssetRecord, ChiefDriverComplianceRecord, ChiefPermitRecord, etc.

Database:
  Neon Postgres (via Vercel integration)
  Single table: chief_records (id, collection, data JSONB, imported_at, imported_by)
  11 collections: drivers, assets_master, storage_tanks, vehicles_equipment,
    permits_licenses, employees, maintenance_schedule, activity_log,
    maintenance_tracker, colorado_contacts, emergency_contacts
```

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/chief-data.ts` | Async data layer — queries Postgres, transforms to typed records |
| `src/lib/chief-db.ts` | Neon connection helper, table init, CRUD operations |
| `src/lib/chief-import-schemas.ts` | 11 collection schemas, validation, sheet name mapping |
| `src/app/api/chief/import/parse/route.ts` | Multi-sheet XLSX parser API |
| `src/app/api/chief/import/save/route.ts` | Save approved rows to Postgres |
| `src/components/chief/ImportReviewer.tsx` | Multi-sheet upload/review/save UI |

## Next Features

- [ ] Invoice PDF upload — parse vendor details, amounts, line items from PDF
- [ ] Employee edit page — `/chief/employees/[id]/edit`
- [ ] Per-record source-quality badges on detail pages
- [ ] Sortable columns / saved filter presets
- [ ] Resource/document linkage per asset and compliance record
- [ ] Mobile capture forms — `input[capture]` for camera/barcode on assets

## Alerts

- [x] Suspense auto-generated from driver/permit/asset compliance deadlines
- [ ] Email template refinement
- [ ] Notification log to prevent duplicate sends
- [ ] FMCSA alert integration — auto-generate suspense if carrier safety rating drops

## Penny

- [ ] Improve retrieval and prompt routing for plain-language compliance questions
- [ ] Add source section display or deep-linking for returned CFR answers
- [ ] Deeper Chief data context wired into Penny

## TrueNorth Sentinel App

Standalone app version at `chief-sentinel-main/`. Mirrors website Chief module plus:
- Clerk authentication
- Pipeline Penny LLM page
- Protected resources page
- Renamed from "Chief" to "TrueNorth Sentinel"
