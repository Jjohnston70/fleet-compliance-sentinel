export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getFiles,
  getOrgSummary,
  createDqFile,
  getChecklist,
  ensureOrgHydrated,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
  fleetComplianceAuthErrorResponse,
} from '@/lib/fleet-compliance-auth';

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await ensureOrgHydrated(orgId);

  const fileTypeParam = req.nextUrl.searchParams.get('fileType');
  const fileType = fileTypeParam === 'dqf' || fileTypeParam === 'dhf' ? fileTypeParam : undefined;
  const files = getFiles(orgId, fileType);
  const summary = getOrgSummary(orgId);
  const dqfFiles = files.filter((file) => file.file_type === 'dqf');

  const drivers = dqfFiles.map((file) => {
    const checklist = getChecklist(file.id);
    const docsTotal = checklist.length;
    const docsComplete = checklist.filter(
      (item) => item.status === 'uploaded' || item.status === 'generated' || item.status === 'verified',
    ).length;
    const nextExpiry = checklist
      .map((item) => item.expires_at)
      .filter((value): value is string => Boolean(value))
      .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0] ?? '';

    return {
      id: String(file.id),
      driverName: file.driver_name || 'Unknown Driver',
      cdl: file.cdl_holder ? 'CDL' : 'Non-CDL',
      status: file.status,
      intakeStatus: file.intake_completed_at ? 'Complete' : 'Pending',
      docsComplete,
      docsTotal,
      nextExpiry,
    };
  });

  return NextResponse.json({
    ok: true,
    files,
    summary: {
      ...summary,
      totalDrivers: summary.total_drivers,
      expiringIn30Days: summary.expiring_within_30_days,
    },
    drivers,
    summaryCamel: {
      totalDrivers: summary.total_drivers,
      complete: summary.complete,
      incomplete: summary.incomplete,
      expired: summary.expired,
      flagged: summary.flagged,
      expiringIn30Days: summary.expiring_within_30_days,
    },
  });
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

  await ensureOrgHydrated(orgId);

  const body = await req.json();
  const driverId = body.driver_id ?? body.driverId ?? '';
  const driverName = body.driver_name ?? body.driverName ?? '';
  const cdlHolder = Boolean(body.cdl_holder ?? body.cdlHolder ?? false);
  const hireDate = body.hire_date ?? body.hireDate ?? '';

  if (!driverName || typeof driverName !== 'string') {
    return NextResponse.json({ ok: false, error: 'Driver Name is required' }, { status: 400 });
  }

  const { dqf, dhf, intake_token } = await createDqFile(orgId, {
    driver_id: String(driverId || `drv-${crypto.randomUUID().slice(0, 8)}`),
    driver_name: driverName,
    cdl_holder: cdlHolder,
    hire_date: String(hireDate || new Date().toISOString().slice(0, 10)),
  });

  const intake_link = `/intake/${intake_token}`;
  const intake_url = `${req.nextUrl.origin}${intake_link}`;

  return NextResponse.json({
    ok: true,
    dqf,
    dhf,
    intake_token,
    intake_link,
    fileId: String(dqf.id),
    intakeToken: intake_token,
    intakeUrl: intake_url,
  });
}
