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
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ORG_WIDE_ACL_USER_ID = '*';

const TELEMATICS_PROVIDERS = ['verizon_reveal', 'geotab', 'samsara'] as const;
type TelematicsProvider = (typeof TELEMATICS_PROVIDERS)[number];

const PROVIDER_LABELS: Record<TelematicsProvider, string> = {
  verizon_reveal: 'Verizon Reveal',
  geotab: 'Geotab',
  samsara: 'Samsara',
};

interface TelematicsProviderStatus {
  provider: TelematicsProvider;
  label: string;
  isActive: boolean;
  hasCredentials: boolean;
  lastValidatedAt: string | null;
  consentRecordedAt: string | null;
}

// Tables that hold org-scoped client data, in deletion order
const ORG_DATA_TABLES = [
  'telematics_gps_events',
  'telematics_dvir_records',
  'telematics_alerts',
  'telematics_hos_logs',
  'telematics_drivers',
  'telematics_vehicles',
  'telematics_credentials',
  'training_progress',
  'training_assignments',
  'module_gateway_invocation_audit',
  'module_gateway_sandbox_events',
  'module_gateway_retry_escalations',
  'module_gateway_acl_rules',
  'ai_usage_budget_alerts',
  'ai_usage_cost_events',
  'org_modules',
] as const;

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

