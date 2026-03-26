'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addRecord,
  updateRecord,
  generateId,
  type LocalInvoice,
} from '@/lib/fleet-compliance-local-store';

interface Props {
  initial?: LocalInvoice;
  returnHref?: string;
  orgAssets?: Array<{ assetId: string; label: string }>;
}

const BLANK: Omit<LocalInvoice, 'id' | 'createdAt'> = {
  vendor: '',
  invoiceNumber: '',
  invoiceDate: '',
  dueDate: '',
  amount: '',
  partsCost: '',
  laborCost: '',
  category: 'maintenance',
  assetId: '',
  serviceType: '',
  status: 'pending',
  note: '',
};

export default function InvoiceForm({
  initial,
  returnHref = '/fleet-compliance/invoices',
  orgAssets = [],
}: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<LocalInvoice, 'id' | 'createdAt'>>(initial ?? BLANK);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const isEditing = Boolean(initial?.id && initial?.createdAt);

  useEffect(() => {
    setForm(initial ?? BLANK);
    setSaved(false);
    setError('');
  }, [initial]);

  function set(field: keyof typeof BLANK, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.vendor.trim()) { setError('Vendor is required.'); return; }
    if (!form.invoiceNumber.trim()) { setError('Invoice number is required.'); return; }
    if (!form.invoiceDate) { setError('Invoice date is required.'); return; }

    if (isEditing && initial) {
      updateRecord<LocalInvoice>('fleet-compliance:store:invoices', initial.id, form);
    } else {
      addRecord<LocalInvoice>('fleet-compliance:store:invoices', {
        id: generateId('inv'),
        createdAt: new Date().toISOString(),
        ...form,
      });
    }
    setSaved(true);
    setTimeout(() => router.push(returnHref), 1200);
  }

  const f = (
    field: keyof typeof BLANK,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; options?: string[] } = {}
  ) => (
    <label className="fleet-compliance-field-stack">
      <span>{label}{opts.required && ' *'}</span>
      {opts.options ? (
        <select value={String(form[field])} onChange={(e) => set(field, e.target.value)}>
          {opts.options.map((o) => <option key={o} value={o}>{o || '— select —'}</option>)}
        </select>
      ) : (
        <input
          type={opts.type ?? 'text'}
          value={String(form[field])}
          onChange={(e) => set(field, e.target.value)}
          placeholder={opts.placeholder}
          required={opts.required}
        />
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
      {saved && <div className="fleet-compliance-success-banner">Saved. Redirecting…</div>}
      {error && <div className="fleet-compliance-info-banner"><strong>Error:</strong> {error}</div>}

      <fieldset className="fleet-compliance-fieldset">
        <legend>Invoice Details</legend>
        <div className="fleet-compliance-form-grid">
          {f('vendor', 'Vendor', { required: true, placeholder: 'Company name' })}
          {f('invoiceNumber', 'Invoice Number', { required: true, placeholder: 'INV-2026-001' })}
          {f('invoiceDate', 'Invoice Date', { type: 'date', required: true })}
          {f('dueDate', 'Due Date', { type: 'date' })}
          {f('status', 'Status', { options: ['pending', 'paid', 'overdue'] })}
          {f('category', 'Category', { options: ['maintenance', 'permit', 'fuel', 'insurance', 'other'] })}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Costs</legend>
        <div className="fleet-compliance-form-grid">
          {f('amount', 'Total Amount', { placeholder: '$0.00' })}
          {f('partsCost', 'Parts Cost', { placeholder: '$0.00' })}
          {f('laborCost', 'Labor Cost', { placeholder: '$0.00' })}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Asset Link</legend>
        <div className="fleet-compliance-form-grid">
          <label className="fleet-compliance-field-stack">
            <span>Asset ID</span>
            <select value={form.assetId} onChange={(e) => set('assetId', e.target.value)}>
              <option value="">— Select Asset —</option>
              {orgAssets.map((asset) => (
                <option key={asset.assetId} value={asset.assetId}>
                  {asset.assetId} — {asset.label}
                </option>
              ))}
            </select>
          </label>
          {f('serviceType', 'Service Type', { placeholder: 'Oil change, DOT inspection, etc.' })}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Notes</legend>
        <label className="fleet-compliance-field-stack">
          <span>Notes</span>
          <textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={3} />
        </label>
      </fieldset>

      <div className="fleet-compliance-action-row">
        <button type="submit" className="btn-primary" disabled={saved}>
          {isEditing ? 'Save Changes' : 'Add Invoice'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push(returnHref)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
