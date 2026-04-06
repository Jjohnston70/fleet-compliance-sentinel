import { auth } from '@clerk/nextjs/server';
import { setSentryRequestContext } from '@/lib/sentry-context';
import { getOrgPlan } from '@/lib/plan-gate';
import { isClerkEnabled } from '@/lib/clerk';

export class FleetComplianceAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'FleetComplianceAuthError';
    this.status = status;
  }
}

type FleetComplianceRole = 'admin' | 'member';

export interface FleetComplianceAuthContext {
  userId: string;
  orgId: string;
  role: FleetComplianceRole;
}

function shouldBypassAuthForLocalDev(): boolean {
  return !isClerkEnabled() && process.env.NODE_ENV !== 'production';
}

function getLocalDevAuthContext(): FleetComplianceAuthContext {
  const orgId = (process.env.LOCAL_DEV_ORG_ID || process.env.DEV_ORG_ID || 'org_local_dev').trim();
  const userId = (process.env.LOCAL_DEV_USER_ID || process.env.DEV_USER_ID || 'user_local_dev').trim();
  return {
    orgId: orgId || 'org_local_dev',
    userId: userId || 'user_local_dev',
    role: 'admin',
  };
}

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

export function resolveFleetComplianceRole(sessionClaims: any): FleetComplianceRole {
  return resolveOrgRole(sessionClaims);
}

export async function requireFleetComplianceOrg(
  request: Request,
  options: { allowCanceled?: boolean } = {},
): Promise<{
  userId: string;
  orgId: string;
}> {
  assertRequestShape(request);
  if (shouldBypassAuthForLocalDev()) {
    const ctx = getLocalDevAuthContext();
    setSentryRequestContext(ctx.userId, ctx.orgId);
    return { userId: ctx.userId, orgId: ctx.orgId };
  }
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

export async function requireFleetComplianceOrgContext(
  request: Request,
  options: { allowCanceled?: boolean } = {},
): Promise<FleetComplianceAuthContext> {
  assertRequestShape(request);
  if (shouldBypassAuthForLocalDev()) {
    const ctx = getLocalDevAuthContext();
    setSentryRequestContext(ctx.userId, ctx.orgId);
    return ctx;
  }
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

  const role = resolveOrgRole(sessionClaims);
  setSentryRequestContext(userId, orgId);
  return { userId, orgId, role };
}

export async function requireFleetComplianceOrgWithRole(
  request: Request,
  requiredRole: 'admin' | 'member',
  options: { allowCanceled?: boolean } = {},
): Promise<{ userId: string; orgId: string }> {
  assertRequestShape(request);
  if (shouldBypassAuthForLocalDev()) {
    const ctx = getLocalDevAuthContext();
    if (requiredRole === 'admin' && ctx.role !== 'admin') {
      throw new FleetComplianceAuthError(403, 'Forbidden');
    }
    setSentryRequestContext(ctx.userId, ctx.orgId);
    return { userId: ctx.userId, orgId: ctx.orgId };
  }
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
