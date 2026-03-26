import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { findDriver, formatDueLabel, getDriverDocuments, getDriverSourceQuality, getDriverSuspense, loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import InlineNoteEditor from '@/components/fleet-compliance/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ personId: string }>;

export default async function FleetComplianceDriverComplianceDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId, orgId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }
  if (!orgId) {
    redirect('/');
  }

  const data = await loadFleetComplianceData(orgId);

  const { personId } = await params;
  const driver = findDriver(data.drivers, personId);
  if (!driver) {
    notFound();
  }

  const suspense = getDriverSuspense(data.suspense, driver.personId);
  const documents = getDriverDocuments();
  const quality = getDriverSourceQuality(driver);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/compliance">Compliance</Link>
          <span>/</span>
          <span>{driver.driverName}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">
              {driver.employeeId}
              <span className={`fleet-compliance-quality-badge fleet-compliance-quality-${quality}`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </span>
            </p>
            <h1>{driver.driverName}</h1>
          </div>
          <Link href="/fleet-compliance/compliance" className="btn-secondary">
            Back to Compliance
          </Link>
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Qualification timing</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>License State</dt>
                <dd>{driver.licenseState}</dd>
              </div>
              <div>
                <dt>CDL Class</dt>
                <dd>{driver.cdlClass}</dd>
              </div>
              <div>
                <dt>Medical Expiration</dt>
                <dd>
                  {driver.medicalExpiration} · {formatDueLabel(driver.medicalExpiration)}
                </dd>
              </div>
              <div>
                <dt>MVR Due</dt>
                <dd>
                  {driver.nextMvrDue} · {formatDueLabel(driver.nextMvrDue)}
                </dd>
              </div>
            </dl>
          </article>

          <article className="fleet-compliance-kv-card">
            <h3>Hazmat / clearinghouse</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>TSA Expiration</dt>
                <dd>
                  {driver.tsaExpiration} · {formatDueLabel(driver.tsaExpiration)}
                </dd>
              </div>
              <div>
                <dt>Hazmat Expiration</dt>
                <dd>
                  {driver.hazmatExpiration} · {formatDueLabel(driver.hazmatExpiration)}
                </dd>
              </div>
              <div>
                <dt>Clearinghouse Status</dt>
                <dd>{driver.clearinghouseStatus}</dd>
              </div>
            </dl>
          </article>
        </div>

        <InlineNoteEditor
          storageKey={`fleet-compliance:driver:note:${driver.personId}`}
          initialNote={driver.note}
          label="Notes"
        />

        <article className="fleet-compliance-list-card">
          <h3>Documents</h3>
          <ul>
            {documents.map((doc) => (
              <li key={doc.label}>
                <Link href={doc.href} className="fleet-compliance-inline-link">
                  {doc.label}
                </Link>
                {' '}· <span className="fleet-compliance-table-note">{doc.note}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="fleet-compliance-list-card">
          <h3>Linked suspense items</h3>
          {suspense.length ? (
            <ul>
              {suspense.map((item) => (
                <li key={item.suspenseItemId}>
                  <Link href={`/fleet-compliance/suspense/${encodeURIComponent(item.suspenseItemId)}`} className="fleet-compliance-inline-link">
                    {item.title}
                  </Link>{' '}
                  · {item.dueDate}
                </li>
              ))}
            </ul>
          ) : (
            <p>No suspense items are currently tied to this driver profile.</p>
          )}
        </div>
      </section>
    </main>
  );
}

