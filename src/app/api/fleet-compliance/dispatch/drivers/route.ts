export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getDispatchRuntime,
  normalizeDriverStatus,
  serializeDriver,
} from '@/lib/dispatch-command-runtime';

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
    const zoneIdFilter = String(req.nextUrl.searchParams.get('zoneId') ?? '').trim();
    const statusFilter = normalizeDriverStatus(req.nextUrl.searchParams.get('status'));
    const runtimeRef = await getDispatchRuntime(orgId);

    const drivers = await runtimeRef.apiHandlers.listDrivers();
    const filtered = drivers.filter((driver: any) => {
      if (zoneIdFilter && String(driver.zone_id) !== zoneIdFilter) return false;
      if (statusFilter && String(driver.status) !== statusFilter) return false;
      return true;
    });

    return NextResponse.json({
      ok: true,
      drivers: filtered.map((driver: any) => serializeDriver(driver)),
    });
  } catch (error) {
    console.error('[dispatch-drivers-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load drivers' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const driverId = String(body.driverId ?? '').trim();
  const status = normalizeDriverStatus(body.status);

  if (!driverId || !status) {
    return NextResponse.json(
      { ok: false, error: 'driverId and valid status are required' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getDispatchRuntime(orgId);
    const updated = await runtimeRef.apiHandlers.updateDriverStatus(driverId, status);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Driver not found or invalid status' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, driver: serializeDriver(updated) });
  } catch (error) {
    console.error('[dispatch-drivers-patch] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to update driver status' }, { status: 500 });
  }
}
