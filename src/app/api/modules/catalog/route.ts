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
  const localById = new Map(localCatalog.map((entry) => [entry.moduleId, entry]));
  const merged: ModuleCatalogEntry[] = remoteCatalog.map((remoteEntry) => {
    const localEntry = localById.get(remoteEntry.moduleId);
    if (!localEntry) return remoteEntry;

    const actionById = new Map(remoteEntry.actions.map((action) => [action.actionId, action]));
    for (const localAction of localEntry.actions) {
      if (!actionById.has(localAction.actionId)) {
        actionById.set(localAction.actionId, localAction);
      }
    }

    return {
      ...localEntry,
      ...remoteEntry,
      actions: Array.from(actionById.values()),
    };
  });

  const mergedById = new Map(merged.map((entry) => [entry.moduleId, entry]));
  for (const localEntry of localCatalog) {
    if (!mergedById.has(localEntry.moduleId)) {
      merged.push(localEntry);
    }
  }

  return merged;
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

