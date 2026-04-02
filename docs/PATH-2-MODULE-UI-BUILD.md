# Path 2 -- Module UI Build Plan

Fleet-Compliance Sentinel | True North Data Strategies LLC
Last Updated: 2026-04-02

## What This Is

A sequential task list for wiring every command module into the live app with dedicated pages, API routes, and click-to-use interfaces. No JSON entry, no raw args, no code. Buttons, forms, dropdowns, status cards.

Each task includes a self-contained prompt with context, role, constraints, deliverables, and test criteria. Run them one at a time. Each builds on the previous.

## Architecture Decisions (Apply to All Tasks)

- Route prefix: `/api/fleet-compliance/{module-slug}/` for API routes
- Page prefix: `/fleet-compliance/{module-slug}/` for UI pages
- Auth: Clerk org-scoped, admin role for write actions, member role for read
- Data: In-memory repository initially (same as tooling modules), Supabase/Postgres migration is a separate effort
- UI: Tailwind + shadcn/ui components, consistent with existing fleet-compliance pages
- Each module imports directly from `tooling/{module-name}/dist/src/index.js` (must be built first via `npm run build`)
- All modules registered in `/src/lib/modules.ts` plan catalog with appropriate plan tier

## Pre-Flight Checklist (Do This Once Before Starting)

```bash
# Build all command modules so dist/ exists for each
cd tooling/proposal-command && npm run build
cd ../dispatch-command && npm run build
cd ../compliance-command && npm run build
cd ../contract-command && npm run build
cd ../email-command && npm run build
cd ../financial-command && npm run build
cd ../govcon-command && npm run build
cd ../onboard-command && npm run build
cd ../readiness-command && npm run build
cd ../realty-command && npm run build
cd ../sales-command && npm run build
cd ../task-command && npm run build
cd ../training-command && npm run build
cd ../dq-command && npm install && npm run build
```

---

## Task 0: Admin Module Toggle Page + Sidebar Reorganization (Developer-Only)

**Do this first. Every other task depends on it.**

This task has two parts:
- **Part A:** Developer-only module toggle page
- **Part B:** Reorganize the sidebar into collapsible section groups

### Prompt

```
CONTEXT:
Fleet-Compliance Sentinel is a Next.js 14 app using Clerk for auth with org-scoped tenants.
The app has a module catalog in /src/lib/modules.ts that defines which modules exist and which
plan tier they require (trial, starter, pro, enterprise). When a new org is provisioned, they
get modules based on their plan. Currently there is no UI for me (the platform owner / developer)
to toggle individual modules on or off per org after provisioning.

The existing fleet-compliance shell is at /src/app/fleet-compliance/layout.tsx and uses
FleetComplianceShell for navigation. The admin tools page is at /fleet-compliance/tools/.

The sidebar currently has a flat list of navigation links. With 14+ modules being added, it
will become unmanageable. The sidebar needs to be reorganized into collapsible section groups.

ROLE:
You are building an internal developer/admin page that ONLY I can see. Not org admins -- me,
the platform owner. This page is for when a customer pays and I need to turn on their modules,
or when I need to disable something during troubleshooting.

CONSTRAINTS:

--- Part A: Module Toggle Page ---
- Page route: /fleet-compliance/dev/modules
- Access: Restrict to a hardcoded list of Clerk user IDs (Jacob's account) OR check for a
  custom "platform_admin" metadata field on the Clerk user. No org admins should see this.
- Do NOT add this page to the sidebar navigation. It's a hidden route I bookmark.
- Use the existing module catalog from /src/lib/modules.ts as the source of truth for what
  modules exist.
- Store per-org module overrides in the database (Neon Postgres). Create a migration for a
  `module_overrides` table: org_id TEXT, module_id TEXT, enabled BOOLEAN, toggled_by TEXT,
  toggled_at TIMESTAMPTZ, with a unique constraint on (org_id, module_id).
- The UI should show: org selector (dropdown of all orgs from Clerk), then a grid/list of
  all modules with toggle switches. Each toggle shows the module name, description, plan tier,
  and current state (enabled/disabled/plan-default). Changes save immediately via API call.
- Include a "Reset to Plan Defaults" button per org.
- Show a log of recent toggle actions at the bottom (last 20).

--- Part B: Sidebar Reorganization ---
- Refactor FleetComplianceShell sidebar navigation to use COLLAPSIBLE SECTION GROUPS.
- Each section has a header that clicks to expand/collapse, with a chevron icon indicating state.
- Sections remember their open/closed state (use localStorage or React state, NOT a database call).
- Section groups and their modules:

  OPERATIONS (default: expanded)
    - Dashboard (home)
    - Assets
    - Employees
    - Dispatch
    - Tasks
    - Onboarding

  COMPLIANCE (default: expanded)
    - Compliance Overview
    - DQ Files
    - Alerts
    - Suspense
    - FMCSA Lookup

  TRAINING (default: expanded)
    - Training Hub (/fleet-compliance/training -- PHMSA hazmat modules, existing)
    - My Training (/fleet-compliance/training/my -- employee assignment view, existing)
    - Training Admin (/fleet-compliance/training/manage -- admin assignments, existing, admin-only)
    - Hazmat Reports (/fleet-compliance/training/reports -- existing, admin-only)
    - Courses & Workshops (training-command -- professional development, NEW)

  FINANCE (default: collapsed)
    - Financial
    - Sales
    - Proposals
    - Contracts
    - Invoices

  INTELLIGENCE (default: collapsed)
    - Email Analytics
    - Readiness
    - GovCon
    - Realty
    - Telematics

  ADMIN (default: collapsed, admin role only)
    - Settings
    - Spend Dashboard
    - Import Data
    - Command Center
    - Module Tools

- Only show modules that are ENABLED for the current org (check module_overrides from Part A).
  If a module is disabled or not in the org's plan, hide the sidebar link entirely.
- The section header should still show even if only 1 module in that group is enabled, but
  hide the entire section if ALL modules in it are disabled for that org.
- Use a consistent icon for each module (Lucide icons, matching the module catalog).
- Keep the sidebar responsive -- on mobile it should collapse to a hamburger menu.
- The sidebar grouping config should be a single array/object in one file so future modules
  can be added by editing one place, not scattered across components.

DELIVERABLES:
1. Migration file: /migrations/014_module_overrides.sql (or next available number)
2. API route: /api/fleet-compliance/dev/modules/route.ts (GET list, POST toggle, DELETE reset)
3. Page: /src/app/fleet-compliance/dev/modules/page.tsx
4. Helper: Update /src/lib/modules.ts to check module_overrides table before returning
   enabled modules for an org
5. Sidebar config: /src/lib/sidebar-config.ts (section groups, module-to-section mapping,
   icons, default expand/collapse state)
6. Refactored FleetComplianceShell with collapsible sidebar sections
7. Sidebar reads enabled modules from org context and hides disabled ones

OUTPUT FORMAT:
- All files created in the codebase
- No placeholder "TODO" comments -- working code
- TypeScript strict mode

TEST:
- Navigate to /fleet-compliance/dev/modules while logged in as Jacob -- page loads
- Navigate while logged in as any other user -- 403 or redirect
- Toggle a module off for an org -- verify it disappears from that org's sidebar/catalog
- Toggle it back on -- verify it reappears
- Click "Reset to Plan Defaults" -- verify overrides are cleared
- Sidebar shows collapsible sections with chevron icons
- Click section header -- section collapses/expands, chevron rotates
- Refresh page -- section state persists (open/closed remembered)
- Disable all modules in a section via dev page -- entire section header hides from sidebar
- Enable one module back -- section reappears with just that one link
- On mobile viewport -- sidebar collapses to hamburger menu
```

