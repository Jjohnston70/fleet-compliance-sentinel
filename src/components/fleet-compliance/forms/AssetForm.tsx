'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
interface Props {
  returnHref?: string;
}

interface AssetFormValues {
  status: string;
  assetId: string;
  name: string;
  category: string;
  location: string;
  assignedTo: string;
  complianceFocus: string;
  nextServiceDue: string;
  purchaseDate: string;
  purchasePrice: string;
  vin: string;
  licensePlate: string;
  year: string;
  make: string;
  model: string;
  note: string;
}

const BLANK: AssetFormValues = {
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

export default function AssetForm({ returnHref = '/fleet-compliance/assets' }: Props) {
  const router = useRouter();
  const [form, setForm] = useState<AssetFormValues>(BLANK);
  const [saving, setSaving] = useState(false);
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Asset name is required.');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/fleet-compliance/assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (Array.isArray(payload.fieldErrors) && payload.fieldErrors.length > 0) {
          setError(payload.fieldErrors.join(' | '));
        } else {
          setError(payload.error || 'Failed to save asset.');
        }
        return;
      }

      setSaved(true);
      router.push(returnHref);
      router.refresh();
    } catch {
      setError('Network error while saving asset.');
    } finally {
      setSaving(false);
    }
  }

  const f = (
    field: keyof typeof BLANK,
    label: string,
    opts: { type?: string; required?: boolean; placeholder?: string; options?: string[]; readOnly?: boolean } = {}
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
    <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
      {saved && <div className="fleet-compliance-success-banner">Saved. Redirecting…</div>}
      {error && <div className="fleet-compliance-info-banner"><strong>Error:</strong> {error}</div>}

      <fieldset className="fleet-compliance-fieldset">
        <legend>Identity</legend>
        <div className="fleet-compliance-form-grid">
          {f('name', 'Asset Name', { required: true })}
          {f('assetId', 'Asset ID', { placeholder: 'Auto-generated if blank' })}
          {f('category', 'Category', { options: ['vehicle', 'tank', 'trailer', 'equipment'] })}
          {f('status', 'Status', { options: ['active', 'maintenance-hold', 'retired', 'inactive'] })}
          {f('location', 'Location')}
          {f('assignedTo', 'Assigned To')}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Vehicle Details</legend>
        <div className="fleet-compliance-form-grid">
          {f('year', 'Year', { placeholder: '2024' })}
          {f('make', 'Make', { placeholder: 'Ford' })}
          {f('model', 'Model', { placeholder: 'F-450' })}
          {f('vin', 'VIN')}
          {f('licensePlate', 'License Plate')}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Compliance & Service</legend>
        <div className="fleet-compliance-form-grid">
          {f('nextServiceDue', 'Next Service Due', { type: 'date' })}
          {f('complianceFocus', 'Compliance Focus', { placeholder: 'Auto-filled by category', readOnly: true })}
        </div>
      </fieldset>

      <fieldset className="fleet-compliance-fieldset">
        <legend>Purchase</legend>
        <div className="fleet-compliance-form-grid">
          {f('purchaseDate', 'Purchase Date', { type: 'date' })}
          {f('purchasePrice', 'Purchase Price', { placeholder: '$0.00' })}
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
        <button type="submit" className="btn-primary" disabled={saving || saved}>
          {saving ? 'Saving…' : 'Add Asset'}
        </button>
        <button type="button" className="btn-secondary" onClick={() => router.push(returnHref)}>
          Cancel
        </button>
      </div>
    </form>
  );
}
