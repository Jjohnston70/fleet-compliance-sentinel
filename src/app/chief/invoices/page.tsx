import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import LocalRecordsPanel from '@/components/chief/LocalRecordsPanel';

export const dynamic = 'force-dynamic';

export default async function ChiefInvoicesPage() {
  if (!isClerkEnabled()) return null;
  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Invoices</p>
            <h1>Vendor invoices</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/chief/invoices/new" className="btn-primary">+ Add Invoice</Link>
            <Link href="/chief" className="btn-secondary">Back to Chief</Link>
          </div>
        </div>
        <p className="chief-subcopy">
          Track vendor invoices for maintenance, permits, fuel, insurance, and other expenses.
          Invoices are saved locally and can be exported as JSON for Firestore import.
        </p>

        <LocalRecordsPanel
          storeKey="chief:store:invoices"
          title="Invoices"
          addHref="/chief/invoices/new"
          editHref={(id) => `/chief/invoices/${id}/edit`}
          statusField="status"
          columns={[
            { key: 'vendor', label: 'Vendor' },
            { key: 'invoiceNumber', label: 'Invoice #' },
            { key: 'invoiceDate', label: 'Date' },
            { key: 'dueDate', label: 'Due' },
            { key: 'amount', label: 'Amount' },
            { key: 'category', label: 'Category' },
            { key: 'assetId', label: 'Asset' },
            { key: 'status', label: 'Status' },
          ]}
        />
      </section>
    </main>
  );
}
