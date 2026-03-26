import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { findPermit, formatDueLabel, getPermitDocuments, getPermitSourceQuality, getPermitSuspense, loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import InlineNoteEditor from '@/components/fleet-compliance/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ recordId: string }>;

export default async function FleetCompliancePermitDetailPage({ params }: { params: Params }) {
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

  const { recordId } = await params;
  const permit = findPermit(data.permits, recordId);
  if (!permit) {
    notFound();
  }

  const suspense = getPermitSuspense(data.suspense, permit.recordId);
  const documents = getPermitDocuments(permit.templateId);
  const quality = getPermitSourceQuality(permit);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/compliance">Compliance</Link>
          <span>/</span>
          <span>{permit.name}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">
              {permit.templateId}
              <span className={`fleet-compliance-quality-badge fleet-compliance-quality-${quality}`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </span>
            </p>
            <h1>{permit.name}</h1>
          </div>
          <Link href="/fleet-compliance/compliance" className="btn-secondary">
            Back to Compliance
          </Link>
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Renewal record</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>Cadence</dt>
                <dd>{permit.cadence}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{permit.status}</dd>
              </div>
              <div>
                <dt>Renewal Due</dt>
                <dd>
                  {permit.renewalDueDate} · {formatDueLabel(permit.renewalDueDate)}
                </dd>
              </div>
              <div>
                <dt>Issuing Agency</dt>
                <dd>{permit.issuingAgency}</dd>
              </div>
            </dl>
          </article>

          <article className="fleet-compliance-kv-card">
            <h3>Ownership</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>Owner</dt>
                <dd>{permit.owner}</dd>
              </div>
              <div>
                <dt>Record ID</dt>
                <dd>{permit.recordId}</dd>
              </div>
            </dl>
          </article>
        </div>

        <InlineNoteEditor
          storageKey={`fleet-compliance:permit:note:${permit.recordId}`}
          initialNote={permit.note}
          label="Note"
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
            <p>No suspense items are currently tied to this permit record.</p>
          )}
        </div>
      </section>
    </main>
  );
}

