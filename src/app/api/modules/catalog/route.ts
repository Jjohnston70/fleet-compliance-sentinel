import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { fetchRemoteModuleCatalog, shouldUseRemoteModuleGateway } from '@/lib/modules-gateway/remote';
import { listModuleCatalog } from '@/lib/modules-gateway/runner';
import { filterModuleCatalogByAcl } from '@/lib/modules-gateway/persistence';
import type { ModuleCatalogEntry } from '@/lib/modules-gateway/types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function buildLocalCatalogResponse(orgId: string, userId: string) {
  const catalog = listModuleCatalog();
  const filteredCatalog = await filterModuleCatalogByAcl({
    orgId,
    userId,
    catalog,
  });
  return Response.json({ ok: true, catalog: filteredCatalog }, { status: 200 });
}

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
  let userId = '';
  let orgId = '';
  try {
    const authContext = await requireFleetComplianceOrgContext(request);
    if (authContext.role !== 'admin') {
      return Response.json(
        { ok: false, error: { code: 'PERMISSION_DENIED', message: 'Forbidden' } },
        { status: 403 },
      );
    }
    userId = authContext.userId;
    orgId = authContext.orgId;
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Unauthorized' } }, { status: 401 });
  }

  if (shouldUseRemoteModuleGateway()) {
    try {
      const { res, body } = await fetchRemoteModuleCatalog();
      if (res.ok && body && typeof body === 'object' && (body as { ok?: unknown }).ok === true) {
        const remoteCatalog = (body as { catalog?: unknown }).catalog;
        if (Array.isArray(remoteCatalog)) {
          const localCatalog = listModuleCatalog();
          const mergedCatalog = mergeCatalogEntries(remoteCatalog as ModuleCatalogEntry[], localCatalog);
          const filteredCatalog = await filterModuleCatalogByAcl({
            orgId,
            userId,
            catalog: mergedCatalog,
          });
          return Response.json({ ...body, catalog: filteredCatalog }, { status: res.status });
        }
      }

      console.warn('[module-gateway] remote catalog unavailable, falling back to local catalog', {
        httpStatus: res.status,
        hasBody: Boolean(body),
      });
      return buildLocalCatalogResponse(orgId, userId);
    } catch (error: unknown) {
      console.warn('[module-gateway] remote catalog fetch failed, falling back to local catalog', {
        message: error instanceof Error ? error.message : String(error),
      });
      return buildLocalCatalogResponse(orgId, userId);
    }
  }

  return buildLocalCatalogResponse(orgId, userId);
}

