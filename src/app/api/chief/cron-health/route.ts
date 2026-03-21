import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { resolvePennyRole, canBypassPennyRoleByEmail } from '@/lib/penny-access';
import { ensureCronLogTable, getLastCronLog } from '@/lib/chief-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_HEALTHY_AGE_HOURS = 25;
const CRON_JOB_NAME = 'chief-alert-sweep';

function isAdminRole(role: string): boolean {
  return role === 'admin' || role === 'org:admin';
}

export async function GET() {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const canBypass = canBypassPennyRoleByEmail(user);
  if (!isAdminRole(role) && !canBypass) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
