import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import {
  buildCommandCenterAclPayload,
  evaluateCommandCenterToolAcl,
  listCommandCenterCatalog,
  type CommandCenterCatalogRow,
} from '@/lib/modules-gateway/persistence';
import { executeCommandCenterAction } from '@/lib/modules-gateway/command-center-bridge';
import { isPlatformAdminUser } from '@/lib/platform-admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const DEFAULT_TOOL_LIMIT = 12;
const MAX_TOOL_LIMIT = 15;

function clampLimit(raw: string | null): number {
  if (!raw) return DEFAULT_TOOL_LIMIT;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return DEFAULT_TOOL_LIMIT;
  return Math.max(1, Math.min(MAX_TOOL_LIMIT, parsed));
}

function scoreToolMatch(row: CommandCenterCatalogRow, query: string): number {
  if (!query) return 0;
  const q = query.toLowerCase();
  let score = 0;
  const qualifiedName = row.qualifiedName.toLowerCase();
  const toolName = row.toolName.toLowerCase();
  const moduleId = row.moduleId.toLowerCase();
  const description = (row.description || '').toLowerCase();

  if (qualifiedName === q || toolName === q) score += 200;
  if (qualifiedName.includes(q)) score += 100;
  if (toolName.includes(q)) score += 80;
  if (moduleId.includes(q)) score += 30;
  if (description.includes(q)) score += 20;
  return score;
}

function asObject(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

function normalizeDiscoveredToolRows(raw: unknown): CommandCenterCatalogRow[] {
  const payload = Array.isArray(raw)
    ? raw
    : (Array.isArray(asObject(raw)?.tools) ? (asObject(raw)?.tools as unknown[]) : []);

  const discoveredAt = new Date().toISOString();
  return payload
    .map((entry) => asObject(entry))
    .filter((entry): entry is Record<string, unknown> => Boolean(entry))
    .map((entry) => ({
      qualifiedName: typeof entry.qualifiedName === 'string' ? entry.qualifiedName.trim() : '',
      moduleId: typeof entry.moduleId === 'string' ? entry.moduleId.trim() : '',
      toolName: typeof entry.name === 'string' ? entry.name.trim() : '',
      description: typeof entry.description === 'string' ? entry.description : null,
      parameters: asObject(entry.parameters) || {},
      discoveredRunId: null,
      discoveredAt,
      updatedAt: discoveredAt,
    }))
    .filter((entry) => entry.qualifiedName && entry.moduleId && entry.toolName);
}

async function discoverLiveTools(orgId: string, userId: string): Promise<CommandCenterCatalogRow[]> {
  try {
    const acl = await buildCommandCenterAclPayload({
      orgId,
      userId,
      permission: 'view',
    });
    const result = await executeCommandCenterAction('discover.tools', {
      acl: {
        allowedModuleIds: acl.allowedModuleIds,
        allowedQualifiedNames: acl.allowedQualifiedNames,
      },
    });
    if (!result.ok) return [];
    return normalizeDiscoveredToolRows(result.data);
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  let orgId = '';
  let userId = '';
  try {
    const authContext = await requireFleetComplianceOrgContext(request);
    if (authContext.role !== 'admin') {
      return Response.json(
        { ok: false, error: { code: 'PERMISSION_DENIED', message: 'Forbidden' } },
        { status: 403 },
      );
    }
    if (!isPlatformAdminUser(authContext.userId)) {
      return Response.json(
        { ok: false, error: { code: 'PERMISSION_DENIED', message: 'Command-center tools are restricted to platform admins' } },
        { status: 403 },
      );
    }
    orgId = authContext.orgId;
    userId = authContext.userId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  const url = new URL(request.url);
  const moduleId = (url.searchParams.get('moduleId') || '').trim();
  const query = (url.searchParams.get('query') || '').trim();
  const limit = clampLimit(url.searchParams.get('limit'));

  let rows = await listCommandCenterCatalog(orgId);
  if (rows.length === 0) {
    const liveRows = await discoverLiveTools(orgId, userId);
    if (liveRows.length > 0) {
      rows = liveRows;
    }
  }
  const aclRows: CommandCenterCatalogRow[] = [];
  for (const row of rows) {
    const decision = await evaluateCommandCenterToolAcl({
      orgId,
      userId,
      qualifiedName: row.qualifiedName,
      permission: 'view',
    });
    if (decision.allowed) {
      aclRows.push(row);
    }
  }

  const filtered = aclRows.filter((row) => (moduleId ? row.moduleId === moduleId : true));
  const scored = filtered
    .map((row) => ({
      row,
      score: scoreToolMatch(row, query),
    }))
    .filter((entry) => (!query ? true : entry.score > 0))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.row.qualifiedName.localeCompare(b.row.qualifiedName);
    })
    .slice(0, limit)
    .map((entry) => entry.row);

  return Response.json(
    {
      ok: true,
      tools: scored,
      meta: {
        moduleId: moduleId || null,
        query: query || null,
        limit,
        totalAvailable: filtered.length,
        totalBeforeAcl: rows.length,
        totalAfterAcl: aclRows.length,
        returned: scored.length,
      },
    },
    { status: 200 },
  );
}
