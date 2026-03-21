import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadChiefData, findActivityLog, findAsset } from '@/lib/chief-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ activityId: string }>;

export default async function ChiefActivityLogPage({ params }: { params: Params }) {
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

  const data = await loadChiefData(orgId);

  const { activityId } = await params;
  const log = findActivityLog(data.activityLogs, decodeURIComponent(activityId));
  if (!log) {
    notFound();
  }

  const asset = findAsset(data.assets, log.assetId);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/assets">Assets</Link>
          {asset && (
            <>
              <span>/</span>
              <Link href={`/chief/assets/${encodeURIComponent(asset.assetId)}`}>{asset.name}</Link>
            </>
          )}
          <span>/</span>
          <span>Activity</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">{log.timestamp}</p>
            <h1>{log.actionType}</h1>
          </div>
          {asset ? (
            <Link href={`/chief/assets/${encodeURIComponent(asset.assetId)}`} className="btn-secondary">
              Back to {asset.name}
            </Link>
          ) : (
            <Link href="/chief/assets" className="btn-secondary">
              Back to Assets
            </Link>
          )}
        </div>

        <div className="chief-kv-grid">
          <article className="chief-kv-card">
            <h3>Event details</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Action</dt>
                <dd>{log.actionType}</dd>
              </div>
              <div>
                <dt>Timestamp</dt>
                <dd>{log.timestamp}</dd>
              </div>
              <div>
                <dt>Employee</dt>
                <dd>{log.employeeName}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{log.location}</dd>
              </div>
            </dl>
          </article>

          <article className="chief-kv-card">
            <h3>Asset linkage</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Asset ID</dt>
                <dd>
                  {asset ? (
                    <Link href={`/chief/assets/${encodeURIComponent(asset.assetId)}`} className="chief-inline-link">
                      {asset.assetId}
                    </Link>
                  ) : (
                    log.assetId
                  )}
                </dd>
              </div>
              <div>
                <dt>Asset Name</dt>
                <dd>{asset?.name || log.assetId}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{asset?.category || '—'}</dd>
              </div>
              <div>
                <dt>Assigned To</dt>
                <dd>{asset?.assignedTo || '—'}</dd>
              </div>
            </dl>
          </article>
        </div>

        {log.notes && (
          <article className="chief-list-card">
            <h3>Notes</h3>
            <p>{log.notes}</p>
          </article>
        )}
      </section>
    </main>
  );
}

