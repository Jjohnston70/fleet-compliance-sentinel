import { auth } from '@clerk/nextjs/server';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  enableModule,
  disableModule,
  getOrgModules,
  getModuleCatalog,
  getModulesByPlan,
} from '@/lib/modules';
import {
  evaluateModuleGatewayAcl,
  upsertModuleGatewayAclRules,
} from '@/lib/modules-gateway/persistence';
import { listModuleCatalog } from '@/lib/modules-gateway/runner';
import { isPlatformAdminUser } from '@/lib/platform-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORG_WIDE_ACL_USER_ID = '*';

type AccessScope = 'platform' | 'org_admin';

interface ToggleAccessContext {
  scope: AccessScope;
  userId: string;
  orgId: string | null;
}

interface ModuleGatewayToggleItem {
  moduleId: string;
  displayName: string;
  runtime: string;
  actionCount: number;
  enabled: boolean;
}

function normalizeRole(value: unknown): 'admin' | 'member' | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return null;
  const parts = trimmed.split(':').filter(Boolean);
  const canonical = parts.length > 0 ? parts[parts.length - 1] : trimmed;
  if (canonical === 'admin') return 'admin';
  if (canonical === 'member') return 'member';
  return null;
}

function resolveOrgRole(sessionClaims: any): 'admin' | 'member' {
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

async function resolveToggleAccess(): Promise<ToggleAccessContext> {
  const { userId, orgId, sessionClaims } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }

  if (isPlatformAdminUser(userId)) {
    return {
      scope: 'platform',
      userId,
      orgId: typeof orgId === 'string' && orgId.trim() ? orgId : null,
    };
  }

  if (!orgId) {
    throw new Error('FORBIDDEN');
  }

  const role = resolveOrgRole(sessionClaims);
  if (role !== 'admin') {
    throw new Error('FORBIDDEN');
  }

  return {
    scope: 'org_admin',
    userId,
    orgId,
  };
}

function resolveEffectiveOrgId(
  access: ToggleAccessContext,
  requestedOrgId: string | null,
): string {
  const normalizedRequestedOrgId = typeof requestedOrgId === 'string' ? requestedOrgId.trim() : '';

  if (access.scope === 'platform') {
    if (normalizedRequestedOrgId) return normalizedRequestedOrgId;
    return access.orgId ?? '';
  }

  if (!access.orgId) {
    throw new Error('FORBIDDEN');
  }

  if (normalizedRequestedOrgId && normalizedRequestedOrgId !== access.orgId) {
    throw new Error('FORBIDDEN');
  }

  return access.orgId;
}

async function listGatewayModuleToggles(orgId: string): Promise<ModuleGatewayToggleItem[]> {
  const catalog = listModuleCatalog()
    .filter((entry) => entry.moduleId !== 'command-center')
    .sort((a, b) => a.displayName.localeCompare(b.displayName));

  const toggles: ModuleGatewayToggleItem[] = [];
  for (const moduleEntry of catalog) {
    const moduleDecision = await evaluateModuleGatewayAcl({
      orgId,
      userId: ORG_WIDE_ACL_USER_ID,
      moduleId: moduleEntry.moduleId,
      permission: 'execute',
    });

    const actionDecisions = await Promise.all(
      moduleEntry.actions.map((action) => evaluateModuleGatewayAcl({
        orgId,
        userId: ORG_WIDE_ACL_USER_ID,
        moduleId: moduleEntry.moduleId,
        actionId: action.actionId,
        permission: 'execute',
      })),
    );

    const actionEnabled = actionDecisions.some((decision) => decision.allowed);

    toggles.push({
      moduleId: moduleEntry.moduleId,
      displayName: moduleEntry.displayName,
      runtime: moduleEntry.runtime,
      actionCount: moduleEntry.actions.length,
      enabled: moduleDecision.allowed || actionEnabled,
    });
  }

  return toggles;
}

function errorResponse(error: unknown): Response {
  if (error instanceof Error) {
    if (error.message === 'UNAUTHORIZED') {
      return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
    }
    if (error.message === 'FORBIDDEN') {
      return Response.json({ ok: false, error: 'Forbidden' }, { status: 403 });
    }
  }
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : 'Internal error' },
    { status: 500 },
  );
}

/**
 * GET /api/fleet-compliance/dev/modules?orgId=xxx
 *
 * Returns:
 * - App module catalog + org toggles (`modules.ts`)
 * - Gateway module ACL toggles (`modules-gateway`)
 */