---

## Task 1: Proposal Command UI

### Prompt

```
CONTEXT:
The proposal-command module lives at /tooling/proposal-command/ and is a fully built TypeScript
service module with 12 LLM tools. It handles proposal generation, pricing, DOCX output, email
delivery, and lifecycle tracking (draft > sent > viewed > accepted/declined/expired).

Key services: ProposalService (CRUD + auto-numbering PROP-{YYYY}-{seq}), ProposalEngine
(Handlebars template rendering), PricingService (line items, tax, discount), PDFGenerator
(DOCX output via docx library), EmailService (Resend pattern), plus hooks for expiration
checking and follow-up reminders.

5 built-in templates: Web Development, Consulting, Design, Data Analytics, Strategy.
Data model: Proposal, Client, LineItem, ProposalTemplate, ProposalActivity.
Status flow: draft > generated > sent > viewed > accepted | declined | expired.

The existing app has no proposal pages or API routes yet. The module is registered in the
command-center manifest under "Finance" classification.

ROLE:
You are building the proposal management UI for fleet managers and service company owners.
They need to create proposals for clients, track status, and generate downloadable documents.
No JSON, no code -- click-to-use forms with dropdowns and buttons.

CONSTRAINTS:
- API routes at /api/fleet-compliance/proposals/ (CRUD, generate PDF, send, track)
- Pages at /fleet-compliance/proposals/ (list, create, detail/edit)
- Import services from tooling/proposal-command/dist/src/index.js
- Create page list view: table with proposal number, client, amount, status, date, actions
- Create page detail view: proposal info card, line items table, status timeline, action buttons
  (Generate PDF, Send to Client, Mark Accepted/Declined)
- Create page new form: multi-step or single-page form with client info, service type dropdown
  (5 templates), project title, description, line items (add/remove rows), validity period
- Add "Proposals" to the fleet-compliance sidebar navigation
- Register in /src/lib/modules.ts as plan: 'starter'
- All amounts displayed as USD formatted ($X,XXX.XX)
- Status badges with color coding (draft=gray, sent=blue, viewed=yellow, accepted=green,
  declined=red, expired=orange)

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/proposals/route.ts (GET list, POST create)
2. API routes: /src/app/api/fleet-compliance/proposals/[id]/route.ts (GET, PATCH)
3. API routes: /src/app/api/fleet-compliance/proposals/[id]/generate/route.ts (POST)
4. API routes: /src/app/api/fleet-compliance/proposals/[id]/send/route.ts (POST)
5. Page: /src/app/fleet-compliance/proposals/page.tsx (list view)
6. Page: /src/app/fleet-compliance/proposals/new/page.tsx (create form)
7. Page: /src/app/fleet-compliance/proposals/[id]/page.tsx (detail view)
8. Sidebar update: Add Proposals link to FleetComplianceShell navigation

TEST:
- Navigate to /fleet-compliance/proposals -- see empty state with "Create Proposal" button
- Click Create Proposal -- fill out form with client name, select template, add 2 line items
- Submit -- redirected to detail page showing proposal with PROP-2026-XXXX number
- Click "Generate PDF" -- DOCX file downloads
- Back to list -- proposal appears in table with correct status and amount
- Click proposal row -- detail page loads with all info
```

---

## Task 2: Dispatch Command UI

### Prompt

