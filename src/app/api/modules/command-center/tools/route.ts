import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { listCommandCenterCatalog, type CommandCenterCatalogRow } from '@/lib/modules-gateway/persistence';

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

export async function GET(request: Request) {
  let orgId = '';
  try {
    const authContext = await requireFleetComplianceOrgWithRole(request, 'admin');
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  const url = new URL(request.url);
  const moduleId = (url.searchParams.get('moduleId') || '').trim();
  const query = (url.searchParams.get('query') || '').trim();
  const limit = clampLimit(url.searchParams.get('limit'));

  const rows = await listCommandCenterCatalog(orgId);
  const filtered = rows.filter((row) => (moduleId ? row.moduleId === moduleId : true));
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
        returned: scored.length,
      },
    },
    { status: 200 },
  );
}
