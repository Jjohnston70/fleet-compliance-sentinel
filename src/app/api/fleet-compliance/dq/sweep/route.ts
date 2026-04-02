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
  const auth = await requireFleetComplianceOrgWithRole(['admin']);
  if (!auth.ok) {
    return fleetComplianceAuthErrorResponse(auth) ?? NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { dry_run } = body;

  const gaps = await getGaps(auth.org_id, 30);

  return NextResponse.json({
    ok: true,
    gaps,
    count: gaps.length,
  });
}
