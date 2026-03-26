import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';

export const dynamic = 'force-dynamic';

export default async function FleetComplianceInvoicesPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

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
            <Link href="/fleet-compliance" className="btn-secondary">Back to Fleet-Compliance</Link>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          Track vendor invoices for maintenance, permits, fuel, insurance, and other expenses.
        </p>

        <div className="fleet-compliance-empty-state">
          <h3>PDF invoice upload coming soon</h3>
          <p>
            This module will let you upload PDF invoices, automatically parse vendor details, amounts, and line items,
            and store them in the database for tracking and reporting.
          </p>
        </div>
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}

