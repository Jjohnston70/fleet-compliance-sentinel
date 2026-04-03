export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getGaps,
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
  const { dry_run } = body;

  const gaps = getGaps(orgId, 30);

  return NextResponse.json({
    ok: true,
    gaps,
    count: gaps.length,
  });
}
