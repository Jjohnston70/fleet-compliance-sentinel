# Prompt: Build GovCon & Compliance UI Pages + API Routes

## Prompt Arm: GovCon-UI-Build-v1
**ID:** govcon-ui-build-v1
**Created:** 2026-04-05
**Use Case:** Building the Next.js pages and API routes for the GovCon & Compliance module in the PipelineX app

---

## System Prompt

You are a senior Next.js 14+ developer building module UI pages for the PipelineX fleet compliance platform. You write production-ready TypeScript with zero shortcuts. You follow existing codebase patterns exactly. You do not introduce new libraries, patterns, or abstractions that don't already exist in the project.

---

## Task Prompt

Build the UI pages and API routes for the **GovCon & Compliance** module at the path `/fleet-compliance/govcon` in the PipelineX Next.js app.

The command module (`@tnds/govcon-compliance-command`) is already built and compiled in `tooling/govcon-compliance-command/`. The runtime loader exists at `src/lib/govcon-compliance-command-runtime.ts`. The sidebar entry, module catalog, and help text are already wired. You are building the pages and API routes that make the module usable from the browser.

---

## Pre-Flight

Before writing any code, read these files to understand the existing patterns. Do not deviate from them:

### Required Reading (Architecture Patterns)
1. `src/lib/govcon-compliance-command-runtime.ts` -- The runtime loader you'll import in API routes
2. `src/lib/proposal-command-runtime.ts` -- Reference pattern: how a runtime loader exposes services
3. `src/app/fleet-compliance/proposals/page.tsx` -- Reference: list page pattern
4. `src/app/fleet-compliance/proposals/[id]/page.tsx` -- Reference: detail page pattern
5. `src/app/fleet-compliance/proposals/new/page.tsx` -- Reference: create form pattern
6. `src/app/api/fleet-compliance/proposals/route.ts` -- Reference: API route (GET list, POST create)
7. `src/app/api/fleet-compliance/proposals/[id]/route.ts` -- Reference: API route (GET single, PATCH update)
8. `src/app/fleet-compliance/sales/page.tsx` -- Reference: dashboard with Recharts charts
9. `src/lib/fleet-compliance-auth.ts` -- Auth helpers (requireFleetComplianceOrg, requireFleetComplianceOrgWithRole)
10. `src/lib/sidebar-config.ts` -- Sidebar entry (already done, just verify)
11. `src/lib/modules.ts` -- Module catalog entry (already done, just verify)

### Required Reading (Command Module)
12. `tooling/govcon-compliance-command/src/tools.ts` -- All 20 tool definitions + createToolHandlers factory
13. `tooling/govcon-compliance-command/src/config/index.ts` -- Config constants
14. `tooling/govcon-compliance-command/src/data/schemas.ts` -- All 12 Zod entity schemas
15. `tooling/govcon-compliance-command/src/services/` -- All 9+ service files
16. `tooling/govcon-compliance-command/README.md` -- Module overview
17. `tooling/govcon-compliance-command/docs/DEVELOPER_GUIDE.md` -- Architecture and service API reference

---

## What to Build

### Step 1: Update the Runtime Loader

The current `src/lib/govcon-compliance-command-runtime.ts` uses the generic tool-based pattern. Update it to follow the `proposal-command-runtime.ts` pattern: lazy-load the compiled module, instantiate services, cache per orgId, and expose typed service accessors.

The runtime should expose:
- `getGovConRuntime(orgId: string)` -- returns cached runtime with all services
- Runtime object should include: `repo`, `opportunityService`, `bidDecisionService`, `outreachService`, `complianceService`, `pipelineService`, `packageService`, `intakeService`, `maturityService`, `bidDocumentService`, `deadlineMonitor`, `complianceMonitor`, `dashboard`, `winLossReport`, `outreachReport`

Import path: `../../tooling/govcon-compliance-command/dist/index.js`

### Step 2: API Routes

Create these API route files:

#### `src/app/api/fleet-compliance/govcon/route.ts`
- **GET** -- Pipeline dashboard. Calls `dashboard.getDashboard()`. Returns `{ ok: true, dashboard: {...} }`.
- **POST** -- Create opportunity. Validates required fields (title, solicitation_number, agency, response_deadline, set_aside_type, naics_code, naics_description, description). Calls `opportunityService.createOpportunity()`. Returns `{ ok: true, opportunity: {...} }` with 201.

