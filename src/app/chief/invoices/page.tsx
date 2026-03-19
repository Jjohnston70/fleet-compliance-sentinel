import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';

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
            <Link href="/chief" className="btn-secondary">Back to Chief</Link>
          </div>
        </div>
        <p className="chief-subcopy">
          Track vendor invoices for maintenance, permits, fuel, insurance, and other expenses.
        </p>

        <div className="chief-empty-state">
          <h3>PDF invoice upload coming soon</h3>
          <p>
            This module will let you upload PDF invoices, automatically parse vendor details, amounts, and line items,
            and store them in the database for tracking and reporting.
          </p>
        </div>
      </section>
    </main>
  );
}
