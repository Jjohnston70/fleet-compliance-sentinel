import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { loadFleetComplianceData, findMaintenanceEvent, findAsset, formatDueLabel } from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ eventId: string }>;

export default async function FleetComplianceMaintenanceEventPage({ params }: { params: Params }) {
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

  const { eventId } = await params;
  const event = findMaintenanceEvent(data.maintenanceEvents, decodeURIComponent(eventId));
  if (!event) {
    notFound();
  }

  const asset = findAsset(data.assets, event.assetId);

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
          <span>Maintenance</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">{event.maintenanceEventId}</p>
            <h1>{event.serviceType}</h1>
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
                <dt>Service Type</dt>
                <dd>{event.serviceType}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{event.status}</dd>
              </div>
              <div>
                <dt>Completed Date</dt>
                <dd>{event.completedDate || 'Not yet completed'}</dd>
              </div>
              <div>
                <dt>Vendor</dt>
                <dd>{event.vendor || 'Not recorded'}</dd>
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
                    event.assetId
                  )}
                </dd>
              </div>
              <div>
                <dt>Asset Name</dt>
                <dd>{asset?.name || event.assetId}</dd>
              </div>
              <div>
                <dt>Category</dt>
                <dd>{asset?.category || '—'}</dd>
              </div>
              <div>
                <dt>Asset Next Due</dt>
                <dd>
                  {asset ? `${asset.nextDueDate} · ${formatDueLabel(asset.nextDueDate)}` : '—'}
                </dd>
              </div>
            </dl>
          </article>
        </div>

        {event.notes && (
          <article className="fleet-compliance-list-card">
            <h3>Notes</h3>
            <p>{event.notes}</p>
          </article>
        )}
      </section>
    </main>
  );
}

