import { runFleetComplianceAlertSweep } from '@/lib/fleet-compliance-alert-engine';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getOrganizationPrimaryContact } from '@/lib/fleet-compliance-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manual trigger from the Fleet-Compliance UI. Protected by Clerk auth (no cron secret required).
// Accepts JSON body: { dryRun?: boolean }
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

  let dryRun = true;
  try {
    const body = await request.json();
    if (typeof body.dryRun === 'boolean') dryRun = body.dryRun;
  } catch {
    // missing or invalid body — default to dry run
  }

  try {
    const data = await loadFleetComplianceData(orgId);
    const managerEmail = await getOrganizationPrimaryContact(orgId);
    const summary = await runFleetComplianceAlertSweep(data.suspense, {
      dryRun,
      managerEmail: managerEmail || undefined,
    });
    auditLog({
      action: 'cron.run',
      userId,
      orgId,
      resourceType: 'fleet-compliance.alerts.trigger',
      metadata: {
        dryRun,
        itemsEvaluated: summary.itemsEvaluated,
        itemsQueued: summary.itemsQueued,
        emailsSent: summary.emailsSent,
        emailsFailed: summary.emailsFailed,
      },
    });
    return Response.json(summary, { status: 200 });
  } catch (err: unknown) {
    console.error('[fleet-compliance-alert-trigger] failed:', err);
    auditLog({
      action: 'cron.failed',
      userId,
      orgId,
      resourceType: 'fleet-compliance.alerts.trigger',
      severity: 'error',
      metadata: {
        dryRun,
      },
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
