import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { isClerkEnabled } from '@/lib/clerk';
import FleetComplianceErrorBoundary from '@/components/fleet-compliance/FleetComplianceErrorBoundary';
import { previewFleetComplianceAlerts } from '@/lib/fleet-compliance-alert-engine';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import AlertsRunPanel from '@/components/fleet-compliance/AlertsRunPanel';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Alerts',
};

const WINDOW_LABELS: Record<string, string> = {
  overdue: 'Overdue',
  'due-today': 'Due Today',
  '7d': 'Due within 7 days',
  '14d': 'Due within 14 days',
  '30d': 'Due within 30 days',
};

export default async function FleetComplianceAlertsPage() {
  if (!isClerkEnabled()) return null;

  const { userId, orgId } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const data = await loadFleetComplianceData(orgId);
  const { alertItems, byOwner, byWindow } = previewFleetComplianceAlerts(data.suspense);
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const cronConfigured = Boolean(process.env.FLEET_COMPLIANCE_CRON_SECRET);

  return (
    <FleetComplianceErrorBoundary page="/fleet-compliance/alerts" userId={userId}>
      <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Alerts</p>
            <h1>Suspense email alerts</h1>
            <div className="fleet-compliance-breadcrumbs">
              <Link href="/fleet-compliance">Fleet-Compliance</Link>
              <span>/</span>
              <span>Alerts</span>
            </div>
          </div>
        </div>
        <p className="fleet-compliance-subcopy">
          The alert engine sweeps all open suspense items, groups them by owner, and sends
          per-owner compliance reminder emails via Resend. The manager summary email always
          receives the full list. Vercel Cron triggers daily at 08:00 UTC.
        </p>

        {/* Delivery status */}
        <div className="fleet-compliance-list-card" style={{ marginTop: '1.5rem' }}>
          <h3>Delivery Status</h3>
          <dl className="fleet-compliance-kv-list">
            <div>
              <dt>Email delivery</dt>
              <dd>
                {resendConfigured
                  ? <span className="fleet-compliance-pill fleet-compliance-pill-active">Configured</span>
                  : <span className="fleet-compliance-pill">Not configured — dry run available</span>}
              </dd>
            </div>
            <div>
              <dt>Daily scheduler</dt>
              <dd>
                {cronConfigured
                  ? <span className="fleet-compliance-pill fleet-compliance-pill-active">Set</span>
                  : <span className="fleet-compliance-pill">Missing secure scheduler token</span>}
              </dd>
            </div>
            <div>
              <dt>From address</dt>
              <dd className="fleet-compliance-table-note">
                {process.env.FLEET_COMPLIANCE_ALERT_FROM_EMAIL || 'compliance@fleetcompliance.com (default)'}
              </dd>
            </div>
            <div>
              <dt>Cron schedule</dt>
              <dd className="fleet-compliance-table-note">Daily 08:00 UTC — /api/fleet-compliance/alerts/run</dd>
            </div>
          </dl>
        </div>

        {/* Window summary */}
        <div className="fleet-compliance-stats fleet-compliance-stats-compact" style={{ marginTop: '1.5rem' }}>
          {Object.entries(byWindow).map(([window, count]) => (
            <article key={window} className="fleet-compliance-stat-card">
              <p className="fleet-compliance-stat-label">{WINDOW_LABELS[window] ?? window}</p>
              <p className="fleet-compliance-stat-value">{count}</p>
            </article>
          ))}
        </div>

        {/* Run panel */}
        <AlertsRunPanel resendConfigured={resendConfigured} />

        {/* Preview: by owner */}
        {alertItems.length > 0 ? (
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ marginBottom: '1rem' }}>What would be sent</h2>
            {Object.entries(byOwner).map(([email, items]) => (
              <div key={email} className="fleet-compliance-list-card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{email}</h3>
                <p className="fleet-compliance-table-note" style={{ marginBottom: '0.75rem' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Severity</th>
                        <th>Window</th>
                        <th>Due</th>
                        <th>Source</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item) => (
                        <tr key={item.suspenseItemId}>
                          <td>
                            <Link
                              href={`/fleet-compliance/suspense/${encodeURIComponent(item.suspenseItemId)}`}
                              className="fleet-compliance-inline-link"
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{item.severity}</td>
                          <td style={{ color: item.window === 'overdue' ? '#dc2626' : item.window === 'due-today' ? '#d97706' : undefined }}>
                            {WINDOW_LABELS[item.window] ?? item.window}
                          </td>
                          <td className="fleet-compliance-table-note">{item.dueDate}</td>
                          <td className="fleet-compliance-table-note">{item.sourceType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fleet-compliance-empty-state" style={{ marginTop: '2rem' }}>
            <h3>No items in alert windows</h3>
            <p>All open suspense items fall outside the 30-day alert window.</p>
          </div>
        )}
      </section>
      </main>
    </FleetComplianceErrorBoundary>
  );
}
