export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
  serializeOpportunity,
  toIsoString,
} from '@/lib/govcon-compliance-command-runtime';

function parseDays(value: string | null): number {
  const parsed = Number(value ?? '7');
  if (!Number.isFinite(parsed)) return 7;
  return Math.max(1, Math.min(365, Math.floor(parsed)));
}

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const days = parseDays(req.nextUrl.searchParams.get('days'));

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const [deadlines, alerts] = await Promise.all([
      runtimeRef.opportunityService.getUpcomingDeadlines(days),
      runtimeRef.deadlineMonitor.checkDeadlines(),
    ]);

    return NextResponse.json({
      ok: true,
      days,
      deadlines: deadlines.map((opportunity: any) => serializeOpportunity(opportunity)),
      alerts: alerts.map((alert: any) => ({
        opportunityId: String(alert?.opportunityId ?? ''),
        title: String(alert?.title ?? ''),
        deadline: toIsoString(alert?.deadline),
        daysRemaining: Number(alert?.daysRemaining ?? 0),
        severity: String(alert?.severity ?? ''),
      })),
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-deadlines-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load upcoming deadlines' }, { status: 500 });
  }
}
