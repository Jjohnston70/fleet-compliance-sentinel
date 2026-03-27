import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { getSQL } from '@/lib/fleet-compliance-db';

export const dynamic = 'force-dynamic';

type Params = Promise<{ assetId: string }>;

type SpendDetailRow = {
  date: string;
  vendor: string;
  type: string;
  parts: number;
  labor: number;
  total: number;
  status: string;
};

function parseAmount(value: unknown): number {
  if (typeof value === 'number') return Number.isFinite(value) ? value : 0;
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
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);

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

function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function formatDate(value: string): string {
  if (!value) return '—';
  const parsed = new Date(`${value}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export default async function FleetComplianceSpendAssetDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) return null;

  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const { assetId: rawAssetId } = await params;
  const assetId = decodeURIComponent(rawAssetId);
  const sql = getSQL();

  const rows: SpendDetailRow[] = [];

  try {
    const invoiceRows = await sql`
      SELECT
        invoice_date,
        imported_at,
        vendor,
        parts_total,
        labor_total,
        shop_supplies,
        sales_tax,
        grand_total,
        subtotal
      FROM invoices
      WHERE org_id = ${orgId}
        AND deleted_at IS NULL
        AND unit_number = ${assetId}
    `;

    for (const row of invoiceRows) {
      const parts = parseAmount(row.parts_total);
      const labor = parseAmount(row.labor_total);
      const shop = parseAmount(row.shop_supplies);
      const tax = parseAmount(row.sales_tax);
      const computed = parts + labor + shop + tax;
      const total = parseAmount(row.grand_total) || parseAmount(row.subtotal) || computed;
      const date = parseDate(String(row.invoice_date ?? '')) || parseDate(String(row.imported_at ?? ''));

      rows.push({
        date,
        vendor: String(row.vendor ?? 'Unknown Vendor'),
        type: 'Invoice Import',
        parts,
        labor,
        total,
        status: 'Imported',
      });
    }
  } catch {
    // invoices table may not exist in some environments
  }

  const recordRows = await sql`
    SELECT collection, data, imported_at
    FROM fleet_compliance_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
      AND collection IN ('invoices', 'maintenance_tracker', 'maintenance_events', 'maintenance_schedule')
      AND (
        data->>'Asset ID' = ${assetId}
        OR data->>'Unit Number' = ${assetId}
        OR data->>'Unit/Equipment' = ${assetId}
      )
  `;

  for (const row of recordRows) {
    const data = (row.data as Record<string, unknown>) ?? {};
    const parts = parseAmount(data['Parts Cost']) || parseAmount(data['Parts Total']);
    const labor = parseAmount(data['Labor Cost']) || parseAmount(data['Labor Total']);
    const total =
      parseAmount(data['Invoice Total']) ||
      parseAmount(data['Total Cost']) ||
      parseAmount(data['Total Amount']) ||
      parseAmount(data['Estimated Cost']) ||
      parseAmount(data['Amount']);

    const date =
      parseDate(String(data['Completed Date'] ?? '')) ||
      parseDate(String(data['Invoice Date'] ?? '')) ||
      parseDate(String(data['Scheduled Date'] ?? '')) ||
      parseDate(String(row.imported_at ?? ''));

    rows.push({
      date,
      vendor: String(data['Vendor'] ?? data['Service Provider'] ?? 'Unknown Vendor'),
      type: String(data['Service Type'] ?? data['Category'] ?? row.collection ?? 'Maintenance'),
      parts,
      labor,
      total,
      status: String(data['Status'] ?? 'Tracked'),
    });
  }

  const detailRows = rows
    .filter((row) => row.total > 0)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalSpend = detailRows.reduce((sum, row) => sum + row.total, 0);
  const invoiceCount = detailRows.length;
  const lastServiceDate = detailRows[0]?.date || '';

  return (
    <FleetComplianceErrorBoundary page={`/fleet-compliance/spend/${encodeURIComponent(assetId)}`} userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <Link href="/fleet-compliance/spend">Spend</Link>
            <span>/</span>
            <span>{assetId}</span>
          </div>

          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Asset Spend</p>
              <h1>{assetId}</h1>
            </div>
            <Link href="/fleet-compliance/spend" className="btn-secondary">Back to Spend Dashboard</Link>
          </div>

          <section className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
            <article className="fleet-compliance-stat-card">
              <p className="fleet-compliance-stat-label">Total Spend</p>
              <p className="fleet-compliance-stat-value">{formatMoney(totalSpend)}</p>
            </article>
            <article className="fleet-compliance-stat-card">
              <p className="fleet-compliance-stat-label">Invoice Count</p>
              <p className="fleet-compliance-stat-value">{invoiceCount}</p>
            </article>
            <article className="fleet-compliance-stat-card">
              <p className="fleet-compliance-stat-label">Last Service Date</p>
              <p className="fleet-compliance-stat-value" style={{ fontSize: '1.5rem' }}>{formatDate(lastServiceDate)}</p>
            </article>
          </section>

          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Vendor</th>
                  <th>Type</th>
                  <th>Parts</th>
                  <th>Labor</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detailRows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="fleet-compliance-table-note">No spend records found for this asset.</td>
                  </tr>
                ) : (
                  detailRows.map((row, index) => (
                    <tr key={`${row.date}-${row.vendor}-${row.type}-${index}`}>
                      <td>{formatDate(row.date)}</td>
                      <td>{row.vendor}</td>
                      <td>{row.type}</td>
                      <td>{formatMoney(row.parts)}</td>
                      <td>{formatMoney(row.labor)}</td>
                      <td>{formatMoney(row.total)}</td>
                      <td>{row.status}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
