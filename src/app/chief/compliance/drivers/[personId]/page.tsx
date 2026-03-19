import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { findDriver, formatDueLabel, getDriverDocuments, getDriverSourceQuality, getDriverSuspense, loadChiefData } from '@/lib/chief-data';
import InlineNoteEditor from '@/components/chief/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ personId: string }>;

export default async function ChiefDriverComplianceDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const data = await loadChiefData();

  const { personId } = await params;
  const driver = findDriver(data.drivers, personId);
  if (!driver) {
    notFound();
  }

  const suspense = getDriverSuspense(data.suspense, driver.personId);
  const documents = getDriverDocuments();
  const quality = getDriverSourceQuality(driver);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/compliance">Compliance</Link>
          <span>/</span>
          <span>{driver.driverName}</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">
              {driver.employeeId}
              <span className={`chief-quality-badge chief-quality-${quality}`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </span>
            </p>
            <h1>{driver.driverName}</h1>
          </div>
          <Link href="/chief/compliance" className="btn-secondary">
            Back to Compliance
          </Link>
        </div>

        <div className="chief-kv-grid">
          <article className="chief-kv-card">
            <h3>Qualification timing</h3>
            <dl className="chief-kv-list">
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

          <article className="chief-kv-card">
            <h3>Hazmat / clearinghouse</h3>
            <dl className="chief-kv-list">
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
          storageKey={`chief:driver:note:${driver.personId}`}
          initialNote={driver.note}
          label="Notes"
        />

        <article className="chief-list-card">
          <h3>Documents</h3>
          <ul>
            {documents.map((doc) => (
              <li key={doc.label}>
                <Link href={doc.href} className="chief-inline-link">
                  {doc.label}
                </Link>
                {' '}· <span className="chief-table-note">{doc.note}</span>
              </li>
            ))}
          </ul>
        </article>

        <div className="chief-list-card">
          <h3>Linked suspense items</h3>
          {suspense.length ? (
            <ul>
              {suspense.map((item) => (
                <li key={item.suspenseItemId}>
                  <Link href={`/chief/suspense/${encodeURIComponent(item.suspenseItemId)}`} className="chief-inline-link">
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
