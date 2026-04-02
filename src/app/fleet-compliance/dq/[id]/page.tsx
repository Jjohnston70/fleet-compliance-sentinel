'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Driver {
  name: string;
  cdlStatus: string;
  hireDate: string;
  intakeStatus: string;
}

interface ChecklistItem {
  label: string;
  reference: string;
  status: 'complete' | 'incomplete' | 'expired';
  cadence: string;
  expiryDate: string;
  action: string;
}

interface TabData {
  completion: number;
  items: ChecklistItem[];
}

export default function DriverDetailPage() {
  const params = useParams();
  const fileId = params.id as string;

  const [driver, setDriver] = useState<Driver | null>(null);
  const [dqf, setDqf] = useState<TabData | null>(null);
  const [dhf, setDhf] = useState<TabData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'dqf' | 'dhf'>('dqf');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch(`/api/fleet-compliance/dq/files/${fileId}`);
        if (!res.ok) throw new Error('Failed to load file');
        const data = await res.json();
        setDriver(data.driver);
        setDqf(data.dqf);
        setDhf(data.dhf);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [fileId]);

  const getStatusColor = (status: string): string => {
    if (status === 'complete') return '#10b981';
    if (status === 'incomplete') return '#f59e0b';
    if (status === 'expired') return '#ef4444';
    return '#6b7280';
  };

  const currentTab = activeTab === 'dqf' ? dqf : dhf;

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/dq">DQ Files</Link>
          <span>/</span>
          <span>{driver?.name || 'Loading...'}</span>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        ) : driver ? (
          <>
            <div className="fleet-compliance-section-head">
              <div>
                <p className="fleet-compliance-eyebrow">Driver</p>
                <h1>{driver.name}</h1>
                <p className="fleet-compliance-subcopy">
                  {driver.cdlStatus} • Hired {driver.hireDate}
                </p>
              </div>
              <Link href="/fleet-compliance/dq" className="btn-secondary">
                Back
              </Link>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '1rem',
                marginTop: '1.5rem',
              }}
            >
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '1rem',
                  background: 'var(--white)',
                }}
              >
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Intake Status
                </p>
                <p style={{ marginTop: '0.5rem', fontSize: '1.1rem', color: 'var(--navy)', fontWeight: 600 }}>
                  {driver.intakeStatus}
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ marginTop: '2rem' }}>
              <div
                style={{
                  display: 'flex',
                  gap: '0',
                  borderBottom: '2px solid var(--border)',
                }}
              >
                {(['dqf', 'dhf'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: '1rem',
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      fontWeight: activeTab === tab ? 700 : 500,
                      color: activeTab === tab ? 'var(--navy)' : 'var(--text-muted)',
                      borderBottom: activeTab === tab ? '3px solid var(--teal)' : 'none',
                      fontSize: '1rem',
                      marginBottom: '-2px',
                    }}
                  >
                    {tab === 'dqf' ? 'DQF Documents' : 'DHF Documents'}
                  </button>
                ))}
              </div>

              {currentTab && (
                <div style={{ marginTop: '1.5rem' }}>
                  <div
                    style={{
                      marginBottom: '1.5rem',
                      background: 'linear-gradient(90deg, #f0f9ff 0%, transparent 100%)',
                      padding: '1rem',
                      borderRadius: '8px',
                    }}
                  >
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Completion
                    </p>
                    <div
                      style={{
                        marginTop: '0.5rem',
                        width: '100%',
                        height: '8px',
                        background: 'var(--border)',
                        borderRadius: '4px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${currentTab.completion}%`,
                          background: 'var(--teal)',
                          transition: 'width 0.3s',
                        }}
                      />
                    </div>
                    <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: 'var(--navy)', fontWeight: 600 }}>
                      {currentTab.completion}% Complete
                    </p>
                  </div>

                  <div className="fleet-compliance-table-wrap">
                    <table className="fleet-compliance-table">
                      <thead>
                        <tr>
                          <th>Document</th>
                          <th>CFR Reference</th>
                          <th>Status</th>
                          <th>Cadence</th>
                          <th>Expires</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTab.items.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.label}</td>
                            <td>{item.reference}</td>
                            <td>
                              <span
                                style={{
                                  display: 'inline-block',
                                  padding: '0.25rem 0.65rem',
                                  borderRadius: '4px',
                                  background: getStatusColor(item.status) + '20',
                                  color: getStatusColor(item.status),
                                  fontWeight: 600,
                                  fontSize: '0.82rem',
                                  textTransform: 'capitalize',
                                }}
                              >
                                {item.status}
                              </span>
                            </td>
                            <td>{item.cadence}</td>
                            <td>{item.expiryDate || '—'}</td>
                            <td>
                              <button
                                style={{
                                  padding: '0.35rem 0.7rem',
                                  background: 'var(--teal)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '4px',
                                  fontSize: '0.8rem',
                                  cursor: 'pointer',
                                }}
                              >
                                {item.action}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : null}
      </section>
    </main>
  );
}