Auth: GET = `requireFleetComplianceOrg`, POST = `requireFleetComplianceOrgWithRole(req, 'admin')`.

#### `src/app/api/fleet-compliance/govcon/[id]/route.ts`
- **GET** -- Single opportunity detail. Calls `opportunityService.getOpportunity(id)`. Returns `{ ok: true, opportunity: {...} }`. 404 if not found.
- **PATCH** -- Update opportunity status or fields. Calls `opportunityService.updateOpportunity(id, body)`. Returns updated opportunity.

#### `src/app/api/fleet-compliance/govcon/bid-decision/route.ts`
- **POST** -- Run bid decision. Body: `{ opportunity_id, technical_fit, set_aside_match, competition_level, contract_value, timeline_feasibility, relationship, strategic_value }`. Calls `bidDecisionService.runBidDecision()`. Returns `{ ok: true, decision: {...} }`.

#### `src/app/api/fleet-compliance/govcon/deadlines/route.ts`
- **GET** -- Upcoming deadlines. Query param `days` (default 7). Calls `opportunityService.getUpcomingDeadlines()`. Returns `{ ok: true, deadlines: [...] }`.

#### `src/app/api/fleet-compliance/govcon/contacts/route.ts`
- **GET** -- List contacts. Query params: agency, status. Calls `outreachService.listContacts()`. Returns `{ ok: true, contacts: [...] }`.
- **POST** -- Log activity. Body: `{ contact_id, activity_type, subject }`. Calls `outreachService.logActivity()`. Returns `{ ok: true, activity: {...} }`.

#### `src/app/api/fleet-compliance/govcon/compliance/route.ts`
- **GET** -- Compliance status. Query param `authority`. Calls `complianceService` or `complianceMonitor.checkCompliance()`. Returns `{ ok: true, compliance: [...] }`.

#### `src/app/api/fleet-compliance/govcon/company/route.ts`
- **POST** -- Submit company info. Calls `repo.createCompany()` or `repo.updateCompany()`. Returns `{ ok: true, company: {...} }`.

#### `src/app/api/fleet-compliance/govcon/packages/route.ts`
- **POST** -- Generate compliance package(s). Body: `{ company_id, package_number?, formats? }`. Calls `packageService.generatePackage()` or `packageService.generateAll()`. Returns `{ ok: true, packages: [...] }`.

#### `src/app/api/fleet-compliance/govcon/bid-documents/route.ts`
- **POST** -- Generate bid document(s). Body: `{ opportunity_id, document_type?, company_id?, formats? }`. If `document_type` is provided, generate single. If not, generate full package. Calls `bidDocumentService`. Returns `{ ok: true, documents: [...] }`.

#### `src/app/api/fleet-compliance/govcon/intake/route.ts`
- **POST** -- Run intake wizard. Body: `{ company_id }`. Calls `intakeService.runIntake()`. Returns `{ ok: true, result: {...} }`.

#### `src/app/api/fleet-compliance/govcon/maturity/route.ts`
- **GET** -- Get maturity score. Query param: `company_id`. Calls `maturityService.getScoreBreakdown()`. Returns `{ ok: true, maturity: {...} }`.

### Step 3: UI Pages

#### `src/app/fleet-compliance/govcon/page.tsx` -- Pipeline Dashboard (Main Page)

This is the landing page when clicking "GovCon & Compliance" in the sidebar. It should be a comprehensive dashboard. Follow the sales page pattern for Recharts integration and the proposals page pattern for table layouts.

**Layout (top to bottom):**

1. **Header**: Eyebrow "Intelligence", H1 "GovCon & Compliance", subcopy "Federal contracting pipeline, compliance tracking, and bid management." Action button: "New Opportunity" (links to /fleet-compliance/govcon/new).

2. **Stat Cards Row** (4 cards, grid layout):
   - Total Opportunities (count)
   - Pipeline Value (USD formatted)
   - Upcoming Deadlines (count, next 7 days)
   - Win Rate (percentage)

