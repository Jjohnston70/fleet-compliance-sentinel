export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadDocument,
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
  const { dq_file_id, doc_type, file_path, expires_at } = body;

  const document = await uploadDocument(
    dq_file_id,
    doc_type,
    file_path,
    expires_at
  );

  return NextResponse.json({
    ok: true,
    document,
  });
}
