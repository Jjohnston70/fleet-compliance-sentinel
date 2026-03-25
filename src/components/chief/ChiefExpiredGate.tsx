import Link from 'next/link';

interface ChiefExpiredGateProps {
  trialEndsAt: Date | null;
}

function formatDate(value: Date | null): string {
  if (!value) return 'Unknown';
  return value.toISOString().slice(0, 10);
}

export default function ChiefExpiredGate({ trialEndsAt }: ChiefExpiredGateProps) {
  return (
    <main className="chief-shell">
      <section className="chief-section chief-expired-card">
        <p className="chief-eyebrow">Plan Required</p>
        <h1>Chief trial has expired</h1>
        <p className="chief-subcopy">
          Access to Chief is blocked until billing is active.
          Trial end date: <strong>{formatDate(trialEndsAt)}</strong>.
        </p>
        <div className="chief-action-row">
          <Link href="https://www.truenorthstrategyops.com/contact" className="btn-primary">
            Contact Sales
          </Link>
          <Link href="/" className="btn-secondary">
            Return Home
          </Link>
        </div>
      </section>
    </main>
  );
}

