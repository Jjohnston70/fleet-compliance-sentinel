'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DQSummary {
  totalDrivers: number;
  complete: number;
  incomplete: number;
  expired: number;
  flagged: number;
  expiringIn30Days: number;
}

interface DQFile {
  id: string;
  driverName: string;
  cdl: string;
  status: 'complete' | 'incomplete' | 'expired' | 'flagged';
  intakeStatus: string;
  docsComplete: number;
  docsTotal: number;
  nextExpiry: string;
}

export default function DQPage() {
  const [summary, setSummary] = useState<DQSummary | null>(null);
  const [drivers, setDrivers] = useState<DQFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sweeping, setSweeping] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/fleet-compliance/dq/files');
        if (!res.ok) throw new Error('Failed to load DQ files');
        const data = await res.json();
        setSummary(data.summary);
        setDrivers(data.drivers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSweep = async () => {
    setSweeping(true);
    try {
      const res = await fetch('/api/fleet-compliance/dq/sweep', {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Sweep failed');
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sweep failed');
    } finally {
      setSweeping(false);
    }
  };

  const getStatusBadgeColor = (status: string): string => {
    if (status === 'complete') return '#10b981';
    if (status === 'incomplete') return '#f59e0b';
    if (status === 'expired' || status === 'flagged') return '#ef4444';
    return '#6b7280';
  };

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Compliance</p>
            <h1>Driver Qualification Files</h1>
            <p className="fleet-compliance-subcopy">
              Manage and track driver qualification files per 49 CFR Part 391.
            </p>
          </div>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner">
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        ) : summary ? (
          <>
            <div className="fleet-compliance-stats">
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Total Drivers</p>
                <p className="fleet-compliance-stat-value">{summary.totalDrivers}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Complete</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#10b981' }}>
                  {summary.complete}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Incomplete</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#f59e0b' }}>
                  {summary.incomplete}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Expired</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#ef4444' }}>
                  {summary.expired}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Flagged</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#ef4444' }}>
                  {summary.flagged}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Expiring 30 Days</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#f59e0b' }}>
                  {summary.expiringIn30Days}
                </p>
              </article>
            </div>

            <div className="fleet-compliance-action-row">
              <Link href="/fleet-compliance/dq/new" className="btn-primary">
                New DQ File
              </Link>
              <Link href="/fleet-compliance/dq/gaps" className="btn-secondary">
                Compliance Gaps
              </Link>
              <button
                onClick={handleSweep}
                disabled={sweeping}
                className="btn-secondary"
                style={{ opacity: sweeping ? 0.6 : 1 }}
              >
                {sweeping ? 'Running...' : 'Run Sweep'}
              </button>
            </div>

            {drivers.length > 0 && (
              <div className="fleet-compliance-list-card" style={{ marginTop: '1.5rem' }}>
                <h3>Drivers</h3>
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>CDL</th>
                        <th>Status</th>
                        <th>Intake Status</th>
                        <th>Doc Progress</th>
                        <th>Next Expiry</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {drivers.map((driver) => (
                        <tr key={driver.id}>
                          <td>{driver.driverName}</td>
                          <td>{driver.cdl || '—'}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                background: getStatusBadgeColor(driver.status) + '20',
                                color: getStatusBadgeColor(driver.status),
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {driver.status}
                            </span>
                          </td>
                          <td>{driver.intakeStatus}</td>
                          <td>
                            {driver.docsComplete}/{driver.docsTotal}
                          </td>
                          <td>{driver.nextExpiry || '—'}</td>
                          <td>
                            <Link
                              href={`/fleet-compliance/dq/${driver.id}`}
                              style={{ color: 'var(--teal)', textDecoration: 'none' }}
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
