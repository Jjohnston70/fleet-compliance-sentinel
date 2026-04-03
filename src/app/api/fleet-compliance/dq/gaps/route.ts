export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getGaps,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrg,
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

  const expiringWithinDays = 
    parseInt(req.nextUrl.searchParams.get('expiringWithinDays') || '30', 10);

  const gaps = getGaps(orgId, expiringWithinDays);

  return NextResponse.json({
    ok: true,
    gaps,
  });
}
