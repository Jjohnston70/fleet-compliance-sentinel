import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import { recordTrialStateIfChanged } from '@/lib/org-audit';

export async function getOrgPlan(orgId: string): Promise<{
  plan: string;
  isTrialActive: boolean;
  trialEndsAt: Date | null;
  dataDeletionScheduledAt: Date | null;
  accessState: 'active' | 'trial_expired' | 'canceled';
  isActive: boolean;
}> {
  await ensureOrgScopingTables();
  const sql = getSQL();

  const orgRows = await sql`
    SELECT plan, trial_ends_at, data_deletion_scheduled_at
    FROM organizations
    WHERE id = ${orgId}
    LIMIT 1
  `;
  const org = orgRows[0] as Record<string, unknown> | undefined;

  const subscriptionRows = await sql`
    SELECT plan, status, current_period_ends_at
    FROM subscriptions
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const subscription = subscriptionRows[0] as Record<string, unknown> | undefined;

  const trialEndsAt = org?.trial_ends_at ? new Date(String(org.trial_ends_at)) : null;
  const dataDeletionScheduledAt = org?.data_deletion_scheduled_at
    ? new Date(String(org.data_deletion_scheduled_at))
    : null;
  const now = new Date();
  const isTrialActive = Boolean(
    trialEndsAt &&
    !Number.isNaN(trialEndsAt.getTime()) &&
    trialEndsAt.getTime() >= now.getTime()
  );

  const subscriptionStatus = String(subscription?.status ?? '').toLowerCase();
  const orgPlan = String(org?.plan ?? 'trial').toLowerCase();
  const isCanceled = orgPlan === 'canceled'
    || ['canceled', 'cancelled', 'unpaid', 'incomplete_expired'].includes(subscriptionStatus);
  const hasActiveSubscription = ['active', 'trialing', 'past_due'].includes(subscriptionStatus);
  const effectivePlan = isCanceled ? 'canceled' : String(subscription?.plan ?? org?.plan ?? 'trial');
  const isActive = !isCanceled && (hasActiveSubscription || isTrialActive);
  const accessState: 'active' | 'trial_expired' | 'canceled' = isCanceled
    ? 'canceled'
    : isActive
      ? 'active'
      : 'trial_expired';

  // Track lifecycle transitions for SOC 2 audit evidence.
  // Fail-open to avoid blocking UI if audit write fails.
  if (effectivePlan === 'trial') {
    try {
      await recordTrialStateIfChanged({
        orgId,
        plan: effectivePlan,
        isTrialActive,
        isActive,
        trialEndsAt: trialEndsAt && !Number.isNaN(trialEndsAt.getTime()) ? trialEndsAt : null,
      });
    } catch {
      // no-op
    }
  }

  return {
    plan: effectivePlan,
    isTrialActive,
    trialEndsAt: trialEndsAt && !Number.isNaN(trialEndsAt.getTime()) ? trialEndsAt : null,
    dataDeletionScheduledAt: dataDeletionScheduledAt && !Number.isNaN(dataDeletionScheduledAt.getTime())
      ? dataDeletionScheduledAt
      : null,
    accessState,
    isActive,
  };
}
