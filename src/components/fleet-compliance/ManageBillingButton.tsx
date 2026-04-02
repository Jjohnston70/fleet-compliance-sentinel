'use client';

import { useState } from 'react';

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function openPortal() {
    if (loading) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(typeof body?.error === 'string' ? body.error : 'Unable to open billing portal');
      }
      if (typeof body?.url !== 'string' || body.url.trim().length === 0) {
        throw new Error('Billing portal URL was not returned');
      }
      window.location.assign(body.url);
    } catch (err: unknown) {
      setLoading(false);
      setError(err instanceof Error ? err.message : 'Unable to open billing portal');
    }
  }

  return (
    <div>
      <button
        type="button"
        className="btn-secondary"
        onClick={openPortal}
        disabled={loading}
      >
        {loading ? 'Opening...' : 'Manage Billing'}
      </button>
      {error ? <p className="fleet-compliance-subcopy" style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{error}</p> : null}
    </div>
  );
}
