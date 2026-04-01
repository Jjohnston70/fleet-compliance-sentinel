# MASTER TODO: Sentinel Platform Expansion

**Created:** 2026-03-30
**Project:** 00-FLEET-COMPLIANCE-SENTINEL
**Working Directory:** `<REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL`

---

## Phase 1: ML-EIA Standalone Module (Petroleum Intelligence)

**Goal:** Build a working Python ML pipeline that ingests multi-year EIA petroleum data, produces price forecasts, and generates reports. Standalone first, integrate later.

**Branch:** `feature/ml-eia-petroleum-intel`

### Phase 1 Progress Snapshot (2026-03-31)

| Task | Status | Notes |
|------|--------|-------|
| 1.1 Scaffold + ingest | ✅ Complete | `run_ingest.py`, EIA+client loaders, normalization, tests |
| 1.2 EIA API fetcher | ✅ Complete | `--api-update`, append+dedup, 404 handling, daily cache |
| 1.3 SARIMA forecasting | ✅ Complete | `run_pipeline.py`, 30/60/90 forecasts, metrics, tests |
| 1.4 Analysis + signals | ✅ Complete | regime, seasonal, strategy, weather, active alerts |
| 1.5 Export + LLM tools | ✅ Complete | docx report, JSON exports, Penny context, `tools.ts`, README |
| 1.6 Traffic sidecar | ✅ Complete | CDOT ArcGIS ingest, `--source traffic_cdot`, processed panel |
| 1.7 Audit + hardening pass | ✅ Complete | Full runtime audit executed; regressions fixed; tests now `16 passed` |

### Phase 1 Carry-Forward TODOs

- [ ] Integrate `traffic_cdot_segment_year.csv` features into forecast/regime models (truck %, AADT trend, congestion proxy)
- [ ] Add traffic quality filtering in feature engineering (`AADTDERIV` weighting/exclusion rules)
- [ ] Add supplier comparison module (stretch)
- [ ] Add inventory timing module (stretch)
- [ ] Add optional Prophet implementation for long-horizon comparison
- [ ] Add benchmark notebook for model tuning and regime calibration

### Phase 1 Current End-to-End Command

```bash
python run_ingest.py --all
python run_ingest.py --api-update
python run_pipeline.py --all
python export_reports.py --format docx --period monthly
```

---

## Phase 2: Module Enablement System

**Goal:** Add per-org module toggling to Sentinel so different clients see different features.

**Branch:** `feature/module-architecture`
**Depends on:** Nothing (can run in parallel with Phase 1)

### Task 2.1: Database Migration + Module Registry

- [x] **Status:** Complete (2026-03-31)

**Implemented artifacts:**
- `migrations/011_module_system.sql`
- `src/lib/modules.ts` (all required functions + plan normalization helpers)
- `src/lib/plan-gate.ts` (plan-change module sync logic)
- `src/app/api/stripe/webhook/route.ts` (invokes plan-change module sync on subscription events)

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/module-architecture

Read tooling/MODULE-ARCHITECTURE-PLAN.md for the full design.

TASK: Create the database migration and module helper functions.

1. Create migrations/011_module_system.sql with:
   - modules table (id, name, description, category, icon, route_prefix, is_core, requires_plan, metadata, created_at)
   - org_modules table (org_id, module_id, enabled, enabled_at, enabled_by, config)
   - Seed data for all 18 modules (see MODULE-ARCHITECTURE-PLAN.md for full list)
   - Core modules auto-enabled: fleet-compliance, penny-ai

2. Create src/lib/modules.ts with:
   - getOrgModules(orgId) - returns list of enabled module IDs
   - isModuleEnabled(orgId, moduleId) - boolean check
   - enableModule(orgId, moduleId, userId) - enable a module
   - disableModule(orgId, moduleId) - disable a module
   - getModuleCatalog() - returns all modules with metadata
   - getModulesByPlan(plan) - returns default modules for a plan tier

3. Update src/lib/plan-gate.ts:
   - On plan change (starter -> pro), auto-enable the new plan's default modules
   - On downgrade (pro -> starter), mark excess modules as disabled

