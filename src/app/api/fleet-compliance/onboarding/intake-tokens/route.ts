import { auditLog } from '@/lib/audit-logger';
import {
  onboardingGuardErrorResponse,
  requireOnboardingAdminContext,
} from '@/lib/onboarding/guards';
import { onboardingIntakeService, OnboardingIntakeError } from '@/lib/onboarding/intake-service';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function asObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
  return {};
}

function optionalString(value: unknown, maxLength = 320): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function optionalNumber(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function boolOrDefault(value: unknown, fallback: boolean): boolean {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return fallback;
}

export async function POST(request: Request) {
  let context: { userId: string; orgId: string };
  try {
    context = await requireOnboardingAdminContext(request);
  } catch (error: unknown) {
    const guarded = onboardingGuardErrorResponse(error);
    if (guarded) return guarded;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    body = asObject(await request.json());
  } catch {
    body = {};
  }

  try {
    const result = await onboardingIntakeService.issueToken({
      orgId: context.orgId,
      userId: context.userId,
      employeeProfileId: optionalString(body.employeeProfileId, 128),
      intakeEmail: optionalString(body.intakeEmail, 320),
      expiresInHours: optionalNumber(body.expiresInHours),
      inviteAfterIntake: boolOrDefault(body.inviteAfterIntake, true),
      inviteOverrideAllowed: boolOrDefault(body.inviteOverrideAllowed, true),
      metadata: asObject(body.metadata),
    });

    auditLog({
      action: 'data.write',
      userId: context.userId,
      orgId: context.orgId,
      resourceType: 'fleet-compliance.onboarding.intake-token',
      metadata: {
        employeeProfileId: result.employeeProfile?.id || '',
        expiresAt: result.expiresAt,
      },
    });

    return Response.json({
      ok: true,
      token: result.token,
      intakeUrl: result.intakeUrl,
      expiresAt: result.expiresAt,
      employeeProfile: result.employeeProfile,
    });
  } catch (error: unknown) {
    if (error instanceof OnboardingIntakeError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error('[onboarding-intake-tokens-post] failed:', error);
    return Response.json({ error: 'Failed to issue intake token' }, { status: 500 });
  }
}
