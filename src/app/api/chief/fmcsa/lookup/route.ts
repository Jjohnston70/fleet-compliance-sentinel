import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import { lookupFmcsaCarrier } from '@/lib/chief-fmcsa-client';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  if (!isClerkEnabled()) {
    return NextResponse.json({ error: 'Auth not configured.' }, { status: 503 });
  }

  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
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
