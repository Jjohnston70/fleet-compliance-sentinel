import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { IMPORT_SCHEMAS } from '@/lib/chief-import-schemas';
import ImportReviewer from '@/components/chief/ImportReviewer';

export const dynamic = 'force-dynamic';

export default async function ChiefImportPage() {
  if (!isClerkEnabled()) return null;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Import Review</p>
            <h1>Validation-driven import</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/api/chief/bulk-template" className="btn-secondary">
              Download Template
            </Link>
            <Link href="/chief" className="btn-secondary">
              Back to Chief
            </Link>
          </div>
        </div>
        <p className="chief-subcopy">
          Upload a CSV or XLSX file, select the target collection, and review each row before
          committing. Rows with validation issues are flagged automatically — you can override
          any decision per row. Approved rows download as JSON ready for Firestore import.
        </p>

        {/* Schema reference */}
        <div className="chief-list-card" style={{ marginBottom: '1.5rem' }}>
          <h3>Expected headers per collection</h3>
          <div className="chief-table-wrap">
            <table className="chief-table">
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
                      <td><strong>{schema.label}</strong><br /><span className="chief-table-note">{key}</span></td>
                      <td style={{ color: '#111827' }}>{required.join(', ')}</td>
                      <td className="chief-table-note">{optional.join(', ')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <ImportReviewer />
      </section>
    </main>
  );
}
