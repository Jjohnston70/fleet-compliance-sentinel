import { NextRequest, NextResponse } from 'next/server';
import { lookupFmcsaCarrier } from '@/lib/chief-fmcsa-client';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrg(req));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const dot = req.nextUrl.searchParams.get('dot') ?? '';
  if (!dot) {
    return NextResponse.json({ error: 'Missing ?dot= parameter.' }, { status: 400 });
  }

  const result = await lookupFmcsaCarrier(dot);

  if (!result.ok) {
    const status = result.status ?? 400;
    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'chief.fmcsa.lookup',
      severity: status >= 500 ? 'error' : 'warn',
      metadata: {
        collection: 'fmcsa_carriers',
        success: false,
        status,
      },
    });
    return NextResponse.json({ error: result.error }, { status });
  }

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'chief.fmcsa.lookup',
    metadata: {
      collection: 'fmcsa_carriers',
      success: true,
      recordCount: 1,
    },
  });
  return NextResponse.json(result.profile);
}
