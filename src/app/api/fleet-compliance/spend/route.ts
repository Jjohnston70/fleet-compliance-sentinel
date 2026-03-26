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
  const totalsByMonth = new Map<string, CategoryTotals>();

  const importInvoiceRows = await sql`
    SELECT collection, data
    FROM fleet_compliance_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND collection IN ('invoices', 'maintenance_tracker')
  `;

  for (const row of importInvoiceRows) {
    const data = (row.data as Record<string, unknown>) ?? {};
    const date = extractFirstDate(data, ['Invoice Date', 'Completed Date', 'Date', 'Service Date']);
    const month = monthKeyFromDate(date);
    if (!month) continue;

    const amount = extractFirstAmount(data, [
      'Invoice Total',
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
  }

  const maintenanceRows = await sql`
    SELECT data
    FROM fleet_compliance_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND collection IN ('maintenance_events', 'maintenance_schedule')
  `;

  for (const row of maintenanceRows) {
    const data = (row.data as Record<string, unknown>) ?? {};
    const date = extractFirstDate(data, ['Completed Date', 'Scheduled Date', 'Date', 'Next Due Date']);
    const month = monthKeyFromDate(date);
    if (!month) continue;

    const amount = extractFirstAmount(data, ['Estimated Cost', 'Cost', 'Invoice Total', 'Total Cost', 'Amount']);
    if (amount <= 0) continue;

    if (!totalsByMonth.has(month)) totalsByMonth.set(month, emptyTotals());
    addToTotals(totalsByMonth.get(month)!, 'maintenance', amount);
  }

  try {
    const dbInvoices = await sql`
      SELECT
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

      const grandTotal = parseAmount(row.grand_total);
      const subtotal = parseAmount(row.subtotal);
      const partsTotal = parseAmount(row.parts_total);
      const laborTotal = parseAmount(row.labor_total);
      const shopSupplies = parseAmount(row.shop_supplies);
      const salesTax = parseAmount(row.sales_tax);
      const computed = partsTotal + laborTotal + shopSupplies + salesTax;
      const amount = grandTotal || subtotal || computed;
      if (amount <= 0) continue;

      const categorySeed = `${String(row.vendor ?? '')} ${String(row.source_file ?? '')}`;
      const category = categorizeFromText(categorySeed, 'maintenance');

      if (!totalsByMonth.has(month)) totalsByMonth.set(month, emptyTotals());
      addToTotals(totalsByMonth.get(month)!, category, amount);
    }
  } catch {
    // Invoices table may not exist in all environments.
  }

  const last12Months = getMonthKeys(12);
  const currentMonth = [last12Months[last12Months.length - 1]];
  const quarter = last12Months.slice(-3);

  const months: SpendSummary[] = last12Months.map((month) => ({
    month,
    categories: cloneTotals(totalsByMonth.get(month) ?? emptyTotals()),
  }));

  return Response.json({
    months,
    currentMonth: sumPeriods(currentMonth, totalsByMonth),
    quarter: sumPeriods(quarter, totalsByMonth),
    year: sumPeriods(last12Months, totalsByMonth),
  });
}
