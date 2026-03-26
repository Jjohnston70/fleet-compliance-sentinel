import { auth } from '@clerk/nextjs/server';
import { setSentryRequestContext } from '@/lib/sentry-context';
import { getOrgPlan } from '@/lib/plan-gate';

export class FleetComplianceAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'FleetComplianceAuthError';
    this.status = status;
  }
}

type FleetComplianceRole = 'admin' | 'member';

function assertRequestShape(request: Request) {
  if (!request || typeof request.headers?.get !== 'function') {
    throw new FleetComplianceAuthError(401, 'Unauthorized');
  }
}

function normalizeRole(value: unknown): FleetComplianceRole | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  if (canonical === 'admin') return 'admin';
  if (canonical === 'member') return 'member';
  return null;
}

function resolveOrgRole(sessionClaims: any): FleetComplianceRole {
  const candidates = [
    sessionClaims?.org_role,
    sessionClaims?.orgRole,
    sessionClaims?.o?.rol,
  ];

  for (const candidate of candidates) {
    const role = normalizeRole(candidate);
    if (role) return role;
  }

  return 'member';
}

export async function requireFleetComplianceOrg(
  request: Request,
  options: { allowCanceled?: boolean } = {},
): Promise<{
  userId: string;
  orgId: string;
}> {
  assertRequestShape(request);
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new FleetComplianceAuthError(401, 'Unauthorized');
  }
  if (!orgId) {
    throw new FleetComplianceAuthError(403, 'Forbidden');
  }
  const plan = await getOrgPlan(orgId);
  if (!options.allowCanceled && plan.accessState === 'canceled') {
    throw new FleetComplianceAuthError(403, 'Organization access is canceled');
  }

  setSentryRequestContext(userId, orgId);

  return { userId, orgId };
}

export async function requireFleetComplianceOrgWithRole(
  request: Request,
  requiredRole: 'admin' | 'member',
  options: { allowCanceled?: boolean } = {},
): Promise<{ userId: string; orgId: string }> {
  assertRequestShape(request);
  const { userId, orgId, sessionClaims } = await auth();

  if (!userId) {
    throw new FleetComplianceAuthError(401, 'Unauthorized');
  }
  if (!orgId) {
    throw new FleetComplianceAuthError(403, 'Forbidden');
  }
  const plan = await getOrgPlan(orgId);
  if (!options.allowCanceled && plan.accessState === 'canceled') {
    throw new FleetComplianceAuthError(403, 'Organization access is canceled');
  }

  if (requiredRole === 'admin') {
    const role = resolveOrgRole(sessionClaims);
    if (role !== 'admin') {
      throw new FleetComplianceAuthError(403, 'Forbidden');
    }
  }

  setSentryRequestContext(userId, orgId);

  return { userId, orgId };
}

export function fleetComplianceAuthErrorResponse(error: unknown): Response | null {
  if (error instanceof FleetComplianceAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
