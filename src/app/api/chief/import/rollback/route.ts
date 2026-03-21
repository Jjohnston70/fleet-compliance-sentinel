import { ensureChiefTables, getImportBatchScope, rollbackChiefImportBatch } from '@/lib/chief-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let orgId: string;
  try {
    ({ orgId } = await requireChiefOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let batchId: string;
  try {
    const body = await request.json();
    batchId = typeof body?.batchId === 'string' ? body.batchId.trim() : '';
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!UUID_RE.test(batchId)) {
    return Response.json({ error: 'batchId must be a valid UUID' }, { status: 400 });
  }

  try {
    await ensureChiefTables();
    const scope = await getImportBatchScope(orgId, batchId);

    if (scope.orgCount === 0) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rolledBack = await rollbackChiefImportBatch(orgId, batchId);
    return Response.json({ rolledBack, batchId });
  } catch (error: unknown) {
    console.error('[chief-import-rollback] failed:', error);
    return Response.json({ error: 'Rollback failed' }, { status: 500 });
  }
}
