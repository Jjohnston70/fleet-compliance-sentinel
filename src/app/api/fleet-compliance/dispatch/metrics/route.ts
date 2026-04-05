export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import { getDispatchRuntime, serializeZone } from '@/lib/dispatch-command-runtime';

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const runtimeRef = await getDispatchRuntime(orgId);
    const [metrics, dashboard, requests, slaStatuses, zones] = await Promise.all([
      runtimeRef.apiHandlers.getDispatchMetrics(),
      runtimeRef.dashboard.getDashboardMetrics(),
      runtimeRef.apiHandlers.listDispatchRequests(),
      runtimeRef.slaService.checkAllSLAStatus(),
      runtimeRef.repository.listZones(),
    ]);

    const slaSummary = {
      healthy: slaStatuses.filter((entry: any) => entry.status === 'healthy').length,
      warning: slaStatuses.filter((entry: any) => entry.status === 'warning').length,
      critical: slaStatuses.filter((entry: any) => entry.status === 'critical').length,
      breached: slaStatuses.filter((entry: any) => entry.status === 'breached').length,
    };

    return NextResponse.json({
      ok: true,
      metrics,
      dashboard,
      slaSummary,
      totals: {
        totalRequests: Number(metrics.totalRequests ?? requests.length),
        openRequests: requests.filter((request: any) => request.status !== 'completed' && request.status !== 'cancelled').length,
      },
      zones: zones.map((zone: any) => serializeZone(zone)),
    });
  } catch (error) {
    console.error('[dispatch-metrics-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load dispatch metrics' }, { status: 500 });
  }
}
