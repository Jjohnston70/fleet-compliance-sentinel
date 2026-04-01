# Module Architecture Plan

## Vision

Transform Fleet Compliance Sentinel from a single-purpose fleet compliance tool into a modular enterprise operations platform where clients enable only the modules they need.

## Current State

- **20 modules** exist (14 TypeScript commands, 2 Python ML, 1 Python invoice parser, 1 compliance sub-project, 1 deployed platform, 1 AI assistant)
- **0 feature flags** in the platform
- **All features visible** to all authenticated orgs
- **Stripe plans** exist (Starter $149, Pro $299) but gate nothing differently
- **command-center** module already provides registry/discovery/routing for all modules
- **Pipeline Penny** already has Anthropic wired up

## Target Architecture

```
Sentinel Platform
|
|-- Core (always on)
|   |-- Authentication (Clerk)
|   |-- Org management
|   |-- Billing (Stripe)
|   |-- Penny AI (with module-aware tools)
|   `-- Command Center (module registry)
|
|-- Module Groups (enable per org)
|   |
|   |-- Fleet & Safety
|   |   |-- Fleet Compliance (assets, drivers, permits, suspense)
|   |   |-- FMCSA Lookup
|   |   |-- Telematics (Verizon Reveal)
|   |   `-- Dispatch Command
|   |
|   |-- Petroleum Intelligence
|   |   |-- ML-EIA Petroleum Intel (forecasts, analysis)
|   |   |-- Pricing Dashboard (OPIS vs Cost Basis)
|   |   |-- Commodity Market Ticker (live prices)
|   |   |-- Heating Oil Charts (candlestick, trends)
|   |   `-- Weather Correlation
|   |
|   |-- Business Operations
|   |   |-- Financial Command (transactions, tax, budgets)
|   |   |-- Invoice Module (PDF extraction)
|   |   |-- Sales Command (analytics, KPIs, forecasting)
|   |   `-- Task Command (assignments, workload)
|   |
|   |-- Contracts & Proposals
|   |   |-- Contract Command (lifecycle, renewals)
|   |   |-- Proposal Command (generation, delivery)
|   |   `-- GovCon Command (federal contracting, bid scoring)
|   |
|   |-- People & Training
|   |   |-- Onboard Command (Google Workspace provisioning)
|   |   |-- Training Command (courses, enrollments)
|   |   `-- Email Command (analytics, digests)
|   |
|   |-- Compliance & Risk
|   |   |-- Compliance Command (doc generation, 6 frameworks)
|   |   |-- Readiness Command (AI readiness assessments)
|   |   `-- ML Signal Stack (business metric forecasting)
|   |
|   `-- Industry-Specific
|       `-- Realty Command (real estate ops)
```

## Database Changes

### New: Module Registry Table

```sql
-- Migration: 011_module_system.sql

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,                    -- e.g., 'petroleum-intel'
    name TEXT NOT NULL,                     -- e.g., 'Petroleum Intelligence'
    description TEXT,
    category TEXT NOT NULL,                 -- e.g., 'petroleum', 'fleet', 'business'
    icon TEXT,                              -- Lucide icon name
    route_prefix TEXT NOT NULL,             -- e.g., '/petroleum'
    is_core BOOLEAN DEFAULT FALSE,          -- Core modules can't be disabled
    requires_plan TEXT DEFAULT 'starter',   -- Minimum plan required
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS org_modules (
    org_id TEXT NOT NULL REFERENCES organizations(id),
    module_id TEXT NOT NULL REFERENCES modules(id),
    enabled BOOLEAN DEFAULT TRUE,
    enabled_at TIMESTAMPTZ DEFAULT NOW(),
    enabled_by TEXT,                        -- Clerk user ID
    config JSONB DEFAULT '{}',              -- Module-specific org config
    PRIMARY KEY (org_id, module_id)
);

-- Seed core modules (always enabled)
INSERT INTO modules (id, name, category, route_prefix, is_core) VALUES
    ('fleet-compliance', 'Fleet Compliance', 'fleet', '/fleet-compliance', TRUE),
    ('penny-ai', 'Pipeline Penny AI', 'core', '/penny', TRUE);

