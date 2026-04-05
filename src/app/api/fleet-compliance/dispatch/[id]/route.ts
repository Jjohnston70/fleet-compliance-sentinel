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
  serializeDispatchRequest,
  serializeDriver,
  toIsoString,
} from '@/lib/dispatch-command-runtime';

type DispatchAction = 'assign' | 'reassign' | 'complete' | 'cancel' | 'mark_en_route' | 'mark_on_site';

function normalizeAction(value: unknown): DispatchAction | null {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (
    normalized === 'assign'
    || normalized === 'reassign'
    || normalized === 'complete'
    || normalized === 'cancel'
    || normalized === 'mark_en_route'
    || normalized === 'mark_on_site'
  ) {
    return normalized;
  }
  return null;
}

async function buildRequestDetail(runtimeRef: any, requestId: string) {
  const request = await runtimeRef.apiHandlers.getDispatchRequest(requestId);
  if (!request) return null;

  const slaStatus = await runtimeRef.apiHandlers.checkSLAStatus(requestId);
  const logs = await runtimeRef.repository.listLogsByRequestId(requestId);
  const assignedDriver = request.assigned_driver_id
    ? await runtimeRef.apiHandlers.getDriver(request.assigned_driver_id)
    : null;
  const assignedTruck = request.assigned_truck_id
    ? await runtimeRef.repository.getTruck(request.assigned_truck_id)
    : null;
  const availableDrivers = await runtimeRef.driverService.getAvailableDriversInZone(request.zone_id);

  return {
    request: serializeDispatchRequest(request),
    slaStatus: slaStatus
      ? {
        requestId: String(slaStatus.requestId),
        status: String(slaStatus.status),
        timeRemainingMinutes: Number(slaStatus.timeRemaining),
        percentComplete: Number(slaStatus.percentComplete),
      }
      : null,
    assignedDriver: assignedDriver ? serializeDriver(assignedDriver) : null,
    assignedTruck: assignedTruck
      ? {
        id: String(assignedTruck.id),
        name: String(assignedTruck.name),
        type: String(assignedTruck.type),
        status: String(assignedTruck.status),
        zoneId: String(assignedTruck.zone_id),
      }
      : null,
    availableDrivers: availableDrivers.map((driver: any) => serializeDriver(driver)),
    logs: logs.map((log: any) => ({
      id: String(log.id),
      action: String(log.action ?? ''),
      actor: String(log.actor ?? ''),
      timestamp: toIsoString(log.timestamp),
      details: log.details && typeof log.details === 'object' ? log.details : null,
    })),
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const runtimeRef = await getDispatchRuntime(orgId);
    const detail = await buildRequestDetail(runtimeRef, id);
    if (!detail) {
      return NextResponse.json({ ok: false, error: 'Dispatch request not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, ...detail });
  } catch (error) {
    console.error('[dispatch-detail-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load dispatch request' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  try {
    const { id } = await params;
    const action = normalizeAction(body.action);
    if (!action) {
      return NextResponse.json(
        { ok: false, error: 'action is required (assign, reassign, complete, cancel, mark_en_route, mark_on_site)' },
        { status: 422 },
      );
    }

    const runtimeRef = await getDispatchRuntime(orgId);
    const existing = await runtimeRef.apiHandlers.getDispatchRequest(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Dispatch request not found' }, { status: 404 });
    }

    if (action === 'assign') {
      const driverId = String(body.driverId ?? '').trim();
      const truckIdRaw = String(body.truckId ?? '').trim();
      const truckId = truckIdRaw.length > 0 ? truckIdRaw : undefined;

      if (!driverId) {
        return NextResponse.json({ ok: false, error: 'driverId is required for assign' }, { status: 422 });
      }

      const result = await runtimeRef.apiHandlers.assignDriver(id, driverId, truckId);
      if (!result.success) {
        return NextResponse.json(
          { ok: false, error: result.error || 'Failed to assign driver' },
          { status: 409 },
        );
      }
    } else if (action === 'reassign') {
      const driverId = String(body.driverId ?? '').trim();
      if (!driverId) {
        return NextResponse.json({ ok: false, error: 'driverId is required for reassign' }, { status: 422 });
      }

      const result = await runtimeRef.apiHandlers.reassignDriver(id, driverId);
      if (!result.success) {
        return NextResponse.json(
          { ok: false, error: result.error || 'Failed to reassign driver' },
          { status: 409 },
        );
      }
    } else if (action === 'complete') {
      const completed = await runtimeRef.dispatchService.completeDispatch(id);
      if (!completed) {
        return NextResponse.json({ ok: false, error: 'Failed to complete dispatch request' }, { status: 409 });
      }
    } else if (action === 'cancel') {
      const reason = String(body.reason ?? 'Cancelled by operator').trim();
      const cancelled = await runtimeRef.dispatchService.cancelDispatch(id, reason || 'Cancelled by operator');
      if (!cancelled) {
        return NextResponse.json({ ok: false, error: 'Failed to cancel dispatch request' }, { status: 409 });
      }
    } else if (action === 'mark_en_route') {
      const updated = await runtimeRef.dispatchService.markEnRoute(id);
      if (!updated) {
        return NextResponse.json({ ok: false, error: 'Failed to mark request en route' }, { status: 409 });
      }
    } else if (action === 'mark_on_site') {
      const updated = await runtimeRef.dispatchService.markOnSite(id);
      if (!updated) {
        return NextResponse.json({ ok: false, error: 'Failed to mark request on site' }, { status: 409 });
      }
    }

    const detail = await buildRequestDetail(runtimeRef, id);
    if (!detail) {
      return NextResponse.json({ ok: false, error: 'Dispatch request not found after update' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, ...detail });
  } catch (error: any) {
    console.error('[dispatch-detail-patch] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to update dispatch request' },
      { status: 500 },
    );
  }
}
