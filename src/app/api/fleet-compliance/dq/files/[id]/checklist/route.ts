export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getChecklist,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrg,
  fleetComplianceAuthErrorResponse,
} from '@/lib/fleet-compliance-auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireFleetComplianceOrg(req);
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const numericId = Number(id);
  const checklist = getChecklist(numericId);

  const total = checklist.length;
  const completed = checklist.filter(
    (item) => item.status === 'uploaded' || item.status === 'generated' || item.status === 'verified',
  ).length;
  const completion_pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return NextResponse.json({
    ok: true,
    checklist,
    total,
    completed,
    completion_pct,
  });
}
