'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface ProposalLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
  category: string;
}

interface ProposalActivity {
  id: string;
  activityType: string;
  description: string;
  actor: string;
  timestamp: string | null;
}

interface ProposalDetail {
  id: string;
  proposalNumber: string;
  title: string;
  description: string;
  notes: string;
  serviceType: string;
  status: string;
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  client: {
    id: string;
    contactName: string;
    companyName: string;
    email: string;
    phone: string;
  };
  createdAt: string | null;
  updatedAt: string | null;
  validUntil: string | null;
  sentAt: string | null;
  viewedAt: string | null;
  respondedAt: string | null;
  lineItems: ProposalLineItem[];
  activity: ProposalActivity[];
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
  return parsed.toLocaleString('en-US');
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

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = String(params.id ?? '');

  const [proposal, setProposal] = useState<ProposalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyAction, setBusyAction] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    notes: '',
    validityDays: '',
  });

  const loadProposal = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/fleet-compliance/proposals/${proposalId}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to load proposal');
      setProposal(data.proposal as ProposalDetail);
      setEditForm({
        title: String(data.proposal?.title ?? ''),
        description: String(data.proposal?.description ?? ''),
        notes: String(data.proposal?.notes ?? ''),
        validityDays: '',
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [proposalId]);

  useEffect(() => {
    if (!proposalId) return;
    void loadProposal();
  }, [proposalId, loadProposal]);

  const timeline = useMemo(() => {
    if (!proposal) return [];
    return [...proposal.activity].sort((a, b) => {
      const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
      const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
      return bTime - aTime;
    });
  }, [proposal]);

  async function updateStatus(status: 'accepted' | 'declined') {
    setBusyAction(status);
    try {
      const res = await fetch(`/api/fleet-compliance/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || `Failed to mark ${status}`);
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyAction('');
    }
  }

  async function generateDocument() {
    setBusyAction('generate');
    try {
      const res = await fetch(`/api/fleet-compliance/proposals/${proposalId}/generate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to generate document');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${proposal?.proposalNumber || 'proposal'}.docx`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate document');
    } finally {
      setBusyAction('');
    }
  }

  async function sendToClient() {
    setBusyAction('send');
    try {
      const res = await fetch(`/api/fleet-compliance/proposals/${proposalId}/send`, {
        method: 'POST',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to send proposal');
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send proposal');
    } finally {
      setBusyAction('');
    }
  }

  async function saveEdits(event: React.FormEvent) {
    event.preventDefault();
    setSavingEdit(true);
    try {
      const payload: Record<string, unknown> = {
        title: editForm.title,
        description: editForm.description,
        notes: editForm.notes,
      };
      if (editForm.validityDays.trim()) {
        payload.validityDays = Number(editForm.validityDays);
      }

      const res = await fetch(`/api/fleet-compliance/proposals/${proposalId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to save changes');
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section">
        <div className="fleet-compliance-breadcrumbs">
          <Link href="/fleet-compliance">Fleet-Compliance</Link>
          <span>/</span>
          <Link href="/fleet-compliance/proposals">Proposals</Link>
          <span>/</span>
          <span>{proposal?.proposalNumber || 'Loading...'}</span>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loading ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading...</p>
        ) : proposal ? (
          <>
            <div className="fleet-compliance-section-head">
              <div>
                <p className="fleet-compliance-eyebrow">Proposal</p>
                <h1>{proposal.proposalNumber}</h1>
                <p className="fleet-compliance-subcopy">
                  {proposal.title} • {proposal.serviceType}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '0.3rem 0.75rem',
                    borderRadius: '6px',
                    background: `${statusColor(proposal.status)}20`,
                    color: statusColor(proposal.status),
                    fontWeight: 700,
                    textTransform: 'capitalize',
                  }}
                >
                  {proposal.status}
                </span>
                <Link href="/fleet-compliance/proposals" className="btn-secondary">
                  Back
                </Link>
              </div>
            </div>

            <div className="fleet-compliance-stats" style={{ marginTop: '1rem' }}>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Client</p>
                <p className="fleet-compliance-stat-value" style={{ fontSize: '1.1rem' }}>
                  {proposal.client.companyName || '--'}
                </p>
                <p className="fleet-compliance-table-note">{proposal.client.contactName || '--'}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Total Amount</p>
                <p className="fleet-compliance-stat-value">{formatUsd(proposal.totalAmount)}</p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Created</p>
                <p className="fleet-compliance-stat-value" style={{ fontSize: '1rem' }}>
                  {formatDate(proposal.createdAt)}
                </p>
              </article>
              <article className="fleet-compliance-stat-card">
                <p className="fleet-compliance-stat-label">Valid Until</p>
                <p className="fleet-compliance-stat-value" style={{ fontSize: '1rem' }}>
                  {formatDate(proposal.validUntil)}
                </p>
              </article>
            </div>

            <div className="fleet-compliance-action-row" style={{ marginTop: '1rem' }}>
              <button className="btn-secondary" onClick={generateDocument} disabled={busyAction !== ''}>
                {busyAction === 'generate' ? 'Generating...' : 'Generate PDF'}
              </button>
              <button className="btn-primary" onClick={sendToClient} disabled={busyAction !== ''}>
                {busyAction === 'send' ? 'Sending...' : 'Send to Client'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => updateStatus('accepted')}
                disabled={busyAction !== ''}
              >
                {busyAction === 'accepted' ? 'Updating...' : 'Mark Accepted'}
              </button>
              <button
                className="btn-secondary"
                onClick={() => updateStatus('declined')}
                disabled={busyAction !== ''}
              >
                {busyAction === 'declined' ? 'Updating...' : 'Mark Declined'}
              </button>
            </div>

            <div
              style={{
                marginTop: '1.5rem',
                display: 'grid',
                gap: '1.25rem',
                gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
              }}
            >
              <div className="fleet-compliance-list-card">
                <h3>Line Items</h3>
                <div className="fleet-compliance-table-wrap">
                  <table className="fleet-compliance-table">
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th>Category</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {proposal.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td>{item.description}</td>
                          <td>{item.category}</td>
                          <td>{item.quantity}</td>
                          <td>{formatUsd(item.unitPrice)}</td>
                          <td>{formatUsd(item.total)}</td>
                        </tr>
                      ))}
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'right', fontWeight: 700 }}>
                          Total
                        </td>
                        <td style={{ fontWeight: 700 }}>{formatUsd(proposal.totalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="fleet-compliance-list-card">
                <h3>Status Timeline</h3>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {timeline.length === 0 ? (
                    <li style={{ color: 'var(--text-muted)' }}>No activity yet.</li>
                  ) : (
                    timeline.map((entry) => (
                      <li
                        key={entry.id}
                        style={{
                          padding: '0.6rem 0',
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <div style={{ fontWeight: 600, color: 'var(--navy)' }}>
                          {entry.description || entry.activityType}
                        </div>
                        <div className="fleet-compliance-table-note">{formatDate(entry.timestamp)}</div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>

            <form onSubmit={saveEdits} className="fleet-compliance-form-page" style={{ marginTop: '1.5rem' }}>
              <fieldset className="fleet-compliance-fieldset">
                <legend>Edit Proposal</legend>
                <div className="fleet-compliance-form-grid">
                  <label className="fleet-compliance-field-stack">
                    <span>Project Title</span>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, title: event.target.value }))
                      }
                    />
                  </label>
                  <label className="fleet-compliance-field-stack">
                    <span>Validity (days)</span>
                    <input
                      type="number"
                      min={1}
                      value={editForm.validityDays}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, validityDays: event.target.value }))
                      }
                    />
                  </label>
                  <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                    <span>Description</span>
                    <textarea
                      rows={4}
                      value={editForm.description}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, description: event.target.value }))
                      }
                    />
                  </label>
                  <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                    <span>Notes</span>
                    <textarea
                      rows={3}
                      value={editForm.notes}
                      onChange={(event) =>
                        setEditForm((current) => ({ ...current, notes: event.target.value }))
                      }
                    />
                  </label>
                </div>
                <div style={{ marginTop: '1rem' }}>
                  <button type="submit" className="btn-primary" disabled={savingEdit}>
                    {savingEdit ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </fieldset>
            </form>
          </>
        ) : (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Proposal not found.</p>
        )}
      </section>
    </main>
  );
}
