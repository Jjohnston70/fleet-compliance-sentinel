# Claude Code Prompt: Sidebar Navigation + Spend Enhancements + Invoice Import

Paste this entire PROMPT section into a new Claude Code session at the repo root.

---

## PROMPT

I need 4 changes to Fleet-Compliance Sentinel. Read all referenced files before making changes.

---

### CHANGE 1: Sidebar Navigation for Fleet-Compliance

Replace the current button grid on the Fleet-Compliance dashboard with a persistent sidebar navigation, similar to the FOB Command Center sidebar at `<REPO_ROOT>\Desktop\FOB-Revamp-ALYP\fob-command-center\packages\core\src\ui\layout\sidebar.tsx`.

**Implementation:**

1. **Create `src/components/fleet-compliance/FleetComplianceSidebar.tsx`** — client component:
   ```tsx
   'use client';

   import Link from 'next/link';
   import { usePathname } from 'next/navigation';

   const NAV_ITEMS = [
     { label: 'Dashboard', href: '/fleet-compliance' },
     { label: 'Assets', href: '/fleet-compliance/assets' },
     { label: 'Employees', href: '/fleet-compliance/employees' },
     { label: 'Compliance', href: '/fleet-compliance/compliance' },
     { label: 'Suspense', href: '/fleet-compliance/suspense' },
     { label: 'Alerts', href: '/fleet-compliance/alerts' },
     { label: 'Invoices', href: '/fleet-compliance/invoices' },
     { label: 'Spend Dashboard', href: '/fleet-compliance/spend' },
     { label: 'FMCSA Lookup', href: '/fleet-compliance/fmcsa' },
     { label: 'Import Data', href: '/fleet-compliance/import' },
     { label: 'Penny AI', href: '/penny' },
     { label: 'Settings', href: '/fleet-compliance/settings/alerts' },
   ];
   ```

   Style the sidebar:
   - Dark background (`#13212f` or match the existing dark theme)
   - White/light text links
   - Active link highlighted (check `usePathname()` against `href`)
   - Fixed width (240-280px), full viewport height
   - Title at top: "FLEET-COMPLIANCE" in uppercase small text
   - Responsive: on mobile (<768px), collapse to a hamburger menu or hide

2. **Create `src/components/fleet-compliance/FleetComplianceShell.tsx`** — layout wrapper:
   ```tsx
   // Wraps sidebar + main content area
   // sidebar on left, content on right with flex layout
   ```

