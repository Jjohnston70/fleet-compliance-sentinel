import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { notFound, redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import InlineNoteEditor from '@/components/fleet-compliance/InlineNoteEditor';
import AssetStatusOverride from '@/components/fleet-compliance/AssetStatusOverride';
import {
  loadFleetComplianceData,
  findAsset,
  formatDueLabel,
  getAssetActivity,
  getAssetDocuments,
  getAssetMaintenance,
  getAssetSourceQuality,
  getAssetSuspense,
} from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';

type Params = Promise<{ assetId: string }>;

const qualityLabel: Record<string, string> = {
  complete: 'Complete',
  partial: 'Partial',
  minimal: 'Minimal',
};

export default async function FleetComplianceAssetDetailPage({ params }: { params: Params }) {
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

  const { assetId } = await params;
  const data = await loadFleetComplianceData(orgId);
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
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/assets">Assets</Link>
          <span>/</span>
          <span>{asset.assetId}</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">
              {asset.assetId}
              <span className={`fleet-compliance-quality-badge fleet-compliance-quality-${quality}`}>{qualityLabel[quality]}</span>
            </p>
            <h1>{asset.name}</h1>
          </div>
          <Link href="/fleet-compliance/assets" className="btn-secondary">
            Back to Assets
          </Link>
        </div>

        <div className="fleet-compliance-kv-grid">
          <article className="fleet-compliance-kv-card">
            <h3>Profile</h3>
            <dl className="fleet-compliance-kv-list">
              <div>
                <dt>Category</dt>
                <dd>{asset.category}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <AssetStatusOverride
                  assetId={asset.assetId}
                  initialStatus={asset.status}
                  statuses={['Active', 'In Shop Reactive', 'In Shop Scheduled', 'Out of Service', 'Other']}
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

          <article className="fleet-compliance-kv-card">
            <h3>Compliance</h3>
            <dl className="fleet-compliance-kv-list">
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

        <div className="fleet-compliance-list-grid">
          <InlineNoteEditor
            storageKey={`fleet-compliance:asset:note:${asset.assetId}`}
            initialNote={asset.note}
            label="Note"
          />
          <article className="fleet-compliance-list-card">
            <h3>Open suspense</h3>
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
              <p>No generated suspense items currently point to this asset.</p>
            )}
          </article>
        </div>

        <div className="fleet-compliance-list-grid">
          <article className="fleet-compliance-list-card">
            <h3>Recent activity</h3>
            {activity.length ? (
              <ul>
                {activity.map((row) => (
                  <li key={row.activityId}>
                    <Link href={`/fleet-compliance/activity/${encodeURIComponent(row.activityId)}`} className="fleet-compliance-inline-link">
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
          <article className="fleet-compliance-list-card">
            <h3>Maintenance history</h3>
            {maintenance.length ? (
              <ul>
                {maintenance.map((row) => (
                  <li key={row.maintenanceEventId}>
                    <Link href={`/fleet-compliance/maintenance/${encodeURIComponent(row.maintenanceEventId)}`} className="fleet-compliance-inline-link">
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

