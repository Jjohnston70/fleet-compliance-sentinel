import { NextResponse } from 'next/server';
import { ensureCronLogTable, getLastCronLog } from '@/lib/chief-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_HEALTHY_AGE_HOURS = 25;
const CRON_JOB_NAME = 'chief-alert-sweep';

export async function GET(request: Request) {
  try {
    await requireChiefOrgWithRole(request, 'admin');
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureCronLogTable();
    const last = await getLastCronLog(CRON_JOB_NAME);

    if (!last) {
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
    console.error('[chief-cron-health] failed:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
