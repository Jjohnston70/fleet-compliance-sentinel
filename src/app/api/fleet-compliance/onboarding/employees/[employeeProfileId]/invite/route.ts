import { auditLog } from '@/lib/audit-logger';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { getEmployeeProfileById } from '@/lib/onboarding/repository';
import { sendOnboardingInvite } from '@/lib/onboarding/adapters/invite-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function optionalString(value: unknown, maxLength = 320): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

export async function POST(
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

  let body: Record<string, unknown> = {};
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    body = {};
  }

  const profile = await getEmployeeProfileById({
    orgId: context.orgId,
    employeeProfileId,
  });
  if (!profile) {
    return Response.json({ error: 'Employee profile not found' }, { status: 404 });
  }

  const redirectUrl = optionalString(body.redirectUrl, 1000);
  const emailAddress = optionalString(body.emailAddress, 320) || profile.workEmail;
  const inviteResult = await sendOnboardingInvite({
    emailAddress,
    redirectUrl,
    publicMetadata: {
      orgId: context.orgId,
      employeeProfileId: profile.id,
      invitedBy: context.userId,
      source: 'admin.override',
    },
  });

  auditLog({
    action: 'data.write',
    userId: context.userId,
    orgId: context.orgId,
    resourceType: 'fleet-compliance.onboarding.employee-invite',
    resourceId: profile.id,
    metadata: {
      inviteStatus: inviteResult.status,
      inviteReason: inviteResult.reason ?? '',
    },
  });

  await recordOrgAuditEvent({
    orgId: context.orgId,
    eventType: 'employee.profile.invited',
    actorUserId: context.userId,
    actorType: 'user',
    metadata: {
      employeeProfileId: profile.id,
      invitationId: inviteResult.invitationId || null,
      status: inviteResult.status,
      reason: inviteResult.reason,
      source: 'admin.override',
    },
  });

  const status = inviteResult.status === 'completed' ? 200
    : inviteResult.status === 'skipped' ? 422
      : 500;
  return Response.json(
    {
      ok: inviteResult.status === 'completed',
      inviteResult,
      employeeProfileId: profile.id,
    },
    { status },
  );
}
