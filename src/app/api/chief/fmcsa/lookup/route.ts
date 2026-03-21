import { NextRequest, NextResponse } from 'next/server';
import { lookupFmcsaCarrier } from '@/lib/chief-fmcsa-client';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    await requireChiefOrg(req);
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
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json(result.profile);
}