```
CONTEXT:
The dispatch-command module at /tooling/dispatch-command/ handles HVAC emergency dispatch
operations. 10 tools covering request creation, driver assignment, SLA monitoring, routing,
and metrics. Services: DispatchService, DriverService, TruckService, RoutingService (Haversine),
SLAService, SchedulingService. Hooks: SLAMonitor, AutoDispatcher. Reporting: DispatchDashboard,
ResponseTimeReport. Includes zone definitions and seed data for Colorado Springs.

Data: DispatchRequest (priority: emergency/urgent/standard/scheduled), Driver (with location,
certifications, shift), Truck (with compartments), Zone (with boundaries).
Status flow: pending > dispatched > en_route > on_site > completed | cancelled.
SLA thresholds: Emergency 30min, Urgent 2hr, Standard 4hr, Scheduled 24hr.

ROLE:
You are building a real-time dispatch dashboard for fleet operations managers. They need to
see active requests, assign drivers, monitor SLA compliance, and view zone status -- all
with click actions, not code.

CONSTRAINTS:
- API routes at /api/fleet-compliance/dispatch/
- Pages at /fleet-compliance/dispatch/
- Import from tooling/dispatch-command/dist/src/index.js
- Dashboard view: summary cards (pending/dispatched/en_route/on_site counts), active requests
  table with SLA countdown timers, driver availability panel
- Create request form: client info, address, zone dropdown, priority dropdown, issue type
  dropdown, description textarea
- Request detail: status timeline, assigned driver info, SLA status bar (green/yellow/red),
  action buttons (Assign Driver, Reassign, Complete, Cancel)
- Driver panel: list of drivers with status badges, availability toggle buttons
- Zone status: cards showing active requests per zone and average response time
- Add "Dispatch" to sidebar navigation
- Register in modules.ts as plan: 'starter'
- SLA status colors: healthy=green, warning=yellow, critical=orange, breached=red

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/dispatch/route.ts (GET list, POST create)
2. API routes: /src/app/api/fleet-compliance/dispatch/[id]/route.ts (GET, PATCH assign/complete/cancel)
3. API routes: /src/app/api/fleet-compliance/dispatch/drivers/route.ts (GET, PATCH status)
4. API routes: /src/app/api/fleet-compliance/dispatch/metrics/route.ts (GET dashboard)
5. Page: /src/app/fleet-compliance/dispatch/page.tsx (dashboard)
6. Page: /src/app/fleet-compliance/dispatch/new/page.tsx (create request)
7. Page: /src/app/fleet-compliance/dispatch/[id]/page.tsx (request detail)
8. Sidebar update

TEST:
- Navigate to /fleet-compliance/dispatch -- dashboard shows seed data (zones, drivers)
- Create new dispatch request -- appears in active requests table
- Click Assign Driver on a pending request -- dropdown shows available drivers, select one
- Request status updates to "dispatched", SLA timer starts
- Click driver name -- see driver detail with current assignment
- Metrics cards update in real time
```

---

## Task 3: Financial Command UI

### Prompt

```
CONTEXT:
The financial-command module at /tooling/financial-command/ provides 9 tools: categorize_transaction,
get_tax_summary, import_bank_csv, get_dashboard_data, get_budget_variance, create_transaction,
list_transactions, get_account_balances, process_recurring_payments.

Handles transaction categorization, tax summaries, bank CSV import, budget tracking, and
recurring payment processing. Built for small business owners who need to see their money
without an accounting degree.

ROLE:
You are building a financial dashboard for small business owners. They need to see account
balances, recent transactions, budget vs actual, and tax summaries. Import bank statements
via CSV upload. No accounting jargon in the UI.

CONSTRAINTS:
- API routes at /api/fleet-compliance/financial/
- Pages at /fleet-compliance/financial/
- Import from tooling/financial-command/dist/src/index.js
- Dashboard: account balance cards, recent transactions list, budget variance chart (bar),
  tax summary card with quarterly breakdown
- Transactions page: filterable table (date range, category, amount range), CSV import button
  with file upload dialog, manual "Add Transaction" form
- Budget page: category-by-category budget vs actual with variance percentage and color coding
  (green = under budget, red = over)
- Add "Financial" to sidebar
- Register as plan: 'starter'
- All currency as USD ($X,XXX.XX), dates as MM/DD/YYYY

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/financial/route.ts (dashboard, transactions CRUD)
2. API routes: /src/app/api/fleet-compliance/financial/import/route.ts (POST CSV upload)
3. API routes: /src/app/api/fleet-compliance/financial/tax/route.ts (GET summary)
4. API routes: /src/app/api/fleet-compliance/financial/budget/route.ts (GET variance)
5. Page: /src/app/fleet-compliance/financial/page.tsx (dashboard)
6. Page: /src/app/fleet-compliance/financial/transactions/page.tsx (list + import)
7. Page: /src/app/fleet-compliance/financial/budget/page.tsx (budget vs actual)
8. Sidebar update

TEST:
- Navigate to /fleet-compliance/financial -- dashboard loads with balance cards and charts
- Click "Import CSV" -- file dialog opens, select a bank CSV, transactions appear in table
- Click "Add Transaction" -- form with date, description, amount, category dropdown
- Navigate to budget page -- see category breakdown with color-coded variance
- Navigate to tax page or card -- see quarterly tax summary
```

---

## Task 4: Sales Command UI

### Prompt

