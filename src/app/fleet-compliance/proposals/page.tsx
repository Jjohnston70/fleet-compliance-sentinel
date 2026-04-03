'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProposalListItem {
  id: string;
  proposalNumber: string;
  title: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  clientName: string;
  clientCompany: string;
  createdAt: string | null;
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatUsd(value: number): string {
  return currencyFormatter.format(Number.isFinite(value) ? value : 0);
}

function formatDate(value: string | null): string {
  if (!value) return '--';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '--';
  return parsed.toLocaleDateString('en-US');
}

function statusColor(status: string): string {
  if (status === 'draft') return '#6b7280';
  if (status === 'sent') return '#2563eb';
  if (status === 'viewed') return '#ca8a04';
  if (status === 'accepted') return '#16a34a';
  if (status === 'declined') return '#dc2626';
  if (status === 'expired') return '#ea580c';
  if (status === 'generated') return '#0f766e';
  return '#6b7280';
}

export default function ProposalsPage() {
  const router = useRouter();
  const [proposals, setProposals] = useState<ProposalListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProposals() {
      try {
        const res = await fetch('/api/fleet-compliance/proposals');
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || 'Failed to load proposals');
        }
        const data = await res.json();
        setProposals(Array.isArray(data.proposals) ? data.proposals : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    loadProposals();
  }, []);

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Finance</p>
            <h1>Proposals</h1>
            <p className="fleet-compliance-subcopy">
              Create and track client proposals with lifecycle status and document generation.
            </p>
          </div>
          <Link href="/fleet-compliance/proposals/new" className="btn-primary">
            Create Proposal
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        ) : proposals.length === 0 ? (
          <div
            style={{
              marginTop: '1.5rem',
              border: '1px dashed var(--border)',
              borderRadius: '12px',
              padding: '2rem',
              background: '#f8fafc',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              No proposals yet. Create your first proposal to start tracking client work.
            </p>
            <Link
              href="/fleet-compliance/proposals/new"
              className="btn-primary"
              style={{ marginTop: '1rem', display: 'inline-flex' }}
            >
              Create Proposal
            </Link>
          </div>
        ) : (
          <div className="fleet-compliance-list-card" style={{ marginTop: '1.5rem' }}>
            <h3>Proposal Pipeline</h3>
            <div className="fleet-compliance-table-wrap">
              <table className="fleet-compliance-table">
                <thead>
                  <tr>
                    <th>Proposal #</th>
                    <th>Client</th>
                    <th>Project</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {proposals.map((proposal) => (
                    <tr
                      key={proposal.id}
                      onClick={() => router.push(`/fleet-compliance/proposals/${proposal.id}`)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td>{proposal.proposalNumber}</td>
                      <td>
                        <div>{proposal.clientCompany || '--'}</div>
                        <div className="fleet-compliance-table-note">{proposal.clientName || '--'}</div>
                      </td>
                      <td>
                        <div>{proposal.title}</div>
                        <div className="fleet-compliance-table-note">{proposal.serviceType}</div>
                      </td>
                      <td>{formatUsd(proposal.totalAmount)}</td>
                      <td>
                        <span
                          style={{
                            display: 'inline-block',
                            padding: '0.25rem 0.65rem',
                            borderRadius: '4px',
                            background: `${statusColor(proposal.status)}20`,
                            color: statusColor(proposal.status),
                            fontWeight: 600,
                            fontSize: '0.82rem',
                            textTransform: 'capitalize',
                          }}
                        >
                          {proposal.status}
                        </span>
                      </td>
                      <td>{formatDate(proposal.createdAt)}</td>
                      <td>
                        <Link
                          href={`/fleet-compliance/proposals/${proposal.id}`}
                          onClick={(event) => event.stopPropagation()}
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
          </div>
        )}
      </section>
    </main>
  );
}