CONSTRAINTS:
- Must not break existing functionality - all current features stay visible
- Migration must be idempotent (safe to run multiple times)
- org_modules should only have rows for explicitly enabled/disabled modules
  (if no row exists, check if module is_core - if yes, it's enabled)
- Module IDs must be kebab-case and match route prefixes

DELIVERABLES:
- migrations/011_module_system.sql runs clean on Neon
- src/lib/modules.ts exports all 6 functions
- Existing orgs continue to see all features (backward compatible)
```

### Task 2.2: Sidebar + Route Gating

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/module-architecture

Read tooling/MODULE-ARCHITECTURE-PLAN.md for context.
Task 2.1 must be complete (modules table + helper functions exist).

TASK: Update the sidebar and route layouts to respect module enablement.

1. Update src/components/fleet-compliance/FleetComplianceSidebar.tsx:
   - Fetch enabled modules for current org on mount
   - Filter NAV_ITEMS to only show routes for enabled modules
   - Group navigation by module category (Fleet, Petroleum, Business, etc.)
   - Show a subtle "More modules available" link at bottom if disabled modules exist

2. Create src/app/fleet-compliance/layout.tsx middleware:
   - On each page load, verify the page's module is enabled for the org
   - If not enabled, render a "Module not enabled" page with upgrade CTA
   - If core module, always allow

3. Create src/app/settings/modules/page.tsx:
   - Admin page showing all available modules
   - Toggle switches for each module (respect plan restrictions)
   - Show which modules are included in current plan vs require upgrade
   - Save changes to org_modules table

CONSTRAINTS:
- Sidebar must not flash/jump on load (fetch modules server-side or with SWR)
- Existing routes must continue working (backward compatible)
- Only org admins can change module settings
- Module page should explain what each module does (use description from modules table)

DELIVERABLES:
- Sidebar dynamically shows/hides based on org's enabled modules
- Unauthorized module pages show upgrade prompt
- Settings > Modules page lets admins toggle modules
- No visual regression on existing pages
```

### Task 2.3: Stripe Plan-Module Sync

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/module-architecture

Tasks 2.1 and 2.2 must be complete.

TASK: Wire Stripe plan changes to auto-enable default module bundles.

1. Update src/app/api/stripe/webhook/route.ts:
   - On subscription.created or subscription.updated:
     - Detect new plan tier
     - Call enableDefaultModules(orgId, plan) to auto-enable the plan's module bundle
   - On subscription.deleted:
     - Keep modules enabled for 30-day grace period (data deletion policy)

2. Create getDefaultModulesForPlan(plan) in src/lib/modules.ts:
   - trial: ['fleet-compliance', 'penny-ai']
   - starter: above + ['telematics', 'financial', 'sales', 'tasks', 'proposals', 'readiness', 'invoices']
   - pro: above + ['petroleum-intel', 'dispatch', 'contracts', 'govcon', 'training', 'compliance-docs', 'onboarding', 'email-analytics', 'ml-signals']
   - enterprise: all modules

3. Update the pricing page to show module breakdown per plan:
   - Starter: list the 7 included modules
   - Pro: list all 17 included modules
   - Enterprise: "All modules + custom"

CONSTRAINTS:
- Never auto-DISABLE modules on downgrade (just prevent new enables)
- Grace period on cancellation must respect existing data retention policy
- Audit log all module enable/disable events

DELIVERABLES:
- Plan upgrade auto-enables correct module bundle
- Pricing page shows per-plan module breakdown
- Webhook handles all plan change scenarios
- Audit events logged for all module changes
```

---

## Phase 3: Petroleum Intelligence Frontend

**Goal:** Build the Sentinel pages that display petroleum data from ML-EIA.

**Branch:** `feature/petroleum-pages`
**Depends on:** Phase 1 (ML-EIA module) + Phase 2 (module system)

### Task 3.1: Petroleum API Routes

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/petroleum-pages

The ML-EIA-PETROLEUM-INTEL module (tooling/) is complete and produces
JSON output in its output/ folder. Read tooling/ML-EIA-PETROLEUM-INTEL/PLAN.md.

TASK: Create Next.js API routes that serve petroleum data.

1. src/app/api/petroleum/prices/route.ts
   - GET: Returns latest spot prices, retail prices, OPIS rack prices
   - Source: Read from Neon petroleum_prices table (or ML-EIA JSON output)

2. src/app/api/petroleum/forecast/route.ts
   - GET ?product=heating_oil&horizon=30
   - Returns forecast with confidence intervals

3. src/app/api/petroleum/regime/route.ts
   - GET: Returns current market regime + history

4. src/app/api/petroleum/spreads/route.ts
   - GET: Returns OPIS vs cost basis spreads + alerts

5. src/app/api/petroleum/alerts/route.ts
   - GET: Returns active price/spread alerts

6. src/app/api/petroleum/sync/route.ts
   - POST: Triggers Railway backend to run ML-EIA pipeline
   - Protected by cron secret

All routes must:
- Check isModuleEnabled(orgId, 'petroleum-intel')
- Return 403 if module not enabled
- Use org_id scoping for multi-tenant isolation

CONSTRAINTS:
- Petroleum data is NOT org-specific (market prices are universal)
  But OPIS/cost basis data IS org-specific (client account numbers)
- API routes follow existing Sentinel patterns (check src/app/api/fleet-compliance/ for examples)
- Must handle case where ML-EIA hasn't run yet (return empty state, not error)

DELIVERABLES:
- 6 API routes functional
- Module gating enforced
- Response schemas documented in route files
```

### Task 3.2: Petroleum Dashboard Pages

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/petroleum-pages

API routes from Task 3.1 are complete.

TASK: Build the petroleum intelligence dashboard pages.

1. src/app/petroleum/page.tsx - Main dashboard
   - Market overview cards (crude, heating oil, diesel, gasoline - live prices)
   - OPIS vs Cost Basis comparison (3 products, colored cards)
   - Market regime badge (Bull/Bear/Volatile with color)
   - Active alerts banner
   - 5-day weather for Colorado Springs

2. src/app/petroleum/forecast/page.tsx - Forecasting
   - Product selector dropdown
   - 30/60/90 day forecast chart with confidence bands
   - Accuracy metrics display
   - Historical vs predicted overlay

3. src/app/petroleum/heating-oil/page.tsx - Heating Oil Deep Dive
   - Candlestick chart (90-day rolling)
   - Seasonal comparison (this year vs last 5 years)
   - Residential pricing trends
   - Futures curve visualization

4. src/app/petroleum/strategy/page.tsx - Pricing Strategy
   - OPIS Plus vs Cost Plus spread analysis
   - Which strategy is winning this week/month
   - Margin optimization recommendations
   - Historical spread chart

5. src/app/petroleum/layout.tsx
   - Module-gated layout (check petroleum-intel enabled)
   - Sub-navigation for petroleum pages

Use Recharts for charts (already in Sentinel deps) or Plotly React.
Follow existing Sentinel component patterns (Tailwind, shadcn/ui).

CONSTRAINTS:
- Must work on mobile (responsive)
- Dark mode compatible (Sentinel already supports it)
- Charts should load data client-side from API routes (SWR or React Query)
- Empty states for when data hasn't been loaded yet

DELIVERABLES:
- 4 petroleum pages + layout
- All data fetched from API routes
- Responsive, dark-mode compatible
- Module gating on layout
```

### Task 3.3: Railway Backend Petroleum Sync

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/petroleum-pages

TASK: Add petroleum data sync to the Railway FastAPI backend.

The Railway backend is at: railway-backend/
It already has /telematics/sync for Verizon Reveal.

1. Add railway-backend/petroleum/ module:
   - /petroleum/sync endpoint (POST)
   - Calls ML-EIA run_ingest.py --api-update && run_pipeline.py --all
   - Writes results to Neon petroleum tables
   - Returns summary of what was updated

2. Add petroleum tables to Neon:
   - petroleum_spot_prices (date, product, price, source, updated_at)
   - petroleum_forecasts (product, horizon, generated_at, forecast_json)
   - petroleum_alerts (id, type, product, message, severity, created_at, resolved_at)
   - petroleum_regime (date, regime, volatility, momentum)

3. Add cron trigger in Vercel:
   - /api/petroleum/sync called daily at 09:00 UTC (after markets update)
   - Same pattern as /api/fleet-compliance/telematics-sync

CONSTRAINTS:
- Railway backend must have ML-EIA dependencies in requirements.txt
- Sync should complete in < 2 minutes
- If EIA API is down, use last cached data (don't error)
- Multi-tenant: market data is shared, OPIS/cost basis is per-org

DELIVERABLES:
- Railway backend /petroleum/sync endpoint works
- Neon tables created and populated
- Cron job configured in vercel.json
- End-to-end: cron triggers -> Railway runs ML -> Neon updated -> Frontend displays
```

---

## Phase 4: Command Module Integration

**Goal:** Wire existing command modules into the platform one at a time.

**Branch:** `feature/command-modules` (or per-module branches)
**Depends on:** Phase 2 (module system)

### Task 4.1: Register All Modules in Command-Center

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/command-modules

Read tooling/command-center/ to understand the module registry pattern.

TASK: Register all 18 modules in the command-center registry.

1. Update command-center config to know about all modules and their tools
2. Add org-aware filtering: command-center should only expose tools for
   modules that are enabled for the requesting org
3. Update Penny's system prompt to use command-center for tool discovery
   instead of hardcoded tool lists
4. Test: Penny should be able to answer "What modules are available?"
   and "Give me a heating oil forecast" (routed to ML-EIA tools)

CONSTRAINTS:
- Python modules (ML-EIA, ML-Signal-Stack, invoice-module) need a bridge:
  command-center is TypeScript, these are Python. Use Railway backend as intermediary.
- Don't break existing Penny functionality
- Tool routing must be fast (< 100ms for discovery, routing is just a lookup)

DELIVERABLES:
- command-center registry contains all 18 modules
- Penny can discover and route to any enabled module's tools
- Org-scoped: disabled modules' tools are hidden from Penny
```

### Task 4.2: Integrate Priority Command Modules

- [ ] **Status:** Not started

For each module, follow this pattern:

**Prompt Template (repeat for each module):**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL
Branch: feature/integrate-{module-name}

TASK: Integrate {module-name} from tooling/{module-name}/ into the Sentinel platform.

1. Create src/app/{route-prefix}/page.tsx and sub-pages
   - Port the module's services into API routes
   - Build React pages consuming those routes
   - Follow Sentinel UI patterns (Tailwind, shadcn/ui)

2. Add database tables to Neon (if module uses PostgreSQL):
   - Create migration file: migrations/0XX_{module_name}_tables.sql
   - Port schema from module's data/schema.ts

3. If module uses Firestore, migrate to Neon PostgreSQL:
   - Replace Firestore repository with SQL queries
   - Map Firestore document structure to relational tables

4. Register module in command-center
5. Add sidebar navigation entry
6. Gate behind module enablement

CONSTRAINTS:
- One module at a time - don't batch
- Each module gets its own migration file
- Preserve all existing module functionality
- All data org-scoped

DELIVERABLES:
- Module accessible at /{route-prefix}
- All features from standalone version working in Sentinel
- Module-gated (only visible if enabled for org)
- Penny can access module tools via command-center
```

**Priority Order:**
1. financial-command (most universally useful)
2. sales-command (analytics, all businesses need it)
3. task-command (project management, universal)
4. contract-command (common business need)
5. proposal-command (revenue-generating)
6. govcon-command (niche but high-value for SDVOSB clients)
7. dispatch-command (fleet-adjacent, natural fit)
8. training-command (platform stickiness)
9. compliance-command (SOC2/CMMC doc generation)
10. readiness-command (consulting tool)
11. email-command (analytics add-on)
12. onboard-command (HR tool, requires Apps Script completion)
13. realty-command (industry-specific, lowest priority)

---

## Phase 5: Penny AI Expansion

**Goal:** Make Penny aware of all modules and able to answer questions across them.

**Branch:** `feature/penny-multi-module`
**Depends on:** Phase 4 (modules integrated)

### Task 5.1: Multi-Module Penny

- [ ] **Status:** Not started

**Prompt:**
```
Working directory: <REPO_ROOT>\Desktop\00 PIPLINE PUNKS GIT\00-FLEET-COMPLIANCE-SENTINEL

TASK: Upgrade Penny to be a multi-module AI assistant.

Currently Penny only knows about fleet compliance. After this:
- Penny discovers all enabled modules via command-center
- Penny routes questions to the right module's tools
- Penny maintains context across module boundaries
  ("What's our diesel cost basis?" -> petroleum module
   "Which trucks need inspection?" -> fleet module
   "How does that affect our margins?" -> petroleum + financial)

1. Update Penny's system prompt to include module-aware context
2. Use command-center's discover_tools and route_tool_call
3. Add petroleum market context (from penny_context.py) when petroleum module is enabled
4. Test cross-module queries

CONSTRAINTS:
- Don't exceed Anthropic context window - only load context for enabled modules
- Keep response latency < 5 seconds
- Penny should gracefully say "That module isn't enabled" rather than hallucinate

DELIVERABLES:
- Penny answers questions across all enabled modules
- Module-scoped: only exposes tools for enabled modules
- Cross-module reasoning works (petroleum + financial, fleet + dispatch, etc.)
```

---

## Phase 6: Stripe Plan Packaging

**Goal:** Finalize pricing tiers with module bundles.

**Branch:** `feature/plan-pricing`
**Depends on:** Phase 2 + at least a few Phase 4 modules

### Task 6.1: Plan Tier Finalization

- [ ] **Status:** Not started

**Prompt:**
```
TASK: Finalize Stripe pricing with module bundles.

1. Update Stripe products/prices for:
   - Starter ($149/mo): Core + 7 modules
   - Professional ($299/mo): Core + 17 modules
   - Enterprise (custom): All modules + custom config

2. Create a public pricing page at /pricing showing:
   - Feature comparison table (which modules in which plan)
   - Module icons and descriptions
   - Upgrade CTA for each tier

3. Add usage tracking:
   - Track module usage (page views, API calls) per org
   - Surface in admin: "Most used modules", "Unused modules"
   - Use for upgrade prompts: "You've used financial 47 times - upgrade to Pro to keep it"

DELIVERABLES:
- Stripe products updated
- Public pricing page with module breakdown
- Usage tracking implemented
- Upgrade flows tested end-to-end
```

---

## Quick Reference: File Locations

| Document | Path |
|----------|------|
| This TODO | `tooling/ML-EIA-PETROLEUM-INTEL/MASTER-TODO.md` |
| ML-EIA Module Plan | `tooling/ML-EIA-PETROLEUM-INTEL/PLAN.md` |
| Data Migration Guide | `tooling/ML-EIA-PETROLEUM-INTEL/PETROLEUM-DATA-MIGRATION.md` |
| Module Architecture | `tooling/ML-EIA-PETROLEUM-INTEL/MODULE-ARCHITECTURE-PLAN.md` |
| ML-Signal-Stack (reference) | `tooling/ML-SIGNAL-STACK-TNCC/` |
| Command-Center (reference) | `tooling/command-center/` |
| All Command Modules | `tooling/*-command/` |

## EIA Data Download Links

| Dataset | URL |
|---------|-----|
| Spot Prices (daily) | https://www.eia.gov/dnav/pet/pet_pri_spt_s1_d.htm |
| Diesel Wholesale | https://www.eia.gov/dnav/pet/pet_pri_dist_dcu_nus_w.htm |
| Colorado Retail | https://www.eia.gov/dnav/pet/pet_pri_gnd_dcus_sco_w.htm |
| Rocky Mountain Retail | https://www.eia.gov/dnav/pet/pet_pri_gnd_dcus_r40_w.htm |
| Weekly Petroleum Status | https://www.eia.gov/petroleum/supply/weekly/ |
| Heating Oil & Propane | https://www.eia.gov/petroleum/heatingoilpropane/ |
| Open Data API Portal | https://www.eia.gov/opendata/ |
| API Browser | https://www.eia.gov/opendata/browser/ |
