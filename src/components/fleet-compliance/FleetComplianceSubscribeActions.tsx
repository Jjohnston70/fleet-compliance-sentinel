'use client';

import { useState } from 'react';

interface FleetComplianceSubscribeActionsProps {
  starterPriceId: string;
  proPriceId: string;
}

type PendingPlan = 'starter' | 'pro' | null;

async function startCheckout(priceId: string): Promise<string> {
  const response = await fetch('/api/stripe/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ priceId }),
  });

  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof body?.error === 'string' ? body.error : 'Unable to start checkout';
    throw new Error(message);
  }
  if (typeof body?.url !== 'string' || body.url.trim().length === 0) {
    throw new Error('Checkout URL was not returned');
  }
  return body.url;
}

export default function FleetComplianceSubscribeActions({
  starterPriceId,
  proPriceId,
}: FleetComplianceSubscribeActionsProps) {
  const [pending, setPending] = useState<PendingPlan>(null);
  const [error, setError] = useState('');

  const isConfigured = Boolean(starterPriceId && proPriceId);

  async function onPlanSelect(plan: 'starter' | 'pro', priceId: string) {
    if (pending || !priceId) return;
    setPending(plan);
    setError('');
    try {
      const url = await startCheckout(priceId);
      window.location.assign(url);
    } catch (checkoutError: unknown) {
      setPending(null);
      setError(checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout');
    }
  }

  if (!isConfigured) {
    return (
      <p className="fleet-compliance-subcopy" style={{ color: '#b91c1c' }}>
        Billing is not configured. Contact support to activate Stripe pricing.
      </p>
    );
  }

  return (
    <>
      <div className="fleet-compliance-action-row">
        <button
          type="button"
          className="btn-primary"
          onClick={() => onPlanSelect('starter', starterPriceId)}
          disabled={pending !== null}
        >
          {pending === 'starter' ? 'Redirecting...' : 'Subscribe Starter - $149/mo'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => onPlanSelect('pro', proPriceId)}
          disabled={pending !== null}
        >
          {pending === 'pro' ? 'Redirecting...' : 'Subscribe Professional - $299/mo'}
        </button>
      </div>
      {error ? <p className="fleet-compliance-subcopy" style={{ color: '#b91c1c' }}>{error}</p> : null}
    </>
  );
}