```
CONTEXT:
The sales-command module at /tooling/sales-command/ provides 7 tools: get_sales_trend,
compare_periods, forecast_revenue, import_csv, get_top_products, get_kpi_summary,
get_channel_breakdown.

Handles sales analytics -- trend lines, period-over-period comparison, revenue forecasting,
product rankings, KPI dashboards, and channel performance breakdowns.

ROLE:
You are building a sales analytics dashboard. The owner wants to see trends, compare this
month vs last month, know their top products, and forecast next month's revenue. Visual,
chart-heavy, minimal text.

CONSTRAINTS:
- API routes at /api/fleet-compliance/sales/
- Pages at /fleet-compliance/sales/
- Import from tooling/sales-command/dist/src/index.js
- Dashboard: KPI summary cards (total revenue, avg deal size, conversion rate, deals closed),
  sales trend line chart (recharts), period comparison bar chart
- Top products: ranked table with revenue, units, growth %
- Channel breakdown: pie or donut chart showing revenue by channel
- Forecast: simple card showing projected revenue for next period with confidence range
- CSV import for historical sales data
- Add "Sales" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/sales/route.ts (trends, KPIs, forecast)
2. API routes: /src/app/api/fleet-compliance/sales/import/route.ts (POST CSV)
3. Page: /src/app/fleet-compliance/sales/page.tsx (dashboard with charts)
4. Sidebar update

TEST:
- Navigate to /fleet-compliance/sales -- dashboard loads with KPI cards and trend chart
- Import CSV -- data populates charts
- Period comparison shows current vs previous with delta %
- Top products table renders ranked list
- Forecast card shows projected number
```

---

## Task 5: Contract Command UI

### Prompt

```
CONTEXT:
The contract-command module at /tooling/contract-command/ provides 8 tools: add_contract,
get_expiring_contracts, get_vendor_analysis, create_amendment, get_contract_summary,
update_contract_status, get_expiration_calendar, add_party.

Manages contracts with vendors, tracks expiration dates, handles amendments, and provides
vendor analysis. Key for fleet operators managing fuel suppliers, maintenance shops, insurance.

ROLE:
You are building a contract management UI. Fleet managers need to see all active contracts,
know what's expiring soon, create new contracts, and amend existing ones. Calendar view for
expirations is critical.

CONSTRAINTS:
- API routes at /api/fleet-compliance/contracts/
- Pages at /fleet-compliance/contracts/
- Import from tooling/contract-command/dist/src/index.js
- List view: table with vendor name, contract type, start/end dates, value, status, days
  until expiry (color coded: >90d green, 30-90d yellow, <30d red, expired=red bold)
- Detail view: contract info card, parties list, amendments timeline, action buttons
  (Amend, Renew, Terminate)
- New contract form: vendor info, contract type, dates, value, upload contract PDF, add parties
- Calendar view: month calendar showing contract expirations as dots/badges
- Expiring soon widget: top 5 contracts expiring in next 30 days
- Add "Contracts" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/contracts/route.ts (CRUD)
2. API routes: /src/app/api/fleet-compliance/contracts/[id]/route.ts (GET, PATCH, amendments)
3. API routes: /src/app/api/fleet-compliance/contracts/calendar/route.ts (GET)
4. Page: /src/app/fleet-compliance/contracts/page.tsx (list + expiring widget)
5. Page: /src/app/fleet-compliance/contracts/new/page.tsx (create form)
6. Page: /src/app/fleet-compliance/contracts/[id]/page.tsx (detail)
7. Page: /src/app/fleet-compliance/contracts/calendar/page.tsx (calendar view)
8. Sidebar update

TEST:
- Navigate to /fleet-compliance/contracts -- table loads, expiring widget shows top 5
- Create new contract -- fill form, submit, appears in table
- Click contract row -- detail page with full info
- Click Amend -- amendment form, submit, shows in amendments timeline
- Navigate to calendar -- see expiration dates plotted on calendar
```

---

## Task 6: GovCon Command UI

### Prompt

```
CONTEXT:
The govcon-command module at /tooling/govcon-command/ provides 10 tools: search_opportunities,
run_bid_decision, get_pipeline_status, log_outreach_activity, check_compliance_status,
get_upcoming_deadlines, create_opportunity, get_win_loss_report, list_contacts, get_bid_recommendation.

Manages government contracting pipeline -- opportunity tracking, bid/no-bid decisions, compliance
readiness, outreach logging, and win/loss analysis. Built for SDVOSB small businesses pursuing
federal contracts.

ROLE:
You are building a GovCon pipeline dashboard. Jacob needs to track federal opportunities from
SAM.gov, make bid/no-bid decisions with scoring, log outreach to contracting officers, and
track win rates. This is a sales pipeline specifically for government work.

CONSTRAINTS:
- API routes at /api/fleet-compliance/govcon/
- Pages at /fleet-compliance/govcon/
- Import from tooling/govcon-command/dist/src/index.js
- Pipeline dashboard: Kanban-style board (Identified > Qualifying > Bid > Submitted > Won | Lost)
  OR table view with toggle. Summary cards: total pipeline value, active bids, win rate, upcoming
  deadlines count
- Opportunity detail: solicitation info, NAICS codes, set-aside type, estimated value, due date,
  bid decision score, outreach log, compliance checklist
- Create opportunity form: title, agency, solicitation number, NAICS, set-aside, value, due date,
  description, URL
- Bid decision tool: click "Run Bid Decision" on an opportunity -- shows scored recommendation
  (bid/no-bid with reasoning)
- Deadlines view: upcoming deadlines sorted by date with countdown
- Add "GovCon" to sidebar
- Register as plan: 'pro'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/govcon/route.ts (CRUD, pipeline)
2. API routes: /src/app/api/fleet-compliance/govcon/[id]/route.ts (GET, PATCH, bid-decision)
3. API routes: /src/app/api/fleet-compliance/govcon/deadlines/route.ts (GET)
4. Page: /src/app/fleet-compliance/govcon/page.tsx (pipeline dashboard)
5. Page: /src/app/fleet-compliance/govcon/new/page.tsx (create opportunity)
6. Page: /src/app/fleet-compliance/govcon/[id]/page.tsx (opportunity detail)
7. Sidebar update

TEST:
- Navigate to /fleet-compliance/govcon -- pipeline board/table loads
- Create new opportunity -- appears in "Identified" column/status
- Click opportunity -- detail page with all fields
- Click "Run Bid Decision" -- scoring runs, recommendation displayed
- Move opportunity to "Bid" stage -- status updates
- Check deadlines view -- sorted by due date with countdown
```

