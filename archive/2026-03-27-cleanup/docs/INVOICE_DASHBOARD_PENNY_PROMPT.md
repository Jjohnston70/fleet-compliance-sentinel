# Claude Code Prompt: Invoice Enhancements, Spend Dashboard, Penny Data Access

Paste this entire PROMPT section into a new Claude Code session at the repo root.

---

## PROMPT

I need 4 features built for Fleet-Compliance Sentinel. Read the files referenced before making changes.

---

### FEATURE 1: Asset Dropdown on Invoice Form

**File:** `src/components/fleet-compliance/forms/InvoiceForm.tsx`

The "Asset Link" section currently has a plain text input for `assetId`. Replace it with a dropdown that lists all assets in the current organization.

**Implementation:**

1. The InvoiceForm component needs to receive the org's assets as a prop. Update the Props interface:
   ```ts
   interface Props {
     initial?: LocalInvoice;
     returnHref?: string;
     orgAssets?: Array<{ assetId: string; label: string }>;
   }
   ```

2. In the "Asset Link" fieldset, replace the text input for `assetId` with a `<select>` dropdown:
   - First option: `"— Select Asset —"` with empty value
   - Remaining options: each asset formatted as `"{assetId} — {label}"` where label is the asset name/type
   - Value should be the `assetId`

3. **Pass assets from the parent page.** Update `src/app/fleet-compliance/invoices/new/page.tsx`:
   - Import `loadFleetComplianceData` from `@/lib/fleet-compliance-data`
   - Use `requireFleetComplianceOrg` to get orgId
   - Load assets via `loadFleetComplianceData(orgId)`
   - Map to `{ assetId, label }` format — use `data.unitNumber || data.assetName || assetId` for the label
   - Pass as `orgAssets` prop to InvoiceForm

---

### FEATURE 2: PDF Invoice Upload

**New files needed:**
- `src/app/api/fleet-compliance/invoices/parse-pdf/route.ts`
- Update `src/app/fleet-compliance/invoices/new/page.tsx` to add PDF upload option

**Implementation:**

1. **Create `src/app/api/fleet-compliance/invoices/parse-pdf/route.ts`** (POST):
   - Requires Clerk auth via `requireFleetComplianceOrg`
   - Accepts multipart form data with a PDF file
   - Use `pdf-parse` (already in package.json) to extract text from the PDF
   - Parse the extracted text to find common invoice fields using regex patterns:
     - Invoice number: look for "Invoice #", "Invoice No", "INV-"
     - Date: look for date patterns near "Date", "Invoice Date"
     - Vendor: look for company name at top of document
     - Total/Amount: look for "Total", "Amount Due", "Balance Due" near dollar amounts
     - Parts/Labor: look for "Parts", "Labor" near dollar amounts
   - Return `{ extracted: { vendor, invoiceNumber, invoiceDate, amount, partsCost, laborCost }, rawText: string }`
   - If extraction is uncertain, return what was found and let the user fill in the rest
   - Log audit event: `invoice.pdf_parsed`

2. **Update `src/app/fleet-compliance/invoices/new/page.tsx`:**
   - Add a section above the InvoiceForm: "Upload PDF Invoice"
   - File input that accepts `.pdf` only
   - On file selection, POST to `/api/fleet-compliance/invoices/parse-pdf`
   - Pre-fill the InvoiceForm with extracted fields
   - Show the raw extracted text in a collapsible "Source Text" section so the user can verify
   - Show a banner: "Fields extracted from PDF. Review and adjust before saving."

