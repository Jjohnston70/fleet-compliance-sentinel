import { auditLog } from '@/lib/audit-logger';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { createOnboardingService, OnboardingServiceError } from '@/lib/onboarding/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const onboardingService = createOnboardingService();

function normalizeStepKeys(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => (typeof entry === 'string' ? entry.trim() : ''))
    .filter(Boolean)
    .slice(0, 25);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { runId } = await params;
  let stepKeys: string[] = [];
  try {
    const body = await request.json();
    stepKeys = normalizeStepKeys((body as { stepKeys?: unknown })?.stepKeys);
  } catch {
    stepKeys = [];
  }

  try {
    const detail = await onboardingService.retryRun({
      context,
      runId,
      stepKeys,
    });

    auditLog({
      action: 'data.write',
      userId: context.userId,
      orgId: context.orgId,
      resourceType: 'fleet-compliance.onboarding.run',
      resourceId: detail.run.id,
      metadata: {
        retry: true,
        requestedStepCount: stepKeys.length,
      },
    });

    await recordOrgAuditEvent({
      orgId: context.orgId,
      eventType: 'employee.onboarding.step.requested',
      actorUserId: context.userId,
      actorType: 'user',
      metadata: {
        runId: detail.run.id,
        requestedStepCount: stepKeys.length,
      },
    });

    return Response.json({
      ok: true,
      ...detail,
    });
  } catch (error: unknown) {
    if (error instanceof OnboardingServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('[onboarding-runs-retry-post] failed:', error);
    return Response.json({ error: 'Failed to retry onboarding run' }, { status: 500 });
  }
}