---

## Task 7: Task Command UI

### Prompt

```
CONTEXT:
The task-command module at /tooling/task-command/ provides 8 tools: create_task, assign_task,
update_status, get_department_tasks, get_overdue_tasks, get_workload_report, get_completion_metrics,
get_department_summary.

General-purpose task management with department grouping, assignment, status tracking, workload
balancing, and completion metrics. Think lightweight project management for a 5-20 person company.

ROLE:
You are building a task board for small teams. The owner assigns work, tracks what's overdue,
and sees who's overloaded. Simple, fast, no project management bloat.

CONSTRAINTS:
- API routes at /api/fleet-compliance/tasks/
- Pages at /fleet-compliance/tasks/
- Import from tooling/task-command/dist/src/index.js
- Board view: columns by status (To Do, In Progress, Review, Done) with drag-and-drop OR
  simple button-click to move between columns
- List view: filterable table (department, assignee, status, priority, due date)
- Create task: title, description, department dropdown, assignee dropdown, priority (low/med/high/urgent),
  due date
- Overdue widget: red-highlighted list of overdue tasks
- Workload view: per-person bar chart showing task count by status
- Add "Tasks" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/tasks/route.ts (CRUD, filter)
2. API routes: /src/app/api/fleet-compliance/tasks/[id]/route.ts (GET, PATCH)
3. API routes: /src/app/api/fleet-compliance/tasks/metrics/route.ts (GET workload, completion)
4. Page: /src/app/fleet-compliance/tasks/page.tsx (board + list toggle)
5. Page: /src/app/fleet-compliance/tasks/new/page.tsx (create form)
6. Page: /src/app/fleet-compliance/tasks/[id]/page.tsx (detail)
7. Sidebar update

TEST:
- Navigate to /fleet-compliance/tasks -- board view loads with columns
- Toggle to list view -- table renders
- Create task -- appears in "To Do" column
- Click status button to move to "In Progress" -- card moves
- Check overdue widget -- shows tasks past due date in red
- Check workload view -- bar chart shows per-person breakdown
```

---

## Task 8: Email Command UI

### Prompt

```
CONTEXT:
The email-command module at /tooling/email-command/ provides 8 tools: generate_digest,
get_email_metrics, extract_action_items, detect_anomalies, get_sender_analysis,
list_action_items, update_action_item, get_digest_config.

Email intelligence -- digests, metrics, action item extraction, anomaly detection, and sender
analysis. Designed to surface what matters from an overloaded inbox.

ROLE:
You are building an email intelligence dashboard. The owner wants a daily digest, action items
pulled from emails automatically, and sender analysis showing who they communicate with most.

CONSTRAINTS:
- API routes at /api/fleet-compliance/email-analytics/
- Pages at /fleet-compliance/email-analytics/
- Import from tooling/email-command/dist/src/index.js
- Dashboard: digest card (today's summary), email volume chart (last 30 days), top senders
  list, anomaly alerts (unusual patterns)
- Action items page: table of extracted action items with status (open/done), source email
  reference, due date, assignee. Click to mark done.
- Sender analysis: ranked list of contacts by email volume, response time, last contact date
- Digest config: form to set digest frequency, focus topics, excluded senders
- Add "Email Analytics" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/email-analytics/route.ts (digest, metrics)
2. API routes: /src/app/api/fleet-compliance/email-analytics/actions/route.ts (action items CRUD)
3. Page: /src/app/fleet-compliance/email-analytics/page.tsx (dashboard)
4. Page: /src/app/fleet-compliance/email-analytics/actions/page.tsx (action items)
5. Page: /src/app/fleet-compliance/email-analytics/settings/page.tsx (digest config)
6. Sidebar update

TEST:
- Navigate to /fleet-compliance/email-analytics -- dashboard loads with digest and charts
- Navigate to action items -- table shows extracted items
- Click checkbox to mark action item done -- status updates
- Navigate to settings -- configure digest, save, confirm saved
```

---

## Task 9: Onboard Command UI

### Prompt

```
CONTEXT:
The onboard-command module at /tooling/onboard-command/ provides 10 tools: start_onboarding,
check_onboarding_status, rollback_onboarding, get_audit_log, list_onboarding_requests,
get_queue_status, process_next_queue_item, get_department_config, get_onboarding_status_report,
get_audit_report.

Handles employee/driver onboarding workflows with queue management, department-specific steps,
audit logging, and rollback capability. Critical for fleet operators hiring drivers who need
CDL verification, drug testing, orientation scheduling.

ROLE:
You are building an onboarding management UI for HR/fleet managers. They need to start onboarding
for new hires, track progress through steps, and handle the queue of pending onboardings.

CONSTRAINTS:
- API routes at /api/fleet-compliance/onboarding/
- Pages at /fleet-compliance/onboarding/
- Import from tooling/onboard-command/dist/src/index.js
- Queue view: list of pending onboarding requests with priority, department, created date,
  "Process Next" button
- Active onboardings: table showing each person's progress (step X of Y), status, department,
  start date
- Detail view: person info, step-by-step checklist with completion status, action buttons
  (Complete Step, Skip Step, Rollback), audit log timeline
- Start onboarding form: person name, email, department, position, start date
- Add "Onboarding" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/onboarding/route.ts (CRUD, queue)
2. API routes: /src/app/api/fleet-compliance/onboarding/[id]/route.ts (GET, PATCH, rollback)
3. Page: /src/app/fleet-compliance/onboarding/page.tsx (queue + active list)
4. Page: /src/app/fleet-compliance/onboarding/new/page.tsx (start form)
5. Page: /src/app/fleet-compliance/onboarding/[id]/page.tsx (detail + steps)
6. Sidebar update

TEST:
- Navigate to /fleet-compliance/onboarding -- queue and active list load
- Start new onboarding -- fill form, submit, appears in active list
- Click person -- detail page with step checklist
- Complete a step -- checkbox updates, progress advances
- Click Rollback -- previous step reverts, audit log entry created
```

