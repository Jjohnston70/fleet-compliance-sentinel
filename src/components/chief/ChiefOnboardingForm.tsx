'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ChiefOnboardingFormProps {
  initialCompanyName: string;
  initialPrimaryContact: string;
  initialFleetSize: string;
  initialPrimaryDotConcern: string;
}

export default function ChiefOnboardingForm({
  initialCompanyName,
  initialPrimaryContact,
  initialFleetSize,
  initialPrimaryDotConcern,
}: ChiefOnboardingFormProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initialCompanyName);
  const [primaryContact, setPrimaryContact] = useState(initialPrimaryContact);
  const [fleetSize, setFleetSize] = useState(initialFleetSize);
  const [primaryDotConcern, setPrimaryDotConcern] = useState(initialPrimaryDotConcern);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isReady = useMemo(() => {
    return (
      companyName.trim().length > 0 &&
      primaryContact.trim().length > 0 &&
      fleetSize.trim().length > 0 &&
      primaryDotConcern.trim().length > 0
    );
  }, [companyName, primaryContact, fleetSize, primaryDotConcern]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || !isReady) return;
    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/chief/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName,
          primaryContact,
          fleetSize,
          primaryDotConcern,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        const message = typeof body?.error === 'string' ? body.error : 'Onboarding submission failed';
        throw new Error(message);
      }

      router.push('/chief/import');
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Submission failed');
      setSubmitting(false);
    }
  }

  return (
    <form className="chief-filter-bar" onSubmit={onSubmit}>
      <div className="chief-filter-grid">
        <label className="chief-field-stack">
          <span>Company Name</span>
          <input
            type="text"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="Acme Logistics"
            maxLength={160}
            required
          />
        </label>

        <label className="chief-field-stack">
          <span>Primary Contact</span>
          <input
            type="text"
            value={primaryContact}
            onChange={(event) => setPrimaryContact(event.target.value)}
            placeholder="Jane Smith, Ops Director"
            maxLength={160}
            required
          />
        </label>

        <label className="chief-field-stack">
          <span>Fleet Size</span>
          <input
            type="text"
            value={fleetSize}
            onChange={(event) => setFleetSize(event.target.value)}
            placeholder="25 units"
            maxLength={80}
            required
          />
        </label>

        <label className="chief-field-stack">
          <span>Primary DOT Compliance Concern</span>
          <input
            type="text"
            value={primaryDotConcern}
            onChange={(event) => setPrimaryDotConcern(event.target.value)}
            placeholder="Driver qualification renewals"
            maxLength={240}
            required
          />
        </label>
      </div>

      {error ? <p className="chief-subcopy" style={{ color: '#b91c1c' }}>{error}</p> : null}

      <div className="chief-action-row">
        <button type="submit" className="btn-primary" disabled={submitting || !isReady}>
          {submitting ? 'Saving...' : 'Complete Onboarding'}
        </button>
      </div>
    </form>
  );
}

