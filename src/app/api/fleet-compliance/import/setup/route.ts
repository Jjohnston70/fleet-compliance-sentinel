import { ensureFleetComplianceTables } from '@/lib/fleet-compliance-db';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  try {
    await ensureFleetComplianceTables();
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import.setup',
      metadata: {
        action: 'ensureFleetComplianceTables',
      },
    });
    return Response.json({ status: 'ok', message: 'Fleet-Compliance tables created successfully' });
  } catch (err: unknown) {
    console.error('[fleet-compliance-import-setup] failed:', err);
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'fleet-compliance.import.setup',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Setup failed' }, { status: 500 });
  }
}
