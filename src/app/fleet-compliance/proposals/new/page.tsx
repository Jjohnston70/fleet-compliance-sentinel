'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

type LineItemRow = {
  id: string;
  description: string;
  quantity: string;
  unitPrice: string;
  category: 'Development' | 'Design' | 'Consulting' | 'Training' | 'Support' | 'Other';
};

const SERVICE_TYPES = [
  'Web Development',
  'Consulting',
  'Design',
  'Data Analytics',
  'Strategy',
] as const;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function createLineItem(): LineItemRow {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: '1',
    unitPrice: '0',
    category: 'Other',
  };
}

function parseCurrencyValue(value: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

export default function NewProposalPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    clientName: '',
    clientCompany: '',
    clientEmail: '',
    clientPhone: '',
    serviceType: 'Web Development',
    projectTitle: '',
    description: '',
    validityDays: '30',
  });
  const [lineItems, setLineItems] = useState<LineItemRow[]>([createLineItem()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const subtotal = useMemo(
    () =>
      lineItems.reduce((sum, item) => {
        const quantity = parseCurrencyValue(item.quantity);
        const unitPrice = parseCurrencyValue(item.unitPrice);
        return sum + quantity * unitPrice;
      }, 0),
    [lineItems],
  );

  function updateLineItem(id: string, updates: Partial<LineItemRow>) {
    setLineItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');

    const cleanedLineItems = lineItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: parseCurrencyValue(item.quantity),
        unitPrice: parseCurrencyValue(item.unitPrice),
        category: item.category,
      }))
      .filter((item) => item.description && item.quantity > 0 && item.unitPrice >= 0);

    if (cleanedLineItems.length === 0) {
      setError('Add at least one valid line item.');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/fleet-compliance/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          validityDays: Number(form.validityDays || 30),
          lineItems: cleanedLineItems,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create proposal');
      }

      const proposalId = data?.proposal?.id;
      if (!proposalId) throw new Error('Proposal created but response is missing proposal id');
      router.push(`/fleet-compliance/proposals/${proposalId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
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
          <span>New</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Finance</p>
            <h1>Create Proposal</h1>
            <p className="fleet-compliance-subcopy">
              Enter client details, choose a service template, and build line-item pricing.
            </p>
          </div>
          <Link href="/fleet-compliance/proposals" className="btn-secondary">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
          <fieldset className="fleet-compliance-fieldset">
            <legend>Client Information</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack">
                <span>Client Name *</span>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                  required
                />
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Company *</span>
                <input
                  type="text"
                  value={form.clientCompany}
                  onChange={(event) => setForm((current) => ({ ...current, clientCompany: event.target.value }))}
                  required
                />
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Email *</span>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(event) => setForm((current) => ({ ...current, clientEmail: event.target.value }))}
                  required
                />
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Phone</span>
                <input
                  type="tel"
                  value={form.clientPhone}
                  onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fleet-compliance-fieldset">
            <legend>Project</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack">
                <span>Service Type *</span>
                <select
                  value={form.serviceType}
                  onChange={(event) => setForm((current) => ({ ...current, serviceType: event.target.value }))}
                  required
                >
                  {SERVICE_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="fleet-compliance-field-stack">
                <span>Validity (days) *</span>
                <input
                  type="number"
                  min={1}
                  value={form.validityDays}
                  onChange={(event) => setForm((current) => ({ ...current, validityDays: event.target.value }))}
                  required
                />
              </label>
              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>Project Title *</span>
                <input
                  type="text"
                  value={form.projectTitle}
                  onChange={(event) => setForm((current) => ({ ...current, projectTitle: event.target.value }))}
                  required
                />
              </label>
              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fleet-compliance-fieldset">
            <legend>Line Items</legend>
            <div className="fleet-compliance-table-wrap">
              <table className="fleet-compliance-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th style={{ width: '7rem' }}>Qty</th>
                    <th style={{ width: '10rem' }}>Unit Price</th>
                    <th style={{ width: '10rem' }}>Category</th>
                    <th style={{ width: '10rem' }}>Total</th>
                    <th style={{ width: '6rem' }}>Remove</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item) => {
                    const quantity = parseCurrencyValue(item.quantity);
                    const unitPrice = parseCurrencyValue(item.unitPrice);
                    const total = quantity * unitPrice;

                    return (
                      <tr key={item.id}>
                        <td>
                          <input
                            type="text"
                            value={item.description}
                            onChange={(event) => updateLineItem(item.id, { description: event.target.value })}
                            placeholder="Service description"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            value={item.quantity}
                            onChange={(event) => updateLineItem(item.id, { quantity: event.target.value })}
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            min={0}
                            step="0.01"
                            value={item.unitPrice}
                            onChange={(event) => updateLineItem(item.id, { unitPrice: event.target.value })}
                          />
                        </td>
                        <td>
                          <select
                            value={item.category}
                            onChange={(event) =>
                              updateLineItem(item.id, {
                                category: event.target.value as LineItemRow['category'],
                              })
                            }
                          >
                            <option value="Development">Development</option>
                            <option value="Design">Design</option>
                            <option value="Consulting">Consulting</option>
                            <option value="Training">Training</option>
                            <option value="Support">Support</option>
                            <option value="Other">Other</option>
                          </select>
                        </td>
                        <td>{currencyFormatter.format(total)}</td>
                        <td>
                          <button
                            type="button"
                            onClick={() =>
                              setLineItems((current) =>
                                current.length > 1 ? current.filter((row) => row.id !== item.id) : current,
                              )
                            }
                            disabled={lineItems.length <= 1}
                            style={{
                              border: 'none',
                              background: 'none',
                              color: lineItems.length <= 1 ? 'var(--text-muted)' : '#dc2626',
                              cursor: lineItems.length <= 1 ? 'not-allowed' : 'pointer',
                            }}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div
              style={{
                marginTop: '0.75rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <button
                type="button"
                onClick={() => setLineItems((current) => [...current, createLineItem()])}
                className="btn-secondary"
              >
                Add Line Item
              </button>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy)' }}>
                Subtotal: {currencyFormatter.format(subtotal)}
              </p>
            </div>
          </fieldset>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Proposal'}
            </button>
            <Link href="/fleet-compliance/proposals" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}

