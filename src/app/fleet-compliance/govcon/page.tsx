'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';

type OpportunityStatus =
  | 'identified'
  | 'evaluating'
  | 'bid'
  | 'no_bid'
  | 'submitted'
  | 'awarded'
  | 'lost';

interface OpportunityRow {
  id: string;
  title: string;
  solicitation_number: string;
  agency: string;
  set_aside_type: string;
  estimated_value: number | null;
  status: OpportunityStatus;
  response_deadline: string | null;
}

interface AlertRow {
  name?: string;
  title?: string;
  severity: string;
  daysRemaining: number;
  expirationDate?: string | null;
  deadline?: string | null;
}

interface DashboardPayload {
  ok: boolean;
  dashboard?: {
    activeOpportunities: number;
    pipelineValue: number;
    estimatedWinRate: number;
    upcomingDeadlines: OpportunityRow[];
  };
  opportunities?: OpportunityRow[];
  complianceAlerts?: AlertRow[];
  deadlineAlerts?: AlertRow[];
  winLoss?: {
    winRate: number;
  };
  error?: string;
}

interface FederalIntelSyncResponse {
  ok: boolean;
  imported?: number;
  skippedDuplicates?: number;
  skippedMissingNoticeId?: number;
  importErrors?: string[];
  remoteCounts?: {
    sam?: number;
    usaspending?: number;
    grants?: number;
    sbir?: number;
    subawards?: number;
  };
  error?: string;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const statusColors: Record<OpportunityStatus, string> = {
  identified: '#6b7280',
  evaluating: '#2563eb',
  bid: '#16a34a',
  no_bid: '#dc2626',
  submitted: '#ca8a04',
  awarded: '#0f766e',
  lost: '#ea580c',
};

const alertColors: Record<string, string> = {
  critical: '#dc2626',
  warning: '#ca8a04',
  upcoming: '#2563eb',
  oneDay: '#dc2626',
  threeDay: '#ea580c',
  week: '#2563eb',
};

function formatCurrency(value: number | null): string {
  if (value == null || !Number.isFinite(value)) return '--';
  return currencyFormatter.format(value);
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-US');
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0.0%';
  return `${(value * 100).toFixed(1)}%`;
}

function getAlertColor(severity: string): string {
  return alertColors[severity] || '#6b7280';
}

export default function GovConDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payload, setPayload] = useState<DashboardPayload | null>(null);
  const [runningFederalIntelSync, setRunningFederalIntelSync] = useState(false);
  const [federalIntelMessage, setFederalIntelMessage] = useState('');

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon', { cache: 'no-store' });
      const data = (await response.json().catch(() => ({}))) as DashboardPayload;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to load GovCon dashboard');
      }
      setPayload(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load GovCon dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleRunFederalIntelSync() {
    setRunningFederalIntelSync(true);
    setError('');
    setFederalIntelMessage('');

    try {
      const response = await fetch('/api/fleet-compliance/govcon/federal-intel/run-all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ months_back: 3 }),
      });

      const data = (await response.json().catch(() => ({}))) as FederalIntelSyncResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to run federal intelligence sync');
      }

      const imported = Number(data.imported ?? 0);
      const duplicates = Number(data.skippedDuplicates ?? 0);
      const missingIds = Number(data.skippedMissingNoticeId ?? 0);
      const remoteSamCount = Number(data.remoteCounts?.sam ?? 0);

      let message = `Federal sync complete. Imported ${imported} SAM opportunities`;
      message += `, skipped ${duplicates} duplicates`;
      if (missingIds > 0) {
        message += `, and skipped ${missingIds} records missing notice IDs`;
      }
      message += `.`;
      if (remoteSamCount > 0) {
        message += ` Source SAM count: ${remoteSamCount}.`;
      }
      if (Array.isArray(data.importErrors) && data.importErrors.length > 0) {
        message += ` ${data.importErrors.length} record(s) had import errors.`;
      }

      setFederalIntelMessage(message);
      await loadDashboard();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run federal intelligence sync');
    } finally {
      setRunningFederalIntelSync(false);
    }
  }

  const opportunities = useMemo(
    () => (Array.isArray(payload?.opportunities) ? payload?.opportunities : []),
    [payload?.opportunities],
  );

  const hasOpportunities = opportunities.length > 0;

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Intelligence</p>
            <h1>GovCon &amp; Compliance</h1>
            <p className="fleet-compliance-subcopy">
              Federal contracting pipeline, compliance tracking, and bid management.
            </p>
          </div>
          <Link href="/fleet-compliance/govcon/new" className="btn-primary">
            New Opportunity
          </Link>
        </div>

        {error ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading GovCon dashboard...</p>
        ) : (
          <>
            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Total Opportunities</p>
                <p className="fleet-compliance-stat-value">{opportunities.length}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Pipeline Value</p>
                <p className="fleet-compliance-stat-value">
                  {formatCurrency(payload?.dashboard?.pipelineValue ?? 0)}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Upcoming Deadlines (7d)</p>
                <p className="fleet-compliance-stat-value">
                  {Array.isArray(payload?.dashboard?.upcomingDeadlines)
                    ? payload.dashboard.upcomingDeadlines.length
                    : 0}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Win Rate</p>
                <p className="fleet-compliance-stat-value">
                  {formatPercent(payload?.winLoss?.winRate ?? payload?.dashboard?.estimatedWinRate ?? 0)}
                </p>
              </article>
            </div>

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>GovCon Workflow</h3>
              <ol style={{ margin: '0.7rem 0 0 1rem', padding: 0, display: 'grid', gap: '0.35rem', color: 'var(--text-secondary)' }}>
                <li>Capture or create the opportunity.</li>
                <li>Run bid/no-bid scoring from the opportunity detail page.</li>
                <li>Generate bid package outputs (DOCX/PDF/Markdown).</li>
                <li>Move status through bid, submitted, awarded/lost.</li>
                <li>Review alerts for deadlines and compliance renewals.</li>
              </ol>
            </article>

            <article className="fleet-compliance-list-card" style={{ marginTop: '1rem' }}>
              <h3>Federal Intelligence Sync</h3>
              <p className="fleet-compliance-table-note" style={{ marginTop: '0.6rem' }}>
                Pull live federal opportunities through the Railway federal-intel orchestrator and import SAM results
                into this GovCon pipeline.
              </p>
              <div className="fleet-compliance-action-row" style={{ marginTop: '0.8rem' }}>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => void handleRunFederalIntelSync()}
                  disabled={runningFederalIntelSync}
                >
                  {runningFederalIntelSync ? 'Running Sync...' : 'Run Federal Intel Sync'}
                </button>
              </div>
              <p className="fleet-compliance-table-note" style={{ marginTop: '0.55rem' }}>
                Requires `PENNY_API_URL` to point at the Railway backend and admin role access.
              </p>
              {federalIntelMessage ? (
                <p className="fleet-compliance-table-note" style={{ marginTop: '0.55rem', color: 'var(--text-primary)' }}>
                  {federalIntelMessage}
                </p>
              ) : null}
            </article>

            <div className="fleet-compliance-list-card" style={{ marginTop: '1.2rem' }}>
              <h3>Pipeline</h3>
              {!hasOpportunities ? (
                <div
                  style={{
                    marginTop: '0.9rem',
                    border: '1px dashed var(--border)',
                    borderRadius: '10px',
                    padding: '1.2rem',
                    textAlign: 'center',
                  }}
                >
                  <p style={{ margin: 0, color: 'var(--text-secondary)' }}>No opportunities in the pipeline.</p>
                  <Link href="/fleet-compliance/govcon/new" className="btn-secondary" style={{ marginTop: '0.75rem' }}>
                    New Opportunity
                  </Link>
                </div>
              ) : (
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Solicitation #</th>
                        <th>Agency</th>
                        <th>Title</th>
                        <th>Set-Aside</th>
                        <th>Est. Value</th>
                        <th>Status</th>
                        <th>Deadline</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {opportunities.map((opportunity) => (
                        <tr key={opportunity.id}>
                          <td>{opportunity.solicitation_number}</td>
                          <td>{opportunity.agency}</td>
                          <td>
                            <Link
                              href={`/fleet-compliance/govcon/${opportunity.id}`}
                              style={{ color: 'var(--navy)', textDecoration: 'none', fontWeight: 600 }}
                            >
                              {opportunity.title}
                            </Link>
                          </td>
                          <td>{opportunity.set_aside_type}</td>
                          <td>{formatCurrency(opportunity.estimated_value)}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                borderRadius: '4px',
                                padding: '0.2rem 0.55rem',
                                background: `${statusColors[opportunity.status]}1A`,
                                color: statusColors[opportunity.status],
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            >
                              {opportunity.status.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{formatDate(opportunity.response_deadline)}</td>
                          <td>
                            <Link
                              href={`/fleet-compliance/govcon/${opportunity.id}`}
                              style={{ color: 'var(--teal)', textDecoration: 'none', fontWeight: 600 }}
                            >
                              Open
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '1rem',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                gap: '1rem',
              }}
            >
              <article className="fleet-compliance-list-card">
                <h3>Compliance Alerts</h3>
                {Array.isArray(payload?.complianceAlerts) && payload.complianceAlerts.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: '0.7rem 0 0', padding: 0 }}>
                    {payload.complianceAlerts.map((alert, index) => (
                      <li
                        key={`${alert.name ?? 'alert'}-${index}`}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          padding: '0.55rem 0',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{alert.name}</div>
                        <div className="fleet-compliance-table-note">
                          Expires: {formatDate(alert.expirationDate)}
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            background: `${getAlertColor(alert.severity)}1A`,
                            color: getAlertColor(alert.severity),
                            fontWeight: 700,
                            fontSize: '0.75rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {alert.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.65rem' }}>
                    No compliance alerts.
                  </p>
                )}
              </article>

              <article className="fleet-compliance-list-card">
                <h3>Upcoming Deadlines</h3>
                {Array.isArray(payload?.deadlineAlerts) && payload.deadlineAlerts.length > 0 ? (
                  <ul style={{ listStyle: 'none', margin: '0.7rem 0 0', padding: 0 }}>
                    {payload.deadlineAlerts.map((alert, index) => (
                      <li
                        key={`${alert.title ?? 'deadline'}-${index}`}
                        style={{
                          borderBottom: '1px solid var(--border)',
                          padding: '0.55rem 0',
                        }}
                      >
                        <div style={{ fontWeight: 700, color: 'var(--navy)' }}>{alert.title}</div>
                        <div className="fleet-compliance-table-note">
                          Deadline: {formatDate(alert.deadline)} ({alert.daysRemaining} day{alert.daysRemaining === 1 ? '' : 's'})
                        </div>
                        <span
                          style={{
                            display: 'inline-block',
                            marginTop: '0.25rem',
                            borderRadius: '4px',
                            padding: '0.15rem 0.45rem',
                            background: `${getAlertColor(alert.severity)}1A`,
                            color: getAlertColor(alert.severity),
                            fontWeight: 700,
                            fontSize: '0.75rem',
                          }}
                        >
                          {alert.severity}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="fleet-compliance-table-note" style={{ marginTop: '0.65rem' }}>
                    No upcoming deadlines.
                  </p>
                )}
              </article>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
