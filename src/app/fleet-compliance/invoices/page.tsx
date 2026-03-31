import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { loadFleetComplianceInvoices } from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Invoices',
};

export default async function FleetComplianceInvoicesPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const invoices = await loadFleetComplianceInvoices(orgId);
  const totalAmount = invoices.reduce((sum, row) => sum + row.amount, 0);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/invoices" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Invoices</p>
            <h1>Vendor invoices</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/fleet-compliance/invoices/new" className="btn-primary">Add Invoice</Link>
          </div>
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Invoices</span>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          Track vendor invoices for maintenance, permits, fuel, insurance, and other expenses.
          PDF parsing is available in the add-invoice flow and pre-fills invoice fields before save.
        </p>

        <div className="fleet-compliance-stats fleet-compliance-stats-compact" style={{ marginTop: '1rem' }}>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Invoice Records</p>
            <p className="fleet-compliance-stat-value">{invoices.length}</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Total Tracked</p>
            <p className="fleet-compliance-stat-value">${totalAmount.toFixed(2)}</p>
          </article>
        </div>

        {invoices.length > 0 ? (
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Vendor</th>
                  <th>Date</th>
                  <th>Category</th>
                  <th>Asset</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoices.slice(0, 100).map((invoice) => (
                  <tr key={invoice.invoiceId}>
                    <td className="fleet-compliance-table-note">{invoice.invoiceId}</td>
                    <td>{invoice.vendor}</td>
                    <td>{invoice.invoiceDate}</td>
                    <td style={{ textTransform: 'capitalize' }}>{invoice.category}</td>
                    <td>{invoice.assetId || '—'}</td>
                    <td>${invoice.amount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fleet-compliance-empty-state">
            <h3>No invoices yet</h3>
            <p>Add your first invoice to start tracking spend and category totals.</p>
          </div>
        )}
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
