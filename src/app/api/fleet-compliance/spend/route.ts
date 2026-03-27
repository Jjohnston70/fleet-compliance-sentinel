import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { getSQL } from '@/lib/fleet-compliance-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SpendCategory = 'maintenance' | 'permits' | 'fuel' | 'insurance' | 'other';

type CategoryTotals = {
  maintenance: number;
  permits: number;
  fuel: number;
  insurance: number;
  other: number;
  total: number;
};

type SpendSummary = {
  month: string;
  categories: CategoryTotals;
};

type CostBreakdown = {
  parts: number;
  labor: number;
  shopSupplies: number;
  tax: number;
  other: number;
  total: number;
};

type AssetSpendRow = {
  assetId: string;
  label: string;
  total: number;
  parts: number;
  labor: number;
  invoiceCount: number;
  lastServiceDate: string;
};

const CATEGORY_LIST: SpendCategory[] = ['maintenance', 'permits', 'fuel', 'insurance', 'other'];

function emptyTotals(): CategoryTotals {
  return {
    maintenance: 0,
    permits: 0,
    fuel: 0,
    insurance: 0,
    other: 0,
    total: 0,
  };
}

function cloneTotals(input: CategoryTotals): CategoryTotals {
  return {
    maintenance: input.maintenance,
    permits: input.permits,
    fuel: input.fuel,
    insurance: input.insurance,
    other: input.other,
    total: input.total,
  };
}

function emptyCostBreakdown(): CostBreakdown {
  return {
    parts: 0,
    labor: 0,
    shopSupplies: 0,
    tax: 0,
    other: 0,
    total: 0,
  };
}

