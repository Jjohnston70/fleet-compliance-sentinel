import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadChiefData, findSuspenseItem, formatDueLabel, getSuspenseRelatedRecord } from '@/lib/chief-data';
import SuspenseResolveButton from '@/components/chief/SuspenseResolveButton';
import InlineNoteEditor from '@/components/chief/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ suspenseItemId: string }>;

export default async function ChiefSuspenseDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const data = await loadChiefData();

  const { suspenseItemId } = await params;
  const item = findSuspenseItem(data.suspense, suspenseItemId);
  if (!item) {
    notFound();
  }

  const related = getSuspenseRelatedRecord(item, data);
  const relatedHref =
    item.sourceType === 'employee_compliance'
      ? `/chief/compliance/drivers/${encodeURIComponent(item.sourceId)}`
      : item.sourceType === 'permit_license_records'
        ? `/chief/compliance/permits/${encodeURIComponent(item.sourceId)}`
        : item.sourceType === 'assets'
          ? `/chief/assets/${encodeURIComponent(item.sourceId)}`
          : '';

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/suspense">Suspense</Link>
          <span>/</span>
          <span>{item.suspenseItemId}</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">{item.alertState}</p>
            <h1>{item.title}</h1>
          </div>
          <Link href="/chief/suspense" className="btn-secondary">
            Back to Suspense
          </Link>
        </div>

        <div className="chief-kv-grid">
          <article className="chief-kv-card">
            <h3>Alert timing</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Due Date</dt>
                <dd>
                  {item.dueDate} · {formatDueLabel(item.dueDate)}
                </dd>
              </div>
              <div>
                <dt>Severity</dt>
                <dd>{item.severity}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{item.status}</dd>
              </div>
              <div>
                <dt>Owner Email</dt>
                <dd>{item.ownerEmail}</dd>
              </div>
            </dl>
          </article>

          <article className="chief-kv-card">
            <h3>Source linkage</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Source Type</dt>
                <dd>{item.sourceType}</dd>
              </div>
              <div>
                <dt>Source ID</dt>
                <dd>{item.sourceId}</dd>
              </div>
              <div>
                <dt>Record Link</dt>
                <dd>
                  {relatedHref ? (
                    <Link href={relatedHref} className="chief-inline-link">
                      Open linked record
                    </Link>
                  ) : (
                    'No linked route yet'
                  )}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        <SuspenseResolveButton
          suspenseItemId={item.suspenseItemId}
          initialStatus={item.status}
        />

        <InlineNoteEditor
          storageKey={`chief:suspense:note:${item.suspenseItemId}`}
          initialNote={item.title}
          label="Resolution notes"
        />

        <div className="chief-list-card">
          <h3>Source record preview</h3>
          {related ? <pre className="chief-code-block">{JSON.stringify(related, null, 2)}</pre> : <p>No related record preview is available yet.</p>}
        </div>
      </section>
    </main>
  );
}
