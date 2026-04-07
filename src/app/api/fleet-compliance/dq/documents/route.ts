export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadDocument,
  ensureOrgHydrated,
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

  await ensureOrgHydrated(orgId);

  const body = await req.json();
  const { dq_file_id, doc_type, file_path, expires_at } = body;

  const document = await uploadDocument(
    orgId,
    Number(dq_file_id),
    doc_type,
    file_path,
    expires_at
  );

  return NextResponse.json({
    ok: true,
    document,
  });
}