async function loadTelematicsProviderStatus(orgId: string): Promise<TelematicsProviderStatus[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT provider, is_active, last_validated_at, consent_recorded_at
    FROM telematics_credentials
    WHERE org_id = ${orgId}
  `;

  const byProvider = new Map<string, typeof rows[0]>();
  for (const row of rows) {
    byProvider.set(String(row.provider ?? ''), row);
  }

  return TELEMATICS_PROVIDERS.map((provider) => {
    const row = byProvider.get(provider);
    return {
      provider,
      label: PROVIDER_LABELS[provider],
      isActive: row?.is_active === true,
      hasCredentials: Boolean(row),
      lastValidatedAt: row?.last_validated_at ? String(row.last_validated_at) : null,
      consentRecordedAt: row?.consent_recorded_at ? String(row.consent_recorded_at) : null,
    };
  });
}

async function exportOrgDataToCsv(orgId: string): Promise<Record<string, Record<string, unknown>[]>> {
  const sql = getSQL();
  const result: Record<string, Record<string, unknown>[]> = {};

  // Organization info
  const orgRows = await sql`SELECT id, name, plan, created_at, onboarding_complete, metadata FROM organizations WHERE id = ${orgId}`;
  result['organizations'] = orgRows.map((r) => ({ ...r }));

  // Modules
  const modRows = await sql`SELECT module_id, enabled, enabled_at, enabled_by FROM org_modules WHERE org_id = ${orgId}`;
  result['org_modules'] = modRows.map((r) => ({ ...r }));

  // Telematics vehicles
  const vRows = await sql`SELECT provider_vehicle_id, vehicle_number, make, model, year, vin, last_seen_at FROM telematics_vehicles WHERE org_id = ${orgId}`;
  result['telematics_vehicles'] = vRows.map((r) => ({ ...r }));

  // Telematics drivers
  const dRows = await sql`SELECT provider_driver_id, driver_name, license_number, license_state, current_hos_status FROM telematics_drivers WHERE org_id = ${orgId}`;
  result['telematics_drivers'] = dRows.map((r) => ({ ...r }));

  // Training assignments
  const taRows = await sql`SELECT id, employee_id, plan_id, status, assigned_at, completed_at FROM training_assignments WHERE org_id = ${orgId}`;
  result['training_assignments'] = taRows.map((r) => ({ ...r }));

  // Training progress
  const tpRows = await sql`SELECT id, assignment_id, module_code, status, score, attempts, completed_at FROM training_progress WHERE org_id = ${orgId}`;
  result['training_progress'] = tpRows.map((r) => ({ ...r }));

  // Employee profiles
  try {
    const epRows = await sql`SELECT id, first_name, last_name, email, role, status, hired_at FROM employee_profiles WHERE org_id = ${orgId}`;
    result['employee_profiles'] = epRows.map((r) => ({ ...r }));
  } catch {
    // Table may not exist in all deployments
  }

  // Audit events (last 500)
  try {
    const aeRows = await sql`SELECT action, user_id, resource_type, severity, created_at FROM org_audit_events WHERE org_id = ${orgId} ORDER BY created_at DESC LIMIT 500`;
    result['audit_events'] = aeRows.map((r) => ({ ...r }));
  } catch {
    // Table may not exist
  }

  return result;
}

async function deleteFromTable(tableName: string, orgId: string): Promise<number> {
  const sql = getSQL();
  // Each table handled explicitly to avoid dynamic table name interpolation issues.
  switch (tableName) {
    case 'telematics_gps_events': { const r = await sql`DELETE FROM telematics_gps_events WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_dvir_records': { const r = await sql`DELETE FROM telematics_dvir_records WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_alerts': { const r = await sql`DELETE FROM telematics_alerts WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_hos_logs': { const r = await sql`DELETE FROM telematics_hos_logs WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_drivers': { const r = await sql`DELETE FROM telematics_drivers WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_vehicles': { const r = await sql`DELETE FROM telematics_vehicles WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'telematics_credentials': { const r = await sql`DELETE FROM telematics_credentials WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'training_progress': { const r = await sql`DELETE FROM training_progress WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'training_assignments': { const r = await sql`DELETE FROM training_assignments WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'module_gateway_invocation_audit': { const r = await sql`DELETE FROM module_gateway_invocation_audit WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'module_gateway_sandbox_events': { const r = await sql`DELETE FROM module_gateway_sandbox_events WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'module_gateway_retry_escalations': { const r = await sql`DELETE FROM module_gateway_retry_escalations WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'module_gateway_acl_rules': { const r = await sql`DELETE FROM module_gateway_acl_rules WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'ai_usage_budget_alerts': { const r = await sql`DELETE FROM ai_usage_budget_alerts WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'ai_usage_cost_events': { const r = await sql`DELETE FROM ai_usage_cost_events WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    case 'org_modules': { const r = await sql`DELETE FROM org_modules WHERE org_id = ${orgId}`; return (r as any).count ?? r.length; }
    default: return 0;
  }
}

async function wipeOrgData(orgId: string, userId: string): Promise<Record<string, number>> {
  const counts: Record<string, number> = {};

  for (const table of ORG_DATA_TABLES) {
    try {
      counts[table] = await deleteFromTable(table, orgId);
    } catch {
      counts[table] = -1; // table may not exist in this deployment
    }
  }

  auditLog({
    action: 'admin.action',
    userId,
    orgId,
    resourceType: 'organization',
    severity: 'warn',
    metadata: { operation: 'org_data_wipe', tablesProcessed: ORG_DATA_TABLES.length },
  });

  return counts;
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
    let telematicsProviders: TelematicsProviderStatus[] = [];

    if (effectiveOrgId) {
      enabledModules = await getOrgModules(effectiveOrgId);
      const orgRow = orgs.find((o) => o.id === effectiveOrgId);
      planDefaults = getModulesByPlan(orgRow?.plan ?? 'trial');
      moduleGatewayModules = access.scope === 'platform'
        ? await listGatewayModuleToggles(effectiveOrgId)
        : [];
      if (access.scope === 'platform') {
        telematicsProviders = await loadTelematicsProviderStatus(effectiveOrgId);
      }
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
      telematicsProviders,
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

    // Telematics provider toggle
    if (body.action === 'telematics-toggle') {
      const provider = typeof body.provider === 'string' ? body.provider.trim() : '';
      if (!TELEMATICS_PROVIDERS.includes(provider as TelematicsProvider)) {
        return Response.json({ ok: false, error: `Invalid provider. Must be one of: ${TELEMATICS_PROVIDERS.join(', ')}` }, { status: 400 });
      }
      const enabled = body.enabled === true;
      const sql = getSQL();

      // Check if credentials exist
      const existing = await sql`
        SELECT id FROM telematics_credentials WHERE org_id = ${orgId} AND provider = ${provider} LIMIT 1
      `;

      if (existing.length === 0) {
        // Create a placeholder row (credentials to be configured separately)
        await sql`
          INSERT INTO telematics_credentials (org_id, provider, username, password_enc, is_active)
          VALUES (${orgId}, ${provider}, '', '', ${enabled})
        `;
      } else {
        await sql`
          UPDATE telematics_credentials
          SET is_active = ${enabled}, updated_at = NOW()
          WHERE org_id = ${orgId} AND provider = ${provider}
        `;
      }

      auditLog({
        action: 'admin.action',
        userId: access.userId,
        orgId,
        resourceType: 'telematics_credentials',
        severity: 'info',
        metadata: { operation: 'telematics_toggle', provider, enabled },
      });

      return Response.json({ ok: true, action: 'telematics-toggle', provider, enabled });
    }

    // Export org data as JSON (client downloads and converts to Excel)
    if (body.action === 'export-org-data') {
      const data = await exportOrgDataToCsv(orgId);
      auditLog({
        action: 'admin.action',
        userId: access.userId,
        orgId,
        resourceType: 'organization',
        severity: 'info',
        metadata: { operation: 'org_data_export', tableCount: Object.keys(data).length },
      });
      return Response.json({ ok: true, action: 'export-org-data', orgId, data });
    }

    // Wipe all org data (for cancelled clients)
    if (body.action === 'wipe-org-data') {
      const confirmOrgId = typeof body.confirmOrgId === 'string' ? body.confirmOrgId.trim() : '';
      if (confirmOrgId !== orgId) {
        return Response.json({ ok: false, error: 'confirmOrgId must match orgId to proceed with wipe' }, { status: 400 });
      }
      const counts = await wipeOrgData(orgId, access.userId);
      return Response.json({ ok: true, action: 'wipe-org-data', orgId, deletedCounts: counts });
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
