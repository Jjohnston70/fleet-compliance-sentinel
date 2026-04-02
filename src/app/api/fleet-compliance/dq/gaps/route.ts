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
  const auth = await requireFleetComplianceOrg();
  if (!auth.ok) {
    return fleetComplianceAuthErrorResponse(auth) ?? NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const expiringWithinDays = 
    parseInt(req.nextUrl.searchParams.get('expiringWithinDays') || '30', 10);

  const gaps = await getGaps(auth.org_id, expiringWithinDays);

  return NextResponse.json({
    ok: true,
    gaps,
  });
}