3. **Pipeline Table**: List all opportunities in a `fleet-compliance-table`. Columns: Solicitation #, Agency, Title, Set-Aside, Estimated Value, Status (color-coded badge), Deadline, Actions (Open link). Rows clickable, navigate to `[id]` detail page. Sort by deadline ascending.

   Status colors: identified=#6b7280, evaluating=#2563eb, bid=#16a34a, no_bid=#dc2626, submitted=#ca8a04, awarded=#0f766e, lost=#ea580c.

4. **Two-Column Section Below Table**:
   - Left: **Compliance Alerts** -- List from complianceMonitor with severity badges (critical=red, warning=amber, upcoming=blue).
   - Right: **Upcoming Deadlines** -- List from deadlineMonitor with severity badges.

5. **Empty State**: If no opportunities, show dashed border box with "No opportunities in the pipeline" message and "New Opportunity" button. Same pattern as proposals empty state.

Data fetching: single `GET /api/fleet-compliance/govcon` call returns the dashboard object. Parse it in the client.

#### `src/app/fleet-compliance/govcon/new/page.tsx` -- Create Opportunity Form

Follow the proposals/new pattern. Multi-section form.

**Form Sections:**

1. **Opportunity Details**: title (text), solicitation_number (text), agency (text), sub_agency (text, optional), description (textarea).

2. **Classification**: set_aside_type (select dropdown: SDVOSB, VOSB, 8a, HUBZone, WOSB, small_business, full_open), naics_code (text), naics_description (text).

3. **Timeline & Value**: response_deadline (date input), estimated_value (number input, USD), place_of_performance (text, optional), source (select: sam_gov, manual, referral), url (text, optional).

**Submission**: POST to `/api/fleet-compliance/govcon`. On success, redirect to `/fleet-compliance/govcon/{id}`.

**Validation**: Required fields: title, solicitation_number, agency, response_deadline, set_aside_type, naics_code, naics_description, description. Show inline error messages.

#### `src/app/fleet-compliance/govcon/[id]/page.tsx` -- Opportunity Detail

Follow the proposals/[id] pattern. Two-column layout (2fr + 1fr).

**Main Column (left, 2fr):**

1. **Header**: Back link to list. H1 = opportunity title. Status badge. Agency + solicitation number subtitle.

2. **Stat Cards** (4): Estimated Value, Days Until Deadline, Set-Aside Type, Source.

3. **Bid Decision Section**: If a bid decision exists, show the score (large number), decision (bid/no_bid badge), criteria breakdown table (criterion, score, weight, notes), and rationale text. If no decision exists, show "Run Bid Decision" button that opens an inline form with 7 slider/number inputs (technical_fit, set_aside_match, competition_level, contract_value, timeline_feasibility, relationship, strategic_value). Submit POSTs to `/api/fleet-compliance/govcon/bid-decision`.

4. **Bid Documents Section**: List any generated bid documents. "Generate Bid Package" button. Shows document_type, status, version, created_at.

5. **Description**: Full opportunity description text.

**Sidebar (right, 1fr):**

1. **Actions**: "Edit Status" dropdown (identified/evaluating/bid/no_bid/submitted/awarded/lost). "Generate Bid Package" button. "Run Intake" button (if company exists).

2. **Opportunity Info**: Posted date, response deadline (with countdown), NAICS code + description, place of performance, SAM.gov link.

3. **Related Contacts**: List outreach contacts for this agency. "Log Activity" button.

Data fetching: GET `/api/fleet-compliance/govcon/{id}`. Hydrate bid decision and bid documents in the API response.

---

## Mandatory Patterns

Follow these exactly. They come from the existing codebase:

### API Route Boilerplate
```typescript
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { getGovConRuntime } from '@/lib/govcon-compliance-command-runtime';
```

### Auth Pattern
```typescript
// Read access
let orgId: string;
try {
  ({ orgId } = await requireFleetComplianceOrg(req));
} catch (error: unknown) {
  const authResponse = fleetComplianceAuthErrorResponse(error);
  if (authResponse) return authResponse;
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}

// Write access
let orgId: string;
try {
  ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
} catch (error: unknown) {
  const authResponse = fleetComplianceAuthErrorResponse(error);
  if (authResponse) return authResponse;
  return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
}
```

