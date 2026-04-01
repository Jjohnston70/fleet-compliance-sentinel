import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { fetchRemoteModuleCatalog, shouldUseRemoteModuleGateway } from '@/lib/modules-gateway/remote';
import { listModuleCatalog } from '@/lib/modules-gateway/runner';
import type { ModuleCatalogEntry } from '@/lib/modules-gateway/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function mergeCatalogEntries(
  remoteCatalog: ModuleCatalogEntry[],
  localCatalog: ModuleCatalogEntry[],
): ModuleCatalogEntry[] {
  const byModuleId = new Map<string, ModuleCatalogEntry>();
  for (const entry of remoteCatalog) {
    byModuleId.set(entry.moduleId, entry);
  }
  for (const entry of localCatalog) {
    if (!byModuleId.has(entry.moduleId)) {
      byModuleId.set(entry.moduleId, entry);
    }
  }
  return Array.from(byModuleId.values());
}

export async function GET(request: Request) {
  try {
    await requireFleetComplianceOrgWithRole(request, 'admin');
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  if (shouldUseRemoteModuleGateway()) {
    try {
      const { res, body } = await fetchRemoteModuleCatalog();
      if (!res.ok || !body?.ok || !Array.isArray(body?.catalog)) {
        return Response.json(body, { status: res.status });
      }

      const localCatalog = listModuleCatalog();
      const mergedCatalog = mergeCatalogEntries(body.catalog, localCatalog);
      return Response.json({ ...body, catalog: mergedCatalog }, { status: res.status });
    } catch (error: unknown) {
      return Response.json(
        {
          ok: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error instanceof Error ? error.message : 'Remote module gateway unavailable',
          },
        },
        { status: 502 },
      );
    }
  }

  const catalog = listModuleCatalog();
  return Response.json({ ok: true, catalog }, { status: 200 });
}

