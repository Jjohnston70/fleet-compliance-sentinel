import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { previewChiefAlerts } from '@/lib/chief-alert-engine';
import AlertsRunPanel from '@/components/chief/AlertsRunPanel';

export const dynamic = 'force-dynamic';

const WINDOW_LABELS: Record<string, string> = {
  overdue: 'Overdue',
  'due-today': 'Due Today',
  '7d': 'Due within 7 days',
  '14d': 'Due within 14 days',
  '30d': 'Due within 30 days',
};

export default async function ChiefAlertsPage() {
  if (!isClerkEnabled()) return null;

  const { userId } = await auth();
  if (!userId) redirect('/sign-in');

  const { alertItems, byOwner, byWindow } = previewChiefAlerts();
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const cronConfigured = Boolean(process.env.CHIEF_CRON_SECRET);

  return (
    <main className="chief-shell">
      <section className="chief-section">
        <div className="chief-section-head">
          <div>
            <p className="chief-eyebrow">Alerts</p>
            <h1>Suspense email alerts</h1>
          </div>
          <Link href="/chief" className="btn-secondary">Back to Chief</Link>
        </div>
        <p className="chief-subcopy">
          The alert engine sweeps all open suspense items, groups them by owner, and sends
          per-owner compliance reminder emails via Resend. The manager summary email always
          receives the full list. Vercel Cron triggers daily at 08:00 UTC.
        </p>

        {/* Config status */}
        <div className="chief-list-card" style={{ marginTop: '1.5rem' }}>
          <h3>Configuration</h3>
          <dl className="chief-kv-list">
            <div>
              <dt>RESEND_API_KEY</dt>
              <dd>
                {resendConfigured
                  ? <span className="chief-pill chief-pill-active">Configured</span>
                  : <span className="chief-pill">Not set — dry-run only</span>}
              </dd>
            </div>
            <div>
              <dt>CHIEF_CRON_SECRET</dt>
              <dd>
                {cronConfigured
                  ? <span className="chief-pill chief-pill-active">Set</span>
                  : <span className="chief-pill">Not set — cron endpoint is open</span>}
              </dd>
            </div>
            <div>
              <dt>CHIEF_ALERT_FROM_EMAIL</dt>
              <dd className="chief-table-note">
                {process.env.CHIEF_ALERT_FROM_EMAIL || 'compliance@examplefleetco.com (default)'}
              </dd>
            </div>
            <div>
              <dt>Cron schedule</dt>
              <dd className="chief-table-note">Daily 08:00 UTC — /api/chief/alerts/run</dd>
            </div>
          </dl>
        </div>

        {/* Window summary */}
        <div className="chief-stats chief-stats-compact" style={{ marginTop: '1.5rem' }}>
          {Object.entries(byWindow).map(([window, count]) => (
            <article key={window} className="chief-stat-card">
              <p className="chief-stat-label">{WINDOW_LABELS[window] ?? window}</p>
              <p className="chief-stat-value">{count}</p>
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
              <div key={email} className="chief-list-card" style={{ marginBottom: '1rem' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>{email}</h3>
                <p className="chief-table-note" style={{ marginBottom: '0.75rem' }}>
                  {items.length} item{items.length !== 1 ? 's' : ''}
                </p>
                <div className="chief-table-wrap">
                  <table className="chief-table">
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
                              href={`/chief/suspense/${encodeURIComponent(item.suspenseItemId)}`}
                              className="chief-inline-link"
                            >
                              {item.title}
                            </Link>
                          </td>
                          <td style={{ textTransform: 'capitalize' }}>{item.severity}</td>
                          <td style={{ color: item.window === 'overdue' ? '#dc2626' : item.window === 'due-today' ? '#d97706' : undefined }}>
                            {WINDOW_LABELS[item.window] ?? item.window}
                          </td>
                          <td className="chief-table-note">{item.dueDate}</td>
                          <td className="chief-table-note">{item.sourceType}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="chief-empty-state" style={{ marginTop: '2rem' }}>
            <h3>No items in alert windows</h3>
            <p>All open suspense items fall outside the 30-day alert window.</p>
          </div>
        )}
      </section>
    </main>
  );
}
