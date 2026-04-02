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
  const auth = await requireFleetComplianceOrg();
  if (!auth.ok) {
    return fleetComplianceAuthErrorResponse(auth);
  }

  const fileType = req.nextUrl.searchParams.get('fileType') || undefined;
  const files = await getFiles(auth.org_id, fileType);
  const summary = await getOrgSummary(auth.org_id);

  return NextResponse.json({
    ok: true,
    files,
    summary,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireFleetComplianceOrgWithRole(['admin']);
  if (!auth.ok) {
    return fleetComplianceAuthErrorResponse(auth);
  }

  const body = await req.json();
  const { driver_id, driver_name, cdl_holder, hire_date } = body;

  const { dqf, dhf, intake_token } = await createDqFile(
    auth.org_id,
    driver_id,
    driver_name,
    cdl_holder,
    hire_date
  );

  const intake_link = `/intake/${intake_token}`;

  return NextResponse.json({
    ok: true,
    dqf,
    dhf,
    intake_token,
    intake_link,
  });
}
