import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadFleetComplianceData, findActivityLog, findAsset } from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ activityId: string }>;

export default async function FleetComplianceActivityLogPage({ params }: { params: Params }) {
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

  const { activityId } = await params;
  const log = findActivityLog(data.activityLogs, decodeURIComponent(activityId));
  if (!log) {
    notFound();
  }

  const asset = findAsset(data.assets, log.assetId);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/assets">Assets</Link>
          {asset && (
            <>
              <span>/</span>
              <Link href={`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`}>{asset.name}</Link>
            </>
          )}
          <span>/</span>
          <span>Activity</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">{log.timestamp}</p>
            <h1>{log.actionType}</h1>
          </div>
          {asset ? (
            <Link href={`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`} className="btn-secondary">
              Back to {asset.name}
            </Link>
          ) : (
            <Link href="/fleet-compliance/assets" className="btn-secondary">
              Back to Assets
            </Link>
          )}
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Event details</h3>
            <dl className="fleet-compliance-kv-list">
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

          <article className="fleet-compliance-kv-card">
            <h3>Asset linkage</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>Asset ID</dt>
                <dd>
                  {asset ? (
                    <Link href={`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`} className="fleet-compliance-inline-link">
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
          <article className="fleet-compliance-list-card">
            <h3>Notes</h3>
            <p>{log.notes}</p>
          </article>
        )}
      </section>
    </main>
  );
}

