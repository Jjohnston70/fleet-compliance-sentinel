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
  const auth = await requireFleetComplianceOrg();
  if (!auth.ok) {
    return fleetComplianceAuthErrorResponse(auth);
  }

  const { id } = await params;
  const checklist = await getChecklist(id);

  const total = checklist.length;
  const completed = checklist.filter((item) => item.completed).length;
  const completion_pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  return NextResponse.json({
    ok: true,
    checklist,
    total,
    completed,
    completion_pct,
  });
}
