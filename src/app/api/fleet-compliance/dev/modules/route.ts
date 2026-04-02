import { auth } from '@clerk/nextjs/server';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  enableModule,
  disableModule,
  getOrgModules,
  getModuleCatalog,
  getModulesByPlan,
} from '@/lib/modules';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Hardcoded platform admin user IDs. Only these Clerk users can access the
 * developer module toggle page. Add your Clerk user ID here.
 */
const PLATFORM_ADMIN_IDS = new Set<string>([
  // Jacob Johnston
  'user_2stXa9LWIFKFCMlkBsfVGoZLhgK',
]);

async function isPlatformAdmin(userId: string): Promise<boolean> {
  return PLATFORM_ADMIN_IDS.has(userId);
}

async function requirePlatformAdmin(): Promise<{ userId: string }> {
  const { userId } = await auth();
  if (!userId) {
    throw new Error('UNAUTHORIZED');
  }
  if (!(await isPlatformAdmin(userId))) {
    throw new Error('FORBIDDEN');
  }
  return { userId };
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
 * Returns the module catalog, the org's enabled modules, and recent toggle log.
 * If no orgId is provided, returns just the catalog and org list.
 */
export async function GET(request: Request) {
  try {
    await requirePlatformAdmin();
  } catch (error) {
    return errorResponse(error);
  }

  const url = new URL(request.url);
  const orgId = url.searchParams.get('orgId');

  try {
    const sql = getSQL();
    const catalog = await getModuleCatalog();

    // Fetch all orgs for the dropdown
    const orgRows = await sql`
      SELECT id, name, plan
      FROM organizations
      ORDER BY name ASC
    `;
    const orgs = orgRows.map((row) => ({
      id: String(row.id ?? ''),
      name: String(row.name ?? ''),
      plan: String(row.plan ?? 'trial'),
    }));

    let enabledModules: string[] = [];
    let planDefaults: string[] = [];

    if (orgId) {
      enabledModules = await getOrgModules(orgId);
      const orgRow = orgs.find((o) => o.id === orgId);
      planDefaults = getModulesByPlan(orgRow?.plan ?? 'trial');
    }

    // Recent toggle log from org_modules
    let recentToggles: Array<Record<string, unknown>> = [];
    if (orgId) {
      const toggleRows = await sql`
        SELECT
          om.module_id,
          om.enabled,
          om.enabled_at,
          om.enabled_by,
          m.name AS module_name
        FROM org_modules om
        JOIN modules m ON m.id = om.module_id
        WHERE om.org_id = ${orgId}
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
      orgId,
      enabledModules,
      planDefaults,
      recentToggles,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

/**
 * POST /api/fleet-compliance/dev/modules
 *
 * Body: { orgId, moduleId, enabled } -- toggle a single module
 * Body: { orgId, action: 'reset' }   -- reset org to plan defaults
 */
export async function POST(request: Request) {
  let adminUserId: string;
  try {
    const admin = await requirePlatformAdmin();
    adminUserId = admin.userId;
  } catch (error) {
    return errorResponse(error);
  }

  try {
    const body = await request.json();
    const orgId = typeof body.orgId === 'string' ? body.orgId.trim() : '';
    if (!orgId) {
      return Response.json({ ok: false, error: 'orgId is required' }, { status: 400 });
    }

    // Reset to plan defaults
    if (body.action === 'reset') {
      const sql = getSQL();
      await sql`DELETE FROM org_modules WHERE org_id = ${orgId}`;

      // Look up the org's plan
      const orgRows = await sql`
        SELECT plan FROM organizations WHERE id = ${orgId} LIMIT 1
      `;
      const plan = orgRows[0]?.plan ? String(orgRows[0].plan) : 'trial';
      const defaults = getModulesByPlan(plan);

      for (const moduleId of defaults) {
        await enableModule(orgId, moduleId, adminUserId);
      }

      return Response.json({ ok: true, action: 'reset', enabledModules: defaults });
    }

    // Toggle single module
    const moduleId = typeof body.moduleId === 'string' ? body.moduleId.trim() : '';
    const enabled = body.enabled === true;
    if (!moduleId) {
      return Response.json({ ok: false, error: 'moduleId is required' }, { status: 400 });
    }

    let success: boolean;
    if (enabled) {
      success = await enableModule(orgId, moduleId, adminUserId);
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
