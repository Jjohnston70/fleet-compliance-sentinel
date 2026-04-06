import { auditLog } from '@/lib/audit-logger';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { processOnboardingOutboxBatch } from '@/lib/onboarding/outbox-worker';
import { reconcileUnsyncedOnboardingTasks } from '@/lib/onboarding/adapters/task-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const reconciled = await reconcileUnsyncedOnboardingTasks({
      orgId: context.orgId,
      limit: 100,
    });
    const processed = await processOnboardingOutboxBatch({
      limit: 100,
    });

    auditLog({
      action: 'data.write',
      userId: context.userId,
      orgId: context.orgId,
      resourceType: 'fleet-compliance.onboarding.outbox',
      metadata: {
        reconciledTaskCount: reconciled.queued,
        outboxProcessed: processed.processed,
        outboxRetried: processed.retried,
        outboxFailed: processed.failed,
      },
    });

    await recordOrgAuditEvent({
      orgId: context.orgId,
      eventType: 'employee.onboarding.step.requested',
      actorUserId: context.userId,
      actorType: 'user',
      metadata: {
        action: 'onboarding.outbox.process',
        reconciledTaskCount: reconciled.queued,
        outboxSummary: { ...processed },
      },
    });

    return Response.json({
      ok: true,
      reconciled,
      processed,
    });
  } catch (error: unknown) {
    console.error('[onboarding-outbox-process-post] failed:', error);
    return Response.json({ error: 'Failed to process onboarding outbox' }, { status: 500 });
  }
}