3. **Add the route to middleware protection** in `src/middleware.ts` (it's already covered by `/api/fleet-compliance/*` pattern, so just verify).

---

### FEATURE 3: Monthly Spend Dashboard

**New files needed:**
- `src/app/fleet-compliance/spend/page.tsx`
- `src/app/api/fleet-compliance/spend/route.ts`

**Implementation:**

1. **Create `src/app/api/fleet-compliance/spend/route.ts`** (GET):
   - Requires Clerk auth via `requireFleetComplianceOrg`
   - Queries invoices from `fleet_compliance_records` where collection = 'invoices' (from bulk import) PLUS the `invoices` table (from invoice import)
   - Also reads from `fleet_compliance_records` where collection = 'maintenance_events' for maintenance costs
   - Aggregates by month and category:
     ```ts
     type SpendSummary = {
       month: string; // "2026-03"
       categories: {
         maintenance: number;
         permits: number;
         fuel: number;
         insurance: number;
         other: number;
         total: number;
       };
     };
     ```
   - Also calculates category totals for current month, last 3 months, and last 12 months
   - Returns `{ months: SpendSummary[], currentMonth: CategoryTotals, quarter: CategoryTotals, year: CategoryTotals }`

2. **Create `src/app/fleet-compliance/spend/page.tsx`:**
   - Title: "Spend Dashboard"
   - Top row: 3 summary cards — "This Month", "Last 90 Days", "Last 12 Months" with total spend
   - Category breakdown table showing spend per category for the current month
   - Monthly trend: a simple table or bar visualization showing last 6 months of total spend
   - Each row shows: Month | Maintenance | Permits | Fuel | Insurance | Other | Total
   - Use the existing Fleet-Compliance CSS classes (`.fleet-compliance-card`, `.fleet-compliance-form-grid`, etc.)

3. **Add navigation link** in `src/app/fleet-compliance/page.tsx`:
   - Add a "Spend Dashboard" button/card in the operations grid alongside "Open Suspense", "Alerts", etc.

---

### FEATURE 4: Penny Access to Client Assets, Invoices, and Maintenance Data

**File:** `src/lib/penny-context.ts`

Penny currently gets drivers, assets, permits, and suspense items in her context. She does NOT get invoices or maintenance costs. Extend the context.

**Implementation:**

1. **Update `src/lib/penny-context.ts`:**

   Add two new sections to `ContextSections`:
   ```ts
   type ContextSections = {
     drivers: ContextEntry[];
     assets: ContextEntry[];
     permits: ContextEntry[];
     suspense: ContextEntry[];
     maintenance: ContextEntry[];   // NEW
     invoices: ContextEntry[];      // NEW
   };
   ```

2. **Build maintenance context** from `data.maintenanceEvents`:
   ```
   RECENT MAINTENANCE (N events):
   - Unit: T-101 | Type: Oil Change | Date: 2026-01-15 | Cost: $285 | Status: Completed
   ```
   - Only include the last 20 maintenance events (sorted by date descending)
   - Include: asset ID, maintenance type, date, estimated cost, status

3. **Build invoice context** from the invoices data:
   - Query invoices from the DB for the org (you'll need to add an invoice loader to `fleet-compliance-data.ts` if one doesn't exist for DB-stored invoices)
   - For locally-stored invoices, skip them (they're in browser localStorage, not available server-side)
   - Format:
   ```
   RECENT INVOICES (N records):
   - Vendor: High Plains Truck | Amount: $285 | Date: 2026-01-15 | Category: Maintenance | Asset: T-101
   ```
   - Only include last 20 invoices
   - Include: vendor, amount, date, category, linked asset

4. **Update `renderContext()`** to include the new sections:
   ```
   --- OPERATOR FLEET DATA ---
   DRIVERS (N total): ...
   ASSETS (N total): ...
   PERMITS (N total): ...
   OPEN SUSPENSE ITEMS (N items): ...
   RECENT MAINTENANCE (N events): ...
   RECENT INVOICES (N records): ...
   --- END OPERATOR DATA ---
   ```

5. **Update `trimToMaxContextChars()`** to include maintenance and invoices in the trimming candidates.

6. **Increase MAX_CONTEXT_CHARS** from 8000 to 12000 to accommodate the additional data. The Railway backend accepts large context payloads.

**Important:** Do NOT include PII in the context. Use asset IDs, vendor names, amounts, dates — no employee names, emails, or personal data.

---

### CONSTRAINTS

- Use existing auth patterns (`requireFleetComplianceOrg`, `getSQL()`, `recordOrgAuditEvent`)
- Use existing CSS classes from `src/styles/globals.css`
- Do not add new npm dependencies (pdf-parse is already installed)
- Do not modify the Stripe, Clerk, or Sentry configuration
- Add any new API routes to the existing middleware protection pattern
- Run `npm run lint` before committing

Commit when done with message: "Add invoice PDF upload, asset dropdown, spend dashboard, and Penny data access"
