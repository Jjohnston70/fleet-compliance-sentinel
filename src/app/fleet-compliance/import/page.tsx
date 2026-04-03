import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { IMPORT_SCHEMAS } from '@/lib/fleet-compliance-import-schemas';
import ImportReviewer from '@/components/fleet-compliance/ImportReviewer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Import Data',
};

export default async function FleetComplianceImportPage() {
  if (!isClerkEnabled()) return null;

  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/import" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Import Review</p>
            <h1>Validation-driven import</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/api/fleet-compliance/bulk-template" className="btn-secondary">
              Download Template
            </Link>
            <Link href="/api/fleet-compliance/sales/template" className="btn-secondary">
              Download Sales CSV Template
            </Link>
          </div>
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Import Review</span>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          Upload a CSV or XLSX file, select the target collection, and review each row before
          committing. Rows with validation issues are flagged automatically — you can override
          any decision per row. Approved rows download as JSON ready for Firestore import.
        </p>

        <div className="fleet-compliance-list-card" style={{ marginBottom: '1rem' }}>
          <h3>Sales CSV Import Format</h3>
          <p className="fleet-compliance-table-note">
            Sales dashboard CSV expects headers:
            {' '}
            <code>Date, Product, Region, SalesRep, Channel, Revenue, UnitsSold, COGS</code>.
            {' '}
            You can also use aliases like <code>Qty</code> and <code>Sales Price</code>.
          </p>
        </div>

        {/* Schema reference */}
        <div className="fleet-compliance-list-card" style={{ marginBottom: '1.5rem' }}>
          <h3>Expected headers per collection</h3>
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Collection</th>
                  <th>Required fields</th>
                  <th>Optional fields</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => {
                  const required = Object.entries(schema.fields)
                    .filter(([, f]) => f.required)
                    .map(([k]) => k);
                  const optional = Object.entries(schema.fields)
                    .filter(([, f]) => !f.required)
                    .map(([k]) => k);
                  return (
                    <tr key={key}>
                      <td><strong>{schema.label}</strong><br /><span className="fleet-compliance-table-note">{key}</span></td>
                      <td style={{ color: '#111827' }}>{required.join(', ')}</td>
                      <td className="fleet-compliance-table-note">{optional.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <ImportReviewer orgId={orgId} />
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
