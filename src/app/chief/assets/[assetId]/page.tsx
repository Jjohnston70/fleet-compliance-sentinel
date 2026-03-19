import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import InlineNoteEditor from '@/components/chief/InlineNoteEditor';
import AssetStatusOverride from '@/components/chief/AssetStatusOverride';
import {
  loadChiefData,
  findAsset,
  formatDueLabel,
  getAssetActivity,
  getAssetDocuments,
  getAssetMaintenance,
  getAssetSourceQuality,
  getAssetSuspense,
} from '@/lib/chief-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ assetId: string }>;

const qualityLabel: Record<string, string> = {
  complete: 'Complete',
  partial: 'Partial',
  minimal: 'Minimal',
};

export default async function ChiefAssetDetailPage({ params }: { params: Params }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const { assetId } = await params;
  const data = await loadChiefData();
  const asset = findAsset(data.assets, assetId);
  if (!asset) {
    notFound();
  }

  const activity = getAssetActivity(data.activityLogs, asset.assetId);
  const maintenance = getAssetMaintenance(data.maintenanceEvents, asset.assetId);
  const suspense = getAssetSuspense(data.suspense, asset.assetId);
  const documents = getAssetDocuments(asset.category);
  const quality = getAssetSourceQuality(asset);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-breadcrumbs">
          <Link href="/chief">Chief</Link>
          <span>/</span>
          <Link href="/chief/assets">Assets</Link>
          <span>/</span>
          <span>{asset.assetId}</span>
        </div>

        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">
              {asset.assetId}
              <span className={`chief-quality-badge chief-quality-${quality}`}>{qualityLabel[quality]}</span>
            </p>
            <h1>{asset.name}</h1>
          </div>
          <Link href="/chief/assets" className="btn-secondary">
            Back to Assets
          </Link>
        </div>

        <div className="chief-kv-grid">
          <article className="chief-kv-card">
            <h3>Profile</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Category</dt>
                <dd>{asset.category}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <AssetStatusOverride
                  assetId={asset.assetId}
                  initialStatus={asset.status}
                  statuses={data.assetStatuses}
                />
              </div>
              <div>
                <dt>Assigned To</dt>
                <dd>{asset.assignedTo}</dd>
              </div>
              <div>
                <dt>Location</dt>
                <dd>{asset.location}</dd>
              </div>
            </dl>
          </article>

          <article className="chief-kv-card">
            <h3>Compliance</h3>
            <dl className="chief-kv-list">
              <div>
                <dt>Next Due</dt>
                <dd>
                  {asset.nextDueDate} · {formatDueLabel(asset.nextDueDate)}
                </dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>{asset.complianceFocus}</dd>
              </div>
              <div>
                <dt>Purchase Date</dt>
                <dd>{asset.purchaseDate || 'Not populated'}</dd>
              </div>
              <div>
                <dt>Purchase Price</dt>
                <dd>{asset.purchasePrice || 'Not populated'}</dd>
              </div>
            </dl>
          </article>
        </div>

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

        <div className="chief-list-grid">
          <InlineNoteEditor
            storageKey={`chief:asset:note:${asset.assetId}`}
            initialNote={asset.note}
            label="Note"
          />
          <article className="chief-list-card">
            <h3>Open suspense</h3>
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
              <p>No generated suspense items currently point to this asset.</p>
            )}
          </article>
        </div>

        <div className="chief-list-grid">
          <article className="chief-list-card">
            <h3>Recent activity</h3>
            {activity.length ? (
              <ul>
                {activity.map((row) => (
                  <li key={row.activityId}>
                    <Link href={`/chief/activity/${encodeURIComponent(row.activityId)}`} className="chief-inline-link">
                      {row.timestamp} · {row.actionType}
                    </Link>
                    {' '}· {row.employeeName}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No activity rows are mapped to this asset yet.</p>
            )}
          </article>
          <article className="chief-list-card">
            <h3>Maintenance history</h3>
            {maintenance.length ? (
              <ul>
                {maintenance.map((row) => (
                  <li key={row.maintenanceEventId}>
                    <Link href={`/chief/maintenance/${encodeURIComponent(row.maintenanceEventId)}`} className="chief-inline-link">
                      {row.completedDate || 'Scheduled'} · {row.serviceType}
                    </Link>
                    {' '}· {row.status}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No maintenance events are mapped to this asset yet.</p>
            )}
          </article>
        </div>
      </section>
    </main>
  );
}