---

## Task 10: Compliance Command UI

### Prompt

```
CONTEXT:
The compliance-command module at /tooling/compliance-command/ provides 4 tools: generate_compliance_package,
get_company_info, check_package_status, list_frameworks. It generates federal compliance document
packages from templates using company info (EIN, CAGE code, DUNS, POCs, etc.). 7 packages covering
internal compliance, security handbook, data handling, government contracting, Google partner,
business ops, advanced compliance.

ROLE:
You are building a compliance document generator UI. After a company fills in their info once,
they can generate any of the 7 compliance packages as formatted documents. Status tracking
shows which packages are generated and which are pending.

CONSTRAINTS:
- API routes at /api/fleet-compliance/compliance-docs/
- Pages at /fleet-compliance/compliance-docs/
- Import from tooling/compliance-command/dist/src/index.js
- Company info form: all fields from companyInfoSchema in manifest.json (core, legal, government,
  personnel, operations sections). Multi-section form with save-as-you-go.
- Package dashboard: grid of 7 packages, each showing name, description, document count,
  status (not started/generating/complete), "Generate" button, "Download" button if complete
- Package detail: list of individual documents in the package with generation status
- Add "Compliance Docs" to sidebar
- Register as plan: 'pro'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/compliance-docs/route.ts (company info CRUD, packages)
2. API routes: /src/app/api/fleet-compliance/compliance-docs/generate/route.ts (POST)
3. Page: /src/app/fleet-compliance/compliance-docs/page.tsx (package dashboard)
4. Page: /src/app/fleet-compliance/compliance-docs/company/page.tsx (company info form)
5. Sidebar update

TEST:
- Navigate to /fleet-compliance/compliance-docs -- package grid loads, all "Not Started"
- Fill company info form -- save
- Click "Generate" on Package 1 -- status changes to generating, then complete
- Click "Download" -- document package downloads
- Check Package Status -- shows correct state for all 7 packages
```

---

## Task 11: Readiness Command UI

### Prompt

```
CONTEXT:
The readiness-command module at /tooling/readiness-command/ provides 7 tools: start_assessment,
submit_response, get_score, get_recommendations, generate_report, get_next_questions, complete_assessment.

A readiness assessment tool -- asks questions, scores responses, provides recommendations, and
generates a report. Used for operational readiness, compliance readiness, or technology readiness
assessments for small businesses.

ROLE:
You are building a guided assessment wizard. The user starts an assessment, answers questions
one at a time (or in small groups), sees their score build up, and gets a final report with
recommendations.

CONSTRAINTS:
- API routes at /api/fleet-compliance/readiness/
- Pages at /fleet-compliance/readiness/
- Import from tooling/readiness-command/dist/src/index.js
- Assessment list: past assessments with scores and dates, "Start New Assessment" button
- Assessment wizard: one question at a time with progress bar, answer options (radio/checkbox/text),
  "Next" / "Previous" buttons, running score indicator
- Results page: overall score (circular gauge or letter grade), category breakdown, recommendations
  list, "Generate Report" button (downloads PDF/DOCX)
- Add "Readiness" to sidebar
- Register as plan: 'starter'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/readiness/route.ts (CRUD, submit, score)
2. API routes: /src/app/api/fleet-compliance/readiness/[id]/route.ts (GET, questions, report)
3. Page: /src/app/fleet-compliance/readiness/page.tsx (list of assessments)
4. Page: /src/app/fleet-compliance/readiness/new/page.tsx (wizard)
5. Page: /src/app/fleet-compliance/readiness/[id]/page.tsx (results)
6. Sidebar update

TEST:
- Navigate to /fleet-compliance/readiness -- list loads (empty initially)
- Click "Start Assessment" -- wizard begins with first question
- Answer questions, click Next -- progress bar advances, score updates
- Complete all questions -- redirected to results page
- See score, recommendations, click "Generate Report" -- file downloads
```

---

## Task 12: Realty Command UI

### Prompt

```
CONTEXT:
The realty-command module at /tooling/realty-command/ provides 5 tools: score_lead,
search_properties, update_deal_stage, get_pipeline_summary, calculate_commission.

A lightweight real estate CRM -- lead scoring, property search, deal pipeline tracking,
and commission calculations.

ROLE:
You are building a real estate pipeline tracker. Agents need to score leads, search properties,
move deals through stages, and calculate commissions.

CONSTRAINTS:
- API routes at /api/fleet-compliance/realty/
- Pages at /fleet-compliance/realty/
- Import from tooling/realty-command/dist/src/index.js
- Pipeline: Kanban board (Lead > Qualified > Showing > Offer > Under Contract > Closed) with
  deal cards showing property address, client name, value
- Lead scoring: form to input lead details, returns score with breakdown
- Commission calculator: input sale price, commission rate, split -- shows gross and net
- Pipeline summary: cards with total deals, total value, avg days to close, conversion rate
- Add "Realty" to sidebar
- Register as plan: 'pro'

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/realty/route.ts (pipeline, leads, commission)
2. Page: /src/app/fleet-compliance/realty/page.tsx (pipeline board + summary)
3. Page: /src/app/fleet-compliance/realty/calculator/page.tsx (commission calculator)
4. Sidebar update

TEST:
- Navigate to /fleet-compliance/realty -- pipeline board loads
- Score a lead -- see score result with breakdown
- Move deal to next stage -- card updates
- Calculate commission -- correct numbers displayed
```

