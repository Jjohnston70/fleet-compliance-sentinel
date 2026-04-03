# PATH-2 -- Module UI Build Status

Fleet-Compliance Sentinel | True North Data Strategies LLC
Last Updated: 2026-04-03

## Status Legend

- [x] Complete
- [~] Complete with known issue
- [ ] Not started

---

## Task 0: Admin Module Toggle Page + Sidebar Reorganization

- [x] Part A: Developer-only module toggle page (`/fleet-compliance/dev/modules`)
- [x] Part B: Sidebar reorganization into collapsible section groups (`sidebar-config.ts`)

---

## Task 12: Realty Command UI

- [x] API route: `/api/fleet-compliance/realty/route.ts` (GET pipeline/score-lead/commission, POST update-stage/add-deal/add-lead)
- [x] Page: `/fleet-compliance/realty/page.tsx` (pipeline Kanban board, lead scoring, summary cards)
- [x] Page: `/fleet-compliance/realty/calculator/page.tsx` (commission calculator)
- [x] Sidebar: Added "Realty" under Finance section
- [x] Module registered in `modules.ts` (plan: pro)
- [x] Light theme fix applied (was rendering dark theme colors on light background)

---

## Task 14: DQ Command UI

- [x] Shared store: `/src/lib/dq-store.ts` (26 doc types, seed data, all business logic)
- [x] API route: `/api/fleet-compliance/dq/files/route.ts` (GET list + summary, POST create)
- [x] API route: `/api/fleet-compliance/dq/files/[id]/route.ts` (GET single file + checklist)
- [x] API route: `/api/fleet-compliance/dq/files/[id]/checklist/route.ts` (GET checklist + completion metrics)
- [x] API route: `/api/fleet-compliance/dq/documents/route.ts` (POST upload)
- [x] API route: `/api/fleet-compliance/dq/documents/generate/route.ts` (POST generate)
- [x] API route: `/api/fleet-compliance/dq/intake/[token]/route.ts` (GET validate, POST submit/complete)
- [x] API route: `/api/fleet-compliance/dq/sweep/route.ts` (POST run sweep)
- [x] API route: `/api/fleet-compliance/dq/gaps/route.ts` (GET gaps)
- [x] Page: `/fleet-compliance/dq/page.tsx` (manager dashboard, summary cards, driver table)
- [x] Page: `/fleet-compliance/dq/new/page.tsx` (create DQ file, intake link generation)
- [x] Page: `/fleet-compliance/dq/[id]/page.tsx` (driver detail, DQF/DHF tabs, checklist)
- [x] Page: `/fleet-compliance/dq/gaps/page.tsx` (compliance gaps, severity badges)
- [x] Page: `/intake/[token]/page.tsx` (public driver intake wizard, 6-step, mobile-friendly)
- [x] Sidebar: Added "DQ Files" under Compliance section
- [x] Module registered in `modules.ts` (plan: starter)
- [x] Compatibility + stability fixes: response shape alignment (API/UI), intake section fallback guard, and live generate/upload actions on DQ detail
- [x] Local validation: `npm run build` passes

---

## Task 1: Proposal Command UI

- [x] API route: `/api/fleet-compliance/proposals/route.ts` (GET list, POST create)
- [x] API route: `/api/fleet-compliance/proposals/[id]/route.ts` (GET, PATCH)
- [x] API route: `/api/fleet-compliance/proposals/[id]/generate/route.ts` (POST DOCX download)
- [x] API route: `/api/fleet-compliance/proposals/[id]/send/route.ts` (POST send)
- [x] Page: `/fleet-compliance/proposals/page.tsx` (list view + empty state + row click)
- [x] Page: `/fleet-compliance/proposals/new/page.tsx` (create form + line item add/remove)
- [x] Page: `/fleet-compliance/proposals/[id]/page.tsx` (detail view, timeline, actions)
- [x] Runtime bridge: `/src/lib/proposal-command-runtime.ts` imports from `tooling/proposal-command/dist/src/index.js`
- [x] Build tracing updated for proposal module dist (`next.config.js`)
- [~] Local smoke test deferred by decision: no local/prod module-level testing until all PATH-2 module UIs are complete

---

## Task 4: Sales Command UI

- [x] API route: `/api/fleet-compliance/sales/route.ts` (GET dashboard payload: trends, KPIs, comparison, top products, channels, forecast)
- [x] API route: `/api/fleet-compliance/sales/import/route.ts` (POST CSV import)
- [x] Page: `/fleet-compliance/sales/page.tsx` (KPI cards, trend line chart, comparison bar chart, top products table, channel donut, forecast card, CSV import UI)
- [x] Runtime bridge: `/src/lib/sales-command-runtime.ts` imports from `tooling/sales-command/dist/src/index.js`
- [x] Build tracing updated for sales module dist (`next.config.js`)
- [x] Dependency added: `recharts` for chart rendering
- [x] Validation: `npx eslint` (targeted files), `npx tsc --noEmit`, and `npm run build` pass

---

## Not Started

- [ ] Task 2: Dispatch Command UI
- [ ] Task 3: Financial Command UI
- [ ] Task 5: Contract Command UI
- [ ] Task 6: GovCon Command UI
- [ ] Task 7: Task Command UI
- [ ] Task 8: Email Command UI
- [ ] Task 9: Onboard Command UI
- [ ] Task 10: Compliance Command UI
- [ ] Task 11: Readiness Command UI
- [ ] Task 13: Training Command UI (Courses & Workshops)

---

## Next Actions

1. Commit and push Task 1 (Proposal), Task 4 (Sales), and Task 14 (DQ) completion.
2. Continue PATH-2 module builds without local smoke testing until all module UIs are implemented.
3. Build order moving forward: Task 2 Dispatch -> Task 3 Financial -> Task 5 Contract -> Task 6 GovCon -> Task 7 Task -> Task 8 Email -> Task 9 Onboard -> Task 10 Compliance -> Task 11 Readiness -> Task 13 Training.
4. After all module UIs are complete, run one consolidated local + production smoke test pass for every module.
