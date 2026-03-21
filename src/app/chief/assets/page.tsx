import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import ChiefErrorBoundary from '@/components/chief/ChiefErrorBoundary';
import {
  loadChiefData,
  filterAssets,
  formatDueLabel,
  getAssetStats,
} from '@/lib/chief-data';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function ChiefAssetsPage({ searchParams }: { searchParams: SearchParams }) {
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

  const resolved = await searchParams;
  const q = firstParam(resolved.q);
  const category = firstParam(resolved.category);
  const status = firstParam(resolved.status);
  const sort = firstParam(resolved.sort);
  const assets = filterAssets(data.assets, { q, category, status, sort });
  const stats = getAssetStats(data.assets);

  return (
    <ChiefErrorBoundary page="/chief/assets" userId={userId}>
      <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Assets</p>
            <h1>Imported asset register</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/chief/assets/new" className="btn-primary">+ Add Asset</Link>
            <Link href="/api/chief/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
            <Link href="/chief" className="btn-secondary">
              Back to Chief
            </Link>
          </div>
        </div>
        <p className="chief-subcopy">
          This module now shows the imported asset snapshot from the workbook and mapped source layer, with search,
          filters, and per-asset detail views on the live records.
        </p>

        <form className="chief-filter-bar" action="/chief/assets">
          <div className="chief-filter-grid">
            <label className="chief-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Asset ID, unit, note, location" />
            </label>
            <label className="chief-field-stack">
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
            <label className="chief-field-stack">
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
            <label className="chief-field-stack">
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
          <div className="chief-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/chief/assets" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="chief-stats chief-stats-compact">
          <article className="chief-stat-card">
            <p className="chief-stat-label">Tracked Assets</p>
            <p className="chief-stat-value">{stats.total}</p>
            <p className="chief-stat-note">Imported snapshot total</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Filtered Results</p>
            <p className="chief-stat-value">{assets.length}</p>
            <p className="chief-stat-note">Current result set</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Due Soon</p>
            <p className="chief-stat-value">{stats.dueSoon}</p>
            <p className="chief-stat-note">Inside 30 days</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Tank Assets</p>
            <p className="chief-stat-value">{stats.tanks}</p>
            <p className="chief-stat-note">Storage records staged</p>
          </article>
        </div>

        {assets.length ? (
          <div className="chief-table-wrap">
            <table className="chief-table">
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
                      <Link href={`/chief/assets/${encodeURIComponent(asset.assetId)}`} className="chief-inline-link">
                        <strong>{asset.name}</strong>
                      </Link>
                      <div className="chief-table-note">
                        {asset.assetId} · {asset.sourceRef}
                      </div>
                    </td>
                    <td>
                      <span className="chief-chip">{asset.category}</span>
                    </td>
                    <td>
                      <span className={`chief-pill chief-pill-${asset.status.replace(/[^a-z0-9]+/g, '-')}`}>{asset.status}</span>
                    </td>
                    <td>{asset.location}</td>
                    <td>{asset.assignedTo}</td>
                    <td>
                      <strong>{asset.nextDueLabel}</strong>
                      <div className="chief-table-note">
                        {asset.nextDueDate} · {formatDueLabel(asset.nextDueDate)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="chief-empty-state">
            <h3>No assets matched the current filters.</h3>
            <p>Try clearing the search or widening the category and status filters.</p>
          </div>
        )}

        <div className="chief-list-grid">
          {assets.slice(0, 8).map((asset) => (
            <article key={`${asset.assetId}-focus`} className="chief-list-card">
              <p className="chief-module-status">{asset.assetId}</p>
              <h3>
                <Link href={`/chief/assets/${encodeURIComponent(asset.assetId)}`} className="chief-inline-link">
                  {asset.name}
                </Link>
              </h3>
              <p>{asset.complianceFocus}</p>
            </article>
          ))}
        </div>
      </section>
      </main>
    </ChiefErrorBoundary>
  );
}

