import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import ChiefErrorBoundary from '@/components/chief/ChiefErrorBoundary';
import {
  loadChiefData,
  filterSuspenseItems,
  formatDueLabel,
  getSuspenseStats,
} from '@/lib/chief-data';
import SuspenseCardStatus from '@/components/chief/SuspenseCardStatus';

export const dynamic = 'force-dynamic';

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function ChiefSuspensePage({ searchParams }: { searchParams: SearchParams }) {
  if (!isClerkEnabled()) {
    return null;
  }

  const { userId } = await auth();
  if (!userId) {
    redirect('/sign-in');
  }

  const data = await loadChiefData();

  const resolved = await searchParams;
  const q = firstParam(resolved.q);
  const severity = firstParam(resolved.severity);
  const alertState = firstParam(resolved.alertState);
  const status = firstParam(resolved.status);
  const sort = firstParam(resolved.sort);
  const items = filterSuspenseItems(data.suspense, { q, severity, alertState, status, sort });
  const stats = getSuspenseStats(data.suspense);

  return (
    <ChiefErrorBoundary page="/chief/suspense" userId={userId}>
      <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Suspense</p>
            <h1>Suspense and alerts queue</h1>
          </div>
          <div className="chief-action-row">
            <Link href="/chief/suspense/new" className="btn-primary">+ Add Item</Link>
            <Link href="/api/chief/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
            <Link href="/chief" className="btn-secondary">
              Back to Chief
            </Link>
          </div>
        </div>
        <p className="chief-subcopy">
          This route reflects suspense items generated from the imported source snapshot. Each item is tied to a source
          record, owner email, due date, and alert state so scheduled email delivery can be added cleanly.
        </p>

        <form className="chief-filter-bar" action="/chief/suspense">
          <div className="chief-filter-grid">
            <label className="chief-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Title, owner, source type" />
            </label>
            <label className="chief-field-stack">
              <span>Severity</span>
              <select name="severity" defaultValue={severity || 'all'}>
                <option value="all">All severity levels</option>
                {data.suspenseSeverities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="chief-field-stack">
              <span>Alert State</span>
              <select name="alertState" defaultValue={alertState || 'all'}>
                <option value="all">All alert states</option>
                {data.suspenseAlertStates.map((option) => (
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
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="chief-field-stack">
              <span>Sort</span>
              <select name="sort" defaultValue={sort || 'due_asc'}>
                <option value="due_asc">Due date ↑</option>
                <option value="due_desc">Due date ↓</option>
                <option value="severity">Severity</option>
                <option value="owner">Owner</option>
              </select>
            </label>
          </div>
          <div className="chief-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/chief/suspense" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="chief-preset-row">
          <span className="chief-preset-label">Quick filters:</span>
          <Link href="/chief/suspense?alertState=overdue&status=open&sort=due_asc" className="chief-preset-link">
            Overdue
          </Link>
          <Link href="/chief/suspense?alertState=due-today&status=open&sort=due_asc" className="chief-preset-link">
            Due today
          </Link>
          <Link href="/chief/suspense?alertState=due-7d&status=open&sort=due_asc" className="chief-preset-link">
            Due this week
          </Link>
          <Link href="/chief/suspense?severity=high&status=open&sort=severity" className="chief-preset-link">
            High severity
          </Link>
          <Link href="/chief/suspense?status=open&sort=owner" className="chief-preset-link">
            By owner
          </Link>
        </div>

        <div className="chief-stats chief-stats-compact">
          <article className="chief-stat-card">
            <p className="chief-stat-label">Open Items</p>
            <p className="chief-stat-value">{stats.totalOpen}</p>
            <p className="chief-stat-note">Current queue total</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Filtered Results</p>
            <p className="chief-stat-value">{items.length}</p>
            <p className="chief-stat-note">Current result set</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">Next 7 Days</p>
            <p className="chief-stat-value">{stats.next7Days}</p>
            <p className="chief-stat-note">Immediate reminders</p>
          </article>
          <article className="chief-stat-card">
            <p className="chief-stat-label">High Severity</p>
            <p className="chief-stat-value">{stats.highSeverity}</p>
            <p className="chief-stat-note">Owner-level alerts</p>
          </article>
        </div>

        {items.length ? (
          <div className="chief-suspense-list">
            {items.map((item) => (
              <article key={item.suspenseItemId} className="chief-suspense-card">
                <div>
                  <p className="chief-suspense-state">{item.alertState}</p>
                  <h3>
                    <Link href={`/chief/suspense/${encodeURIComponent(item.suspenseItemId)}`} className="chief-inline-link">
                      {item.title}
                    </Link>
                    <SuspenseCardStatus suspenseItemId={item.suspenseItemId} />
                  </h3>
                  <p className="chief-table-note">
                    {item.sourceType} · {item.severity} severity · {item.status}
                  </p>
                </div>
                <div className="chief-suspense-meta">
                  <span>Due {item.dueDate}</span>
                  <span>{formatDueLabel(item.dueDate)}</span>
                  <span>{item.ownerEmail}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="chief-empty-state">
            <h3>No suspense items matched the current filters.</h3>
            <p>Try widening the severity or alert-state filter.</p>
          </div>
        )}
      </section>
      </main>
    </ChiefErrorBoundary>
  );
}
