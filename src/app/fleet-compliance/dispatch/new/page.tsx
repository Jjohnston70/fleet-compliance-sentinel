'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface ZoneRow {
  id: string;
  name: string;
}

type DispatchPriority = 'emergency' | 'urgent' | 'standard' | 'scheduled';
type DispatchIssueType = 'no_heat' | 'no_ac' | 'leak' | 'electrical' | 'maintenance' | 'inspection';

const PRIORITY_OPTIONS: Array<{ value: DispatchPriority; label: string }> = [
  { value: 'emergency', label: 'Emergency (30 min SLA)' },
  { value: 'urgent', label: 'Urgent (2 hr SLA)' },
  { value: 'standard', label: 'Standard (4 hr SLA)' },
  { value: 'scheduled', label: 'Scheduled (24 hr SLA)' },
];

const ISSUE_OPTIONS: Array<{ value: DispatchIssueType; label: string }> = [
  { value: 'no_heat', label: 'No Heat' },
  { value: 'no_ac', label: 'No AC' },
  { value: 'leak', label: 'Leak' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
];

export default function NewDispatchRequestPage() {
  const router = useRouter();
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [loadingZones, setLoadingZones] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    clientName: '',
    clientPhone: '',
    address: '',
    city: 'Colorado Springs',
    state: 'CO',
    zip: '',
    zoneId: '',
    priority: 'emergency' as DispatchPriority,
    issueType: 'no_heat' as DispatchIssueType,
    description: '',
  });

  useEffect(() => {
    async function loadZones() {
      try {
        const response = await fetch('/api/fleet-compliance/dispatch');
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !data.ok) {
          throw new Error(data.error || 'Failed to load zones');
        }

        const zoneRows = Array.isArray(data.zones) ? data.zones : [];
        setZones(zoneRows.map((zone: any) => ({ id: String(zone.id), name: String(zone.name) })));
        if (zoneRows.length > 0) {
          setForm((current) => ({ ...current, zoneId: String(zoneRows[0].id) }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load zones');
      } finally {
        setLoadingZones(false);
      }
    }

    void loadZones();
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const response = await fetch('/api/fleet-compliance/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to create dispatch request');
      }

      const requestId = String(data?.request?.id || '');
      if (!requestId) {
        throw new Error('Dispatch request created but response is missing id');
      }

      router.push(`/fleet-compliance/dispatch/${requestId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create dispatch request');
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
          <Link href="/fleet-compliance/dispatch">Dispatch</Link>
          <span>/</span>
          <span>New</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Operations</p>
            <h1>Create Dispatch Request</h1>
            <p className="fleet-compliance-subcopy">
              Submit a service call, set the SLA priority, and route the request to the correct zone.
            </p>
          </div>
          <Link href="/fleet-compliance/dispatch" className="btn-secondary">
            Cancel
          </Link>
        </div>

        {error && (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {loadingZones ? (
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading zones...</p>
        ) : (
          <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
            <fieldset className="fleet-compliance-fieldset">
              <legend>Client Information</legend>
              <div className="fleet-compliance-form-grid">
                <label className="fleet-compliance-field-stack">
                  <span>Client Name *</span>
                  <input
                    value={form.clientName}
                    onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))}
                    required
                  />
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>Client Phone *</span>
                  <input
                    value={form.clientPhone}
                    onChange={(event) => setForm((current) => ({ ...current, clientPhone: event.target.value }))}
                    required
                  />
                </label>
              </div>
            </fieldset>

            <fieldset className="fleet-compliance-fieldset">
              <legend>Service Location</legend>
              <div className="fleet-compliance-form-grid">
                <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                  <span>Address *</span>
                  <input
                    value={form.address}
                    onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
                    required
                  />
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>City *</span>
                  <input
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    required
                  />
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>State *</span>
                  <input
                    value={form.state}
                    onChange={(event) => setForm((current) => ({ ...current, state: event.target.value }))}
                    required
                  />
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>ZIP *</span>
                  <input
                    value={form.zip}
                    onChange={(event) => setForm((current) => ({ ...current, zip: event.target.value }))}
                    required
                  />
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>Zone *</span>
                  <select
                    value={form.zoneId}
                    onChange={(event) => setForm((current) => ({ ...current, zoneId: event.target.value }))}
                    required
                  >
                    {zones.map((zone) => (
                      <option key={zone.id} value={zone.id}>
                        {zone.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </fieldset>

            <fieldset className="fleet-compliance-fieldset">
              <legend>Dispatch Details</legend>
              <div className="fleet-compliance-form-grid">
                <label className="fleet-compliance-field-stack">
                  <span>Priority *</span>
                  <select
                    value={form.priority}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, priority: event.target.value as DispatchPriority }))
                    }
                    required
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fleet-compliance-field-stack">
                  <span>Issue Type *</span>
                  <select
                    value={form.issueType}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, issueType: event.target.value as DispatchIssueType }))
                    }
                    required
                  >
                    {ISSUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                  <span>Description *</span>
                  <textarea
                    rows={4}
                    value={form.description}
                    onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                    placeholder="Describe the service issue and urgency."
                    required
                  />
                </label>
              </div>
            </fieldset>

            <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Creating...' : 'Create Dispatch Request'}
              </button>
              <Link href="/fleet-compliance/dispatch" className="btn-secondary">
                Cancel
              </Link>
            </div>
          </form>
        )}
      </section>
    </main>
  );
}
