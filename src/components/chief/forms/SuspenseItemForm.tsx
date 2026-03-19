'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addRecord,
  updateRecord,
  generateId,
  type LocalSuspenseItem,
} from '@/lib/chief-local-store';

interface Props {
  initial?: LocalSuspenseItem;
  returnHref?: string;
}

const BLANK: Omit<LocalSuspenseItem, 'id' | 'createdAt'> = {
  title: '',
  ownerEmail: '',
  dueDate: '',
  severity: 'medium',
  status: 'open',
  alertState: 'upcoming',
  sourceType: 'manual',
  sourceId: '',
  note: '',
};

function alertStateFromDueDate(dateStr: string): string {
  if (!dateStr) return 'upcoming';
  const diff = Math.round(
    (new Date(`${dateStr}T12:00:00`).getTime() - Date.now()) / 86400000
  );
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'due-today';
  if (diff <= 7) return 'due-7d';
  if (diff <= 14) return 'due-14d';
  if (diff <= 30) return 'due-30d';
  return 'upcoming';
}

export default function SuspenseItemForm({ initial, returnHref = '/chief/suspense' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<LocalSuspenseItem, 'id' | 'createdAt'>>(initial ?? BLANK);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof BLANK, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'dueDate') next.alertState = alertStateFromDueDate(value);
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.title.trim()) { setError('Title is required.'); return; }
    if (!form.ownerEmail.trim()) { setError('Owner email is required.'); return; }
    if (!form.dueDate) { setError('Due date is required.'); return; }

    if (initial) {
      updateRecord<LocalSuspenseItem>('chief:store:suspense', initial.id, form);
    } else {
      addRecord<LocalSuspenseItem>('chief:store:suspense', {
        id: generateId('sus'),
        createdAt: new Date().toISOString(),
        ...form,
      });
    }
    setSaved(true);
    setTimeout(() => router.push(returnHref), 1200);
  }

  return (
    <form onSubmit={handleSubmit} className="chief-form-page">
      {saved && <div className="chief-success-banner">Saved. Redirecting…</div>}
      {error && <div className="chief-info-banner"><strong>Error:</strong> {error}</div>}

      <fieldset className="chief-fieldset">
        <legend>Item</legend>
        <div className="chief-form-grid">
          <label className="chief-field-stack" style={{ gridColumn: '1 / -1' }}>
            <span>Title *</span>
            <input
              type="text"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              placeholder="e.g. Medical card expiring — John Smith"
              required
            />
          </label>
          <label className="chief-field-stack">
            <span>Owner Email *</span>
            <input
              type="email"
              value={form.ownerEmail}
              onChange={(e) => set('ownerEmail', e.target.value)}
              required
            />
          </label>
          <label className="chief-field-stack">
            <span>Due Date *</span>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => set('dueDate', e.target.value)}
              required
            />
          </label>
          <label className="chief-field-stack">
            <span>Severity</span>
            <select value={form.severity} onChange={(e) => set('severity', e.target.value)}>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </label>
          <label className="chief-field-stack">
            <span>Status</span>
            <select value={form.status} onChange={(e) => set('status', e.target.value)}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Source</legend>
        <div className="chief-form-grid">
          <label className="chief-field-stack">
            <span>Source Type</span>
            <select value={form.sourceType} onChange={(e) => set('sourceType', e.target.value)}>
              <option value="manual">Manual</option>
              <option value="asset">Asset</option>
              <option value="driver_compliance">Driver Compliance</option>
              <option value="permit">Permit / License</option>
              <option value="maintenance">Maintenance</option>
              <option value="invoice">Invoice</option>
            </select>
          </label>
          <label className="chief-field-stack">
            <span>Source ID</span>
            <input
              type="text"
              value={form.sourceId}
              onChange={(e) => set('sourceId', e.target.value)}
              placeholder="Asset ID, permit ID, etc."
            />
          </label>
          <label className="chief-field-stack">
            <span>Alert State</span>
            <input
              type="text"
              value={form.alertState}
              readOnly
              style={{ background: '#f9fafb', color: '#6b7280' }}
            />
          </label>
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Notes</legend>
        <label className="chief-field-stack">
          <span>Notes</span>
          <textarea value={form.note} onChange={(e) => set('note', e.target.value)} rows={3} />
        </label>
      </fieldset>

      <div className="chief-action-row">
        <button type="submit" className="btn-primary" disabled={saved}>
          {initial ? 'Save Changes' : 'Add Suspense Item'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push(returnHref)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
