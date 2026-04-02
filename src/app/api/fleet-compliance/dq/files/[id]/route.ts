export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getFileById,
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
    return fleetComplianceAuthErrorResponse(auth) ?? NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const file = await getFileById(auth.org_id, id);
  const checklist = await getChecklist(id);

  return NextResponse.json({
    ok: true,
    file,
    checklist,
  });
}
