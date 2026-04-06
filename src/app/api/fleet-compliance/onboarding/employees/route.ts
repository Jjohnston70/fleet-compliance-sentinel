import { auditLog } from '@/lib/audit-logger';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { isPgUniqueViolation, readIdempotencyKey, toOnboardingEmployeeInput } from '@/lib/onboarding/http';
import { createOnboardingService, OnboardingServiceError } from '@/lib/onboarding/service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const onboardingService = createOnboardingService();

export async function POST(request: Request) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const employee = toOnboardingEmployeeInput(payload);
    const result = await onboardingService.createEmployeeAndStartRun({
      context,
      employee,
      idempotencyKey: readIdempotencyKey(request),
    });

    auditLog({
      action: 'data.write',
      userId: context.userId,
      orgId: context.orgId,
      resourceType: 'fleet-compliance.onboarding.employee',
      resourceId: result.employeeProfile.id,
      metadata: {
        runCreated: true,
        isDriver: result.employeeProfile.isDriver,
        hazmatRequired: result.employeeProfile.hazmatRequired,
      },
    });

    await recordOrgAuditEvent({
      orgId: context.orgId,
      eventType: 'employee.profile.created',
      actorUserId: context.userId,
      actorType: 'user',
      metadata: {
        employeeProfileId: result.employeeProfile.id,
        runId: result.run.id,
        source: result.run.source,
      },
    });

    return Response.json(
      {
        ok: true,
        employeeProfile: result.employeeProfile,
        run: result.run,
        steps: result.steps,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof OnboardingServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    if (isPgUniqueViolation(error)) {
      return Response.json(
        { error: 'Employee profile conflicts with an existing unique employee identifier' },
        { status: 409 },
      );
    }

    console.error('[onboarding-employees-post] failed:', error);
    auditLog({
      action: 'data.write',
      userId: context.userId,
      orgId: context.orgId,
      resourceType: 'fleet-compliance.onboarding.employee',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Failed to create onboarding employee profile' }, { status: 500 });
  }
}