### Page Boilerplate
```typescript
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
```

### CSS Classes (existing, do not create new ones)
- `fleet-compliance-shell` -- main wrapper, max-width 1100px
- `fleet-compliance-section` -- content section
- `fleet-compliance-section-head` -- header with title + action button
- `fleet-compliance-eyebrow` -- small category label above title
- `fleet-compliance-subcopy` -- description below title
- `fleet-compliance-list-card` -- card wrapper for tables
- `fleet-compliance-table-wrap` -- scrollable table container
- `fleet-compliance-table` -- table element
- `fleet-compliance-table-note` -- secondary text in table cells
- `fleet-compliance-info-banner` -- info/error banner
- `fleet-compliance-stat-grid` -- stat card grid (CSS grid, 4 columns)
- `fleet-compliance-stat-card` -- individual stat card
- `btn-primary` -- primary action button
- `btn-secondary` -- secondary action button

### CSS Variables
- `--navy`: #1a3a5c (primary brand)
- `--teal`: #3d8eb9 (accent)
- `--text-secondary`: secondary text color
- `--border`: border color

### Response Format
Always return `{ ok: true, ...data }` on success.
Always return `{ ok: false, error: 'message' }` on failure.

### Error Handling
```typescript
try {
  // ... service calls
} catch (error) {
  console.error('[govcon-{endpoint}] failed:', error);
  return NextResponse.json({ ok: false, error: 'Failed to ...' }, { status: 500 });
}
```

---

## Files to Create (Complete List)

```
src/app/fleet-compliance/govcon/page.tsx              -- Pipeline dashboard
src/app/fleet-compliance/govcon/new/page.tsx           -- Create opportunity form
src/app/fleet-compliance/govcon/[id]/page.tsx          -- Opportunity detail
src/app/api/fleet-compliance/govcon/route.ts           -- GET dashboard, POST create opp
src/app/api/fleet-compliance/govcon/[id]/route.ts      -- GET/PATCH single opp
src/app/api/fleet-compliance/govcon/bid-decision/route.ts    -- POST run bid decision
src/app/api/fleet-compliance/govcon/deadlines/route.ts       -- GET upcoming deadlines
src/app/api/fleet-compliance/govcon/contacts/route.ts        -- GET list, POST log activity
src/app/api/fleet-compliance/govcon/compliance/route.ts      -- GET compliance status
src/app/api/fleet-compliance/govcon/company/route.ts         -- POST submit company info
src/app/api/fleet-compliance/govcon/packages/route.ts        -- POST generate packages
src/app/api/fleet-compliance/govcon/bid-documents/route.ts   -- POST generate bid docs
src/app/api/fleet-compliance/govcon/intake/route.ts          -- POST run intake wizard
src/app/api/fleet-compliance/govcon/maturity/route.ts        -- GET maturity score
```

**Also update:**
- `src/lib/govcon-compliance-command-runtime.ts` -- Upgrade from tool-based to service-based runtime pattern

---

## File to NOT Create or Modify

- Do NOT modify `src/lib/modules.ts` (already updated)
- Do NOT modify `src/lib/sidebar-config.ts` (already updated)
- Do NOT modify `src/components/fleet-compliance/UserManualModal.tsx` (already updated)
- Do NOT modify anything in `tooling/govcon-compliance-command/` (already built)
- Do NOT create new CSS files or modify existing stylesheets
- Do NOT add new npm dependencies
- Do NOT create test files (separate task)

---

## Success Criteria

- Primary: All pages render without errors, all API routes return valid JSON
- Guard 1: Zero TypeScript compilation errors (`npm run lint` passes)
- Guard 2: Existing pages and routes are not affected (no regressions)
- Guard 3: All auth patterns match existing modules exactly
- Guard 4: No new CSS classes, variables, or component abstractions introduced

---

## Known Limitations

- The command module uses InMemoryRepository. Data resets on server restart. This is expected for v1.
- Recharts is available in the project but chart integration on the dashboard is optional for v1. Tables and stat cards are mandatory.
- File download for generated DOCX/PDF documents is not wired yet. The API can return the content/buffer, but the browser download flow is a separate task.

---

Jacob Johnston | 555-555-5555 | jacob@truenorthstrategyops.com
