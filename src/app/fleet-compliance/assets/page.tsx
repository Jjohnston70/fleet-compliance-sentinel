import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import {
  loadFleetComplianceData,
  filterAssets,
  formatDueLabel,
  getAssetStats,
} from '@/lib/fleet-compliance-data';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function FleetComplianceAssetsPage({ searchParams }: { searchParams: SearchParams }) {
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

  const resolved = await searchParams;
  const q = firstParam(resolved.q);
  const category = firstParam(resolved.category);
  const status = firstParam(resolved.status);
  const sort = firstParam(resolved.sort);
  const assets = filterAssets(data.assets, { q, category, status, sort });
  const stats = getAssetStats(data.assets);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/assets" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Assets</p>
            <h1>Imported asset register</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/fleet-compliance/assets/new" className="btn-primary">+ Add Asset</Link>
            <Link href="/api/fleet-compliance/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
            <Link href="/fleet-compliance" className="btn-secondary">
              Back to Fleet-Compliance
            </Link>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          This module now shows the imported asset snapshot from the workbook and mapped source layer, with search,
          filters, and per-asset detail views on the live records.
        </p>

        <form className="fleet-compliance-filter-bar" action="/fleet-compliance/assets">
          <div className="fleet-compliance-filter-grid">
            <label className="fleet-compliance-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Asset ID, unit, note, location" />
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Category</span>
              <select name="category" defaultValue={category || 'all'}>
                <option value="all">All categories</option>
                {data.assetCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Status</span>
              <select name="status" defaultValue={status || 'all'}>
                <option value="all">All statuses</option>
                {data.assetStatuses.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Sort</span>
              <select name="sort" defaultValue={sort || 'due_asc'}>
                <option value="due_asc">Due date ↑</option>
                <option value="due_desc">Due date ↓</option>
                <option value="name_asc">Name A–Z</option>
                <option value="category">Category</option>
                <option value="status">Status</option>
              </select>
            </label>
          </div>
          <div className="fleet-compliance-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/fleet-compliance/assets" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="fleet-compliance-stats fleet-compliance-stats-compact">
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Tracked Assets</p>
            <p className="fleet-compliance-stat-value">{stats.total}</p>
            <p className="fleet-compliance-stat-note">Imported snapshot total</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Filtered Results</p>
            <p className="fleet-compliance-stat-value">{assets.length}</p>
            <p className="fleet-compliance-stat-note">Current result set</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Due Soon</p>
            <p className="fleet-compliance-stat-value">{stats.dueSoon}</p>
            <p className="fleet-compliance-stat-note">Inside 30 days</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Tank Assets</p>
            <p className="fleet-compliance-stat-value">{stats.tanks}</p>
            <p className="fleet-compliance-stat-note">Storage records staged</p>
          </article>
        </div>

        {assets.length ? (
          <div className="fleet-compliance-table-wrap">
            <table className="fleet-compliance-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Location</th>
                  <th>Assigned</th>
                  <th>Next Due</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((asset) => (
                  <tr key={asset.assetId}>
                    <td>
                      <Link href={`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`} className="fleet-compliance-inline-link">
                        <strong>{asset.name}</strong>
                      </Link>
                      <div className="fleet-compliance-table-note">
                        {asset.assetId} · {asset.sourceRef}
                      </div>
                    </td>
                    <td>
                      <span className="fleet-compliance-chip">{asset.category}</span>
                    </td>
                    <td>
                      <span className={`fleet-compliance-pill fleet-compliance-pill-${asset.status.replace(/[^a-z0-9]+/g, '-')}`}>{asset.status}</span>
                    </td>
                    <td>{asset.location}</td>
                    <td>{asset.assignedTo}</td>
                    <td>
                      <strong>{asset.nextDueLabel}</strong>
                      <div className="fleet-compliance-table-note">
                        {asset.nextDueDate} · {formatDueLabel(asset.nextDueDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="fleet-compliance-empty-state">
            <h3>No assets matched the current filters.</h3>
            <p>Try clearing the search or widening the category and status filters.</p>
          </div>
        )}

        <div className="fleet-compliance-list-grid">
          {assets.slice(0, 8).map((asset) => (
            <article key={`${asset.assetId}-focus`} className="fleet-compliance-list-card">
              <p className="fleet-compliance-module-status">{asset.assetId}</p>
              <h3>
                <Link href={`/fleet-compliance/assets/${encodeURIComponent(asset.assetId)}`} className="fleet-compliance-inline-link">
                  {asset.name}
                </Link>
              </h3>
              <p>{asset.complianceFocus}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}

