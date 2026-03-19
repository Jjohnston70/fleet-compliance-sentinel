import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { findChiefMaintenanceEvent, findChiefAsset, formatDueLabel } from '@/lib/chief-demo-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ eventId: string }>;

export default async function ChiefMaintenanceEventPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { eventId } = await params;
  const event = findChiefMaintenanceEvent(decodeURIComponent(eventId));
  if (!event) {
    notFound();
  }

  const asset = findChiefAsset(event.assetId);

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
          <span>Maintenance</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">{event.maintenanceEventId}</p>
            <h1>{event.serviceType}</h1>
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
          <article className="chief-list-card">
            <h3>Notes</h3>
            <p>{event.notes}</p>
          </article>
        )}
      </section>
    </main>
  );
}
