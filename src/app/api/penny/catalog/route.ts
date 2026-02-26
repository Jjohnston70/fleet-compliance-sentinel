import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';

export async function GET(request: NextRequest) {
  const hasClerk = isClerkEnabled();
  if (!hasClerk) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);
  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const rawLimit = Number(searchParams.get('limit') || '120');
  const limit = Number.isFinite(rawLimit) ? Math.max(1, Math.min(rawLimit, 300)) : 120;

  try {
    const res = await fetch(`${PENNY_API_URL}/catalog?limit=${limit}`, {
      headers: PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {},
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Penny catalog backend error: ${res.status} - ${body}`);
      return NextResponse.json({ error: 'Backend error' }, { status: 502 });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Penny catalog proxy error:', error);
    return NextResponse.json({ error: 'Failed to reach backend' }, { status: 503 });
  }
}

