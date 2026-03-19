import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { findPermit, formatDueLabel, getPermitDocuments, getPermitSourceQuality, getPermitSuspense, loadChiefData } from '@/lib/chief-data';
import InlineNoteEditor from '@/components/chief/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ recordId: string }>;

export default async function ChiefPermitDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const data = await loadChiefData();

  const { recordId } = await params;
  const permit = findPermit(data.permits, recordId);
  if (!permit) {
    notFound();
  }

  const suspense = getPermitSuspense(data.suspense, permit.recordId);
  const documents = getPermitDocuments(permit.templateId);
  const quality = getPermitSourceQuality(permit);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/compliance">Compliance</Link>
          <span>/</span>
          <span>{permit.name}</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">
              {permit.templateId}
              <span className={`chief-quality-badge chief-quality-${quality}`}>
                {quality.charAt(0).toUpperCase() + quality.slice(1)}
              </span>
            </p>
            <h1>{permit.name}</h1>
          </div>
          <Link href="/chief/compliance" className="btn-secondary">
            Back to Compliance
          </Link>
        </div>

        <div className="chief-kv-grid">
          <article className="chief-kv-card">
            <h3>Renewal record</h3>
            <dl className="chief-kv-list">
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

          <article className="chief-kv-card">
            <h3>Ownership</h3>
            <dl className="chief-kv-list">
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
          storageKey={`chief:permit:note:${permit.recordId}`}
          initialNote={permit.note}
          label="Note"
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
            <p>No suspense items are currently tied to this permit record.</p>
          )}
        </div>
      </section>
    </main>
  );
}