3. **Update `src/app/fleet-compliance/layout.tsx`** (or create one if it's in `page.tsx`):
   - Wrap all fleet-compliance pages with the FleetComplianceShell
   - The sidebar should appear on ALL `/fleet-compliance/*` pages
   - The main content area should be scrollable independently

4. **Add CSS** to `src/styles/globals.css`:
   ```css
   .fc-shell { display: flex; min-height: 100vh; }
   .fc-sidebar {
     width: 260px;
     background: #13212f;
     color: #fff;
     padding: 1.5rem 1rem;
     position: sticky;
     top: 0;
     height: 100vh;
     overflow-y: auto;
   }
   .fc-sidebar-title {
     font-size: 0.8rem;
     letter-spacing: 0.15em;
     text-transform: uppercase;
     margin-bottom: 1.5rem;
     color: #8ba4b8;
   }
   .fc-sidebar-link {
     display: block;
     padding: 0.5rem 0.75rem;
     color: #d8e8f3;
     text-decoration: none;
     border-radius: 4px;
     margin-bottom: 0.25rem;
     font-size: 0.9rem;
   }
   .fc-sidebar-link:hover { background: rgba(255,255,255,0.08); }
   .fc-sidebar-link.active { background: rgba(255,255,255,0.12); color: #fff; font-weight: 600; }
   .fc-main { flex: 1; min-width: 0; }

   @media (max-width: 768px) {
     .fc-sidebar { display: none; }
     .fc-main { width: 100%; }
   }
   ```

5. **Remove the button grid** from `src/app/fleet-compliance/page.tsx` — the dashboard page. Keep the stats cards, metrics, FMCSA snapshot, but remove the navigation buttons since the sidebar handles navigation now.

---

### CHANGE 2: Enhanced Spend Dashboard — Parts, Labor, Per-Asset Analysis

**Update `src/app/api/fleet-compliance/spend/route.ts`:**

Add these to the response:
```ts
type SpendResponse = {
  months: SpendSummary[];
  currentMonth: CategoryTotals;
  quarter: CategoryTotals;
  year: CategoryTotals;
  // NEW:
  costBreakdown: {
    parts: number;
    labor: number;
    shopSupplies: number;
    tax: number;
    other: number;
    total: number;
  };
  assetSpend: Array<{
    assetId: string;
    label: string;
    total: number;
    parts: number;
    labor: number;
    invoiceCount: number;
    lastServiceDate: string;
  }>;
};
```

- `costBreakdown`: Aggregate parts_total, labor_total, shop_supplies, sales_tax from the `invoices` table + JSONB data for the current month
- `assetSpend`: Group by asset ID, sum costs, count invoices, find latest service date. Include data from both `invoices` table and `fleet_compliance_records` where collection is maintenance-related

**Update `src/components/fleet-compliance/SpendDashboardClient.tsx`:**

Add two new sections below the existing content:

1. **Cost Breakdown card** — shows Parts, Labor, Shop Supplies, Tax as a simple table
2. **Asset Spend table** — sortable table showing each asset's total spend, parts, labor, invoice count, last service. Clicking an asset row navigates to `/fleet-compliance/assets/{assetId}`

**Create `src/app/fleet-compliance/spend/[assetId]/page.tsx`** — Asset Detail Spend page:
- Shows all invoices and maintenance records for a specific asset
- Table: Date | Vendor | Type | Parts | Labor | Total | Status
- Summary card at top: Total Spend, Invoice Count, Last Service Date
- Breadcrumbs: Fleet-Compliance > Spend > {Asset ID}

---

### CHANGE 3: Invoice Sheet in Bulk Import

The import pipeline at `/fleet-compliance/import` supports 12 collection types but does NOT include invoices. Add invoice support.

**Update `src/lib/fleet-compliance-import-schemas.ts`:**

Add a new schema entry:
```ts
invoices: {
  label: 'Invoices',
  sheetName: 'Invoices',
  fields: {
    'Vendor': { required: true },
    'Invoice Number': { required: true },
    'Invoice Date': { required: true, isDate: true },
    'Due Date': { isDate: true },
    'Total Amount': { required: true },
    'Parts Cost': {},
    'Labor Cost': {},
    'Shop Supplies': {},
    'Sales Tax': {},
    'Category': { oneOf: ['maintenance', 'permit', 'fuel', 'insurance', 'other'] },
    'Asset ID': {},
    'Service Type': {},
    'Status': { oneOf: ['pending', 'paid', 'overdue', ''] },
    'PO Number': {},
    'Notes': {},
  },
}
```

Add `'invoices'` to the `CollectionKey` type union.

**Update the bulk template** — the template download should include an "Invoices" sheet with these headers.

Check `src/lib/fleet-compliance-upload-template.generated.ts` and the template generation logic. The import page auto-discovers sheets by matching `sheetName` to schema keys, so adding the schema entry should be sufficient.

---

### CHANGE 4: Update Download Bulk Template

The "Download Bulk Template" button generates an XLSX with all sheet templates. Ensure the new "Invoices" sheet is included.

Read `src/app/api/fleet-compliance/bulk-template/route.ts` (if it exists) or wherever the template is generated. Add the Invoices sheet with the column headers from the schema above.

If the template is generated from `IMPORT_SCHEMAS`, adding the schema in Change 3 should auto-include it.

---

### CONSTRAINTS

- Use existing auth patterns (`requireFleetComplianceOrg`, `getSQL()`, `recordOrgAuditEvent`)
- The sidebar must work on ALL `/fleet-compliance/*` pages without modifying each page individually — use the layout
- Do not modify Stripe, Clerk, Sentry, or Penny configurations
- Do not add new npm dependencies
- Run `npm run lint` before committing
- Ensure the sidebar doesn't break mobile — use responsive CSS with a breakpoint

Commit when done with message: "Add sidebar navigation, enhanced spend dashboard, and invoice import support"
