import { auditLog } from '@/lib/audit-logger';
import { toOnboardingEmployeeInput } from '@/lib/onboarding/http';
import { onboardingIntakeService, OnboardingIntakeError } from '@/lib/onboarding/intake-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;
    const lookup = await onboardingIntakeService.lookupByToken(token);
    return Response.json({
      ok: true,
      orgId: lookup.orgId,
      employeeProfile: lookup.employeeProfile,
      inviteAfterIntake: lookup.inviteAfterIntake,
      intakeEmail: lookup.intakeEmail,
      expiresAt: lookup.expiresAt,
      status: lookup.status,
    });
  } catch (error: unknown) {
    if (error instanceof OnboardingIntakeError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('[onboarding-intake-token-get] failed:', error);
    return Response.json({ error: 'Failed to resolve intake token' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  try {
    const { token } = await params;
    const body = asObject(payload);
    const source = body.employee && typeof body.employee === 'object' ? body.employee : body;
    const employee = toOnboardingEmployeeInput(source);
    const result = await onboardingIntakeService.submitWithToken({
      token,
      employee,
    });

    auditLog({
      action: 'data.write',
      userId: 'token-intake',
      orgId: result.detail.run.orgId,
      resourceType: 'fleet-compliance.onboarding.intake',
      resourceId: result.detail.run.id,
      metadata: {
        runId: result.detail.run.id,
        employeeProfileId: result.detail.employeeProfile.id,
        inviteSent: result.inviteResult?.status === 'completed',
      },
    });

    return Response.json({
      ok: true,
      run: result.detail.run,
      employeeProfile: result.detail.employeeProfile,
      steps: result.detail.steps,
      inviteResult: result.inviteResult,
    });
  } catch (error: unknown) {
    if (error instanceof OnboardingIntakeError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('[onboarding-intake-token-post] failed:', error);
    return Response.json({ error: 'Failed to submit onboarding intake' }, { status: 500 });
  }
}
