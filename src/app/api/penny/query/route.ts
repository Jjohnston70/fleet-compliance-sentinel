// app/api/penny/query/route.ts
// Proxies chat queries to Pipeline Penny FastAPI backend on Railway
// Keeps PENNY_API_URL server-side, adds Clerk auth verification

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';

export async function POST(request: NextRequest) {
  const hasClerk = isClerkEnabled();
  if (!hasClerk) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  // Verify user is authenticated
  const { userId, sessionClaims } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get role from Clerk metadata
  const metadata = (sessionClaims as any)?.metadata || {};
  const role = metadata.role || 'member';

  // Only allowed roles can query
  const allowedRoles = ['admin', 'demo', 'client'];
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { query } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    // Forward to Pipeline Penny backend
    const res = await fetch(`${PENNY_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass user context to backend
        'X-User-Id': userId,
        'X-User-Role': role,
        ...(PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {}),
      },
      body: JSON.stringify({ query }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Penny backend error: ${res.status} - ${errorText}`);
      return NextResponse.json(
        { error: 'Backend error', answer: 'Something went wrong on the backend. Try again in a moment.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Penny proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to reach backend', answer: 'Cannot connect to Pipeline Penny backend.' },
      { status: 503 }
    );
  }
}
