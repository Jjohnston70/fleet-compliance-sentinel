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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ employeeProfileId: string }> },
) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { employeeProfileId } = await params;
  if (!employeeProfileId?.trim()) {
    return Response.json({ error: 'employeeProfileId is required' }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const employee = toOnboardingEmployeeInput(payload);
    const result = await onboardingService.updateEmployeeAndStartRun({
      context,
      employeeProfileId,
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
        update: true,
      },
    });

    await recordOrgAuditEvent({
      orgId: context.orgId,
      eventType: 'employee.profile.updated',
      actorUserId: context.userId,
      actorType: 'user',
      metadata: {
        employeeProfileId: result.employeeProfile.id,
        runId: result.run.id,
        source: result.run.source,
      },
    });

    return Response.json({
      ok: true,
      employeeProfile: result.employeeProfile,
      run: result.run,
      steps: result.steps,
    });
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

    console.error('[onboarding-employees-patch] failed:', error);
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
    return Response.json({ error: 'Failed to update onboarding employee profile' }, { status: 500 });
  }
}
