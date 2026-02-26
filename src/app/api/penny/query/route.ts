// app/api/penny/query/route.ts
// Proxies chat queries to Pipeline Penny FastAPI backend on Railway
// Keeps PENNY_API_URL server-side, adds Clerk auth verification

import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';

type BackendSource =
  | string
  | {
      title?: string;
      category?: string;
      source?: string;
      section?: string;
    };

function normalizeSource(source: BackendSource): string {
  if (typeof source === 'string') {
    return source.trim();
  }

  const title = source.title?.trim();
  const category = source.category?.trim();
  const section = source.section?.trim();
  const fileSource = source.source?.trim();

  if (title && category) {
    return `${title} (${category})`;
  }
  if (title) {
    return title;
  }
  if (section && fileSource) {
    return `${section} - ${fileSource}`;
  }
  if (fileSource) {
    return fileSource;
  }

  return '';
}

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
    const { query, chat_history: chatHistory, skill_mode: skillMode } = body;

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
      body: JSON.stringify({
        // Desktop Penny API expects "question"; current Railway scaffold expects "query".
        question: query,
        query,
        chat_history: Array.isArray(chatHistory) ? chatHistory : [],
        ...(typeof skillMode === 'string' ? { skill_mode: skillMode } : {}),
      }),
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
    const rawSources = Array.isArray(data?.sources) ? (data.sources as BackendSource[]) : [];
    const sources = rawSources
      .map(normalizeSource)
      .filter((item): item is string => Boolean(item));

    return NextResponse.json({
      answer:
        typeof data?.answer === 'string' && data.answer.trim().length > 0
          ? data.answer
          : "I couldn't find an answer to that in the knowledge base.",
      sources,
      mode: typeof data?.mode === 'string' ? data.mode : 'rag',
      processing_ms: typeof data?.processing_ms === 'number' ? data.processing_ms : undefined,
    });
  } catch (error) {
    console.error('Penny proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to reach backend', answer: 'Cannot connect to Pipeline Penny backend.' },
      { status: 503 }
    );
  }
}
