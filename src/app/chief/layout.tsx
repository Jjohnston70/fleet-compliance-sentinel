import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureOrgProvisioned } from '@/lib/org-provisioner';
import { getOrgPlan } from '@/lib/plan-gate';
import ChiefTrialBanner from '@/components/chief/ChiefTrialBanner';
import ChiefExpiredGate from '@/components/chief/ChiefExpiredGate';
import ChiefOnboardingRedirect from '@/components/chief/ChiefOnboardingRedirect';

export const dynamic = 'force-dynamic';

export default async function ChiefLayout({ children }: { children: React.ReactNode }) {
  if (!isClerkEnabled()) {
    return <>{children}</>;
  }

  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) redirect('/sign-in');
  if (!orgId) redirect('/');

  const claimedOrgName = typeof sessionClaims?.org_name === 'string'
    ? sessionClaims.org_name
    : '';
  const fallbackOrgName = claimedOrgName || `Organization ${orgId}`;
  const organization = await ensureOrgProvisioned(orgId, fallbackOrgName);
  const plan = await getOrgPlan(orgId);

  if (!plan.isActive) {
    return <ChiefExpiredGate trialEndsAt={plan.trialEndsAt} />;
  }

  return (
    <>
      {plan.plan === 'trial' && <ChiefTrialBanner trialEndsAt={plan.trialEndsAt} />}
      <ChiefOnboardingRedirect onboardingComplete={organization.onboardingComplete}>
        {children}
      </ChiefOnboardingRedirect>
    </>
  );
}