---

## Task 13: Training Command UI (Courses & Workshops -- Separate from Hazmat)

### Prompt

```
CONTEXT:
The training-command module at /tooling/training-command/ provides 11 tools: list_courses,
get_course, enroll_student, get_student_progress, get_course_recommendations, book_consultation,
list_workshops, register_for_workshop, get_student_dashboard, issue_certificate, get_course_analytics.

IMPORTANT: The app already has a SEPARATE training system for PHMSA hazmat compliance training:
- /fleet-compliance/training/ -- PHMSA hazmat module hub (deck viewer, assessments)
- /fleet-compliance/training/my -- Employee assigned training view (deadlines, progress)
- /fleet-compliance/training/manage -- Admin assignment management (plans, deadlines)
- /fleet-compliance/training/reports -- Hazmat compliance reports (CFR citations, PHMSA equivalents)
- API at /api/v1/training/ and /api/v1/hazmat-training/
- Tables: hazmat_training_records, hazmat_training_modules, training_assignments, training_plans

The training-command module is for PROFESSIONAL DEVELOPMENT -- general skill courses (AI
fundamentals, data strategy, automation, leadership), live workshops, consultations, and
course recommendations. This is NOT hazmat compliance training. These are two different systems
that both live under the "Training" sidebar group.

DO NOT TOUCH the existing hazmat training pages, API routes, components, or tables. They are
a separate system and are working. Build training-command as a new section alongside them.

ROLE:
You are building a professional development / courses platform that sits alongside the existing
hazmat compliance training. Employees can browse courses, enroll, attend workshops, book
consultations, and earn certificates. Admins can see analytics.

CONSTRAINTS:
- API routes at /api/fleet-compliance/courses/ (NOT /api/v1/training/ -- that's hazmat)
- Pages at /fleet-compliance/courses/ (NOT /fleet-compliance/training/ -- that's hazmat)
- Import from tooling/training-command/dist/src/index.js
- Course catalog: grid of course cards with title, description, category, level (beginner/
  intermediate/advanced), duration, enrollment button
- My courses: enrolled courses with progress bars, continue button, certificate download
- Student dashboard: overall progress, recommendations engine ("Based on your role, try..."),
  upcoming workshops, recent activity
- Workshops: list of upcoming live workshops with date/time, instructor, capacity, register button
- Consultation booking: form to book a 1-on-1 session (date picker, topic dropdown, notes)
- Analytics (admin): course completion rates, popular courses, enrollment trends (recharts)
- Sidebar: Add "Courses & Workshops" link under the TRAINING section group
- Register as plan: 'starter'
- DO NOT modify anything in /fleet-compliance/training/, /api/v1/training/, or
  /api/v1/hazmat-training/. Those are off limits.

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/courses/route.ts (GET catalog, POST enroll)
2. API routes: /src/app/api/fleet-compliance/courses/[id]/route.ts (GET detail, progress)
3. API routes: /src/app/api/fleet-compliance/courses/workshops/route.ts (GET list, POST register)
4. API routes: /src/app/api/fleet-compliance/courses/consultations/route.ts (POST book)
5. API routes: /src/app/api/fleet-compliance/courses/analytics/route.ts (GET, admin only)
6. Page: /src/app/fleet-compliance/courses/page.tsx (course catalog)
7. Page: /src/app/fleet-compliance/courses/my/page.tsx (my enrolled courses)
8. Page: /src/app/fleet-compliance/courses/dashboard/page.tsx (student dashboard + recommendations)
9. Page: /src/app/fleet-compliance/courses/workshops/page.tsx (workshop listing + registration)
10. Page: /src/app/fleet-compliance/courses/analytics/page.tsx (admin analytics)
11. Sidebar: Add under TRAINING group

TEST:
- ALL existing hazmat training pages still work unchanged (Training Hub, My Training,
  Training Admin, Hazmat Reports -- no regressions)
- Navigate to /fleet-compliance/courses -- catalog loads with course cards
- Click course -- detail page with enroll button
- Enroll -- course appears in My Courses with progress bar
- Navigate to workshops -- list loads, register for one
- Book consultation -- form submits successfully
- Admin views analytics -- charts render with enrollment data
- Sidebar shows both hazmat training links AND new Courses & Workshops link under TRAINING group
```

---

## Task 14: DQ Command UI

### Prompt

