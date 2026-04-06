import {
  FleetComplianceAuthError,
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { getOrgModules } from '@/lib/modules';

export class OnboardingGuardError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'OnboardingGuardError';
    this.status = status;
  }
}

export interface OnboardingRequestContext {
  userId: string;
  orgId: string;
}

async function requireModuleEnabled(orgId: string, moduleId: string): Promise<void> {
  const enabledModules = await getOrgModules(orgId);
  if (!enabledModules.includes(moduleId)) {
    throw new OnboardingGuardError(403, `Module '${moduleId}' is disabled for this organization`);
  }
}

export async function requireOnboardingAdminContext(request: Request): Promise<OnboardingRequestContext> {
  const authContext = await requireFleetComplianceOrgContext(request);
  if (authContext.role !== 'admin') {
    throw new FleetComplianceAuthError(403, 'Forbidden');
  }

  await requireModuleEnabled(authContext.orgId, 'onboarding');
  return {
    userId: authContext.userId,
    orgId: authContext.orgId,
  };
}

export function onboardingGuardErrorResponse(error: unknown): Response | null {
  const authError = fleetComplianceAuthErrorResponse(error);
  if (authError) return authError;

  if (error instanceof OnboardingGuardError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