function parseAmount(value: unknown): number {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value !== 'string') return 0;
  const cleaned = value.replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return 0;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDate(value: unknown): string {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  const slashMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const rawYear = Number(slashMatch[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function monthKeyFromDate(dateText: string): string {
  if (!dateText) return '';
  const normalized = parseDate(dateText);
  if (!normalized) return '';
  return normalized.slice(0, 7);
}

function addToTotals(totals: CategoryTotals, category: SpendCategory, amount: number) {
  if (!Number.isFinite(amount) || amount <= 0) return;
  totals[category] += amount;
  totals.total += amount;
}

function categorizeFromText(text: string, fallback: SpendCategory = 'other'): SpendCategory {
  const lower = text.toLowerCase();
  if (/(permit|license|ifta|irp|ucr|mc-?150|authority)/.test(lower)) return 'permits';
  if (/(fuel|diesel|gas|gasoline|def\b)/.test(lower)) return 'fuel';
  if (/(insurance|premium|policy|liability|coverage)/.test(lower)) return 'insurance';
  if (/(maintenance|repair|service|parts|labor|inspection|work order)/.test(lower)) return 'maintenance';
  return fallback;
}

function getMonthKeys(count: number): string[] {
  const now = new Date();
  const cursor = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const keys: string[] = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const monthDate = new Date(cursor);
    monthDate.setUTCMonth(monthDate.getUTCMonth() - index);
    keys.push(`${monthDate.getUTCFullYear()}-${String(monthDate.getUTCMonth() + 1).padStart(2, '0')}`);
  }

  return keys;
}

function sumPeriods(monthKeys: string[], totalsByMonth: Map<string, CategoryTotals>): CategoryTotals {
  const totals = emptyTotals();
  for (const month of monthKeys) {
    const monthTotals = totalsByMonth.get(month);
    if (!monthTotals) continue;
    for (const category of CATEGORY_LIST) {
      totals[category] += monthTotals[category];
    }
    totals.total += monthTotals.total;
  }
  return totals;
}

function extractFirstAmount(row: Record<string, unknown>, keys: string[]): number {
  for (const key of keys) {
    const amount = parseAmount(row[key]);
    if (amount > 0) return amount;
  }
  return 0;
}

function extractFirstDate(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const date = parseDate(row[key]);
    if (date) return date;
  }
  return '';
}

function extractFirstString(row: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

function addToCostBreakdown(
  breakdown: CostBreakdown,
  input: { total: number; parts?: number; labor?: number; shopSupplies?: number; tax?: number }
) {
  const total = input.total > 0 ? input.total : 0;
  const parts = input.parts && input.parts > 0 ? input.parts : 0;
  const labor = input.labor && input.labor > 0 ? input.labor : 0;
  const shopSupplies = input.shopSupplies && input.shopSupplies > 0 ? input.shopSupplies : 0;
  const tax = input.tax && input.tax > 0 ? input.tax : 0;
  const known = parts + labor + shopSupplies + tax;
  const other = Math.max(total - known, 0);

  breakdown.parts += parts;
  breakdown.labor += labor;
  breakdown.shopSupplies += shopSupplies;
  breakdown.tax += tax;
  breakdown.other += other;
  breakdown.total += total;
}

function addToAssetSpend(
  assetMap: Map<string, AssetSpendRow>,
  input: {
    assetId: string;
    label: string;
    total: number;
    parts?: number;
    labor?: number;
    serviceDate?: string;
  }
) {
  const assetId = input.assetId.trim() || 'UNASSIGNED';
  const existing = assetMap.get(assetId);
  const total = input.total > 0 ? input.total : 0;
  const parts = input.parts && input.parts > 0 ? input.parts : 0;
  const labor = input.labor && input.labor > 0 ? input.labor : 0;
  const serviceDate = parseDate(input.serviceDate ?? '');

  if (!existing) {
    assetMap.set(assetId, {
      assetId,
      label: input.label.trim() || assetId,
      total,
      parts,
      labor,
      invoiceCount: total > 0 ? 1 : 0,
      lastServiceDate: serviceDate,
    });
    return;
  }

  existing.total += total;
  existing.parts += parts;
  existing.labor += labor;
  if (total > 0) {
    existing.invoiceCount += 1;
  }
  if (serviceDate && (!existing.lastServiceDate || serviceDate > existing.lastServiceDate)) {
    existing.lastServiceDate = serviceDate;
  }
}

function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function roundCategoryTotals(input: CategoryTotals): CategoryTotals {
  return {
    maintenance: roundMoney(input.maintenance),
    permits: roundMoney(input.permits),
    fuel: roundMoney(input.fuel),
    insurance: roundMoney(input.insurance),
    other: roundMoney(input.other),
    total: roundMoney(input.total),
  };
}

function roundCostBreakdown(input: CostBreakdown): CostBreakdown {
  return {
    parts: roundMoney(input.parts),
    labor: roundMoney(input.labor),
    shopSupplies: roundMoney(input.shopSupplies),
    tax: roundMoney(input.tax),
    other: roundMoney(input.other),
    total: roundMoney(input.total),
  };
}

export async function GET(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sql = getSQL();
  const last12Months = getMonthKeys(12);
  const currentMonthKey = last12Months[last12Months.length - 1];
  const totalsByMonth = new Map<string, CategoryTotals>();
  const costBreakdown = emptyCostBreakdown();
  const assetSpendMap = new Map<string, AssetSpendRow>();

  const importInvoiceRows = await sql`
    SELECT collection, data, imported_at
    FROM fleet_compliance_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND collection IN ('invoices', 'maintenance_tracker')
  `;

  for (const row of importInvoiceRows) {
    const data = (row.data as Record<string, unknown>) ?? {};
    const date =
      extractFirstDate(data, ['Invoice Date', 'Completed Date', 'Date', 'Service Date']) ||
      parseDate(String(row.imported_at ?? ''));
    const month = monthKeyFromDate(date);
    if (!month) continue;

    const parts = extractFirstAmount(data, ['Parts Cost', 'Parts Total']);
    const labor = extractFirstAmount(data, ['Labor Cost', 'Labor Total']);
    const shopSupplies = extractFirstAmount(data, ['Shop Supplies']);
    const tax = extractFirstAmount(data, ['Sales Tax', 'Tax']);
    const amount = extractFirstAmount(data, [
      'Invoice Total',
      'Total Cost',
      'Grand Total',
      'Total Amount',
      'Amount Due',
      'Balance Due',
      'Amount',
      'Total',
    ]);
    if (amount <= 0) continue;

    const categorySeed = [
      String(data['Category'] ?? ''),
      String(data['Invoice Category'] ?? ''),
      String(data['Vendor'] ?? ''),
      String(data['Work Completed'] ?? ''),
      String(data['Work Requested'] ?? ''),
      String(data['Notes'] ?? ''),
    ].join(' ');

    const fallback = row.collection === 'maintenance_tracker' ? 'maintenance' : 'other';
    const category = categorizeFromText(categorySeed, fallback);

    if (!totalsByMonth.has(month)) totalsByMonth.set(month, emptyTotals());
    addToTotals(totalsByMonth.get(month)!, category, amount);

    if (month === currentMonthKey) {
      addToCostBreakdown(costBreakdown, {
        total: amount,
        parts,
        labor,
        shopSupplies,
        tax,
      });
    }

    const assetId = extractFirstString(data, ['Asset ID', 'Unit Number', 'Unit/Equipment', 'Asset Name']) || 'UNASSIGNED';
    const label = extractFirstString(data, ['Asset Name', 'Unit Number', 'Asset ID', 'Unit/Equipment']) || assetId;
    addToAssetSpend(assetSpendMap, {
      assetId,
      label,
      total: amount,
      parts,
      labor,
      serviceDate: date,
    });
  }

  const maintenanceRows = await sql`
    SELECT data, imported_at
    FROM fleet_compliance_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND collection IN ('maintenance_events', 'maintenance_schedule')
  `;

  for (const row of maintenanceRows) {
    const data = (row.data as Record<string, unknown>) ?? {};
    const date =
      extractFirstDate(data, ['Completed Date', 'Scheduled Date', 'Date', 'Next Due Date']) ||
      parseDate(String(row.imported_at ?? ''));
    const month = monthKeyFromDate(date);
    if (!month) continue;

    const parts = extractFirstAmount(data, ['Parts Cost', 'Parts Total']);
    const labor = extractFirstAmount(data, ['Labor Cost', 'Labor Total']);
    const amount = extractFirstAmount(data, ['Estimated Cost', 'Cost', 'Invoice Total', 'Total Cost', 'Amount']);
    if (amount <= 0) continue;

    if (!totalsByMonth.has(month)) totalsByMonth.set(month, emptyTotals());
    addToTotals(totalsByMonth.get(month)!, 'maintenance', amount);

    if (month === currentMonthKey) {
      addToCostBreakdown(costBreakdown, {
        total: amount,
        parts,
        labor,
      });
    }

    const assetId = extractFirstString(data, ['Asset ID', 'Unit Number', 'Unit/Equipment', 'Asset Name']) || 'UNASSIGNED';
    const label = extractFirstString(data, ['Asset Name', 'Unit Number', 'Asset ID', 'Unit/Equipment']) || assetId;
    addToAssetSpend(assetSpendMap, {
      assetId,
      label,
      total: amount,
      parts,
      labor,
      serviceDate: date,
    });
  }

  try {
    const dbInvoices = await sql`
      SELECT
        unit_number,
        invoice_date,
        imported_at,
        vendor,
        source_file,
        grand_total,
        subtotal,
        parts_total,
        labor_total,
        shop_supplies,
        sales_tax
      FROM invoices
      WHERE org_id = ${orgId}
        AND deleted_at IS NULL
    `;

    for (const row of dbInvoices) {
      const date =
        parseDate(String(row.invoice_date ?? '')) ||
        parseDate(String(row.imported_at ?? ''));
      const month = monthKeyFromDate(date);
      if (!month) continue;

      const parts = parseAmount(row.parts_total);
      const labor = parseAmount(row.labor_total);
      const shopSupplies = parseAmount(row.shop_supplies);
      const tax = parseAmount(row.sales_tax);
      const computed = parts + labor + shopSupplies + tax;
      const amount = parseAmount(row.grand_total) || parseAmount(row.subtotal) || computed;
      if (amount <= 0) continue;

      const categorySeed = `${String(row.vendor ?? '')} ${String(row.source_file ?? '')}`;
      const category = categorizeFromText(categorySeed, 'maintenance');

      if (!totalsByMonth.has(month)) totalsByMonth.set(month, emptyTotals());
      addToTotals(totalsByMonth.get(month)!, category, amount);

      if (month === currentMonthKey) {
        addToCostBreakdown(costBreakdown, {
          total: amount,
          parts,
          labor,
          shopSupplies,
          tax,
        });
      }

      const assetId = String(row.unit_number ?? '').trim() || 'UNASSIGNED';
      addToAssetSpend(assetSpendMap, {
        assetId,
        label: assetId,
        total: amount,
        parts,
        labor,
        serviceDate: date,
      });
    }
  } catch {
    // invoices table may not exist in all environments.
  }

  const currentMonth = [currentMonthKey];
  const quarter = last12Months.slice(-3);

  const months: SpendSummary[] = last12Months.map((month) => ({
    month,
    categories: roundCategoryTotals(cloneTotals(totalsByMonth.get(month) ?? emptyTotals())),
  }));

  const assetSpend: AssetSpendRow[] = Array.from(assetSpendMap.values())
    .map((row) => ({
      ...row,
      total: roundMoney(row.total),
      parts: roundMoney(row.parts),
      labor: roundMoney(row.labor),
    }))
    .sort((a, b) => b.total - a.total);

  return Response.json({
    months,
    currentMonth: roundCategoryTotals(sumPeriods(currentMonth, totalsByMonth)),
    quarter: roundCategoryTotals(sumPeriods(quarter, totalsByMonth)),
    year: roundCategoryTotals(sumPeriods(last12Months, totalsByMonth)),
    costBreakdown: roundCostBreakdown(costBreakdown),
    assetSpend,
  });
}
