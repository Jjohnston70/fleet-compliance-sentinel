import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import {
  loadFleetComplianceData,
  filterSuspenseItems,
  formatDueLabel,
  getSuspenseStats,
} from '@/lib/fleet-compliance-data';
import SuspenseCardStatus from '@/components/fleet-compliance/SuspenseCardStatus';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Suspense',
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] || '' : value || '';
}

export default async function FleetComplianceSuspensePage({ searchParams }: { searchParams: SearchParams }) {
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
  const severity = firstParam(resolved.severity);
  const alertState = firstParam(resolved.alertState);
  const status = firstParam(resolved.status);
  const sort = firstParam(resolved.sort);
  const items = filterSuspenseItems(data.suspense, { q, severity, alertState, status, sort });
  const stats = getSuspenseStats(data.suspense);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/suspense" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Suspense</p>
            <h1>Suspense and alerts queue</h1>
          </div>
          <div className="fleet-compliance-action-row">
            <Link href="/fleet-compliance/suspense/new" className="btn-primary">+ Add Item</Link>
            <Link href="/api/fleet-compliance/bulk-template" className="btn-secondary">
              Download Bulk Template
            </Link>
          </div>
          <div className="fleet-compliance-breadcrumbs">
            <Link href="/fleet-compliance">Fleet-Compliance</Link>
            <span>/</span>
            <span>Suspense</span>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          This route reflects suspense items generated from the imported source snapshot. Each item is tied to a source
          record, owner email, due date, and alert state so scheduled email delivery can be added cleanly.
        </p>

        <form className="fleet-compliance-filter-bar" action="/fleet-compliance/suspense">
          <div className="fleet-compliance-filter-grid">
            <label className="fleet-compliance-field-stack">
              <span>Search</span>
              <input type="search" name="q" defaultValue={q} placeholder="Title, owner, source type" />
            </label>
            <label className="fleet-compliance-field-stack">
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
            <label className="fleet-compliance-field-stack">
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
            <label className="fleet-compliance-field-stack">
              <span>Status</span>
              <select name="status" defaultValue={status || 'all'}>
                <option value="all">All statuses</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <label className="fleet-compliance-field-stack">
              <span>Sort</span>
              <select name="sort" defaultValue={sort || 'due_asc'}>
                <option value="due_asc">Due date ↑</option>
                <option value="due_desc">Due date ↓</option>
                <option value="severity">Severity</option>
                <option value="owner">Owner</option>
              </select>
            </label>
          </div>
          <div className="fleet-compliance-action-row">
            <button type="submit" className="btn-primary">
              Apply Filters
            </button>
            <Link href="/fleet-compliance/suspense" className="btn-secondary">
              Reset
            </Link>
          </div>
        </form>

        <div className="fleet-compliance-preset-row">
          <span className="fleet-compliance-preset-label">Quick filters:</span>
          <Link href="/fleet-compliance/suspense?alertState=overdue&status=open&sort=due_asc" className="fleet-compliance-preset-link">
            Overdue
          </Link>
          <Link href="/fleet-compliance/suspense?alertState=due-today&status=open&sort=due_asc" className="fleet-compliance-preset-link">
            Due today
          </Link>
          <Link href="/fleet-compliance/suspense?alertState=due-7d&status=open&sort=due_asc" className="fleet-compliance-preset-link">
            Due this week
          </Link>
          <Link href="/fleet-compliance/suspense?severity=high&status=open&sort=severity" className="fleet-compliance-preset-link">
            High severity
          </Link>
          <Link href="/fleet-compliance/suspense?status=open&sort=owner" className="fleet-compliance-preset-link">
            By owner
          </Link>
        </div>

        <div className="fleet-compliance-stats fleet-compliance-stats-compact">
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Open Items</p>
            <p className="fleet-compliance-stat-value">{stats.totalOpen}</p>
            <p className="fleet-compliance-stat-note">Current queue total</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Filtered Results</p>
            <p className="fleet-compliance-stat-value">{items.length}</p>
            <p className="fleet-compliance-stat-note">Current result set</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">Next 7 Days</p>
            <p className="fleet-compliance-stat-value">{stats.next7Days}</p>
            <p className="fleet-compliance-stat-note">Immediate reminders</p>
          </article>
          <article className="fleet-compliance-stat-card">
            <p className="fleet-compliance-stat-label">High Severity</p>
            <p className="fleet-compliance-stat-value">{stats.highSeverity}</p>
            <p className="fleet-compliance-stat-note">Owner-level alerts</p>
          </article>
        </div>

        {items.length ? (
          <div className="fleet-compliance-suspense-list">
            {items.map((item) => (
              <article key={item.suspenseItemId} className="fleet-compliance-suspense-card">
                <div>
                  <p className="fleet-compliance-suspense-state">{item.alertState}</p>
                  <h3>
                    <Link href={`/fleet-compliance/suspense/${encodeURIComponent(item.suspenseItemId)}`} className="fleet-compliance-inline-link">
                      {item.title}
                    </Link>
                    <SuspenseCardStatus suspenseItemId={item.suspenseItemId} />
                  </h3>
                  <p className="fleet-compliance-table-note">
                    {item.sourceType} · {item.severity} severity · {item.status}
                  </p>
                </div>
                <div className="fleet-compliance-suspense-meta">
                  <span>Due {item.dueDate}</span>
                  <span>{formatDueLabel(item.dueDate)}</span>
                  <span>{item.ownerEmail}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="fleet-compliance-empty-state">
            <h3>No suspense items matched the current filters.</h3>
            <p>Try widening the severity or alert-state filter.</p>
          </div>
        )}
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
