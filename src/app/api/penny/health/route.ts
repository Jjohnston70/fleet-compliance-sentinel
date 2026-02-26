// app/api/penny/health/route.ts
// Health check proxy to Pipeline Penny FastAPI backend

import { NextResponse } from 'next/server';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';

export async function GET() {
  try {
    const res = await fetch(`${PENNY_API_URL}/health`, {
      method: 'GET',
      headers: PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {},
      // Short timeout for health checks
      signal: AbortSignal.timeout(5000),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({ status: 'online', ...data });
    }

    return NextResponse.json({ status: 'unhealthy' }, { status: 502 });
  } catch {
    return NextResponse.json({ status: 'offline' }, { status: 503 });
  }
}
