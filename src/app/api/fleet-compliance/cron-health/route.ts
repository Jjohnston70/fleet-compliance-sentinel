import { NextResponse } from 'next/server';
import { ensureCronLogTable, getLastCronLog } from '@/lib/fleet-compliance-db';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_HEALTHY_AGE_HOURS = 25;
const CRON_JOB_NAME = 'fleet-compliance-alert-sweep';

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureCronLogTable();
    const last = await getLastCronLog(CRON_JOB_NAME);

    if (!last) {
      auditLog({
        action: 'data.read',
        userId,
        orgId,
        resourceType: 'fleet-compliance.cron-health',
        metadata: {
          collection: 'cron_log',
          recordCount: 0,
          status: 'never',
        },
      });
      return NextResponse.json({
        lastRun: null,
        hoursAgo: null,
        status: 'never',
        isHealthy: false,
      });
    }

    const lastRunTime = new Date(last.executedAt);
    const hoursAgoRaw = (Date.now() - lastRunTime.getTime()) / (1000 * 60 * 60);
    const hoursAgo = Number(hoursAgoRaw.toFixed(2));
    const isHealthy = hoursAgo <= MAX_HEALTHY_AGE_HOURS;
    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'fleet-compliance.cron-health',
      metadata: {
        collection: 'cron_log',
        recordCount: 1,
        hoursAgo,
        isHealthy,
      },
      severity: isHealthy ? 'info' : 'warn',
    });

    return NextResponse.json({
      lastRun: lastRunTime.toISOString(),
      hoursAgo,
      status: isHealthy ? 'ok' : 'stale',
      isHealthy,
      lastResult: {
        status: last.status,
        message: last.message,
        recordsProcessed: last.recordsProcessed,
      },
    });
  } catch (err: unknown) {
    console.error('[fleet-compliance-cron-health] failed:', err);
    if (userId && orgId) {
      auditLog({
        action: 'data.read',
        userId,
        orgId,
        resourceType: 'fleet-compliance.cron-health',
        severity: 'error',
        metadata: {
          collection: 'cron_log',
          failed: true,
        },
      });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