export async function GET(request: Request) {
  let access: ToggleAccessContext;
  try {
    access = await resolveToggleAccess();
  } catch (error) {
    return errorResponse(error);
  }

  const url = new URL(request.url);
  const requestedOrgId = url.searchParams.get('orgId');

  let effectiveOrgId = '';
  try {
    effectiveOrgId = resolveEffectiveOrgId(access, requestedOrgId);
  } catch (error) {
    return errorResponse(error);
  }

  try {
    const sql = getSQL();
    const catalog = await getModuleCatalog();

    let orgs: Array<{ id: string; name: string; plan: string }> = [];
    if (access.scope === 'platform') {
      const orgRows = await sql`
        SELECT id, name, plan
        FROM organizations
        ORDER BY name ASC
      `;
      orgs = orgRows.map((row) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        plan: String(row.plan ?? 'trial'),
      }));
    } else if (access.orgId) {
      const orgRows = await sql`
        SELECT id, name, plan
        FROM organizations
        WHERE id = ${access.orgId}
        LIMIT 1
      `;
      orgs = orgRows.map((row) => ({
        id: String(row.id ?? ''),
        name: String(row.name ?? ''),
        plan: String(row.plan ?? 'trial'),
      }));
      if (orgs.length === 0) {
        orgs = [{
          id: access.orgId,
          name: 'Current Organization',
          plan: 'trial',
        }];
      }
    }

    let enabledModules: string[] = [];
    let planDefaults: string[] = [];
    let moduleGatewayModules: ModuleGatewayToggleItem[] = [];

    if (effectiveOrgId) {
      enabledModules = await getOrgModules(effectiveOrgId);
      const orgRow = orgs.find((o) => o.id === effectiveOrgId);
      planDefaults = getModulesByPlan(orgRow?.plan ?? 'trial');
      moduleGatewayModules = access.scope === 'platform'
        ? await listGatewayModuleToggles(effectiveOrgId)
        : [];
    }

    let recentToggles: Array<Record<string, unknown>> = [];
    if (effectiveOrgId) {
      const toggleRows = await sql`
        SELECT
          om.module_id,
          om.enabled,
          om.enabled_at,
          om.enabled_by,
          m.name AS module_name
        FROM org_modules om
        JOIN modules m ON m.id = om.module_id
        WHERE om.org_id = ${effectiveOrgId}
        ORDER BY om.enabled_at DESC
        LIMIT 20
      `;
      recentToggles = toggleRows.map((row) => ({
        moduleId: String(row.module_id ?? ''),
        moduleName: String(row.module_name ?? ''),
        enabled: row.enabled === true || row.enabled === 'true',
        enabledAt: String(row.enabled_at ?? ''),
        enabledBy: row.enabled_by ? String(row.enabled_by) : null,
      }));
    }

    return Response.json({
      ok: true,
      catalog,
      orgs,
      selectedOrgId: effectiveOrgId,
      enabledModules,
      planDefaults,
      recentToggles,
      moduleGatewayModules,
      accessScope: access.scope,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/fleet-compliance/dev/modules
 *
 * Access:
 * - Platform admin only (all write operations)
 *
 * Body:
 * - { orgId, moduleId, enabled }                  -> toggle app module
 * - { orgId, action: 'reset' }                    -> reset app modules to plan defaults
 * - { orgId, kind: 'module-gateway', moduleId, enabled } -> toggle gateway module ACL
 */
export async function POST(request: Request) {
  let access: ToggleAccessContext;
  try {
    access = await resolveToggleAccess();
  } catch (error) {
    return errorResponse(error);
  }

  if (access.scope !== 'platform') {
    return Response.json(
      { ok: false, error: 'Feature module changes are restricted to platform admins' },
      { status: 403 },
    );
  }

  try {
    const body = await request.json();
    const requestedOrgId = typeof body.orgId === 'string' ? body.orgId.trim() : '';
    if (!requestedOrgId) {
      return Response.json({ ok: false, error: 'orgId is required for platform requests' }, { status: 400 });
    }

    let orgId = '';
    try {
      orgId = resolveEffectiveOrgId(access, requestedOrgId || null);
    } catch (error) {
      return errorResponse(error);
    }

    if (!orgId) {
      return Response.json({ ok: false, error: 'orgId is required' }, { status: 400 });
    }

    if (body.kind === 'module-gateway') {
      const moduleId = typeof body.moduleId === 'string' ? body.moduleId.trim() : '';
      const enabled = body.enabled === true;
      if (!moduleId) {
        return Response.json({ ok: false, error: 'moduleId is required' }, { status: 400 });
      }

      const moduleEntry = listModuleCatalog().find((entry) => entry.moduleId === moduleId);
      if (!moduleEntry) {
        return Response.json({ ok: false, error: 'Unknown gateway module' }, { status: 400 });
      }

      const rules = [
        {
          orgId,
          userId: ORG_WIDE_ACL_USER_ID,
          scopeType: 'module' as const,
          scopeKey: moduleEntry.moduleId,
          canView: enabled,
          canExecute: enabled,
        },
        ...moduleEntry.actions.map((action) => ({
          orgId,
          userId: ORG_WIDE_ACL_USER_ID,
          scopeType: 'action' as const,
          scopeKey: `${moduleEntry.moduleId}:${action.actionId}`,
          canView: enabled,
          canExecute: enabled,
        })),
      ];

      await upsertModuleGatewayAclRules({ orgId, rules });
      return Response.json({
        ok: true,
        kind: 'module-gateway',
        moduleId: moduleEntry.moduleId,
        enabled,
      });
    }

    if (body.action === 'reset') {
      const sql = getSQL();
      await sql`DELETE FROM org_modules WHERE org_id = ${orgId}`;

      const orgRows = await sql`
        SELECT plan FROM organizations WHERE id = ${orgId} LIMIT 1
      `;
      const plan = orgRows[0]?.plan ? String(orgRows[0].plan) : 'trial';
      const defaults = getModulesByPlan(plan);

      for (const moduleId of defaults) {
        await enableModule(orgId, moduleId, access.userId);
      }

      return Response.json({ ok: true, action: 'reset', enabledModules: defaults });
    }

    const moduleId = typeof body.moduleId === 'string' ? body.moduleId.trim() : '';
    const enabled = body.enabled === true;
    if (!moduleId) {
      return Response.json({ ok: false, error: 'moduleId is required' }, { status: 400 });
    }

    let success: boolean;
    if (enabled) {
      success = await enableModule(orgId, moduleId, access.userId);
    } else {
      success = await disableModule(orgId, moduleId);
    }

    if (!success) {
      return Response.json(
        { ok: false, error: 'Module not found or is a core module that cannot be disabled' },
        { status: 400 },
      );
    }

    return Response.json({ ok: true, moduleId, enabled });
  } catch (error) {
    return errorResponse(error);
  }
}
