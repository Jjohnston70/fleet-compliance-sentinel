import { ensureFleetComplianceTables, restoreFleetComplianceRecord } from '@/lib/fleet-compliance-db';
import { IMPORT_SCHEMAS, type CollectionKey } from '@/lib/fleet-compliance-import-schemas';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface RestoreRouteContext {
  params: Promise<{
    collection: string;
    id: string;
  }>;
}

export async function POST(request: Request, context: RestoreRouteContext) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
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
    await ensureFleetComplianceTables();
    const restored = await restoreFleetComplianceRecord(collection as CollectionKey, numericId, orgId);
    if (!restored) {
      return Response.json({ error: 'Record not found' }, { status: 404 });
    }

    auditLog({
      action: 'data.restore',
      userId,
      orgId,
      resourceType: 'fleet-compliance.collection',
      resourceId: String(numericId),
      metadata: {
        collection,
        restored: true,
      },
    });
    return Response.json({
      restored: true,
      collection,
      id: numericId,
    });
  } catch (error: unknown) {
    console.error('[fleet-compliance-restore] failed:', error);
    auditLog({
      action: 'data.restore',
      userId,
      orgId,
      resourceType: 'fleet-compliance.collection',
      severity: 'error',
      metadata: {
        collection,
        recordId: numericId,
        failed: true,
      },
    });
    return Response.json({ error: 'Restore failed' }, { status: 500 });
  }
}