```
CONTEXT:
The dq-command module at /tooling/dq-command/ manages DOT Driver Qualification Files (DQF) and
Drug & Alcohol History Files (DHF) per 49 CFR Part 391. 11 tools, 26 document types tracked,
token-gated driver intake form, compliance sweep with suspense integration, 3-year retention
enforcement.

Full spec is in the module README at /tooling/dq-command/README.md.

Key flows:
1. Fleet manager creates DQ file for new driver -> system generates intake token
2. Driver receives link, fills multi-step intake form (personal, licensing, employment, violations,
   certifications, uploads)
3. System auto-generates documents (application, violations record, consent forms)
4. Manager uploads remaining docs (MVR, road test, Clearinghouse query)
5. Daily sweep flags missing/expiring docs and creates suspense items

DQF and DHF must be displayed in SEPARATE tabs per FMCSA regulations.

ROLE:
You are building the DQ File management UI for fleet compliance managers AND the driver-facing
intake form (separate unauthenticated page). The manager needs a dashboard showing all drivers'
DQ status, per-driver checklists, and gap alerts. The driver needs a clean multi-step form
they receive via link.

CONSTRAINTS:
- API routes at /api/fleet-compliance/dq/
- Manager pages at /fleet-compliance/dq/
- Driver intake at /intake/[token] (OUTSIDE fleet-compliance layout -- unauthenticated, public)
- Import from tooling/dq-command/dist/src/index.js
- Manager dashboard: org summary bar (X Drivers, Y Complete, Z Incomplete, W Expired, N Expiring
  in 30 Days), per-driver table (name, CDL, DQF status, DHF status, doc count, next expiry, actions)
- Driver detail: two tabs (DQF Documents, DHF Documents), each showing checklist with doc name,
  CFR reference, status badge, expiry date, action button (View/Upload/Generate)
- Create DQ file form: select driver, CDL holder toggle, hire date -- generates intake link
- Send intake link: button copies link or sends via email
- Driver intake form: multi-step wizard (6 sections from intake-form.ts config), progress bar,
  section-by-section save, digital signature block, file upload for CDL/med cert
- Compliance gaps page: all drivers with missing or expiring docs, sorted by urgency
- Add "DQ Files" to sidebar under a "Compliance" group
- Register as plan: 'starter'
- Intake form must work on mobile (drivers will use phones)
- PII warning: SSN last 4 only, DOB collected but marked sensitive

DELIVERABLES:
1. API routes: /src/app/api/fleet-compliance/dq/files/route.ts (GET list, POST create)
2. API routes: /src/app/api/fleet-compliance/dq/files/[id]/route.ts (GET, PATCH)
3. API routes: /src/app/api/fleet-compliance/dq/files/[id]/checklist/route.ts (GET)
4. API routes: /src/app/api/fleet-compliance/dq/documents/route.ts (POST upload)
5. API routes: /src/app/api/fleet-compliance/dq/documents/generate/route.ts (POST)
6. API routes: /src/app/api/fleet-compliance/dq/intake/[token]/route.ts (GET validate, POST submit, POST complete)
7. API routes: /src/app/api/fleet-compliance/dq/sweep/route.ts (POST)
8. API routes: /src/app/api/fleet-compliance/dq/gaps/route.ts (GET)
9. Page: /src/app/fleet-compliance/dq/page.tsx (manager dashboard)
10. Page: /src/app/fleet-compliance/dq/new/page.tsx (create DQ file)
11. Page: /src/app/fleet-compliance/dq/[id]/page.tsx (driver detail with DQF/DHF tabs)
12. Page: /src/app/fleet-compliance/dq/gaps/page.tsx (compliance gaps)
13. Page: /src/app/intake/[token]/page.tsx (driver intake wizard -- unauthenticated)
14. Sidebar update

TEST:
- Navigate to /fleet-compliance/dq -- dashboard shows summary bar and driver table
- Click "New DQ File" -- form with driver selection, CDL toggle, hire date
- Submit -- DQ file created, intake link displayed with copy button
- Open intake link in incognito (unauthenticated) -- multi-step form loads
- Complete all 6 sections with test data, sign, submit -- intake marked complete
- Back in manager view -- driver's checklist shows generated docs (Application, Violations Record,
  Consent Forms) with status "Generated"
- Upload a document (e.g., CDL copy) -- status changes to "Uploaded"
- Click "Run Sweep" -- any gaps create suspense items
- Navigate to gaps page -- shows drivers with missing/expiring docs
- DQF and DHF tabs render separately with correct documents in each
```

---

## Task Sequence and Dependencies

```
Task 0:  Admin Module Toggle Page     (no dependencies -- do first)
Task 1:  Proposal Command UI          (depends on Task 0)
Task 2:  Dispatch Command UI          (depends on Task 0)
Task 3:  Financial Command UI         (depends on Task 0)
Task 4:  Sales Command UI             (depends on Task 0)
Task 5:  Contract Command UI          (depends on Task 0)
Task 6:  GovCon Command UI            (depends on Task 0)
Task 7:  Task Command UI              (depends on Task 0)
Task 8:  Email Command UI             (depends on Task 0)
Task 9:  Onboard Command UI           (depends on Task 0)
Task 10: Compliance Command UI        (depends on Task 0)
Task 11: Readiness Command UI         (depends on Task 0)
Task 12: Realty Command UI            (depends on Task 0)
Task 13: Training Command UI          (depends on Task 0, check existing training first)
Task 14: DQ Command UI                (depends on Task 0)
```

Tasks 1-14 are independent of each other. After Task 0 is complete, do them in any order.
Recommended priority based on client value: 14 (DQ), 1 (Proposal), 2 (Dispatch), 3 (Financial),
9 (Onboard), 6 (GovCon), then the rest.

---

## After All Tasks

- Wire all modules into the module gateway registry.ts (Path 1 -- deferred until testing is done)
- Run full test suite across all modules
- Update /src/lib/modules.ts plan catalog with correct tier for each module
- Update FleetComplianceShell sidebar to group modules logically (Operations, Finance, Compliance, Intelligence)
- Deploy to staging and run through each module end-to-end

---

True North Data Strategies LLC
Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
Fixed scope, fixed price. No open-ended projects. No surprise invoices.
