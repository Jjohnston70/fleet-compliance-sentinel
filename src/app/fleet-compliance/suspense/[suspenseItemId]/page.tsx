import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadFleetComplianceData, findSuspenseItem, formatDueLabel, getSuspenseRelatedRecord } from '@/lib/fleet-compliance-data';
import SuspenseResolveButton from '@/components/fleet-compliance/SuspenseResolveButton';
import InlineNoteEditor from '@/components/fleet-compliance/InlineNoteEditor';

export const dynamic = 'force-dynamic';

type Params = Promise<{ suspenseItemId: string }>;

export default async function FleetComplianceSuspenseDetailPage({ params }: { params: Params }) {
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

  const { suspenseItemId } = await params;
  const item = findSuspenseItem(data.suspense, suspenseItemId);
  if (!item) {
    notFound();
  }

  const related = getSuspenseRelatedRecord(item, data);
  const relatedHref =
    item.sourceType === 'employee_compliance'
      ? `/fleet-compliance/compliance/drivers/${encodeURIComponent(item.sourceId)}`
      : item.sourceType === 'permit_license_records'
        ? `/fleet-compliance/compliance/permits/${encodeURIComponent(item.sourceId)}`
        : item.sourceType === 'assets'
          ? `/fleet-compliance/assets/${encodeURIComponent(item.sourceId)}`
          : '';

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/suspense">Suspense</Link>
          <span>/</span>
          <span>{item.suspenseItemId}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">{item.alertState}</p>
            <h1>{item.title}</h1>
          </div>
          <Link href="/fleet-compliance/suspense" className="btn-secondary">
            Back to Suspense
          </Link>
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Alert timing</h3>
            <dl className="fleet-compliance-kv-list">
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

          <article className="fleet-compliance-kv-card">
            <h3>Source linkage</h3>
            <dl className="fleet-compliance-kv-list">
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
                    <Link href={relatedHref} className="fleet-compliance-inline-link">
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
          storageKey={`fleet-compliance:suspense:note:${item.suspenseItemId}`}
          initialNote={item.title}
          label="Resolution notes"
        />

        <div className="fleet-compliance-list-card">
          <h3>Source record preview</h3>
          {related ? <pre className="fleet-compliance-code-block">{JSON.stringify(related, null, 2)}</pre> : <p>No related record preview is available yet.</p>}
        </div>
      </section>
    </main>
  );
}

