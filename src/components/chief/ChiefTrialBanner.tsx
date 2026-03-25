import Link from 'next/link';

interface ChiefTrialBannerProps {
  trialEndsAt: Date | null;
}

function getDaysRemaining(trialEndsAt: Date | null): number | null {
  if (!trialEndsAt) return null;
  const now = Date.now();
  const diffMs = trialEndsAt.getTime() - now;
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return Number.isFinite(days) ? days : null;
}

export default function ChiefTrialBanner({ trialEndsAt }: ChiefTrialBannerProps) {
  const daysRemaining = getDaysRemaining(trialEndsAt);
  if (daysRemaining === null) return null;
  if (daysRemaining < 0) return null;

  return (
    <section className="chief-trial-banner" role="status" aria-live="polite">
      <strong>Trial:</strong> {daysRemaining} day{daysRemaining === 1 ? '' : 's'} remaining.
      {' '}
      <Link href="/chief/settings/alerts">Review settings</Link>
      {' '}or contact sales before trial expiration.
    </section>
  );
}

