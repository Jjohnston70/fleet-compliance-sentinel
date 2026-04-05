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
  normalizeDispatchIssueType,
  normalizeDispatchPriority,
  normalizeDispatchStatus,
  serializeDispatchRequest,
  serializeDriver,
  serializeZone,
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
    const statusFilter = normalizeDispatchStatus(req.nextUrl.searchParams.get('status'));
    const runtimeRef = await getDispatchRuntime(orgId);

    const requests = await runtimeRef.apiHandlers.listDispatchRequests();
    const filteredRequests = statusFilter
      ? requests.filter((request: any) => request.status === statusFilter)
      : requests;
    const drivers = await runtimeRef.apiHandlers.listDrivers();
    const zones = await runtimeRef.repository.listZones();

    return NextResponse.json({
      ok: true,
      requests: filteredRequests.map((request: any) => serializeDispatchRequest(request)),
      drivers: drivers.map((driver: any) => serializeDriver(driver)),
      zones: zones.map((zone: any) => serializeZone(zone)),
    });
  } catch (error) {
    console.error('[dispatch-list-get] failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to load dispatch requests' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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

  const clientName = String(body.clientName ?? '').trim();
  const clientPhone = String(body.clientPhone ?? '').trim();
  const address = String(body.address ?? '').trim();
  const city = String(body.city ?? '').trim();
  const state = String(body.state ?? '').trim();
  const zip = String(body.zip ?? '').trim();
  const zoneId = String(body.zoneId ?? '').trim();
  const description = String(body.description ?? '').trim();
  const priority = normalizeDispatchPriority(body.priority);
  const issueType = normalizeDispatchIssueType(body.issueType);
  const rawSlaHours = Number(body.slaHours);
  const hasSlaOverride = Number.isFinite(rawSlaHours);
  const slaHours = hasSlaOverride ? Math.trunc(rawSlaHours) : null;

  if (!clientName || !clientPhone || !address || !city || !state || !zip || !zoneId || !description) {
    return NextResponse.json(
      {
        ok: false,
        error: 'clientName, clientPhone, address, city, state, zip, zoneId, and description are required',
      },
      { status: 422 },
    );
  }

  if (!priority) {
    return NextResponse.json(
      { ok: false, error: 'priority must be one of: emergency, urgent, standard, scheduled' },
      { status: 422 },
    );
  }

  if (!issueType) {
    return NextResponse.json(
      { ok: false, error: 'issueType must be one of: no_heat, no_ac, leak, electrical, maintenance, inspection' },
      { status: 422 },
    );
  }

  if (hasSlaOverride && (slaHours === null || ![24, 48, 72].includes(slaHours))) {
    return NextResponse.json(
      { ok: false, error: 'slaHours must be one of: 24, 48, 72' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getDispatchRuntime(orgId);
    const created = await runtimeRef.apiHandlers.createDispatchRequest({
      client_name: clientName,
      client_phone: clientPhone,
      address,
      city,
      state,
      zip,
      zone_id: zoneId,
      priority,
      ...(slaHours ? { sla_hours_override: slaHours } : {}),
      issue_type: issueType,
      description,
    });
    const slaStatus = runtimeRef.slaService.getSLAStatus(created);

    return NextResponse.json(
      {
        ok: true,
        request: serializeDispatchRequest(created),
        slaStatus: {
          requestId: String(slaStatus.requestId),
          status: String(slaStatus.status),
          timeRemainingMinutes: Number(slaStatus.timeRemaining),
          percentComplete: Number(slaStatus.percentComplete),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[dispatch-create-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create dispatch request' },
      { status: 500 },
    );
  }
}
