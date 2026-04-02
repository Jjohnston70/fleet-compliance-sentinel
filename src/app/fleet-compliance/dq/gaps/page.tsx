'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ComplianceGap {
  driverName: string;
  document: string;
  reference: string;
  gapType: 'missing' | 'expiring' | 'expired';
  severity: 'critical' | 'high' | 'medium' | 'low';
  expiryDate: string;
  daysUntil: number;
}

interface GapsSummary {
  missing: number;
  expiring: number;
  expired: number;
}

export default function GapsPage() {
  const [summary, setSummary] = useState<GapsSummary | null>(null);
  const [gaps, setGaps] = useState<ComplianceGap[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/fleet-compliance/dq/gaps');
        if (!res.ok) throw new Error('Failed to load compliance gaps');
        const data = await res.json();
        setSummary(data.summary);
        setGaps(data.gaps || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getGapTypeColor = (type: string): string => {
    if (type === 'missing') return '#f59e0b';
    if (type === 'expiring') return '#f97316';
    if (type === 'expired') return '#ef4444';
    return '#6b7280';
  };

  const getSeverityColor = (severity: string): string => {
    if (severity === 'critical') return '#ef4444';
    if (severity === 'high') return '#f97316';
    if (severity === 'medium') return '#eab308';
    return '#6b7280';
  };

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/dq">DQ Files</Link>
          <span>/</span>
          <span>Compliance Gaps</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Compliance</p>
            <h1>Compliance Gaps</h1>
            <p className="fleet-compliance-subcopy">
              Missing, expiring, and expired documents across your driver fleet.
            </p>
          </div>
          <Link href="/fleet-compliance/dq" className="btn-secondary">
            Back
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        ) : summary ? (
          <>
            <div className="fleet-compliance-stats">
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Missing Documents</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#f59e0b' }}>
                  {summary.missing}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Expiring Soon</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#f97316' }}>
                  {summary.expiring}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Expired</p>
                <p className="fleet-compliance-stat-value" style={{ color: '#ef4444' }}>
                  {summary.expired}
                </p>
              </article>
            </div>

            {gaps.length > 0 ? (
              <div className="fleet-compliance-list-card" style={{ marginTop: '1.5rem' }}>
                <h3>Gaps by Driver</h3>
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Driver Name</th>
                        <th>Document</th>
                        <th>CFR Reference</th>
                        <th>Gap Type</th>
                        <th>Severity</th>
                        <th>Expiry Date</th>
                        <th>Days Until</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gaps.map((gap, idx) => (
                        <tr key={idx}>
                          <td>{gap.driverName}</td>
                          <td>{gap.document}</td>
                          <td>{gap.reference}</td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                background: getGapTypeColor(gap.gapType) + '20',
                                color: getGapTypeColor(gap.gapType),
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {gap.gapType}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                display: 'inline-block',
                                padding: '0.25rem 0.65rem',
                                borderRadius: '4px',
                                background: getSeverityColor(gap.severity) + '20',
                                color: getSeverityColor(gap.severity),
                                fontWeight: 600,
                                fontSize: '0.82rem',
                                textTransform: 'capitalize',
                              }}
                            >
                              {gap.severity}
                            </span>
                          </td>
                          <td>{gap.expiryDate || '—'}</td>
                          <td>
                            <span
                              style={{
                                fontWeight: 600,
                                color: gap.daysUntil < 0 ? '#ef4444' : gap.daysUntil < 30 ? '#f59e0b' : 'var(--text-secondary)',
                              }}
                            >
                              {gap.daysUntil < 0 ? `${Math.abs(gap.daysUntil)} days ago` : `${gap.daysUntil} days`}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="fleet-compliance-empty-state">
                <h3>No Compliance Gaps</h3>
                <p>All drivers are compliant with their documentation requirements.</p>
              </div>
            )}
          </>
        ) : null}
      </section>
    </main>
  );
}
