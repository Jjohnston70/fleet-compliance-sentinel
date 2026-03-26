import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { isClerkEnabled } from '@/lib/clerk';
import { ensureOrgProvisioned } from '@/lib/org-provisioner';
import { getOrgPlan } from '@/lib/plan-gate';
import FleetComplianceTrialBanner from '@/components/fleet-compliance/FleetComplianceTrialBanner';
import FleetComplianceExpiredGate from '@/components/fleet-compliance/FleetComplianceExpiredGate';
import FleetComplianceOnboardingRedirect from '@/components/fleet-compliance/FleetComplianceOnboardingRedirect';

export const dynamic = 'force-dynamic';

export default async function FleetComplianceLayout({ children }: { children: React.ReactNode }) {
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
  const organization = await ensureOrgProvisioned(orgId, fallbackOrgName, {
    adminUserId: userId,
  });
  const plan = await getOrgPlan(orgId);

  if (!plan.isActive) {
    return (
      <FleetComplianceExpiredGate
        trialEndsAt={plan.trialEndsAt}
        accessState={plan.accessState === 'canceled' ? 'canceled' : 'trial_expired'}
        dataDeletionScheduledAt={plan.dataDeletionScheduledAt}
      />
    );
  }

  return (
    <>
      {plan.plan === 'trial' && <FleetComplianceTrialBanner trialEndsAt={plan.trialEndsAt} />}
      <FleetComplianceOnboardingRedirect onboardingComplete={organization.onboardingComplete}>
        {children}
      </FleetComplianceOnboardingRedirect>
    </>
  );
}
