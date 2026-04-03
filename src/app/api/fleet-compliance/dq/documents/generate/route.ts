export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  generateDocument,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrgWithRole,
  fleetComplianceAuthErrorResponse,
} from '@/lib/fleet-compliance-auth';

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
  const { dq_file_id, doc_type } = body;

  const document = generateDocument(orgId, Number(dq_file_id), doc_type);

  return NextResponse.json({
    ok: true,
    document,
  });
}
