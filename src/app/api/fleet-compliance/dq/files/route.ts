export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getFiles,
  getOrgSummary,
  createDqFile,
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

  const fileTypeParam = req.nextUrl.searchParams.get('fileType');
  const fileType = fileTypeParam === 'dqf' || fileTypeParam === 'dhf' ? fileTypeParam : undefined;
  const files = getFiles(orgId, fileType);
  const summary = getOrgSummary(orgId);

  return NextResponse.json({
    ok: true,
    files,
    summary,
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

  const body = await req.json();
  const { driver_id, driver_name, cdl_holder, hire_date } = body;

  const { dqf, dhf, intake_token } = createDqFile(orgId, {
    driver_id,
    driver_name,
    cdl_holder,
    hire_date,
  });

  const intake_link = `/intake/${intake_token}`;

  return NextResponse.json({
    ok: true,
    dqf,
    dhf,
    intake_token,
    intake_link,
  });
}
