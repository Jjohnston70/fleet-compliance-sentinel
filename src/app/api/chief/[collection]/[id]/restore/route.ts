import { ensureChiefTables, restoreChiefRecord } from '@/lib/chief-db';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/chief-import-schemas';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RestoreRouteContext {
  params: Promise<{
    collection: string;
    id: string;
  }>;
}

export async function POST(request: Request, context: RestoreRouteContext) {
  let orgId: string;
  try {
    ({ orgId } = await requireChiefOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { collection, id } = await context.params;
  if (!(collection in IMPORT_SCHEMAS)) {
    return Response.json({ error: 'Unknown collection' }, { status: 400 });
  }

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) {
    return Response.json({ error: 'id must be a positive integer' }, { status: 400 });
  }

  try {
    await ensureChiefTables();
    const restored = await restoreChiefRecord(collection as CollectionKey, numericId, orgId);
    if (!restored) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    return Response.json({
      restored: true,
      collection,
      id: numericId,
    });
  } catch (error: unknown) {
    console.error('[chief-restore] failed:', error);
    return Response.json({ error: 'Restore failed' }, { status: 500 });
  }
}