-- Seed add-on modules
INSERT INTO modules (id, name, category, route_prefix, is_core, requires_plan) VALUES
    ('petroleum-intel', 'Petroleum Intelligence', 'petroleum', '/petroleum', FALSE, 'pro'),
    ('telematics', 'Telematics', 'fleet', '/fleet-compliance/telematics', FALSE, 'starter'),
    ('dispatch', 'Dispatch Operations', 'fleet', '/dispatch', FALSE, 'pro'),
    ('financial', 'Financial Management', 'business', '/financial', FALSE, 'starter'),
    ('sales', 'Sales Analytics', 'business', '/sales', FALSE, 'starter'),
    ('contracts', 'Contract Management', 'contracts', '/contracts', FALSE, 'pro'),
    ('proposals', 'Proposal Generator', 'contracts', '/proposals', FALSE, 'starter'),
    ('govcon', 'Government Contracting', 'contracts', '/govcon', FALSE, 'pro'),
    ('tasks', 'Task Management', 'business', '/tasks', FALSE, 'starter'),
    ('training', 'Training Platform', 'people', '/training', FALSE, 'pro'),
    ('compliance-docs', 'Compliance Documents', 'compliance', '/compliance-docs', FALSE, 'pro'),
    ('readiness', 'AI Readiness', 'compliance', '/readiness', FALSE, 'starter'),
    ('invoices', 'Invoice Processing', 'business', '/invoices', FALSE, 'starter'),
    ('onboarding', 'Employee Onboarding', 'people', '/onboarding', FALSE, 'pro'),
    ('email-analytics', 'Email Analytics', 'people', '/email-analytics', FALSE, 'pro'),
    ('realty', 'Real Estate Operations', 'industry', '/realty', FALSE, 'pro'),
    ('ml-signals', 'Business Forecasting', 'compliance', '/ml-signals', FALSE, 'pro');
```

### Sidebar Gating Logic

```typescript
// src/lib/modules.ts

export async function getOrgModules(orgId: string): Promise<string[]> {
    const result = await sql`
        SELECT m.id, m.route_prefix
        FROM modules m
        LEFT JOIN org_modules om ON m.id = om.module_id AND om.org_id = ${orgId}
        WHERE m.is_core = TRUE
           OR (om.enabled = TRUE)
    `;
    return result.rows.map(r => r.id);
}

export async function isModuleEnabled(orgId: string, moduleId: string): Promise<boolean> {
    const result = await sql`
        SELECT 1 FROM modules m
        LEFT JOIN org_modules om ON m.id = om.module_id AND om.org_id = ${orgId}
        WHERE m.id = ${moduleId}
          AND (m.is_core = TRUE OR om.enabled = TRUE)
    `;
    return result.rows.length > 0;
}
```

### Sidebar Navigation Update

```typescript
// FleetComplianceSidebar.tsx changes:
// Instead of hardcoded NAV_ITEMS, dynamically build from enabled modules

const enabledModules = await getOrgModules(orgId);
const navItems = ALL_NAV_ITEMS.filter(item =>
    enabledModules.includes(item.moduleId)
);
```

## Plan-to-Module Mapping

| Plan | Monthly | Default Modules |
|------|---------|----------------|
| **Trial** | Free (30 days) | Core only (fleet compliance + Penny) |
| **Starter** ($149) | Core + telematics + financial + sales + tasks + proposals + readiness + invoices |
| **Professional** ($299) | Everything in Starter + petroleum-intel + dispatch + contracts + govcon + training + compliance-docs + onboarding + email-analytics + ml-signals |
| **Enterprise** (custom) | All modules + realty + custom config + dedicated support |

## Implementation Priority

1. Add `modules` and `org_modules` tables (migration 011)
2. Add `getOrgModules()` / `isModuleEnabled()` helper functions
3. Update sidebar to filter by enabled modules
4. Update route layouts to check module access (redirect if disabled)
5. Add module management UI in org settings
6. Wire up Stripe plan changes to auto-enable default module bundles

## Implementation Status (2026-03-31)

- Completed:
  1. `migrations/011_module_system.sql` created and seeded with 18 modules.
  2. `src/lib/modules.ts` created with module registry helpers.
  3. `src/lib/plan-gate.ts` updated with plan-change module sync logic.
  4. Stripe webhook now invokes module sync on subscription plan changes.
- Pending:
  1. Sidebar + route gating UI updates.
  2. Settings > Modules management page.
  3. Pricing page module-bundle display updates.
