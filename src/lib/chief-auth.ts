import { auth } from '@clerk/nextjs/server';
import { setSentryRequestContext } from '@/lib/sentry-context';

export class ChiefAuthError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ChiefAuthError';
    this.status = status;
  }
}

type ChiefRole = 'admin' | 'member';

function assertRequestShape(request: Request) {
  if (!request || typeof request.headers?.get !== 'function') {
    throw new ChiefAuthError(401, 'Unauthorized');
  }
}

function normalizeRole(value: unknown): ChiefRole | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  if (canonical === 'admin') return 'admin';
  if (canonical === 'member') return 'member';
  return null;
}

function resolveOrgRole(sessionClaims: any): ChiefRole {
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

export async function requireChiefOrg(request: Request): Promise<{
  userId: string;
  orgId: string;
}> {
  assertRequestShape(request);
  const { userId, orgId } = await auth();

  if (!userId) {
    throw new ChiefAuthError(401, 'Unauthorized');
  }
  if (!orgId) {
    throw new ChiefAuthError(403, 'Forbidden');
  }

  setSentryRequestContext(userId, orgId);

  return { userId, orgId };
}

export async function requireChiefOrgWithRole(
  request: Request,
  requiredRole: 'admin' | 'member'
): Promise<{ userId: string; orgId: string }> {
  assertRequestShape(request);
  const { userId, orgId, sessionClaims } = await auth();

  if (!userId) {
    throw new ChiefAuthError(401, 'Unauthorized');
  }
  if (!orgId) {
    throw new ChiefAuthError(403, 'Forbidden');
  }

  if (requiredRole === 'admin') {
    const role = resolveOrgRole(sessionClaims);
    if (role !== 'admin') {
      throw new ChiefAuthError(403, 'Forbidden');
    }
  }

  setSentryRequestContext(userId, orgId);

  return { userId, orgId };
}

export function chiefAuthErrorResponse(error: unknown): Response | null {
  if (error instanceof ChiefAuthError) {
    return Response.json({ error: error.message }, { status: error.status });
  }
  return null;
}
