import Link from 'next/link';
import FleetComplianceSubscribeActions from '@/components/fleet-compliance/FleetComplianceSubscribeActions';

interface FleetComplianceExpiredGateProps {
  trialEndsAt: Date | null;
  accessState?: 'trial_expired' | 'canceled';
  dataDeletionScheduledAt?: Date | null;
}

function formatDate(value: Date | null): string {
  if (!value) return 'Unknown';
  return value.toISOString().slice(0, 10);
}

export default function FleetComplianceExpiredGate({
  trialEndsAt,
  accessState = 'trial_expired',
  dataDeletionScheduledAt = null,
}: FleetComplianceExpiredGateProps) {
  const isCanceled = accessState === 'canceled';
  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID?.trim() ?? '';
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID?.trim() ?? '';

  return (
    <main className="fleet-compliance-shell">
      <section className="fleet-compliance-section fleet-compliance-expired-card">
        <p className="fleet-compliance-eyebrow">{isCanceled ? 'Plan Canceled' : 'Plan Required'}</p>
        <h1>{isCanceled ? 'Fleet-Compliance access has been canceled' : 'Fleet-Compliance trial has expired'}</h1>
        <p className="fleet-compliance-subcopy">
          {isCanceled ? (
            <>
              Access to Fleet-Compliance is blocked because your organization plan is canceled.
              Scheduled deletion date: <strong>{formatDate(dataDeletionScheduledAt)}</strong>.
            </>
          ) : (
            <>
              Access to Fleet-Compliance is blocked until billing is active.
              Trial end date: <strong>{formatDate(trialEndsAt)}</strong>.
            </>
          )}
        </p>
        <p className="fleet-compliance-subcopy">
          Select a plan to reactivate access immediately:
          Starter (<strong>$149/mo</strong>) or Professional (<strong>$299/mo</strong>).
        </p>
        <FleetComplianceSubscribeActions
          starterPriceId={starterPriceId}
          proPriceId={proPriceId}
        />
        <div className="fleet-compliance-action-row">
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}
