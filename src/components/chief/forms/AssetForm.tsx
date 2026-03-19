'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  addRecord,
  updateRecord,
  generateId,
  type LocalAsset,
} from '@/lib/chief-local-store';

interface Props {
  initial?: LocalAsset;
  returnHref?: string;
}

const BLANK: Omit<LocalAsset, 'id' | 'createdAt'> = {
  status: 'active',
  assetId: '',
  name: '',
  category: 'vehicle',
  location: '',
  assignedTo: '',
  complianceFocus: '',
  nextServiceDue: '',
  purchaseDate: '',
  purchasePrice: '',
  vin: '',
  licensePlate: '',
  year: '',
  make: '',
  model: '',
  note: '',
};

const COMPLIANCE_FOCUS: Record<string, string> = {
  vehicle: 'Registration, DOT inspection, insurance, service interval',
  tank: 'Leak test, inspection, tank permit, calibration',
  trailer: 'Inspection, lights, tires, annual review',
  equipment: 'Service interval, maintenance history, assignment tracking',
};

export default function AssetForm({ initial, returnHref = '/chief/assets' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<Omit<LocalAsset, 'id' | 'createdAt'>>(initial ?? BLANK);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  function set(field: keyof typeof BLANK, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'category') {
        next.complianceFocus = COMPLIANCE_FOCUS[value] ?? '';
      }
      return next;
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Asset name is required.');
      return;
    }

    if (initial) {
      updateRecord<LocalAsset>('chief:store:assets', initial.id, form);
    } else {
      const record: LocalAsset = {
        id: generateId('ast'),
        createdAt: new Date().toISOString(),
        ...form,
        assetId: form.assetId || generateId('AST'),
      };
      addRecord<LocalAsset>('chief:store:assets', record);
    }
    setSaved(true);
    setTimeout(() => router.push(returnHref), 1200);
  }

  const f = (
    field: keyof typeof BLANK,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; options?: string[]; readOnly?: boolean } = {}
  ) => (
    <label className="chief-field-stack">
      <span>{label}{opts.required && ' *'}</span>
      {opts.options ? (
        <select value={String(form[field])} onChange={(e) => set(field, e.target.value)}>
          {opts.options.map((o) => <option key={o} value={o}>{o || '— select —'}</option>)}
        </select>
      ) : (
        <input
          type={opts.type ?? 'text'}
          value={String(form[field])}
          onChange={(e) => !opts.readOnly && set(field, e.target.value)}
          readOnly={opts.readOnly}
          placeholder={opts.placeholder}
          required={opts.required}
          style={opts.readOnly ? { background: '#f9fafb', color: '#6b7280' } : undefined}
        />
      )}
    </label>
  );

  return (
    <form onSubmit={handleSubmit} className="chief-form-page">
      {saved && <div className="chief-success-banner">Saved. Redirecting…</div>}
      {error && <div className="chief-info-banner"><strong>Error:</strong> {error}</div>}

      <fieldset className="chief-fieldset">
        <legend>Identity</legend>
        <div className="chief-form-grid">
          {f('name', 'Asset Name', { required: true })}
          {f('assetId', 'Asset ID', { placeholder: 'Auto-generated if blank' })}
          {f('category', 'Category', { options: ['vehicle', 'tank', 'trailer', 'equipment'] })}
          {f('status', 'Status', { options: ['active', 'maintenance-hold', 'retired', 'inactive'] })}
          {f('location', 'Location')}
          {f('assignedTo', 'Assigned To')}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Vehicle Details</legend>
        <div className="chief-form-grid">
          {f('year', 'Year', { placeholder: '2024' })}
          {f('make', 'Make', { placeholder: 'Ford' })}
          {f('model', 'Model', { placeholder: 'F-450' })}
          {f('vin', 'VIN')}
          {f('licensePlate', 'License Plate')}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Compliance & Service</legend>
        <div className="chief-form-grid">
          {f('nextServiceDue', 'Next Service Due', { type: 'date' })}
          {f('complianceFocus', 'Compliance Focus', { placeholder: 'Auto-filled by category', readOnly: true })}
        </div>
      </fieldset>

      <fieldset className="chief-fieldset">
        <legend>Purchase</legend>
        <div className="chief-form-grid">
          {f('purchaseDate', 'Purchase Date', { type: 'date' })}
          {f('purchasePrice', 'Purchase Price', { placeholder: '$0.00' })}
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
          {initial ? 'Save Changes' : 'Add Asset'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push(returnHref)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
