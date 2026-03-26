import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import SpendDashboardClient from '@/components/fleet-compliance/SpendDashboardClient';

export const dynamic = 'force-dynamic';

export default async function FleetComplianceSpendPage() {
  if (!isClerkEnabled()) return null;
  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/spend" userId={userId}>
      <main className="fleet-compliance-shell">
        <section className="fleet-compliance-section">
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Spend</span>
          </div>
          <div className="fleet-compliance-section-head">
            <div>
              <p className="fleet-compliance-eyebrow">Finance</p>
              <h1>Spend Dashboard</h1>
            </div>
            <Link href="/fleet-compliance" className="btn-secondary">Back to Fleet-Compliance</Link>
          </div>
          <p className="fleet-compliance-subcopy">
            Monthly spend rollup from imported invoices, invoice imports, and maintenance costs.
          </p>
        </section>

        <SpendDashboardClient />
      </main>
    </FleetComplianceErrorBoundary>
  );
}
