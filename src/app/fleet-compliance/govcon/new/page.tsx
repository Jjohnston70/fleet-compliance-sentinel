'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const SET_ASIDE_OPTIONS = [
  'SDVOSB',
  'VOSB',
  '8a',
  'HUBZone',
  'WOSB',
  'small_business',
  'full_open',
] as const;

const SOURCE_OPTIONS = ['sam_gov', 'manual', 'referral'] as const;

interface CreateResponse {
  ok: boolean;
  opportunity?: {
    id: string;
  };
  error?: string;
}

export default function NewGovConOpportunityPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: '',
    solicitation_number: '',
    agency: '',
    sub_agency: '',
    description: '',
    set_aside_type: 'small_business',
    naics_code: '',
    naics_description: '',
    response_deadline: '',
    estimated_value: '',
    place_of_performance: '',
    source: 'manual',
    url: '',
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);

    try {
      const response = await fetch('/api/fleet-compliance/govcon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          estimated_value: form.estimated_value ? Number(form.estimated_value) : undefined,
          sub_agency: form.sub_agency || undefined,
          place_of_performance: form.place_of_performance || undefined,
          url: form.url || undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as CreateResponse;
      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Failed to create opportunity');
      }

      const createdId = data?.opportunity?.id;
      if (!createdId) {
        throw new Error('Opportunity was created but no id was returned');
      }

      router.push(`/fleet-compliance/govcon/${createdId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create opportunity');
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
          <Link href="/fleet-compliance/govcon">GovCon</Link>
          <span>/</span>
          <span>New</span>
        </div>

        <div className="fleet-compliance-section-head">
          <div>
            <p className="fleet-compliance-eyebrow">Intelligence</p>
            <h1>Create Opportunity</h1>
            <p className="fleet-compliance-subcopy">
              Add a new federal opportunity to the pipeline and initialize bid tracking.
            </p>
          </div>
          <Link href="/fleet-compliance/govcon" className="btn-secondary">
            Cancel
          </Link>
        </div>

        {error ? (
          <div className="fleet-compliance-info-banner" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="fleet-compliance-form-page">
          <fieldset className="fleet-compliance-fieldset">
            <legend>Opportunity Details</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>Title *</span>
                <input
                  type="text"
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  required
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Solicitation Number *</span>
                <input
                  type="text"
                  value={form.solicitation_number}
                  onChange={(event) => setForm((current) => ({ ...current, solicitation_number: event.target.value }))}
                  required
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Agency *</span>
                <input
                  type="text"
                  value={form.agency}
                  onChange={(event) => setForm((current) => ({ ...current, agency: event.target.value }))}
                  required
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Sub-Agency</span>
                <input
                  type="text"
                  value={form.sub_agency}
                  onChange={(event) => setForm((current) => ({ ...current, sub_agency: event.target.value }))}
                />
              </label>

              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>Description *</span>
                <textarea
                  value={form.description}
                  onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                  rows={5}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fleet-compliance-fieldset">
            <legend>Classification</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack">
                <span>Set-Aside Type *</span>
                <select
                  value={form.set_aside_type}
                  onChange={(event) => setForm((current) => ({ ...current, set_aside_type: event.target.value }))}
                  required
                >
                  {SET_ASIDE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="fleet-compliance-field-stack">
                <span>NAICS Code *</span>
                <input
                  type="text"
                  value={form.naics_code}
                  onChange={(event) => setForm((current) => ({ ...current, naics_code: event.target.value }))}
                  required
                />
              </label>

              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>NAICS Description *</span>
                <input
                  type="text"
                  value={form.naics_description}
                  onChange={(event) => setForm((current) => ({ ...current, naics_description: event.target.value }))}
                  required
                />
              </label>
            </div>
          </fieldset>

          <fieldset className="fleet-compliance-fieldset">
            <legend>Timeline &amp; Value</legend>
            <div className="fleet-compliance-form-grid">
              <label className="fleet-compliance-field-stack">
                <span>Response Deadline *</span>
                <input
                  type="date"
                  value={form.response_deadline}
                  onChange={(event) => setForm((current) => ({ ...current, response_deadline: event.target.value }))}
                  required
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Estimated Value (USD)</span>
                <input
                  type="number"
                  min={0}
                  value={form.estimated_value}
                  onChange={(event) => setForm((current) => ({ ...current, estimated_value: event.target.value }))}
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Place of Performance</span>
                <input
                  type="text"
                  value={form.place_of_performance}
                  onChange={(event) => setForm((current) => ({ ...current, place_of_performance: event.target.value }))}
                />
              </label>

              <label className="fleet-compliance-field-stack">
                <span>Source</span>
                <select
                  value={form.source}
                  onChange={(event) => setForm((current) => ({ ...current, source: event.target.value }))}
                >
                  {SOURCE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="fleet-compliance-field-stack" style={{ gridColumn: '1 / -1' }}>
                <span>SAM.gov URL</span>
                <input
                  type="text"
                  value={form.url}
                  onChange={(event) => setForm((current) => ({ ...current, url: event.target.value }))}
                />
              </label>
            </div>
          </fieldset>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Creating...' : 'Create Opportunity'}
            </button>
            <Link href="/fleet-compliance/govcon" className="btn-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
