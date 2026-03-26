import { ensureFleetComplianceTables, getImportBatchScope, rollbackFleetComplianceImportBatch } from '@/lib/fleet-compliance-db';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let batchId = '';
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
    await ensureFleetComplianceTables();
    const scope = await getImportBatchScope(orgId, batchId);

    if (scope.orgCount === 0) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const rolledBack = await rollbackFleetComplianceImportBatch(orgId, batchId);
    auditLog({
      action: 'data.delete',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import',
      resourceId: batchId,
      metadata: {
        collection: 'fleet_compliance_records',
        deletedCount: rolledBack,
        mode: 'soft-delete',
      },
    });
    auditLog({
      action: 'import.rollback',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import',
      resourceId: batchId,
      metadata: {
        rowCount: rolledBack,
      },
    });
    return Response.json({ rolledBack, batchId });
  } catch (error: unknown) {
    console.error('[fleet-compliance-import-rollback] failed:', error);
    auditLog({
      action: 'import.rollback',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import',
      resourceId: batchId,
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Rollback failed' }, { status: 500 });
  }
}
