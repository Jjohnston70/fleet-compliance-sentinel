import { runChiefAlertSweep } from '@/lib/chief-alert-engine';
import { loadChiefData } from '@/lib/chief-data';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Manual trigger from the Chief UI. Protected by Clerk auth (no cron secret required).
// Accepts JSON body: { dryRun?: boolean }
export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
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
    const data = await loadChiefData(orgId);
    const summary = await runChiefAlertSweep(data.suspense, { dryRun });
    auditLog({
      action: 'cron.run',
      userId,
      orgId,
      resourceType: 'chief.alerts.trigger',
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
    console.error('[chief-alert-trigger] failed:', err);
    auditLog({
      action: 'cron.failed',
      userId,
      orgId,
      resourceType: 'chief.alerts.trigger',
      severity: 'error',
      metadata: {
        dryRun,
      },
    });
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
