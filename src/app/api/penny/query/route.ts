// app/api/penny/query/route.ts
// Proxies chat queries to Pipeline Penny FastAPI backend on Railway
// Keeps PENNY_API_URL server-side, adds Clerk auth verification

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';
import { listFilesInFolder } from '@/lib/drive';

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

function isResourceListQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('resource') ||
    q.includes('knowledge base') ||
    q.includes('knowledge resources') ||
    q.includes('list files') ||
    q.includes('what documents')
  );
}

function isKnowledgeCatalogQuery(query: string): boolean {
  const q = query.toLowerCase();
  return (
    q.includes('list knowledge') ||
    q.includes('knowledge items') ||
    q.includes('knowledge base items') ||
    q.includes('what knowledge') ||
    q.includes('what docs') ||
    q.includes('what documents do you have') ||
    q.includes('show knowledge')
  );
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

  const user = await currentUser();
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);
  const effectiveRole = canAccessPenny(role) ? role : hasEmailBypass ? 'admin' : role;

  // Only allowed roles can query
  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { query, chat_history: chatHistory, skill_mode: skillMode } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    if (isKnowledgeCatalogQuery(query)) {
      const catalogRes = await fetch(`${PENNY_API_URL}/catalog?limit=40`, {
        headers: PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {},
      });

      if (catalogRes.ok) {
        const catalog = await catalogRes.json();
        const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];
        const documents = Array.isArray(catalog?.documents) ? catalog.documents : [];
        const total = typeof catalog?.knowledge_docs === 'number' ? catalog.knowledge_docs : documents.length;

        if (documents.length > 0) {
          const categoryLine = categories
            .slice(0, 10)
            .map((cat: any) => `${cat.name} (${cat.count})`)
            .join(', ');
          const docList = documents
            .slice(0, 20)
            .map((doc: any, idx: number) => `${idx + 1}. ${doc.title}`)
            .join('\n');

          return NextResponse.json({
            answer:
              `I currently have ${total} indexed knowledge documents.` +
              (categoryLine ? `\n\nTop categories: ${categoryLine}` : '') +
              `\n\nSample documents:\n${docList}\n\nUse /resources for file browsing and ask me to summarize any listed document by name.`,
            sources: documents.slice(0, 8).map((doc: any) => doc.title),
            mode: 'catalog',
          });
        }
      }
    }

    // Forward to Pipeline Penny backend
    const res = await fetch(`${PENNY_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Pass user context to backend
        'X-User-Id': userId,
        'X-User-Role': effectiveRole,
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

    // If the backend knowledge store is empty, still answer "list resources" prompts
    // using the protected Google Drive resources folder.
    if (sources.length === 0 && isResourceListQuery(query)) {
      const folderId = process.env.GOOGLE_DRIVE_PUBLIC_RESOURCES_FOLDER_ID || '';
      const resources = await listFilesInFolder(folderId);
      const names = resources.files
        .map((file) => file.name?.trim())
        .filter((name): name is string => Boolean(name))
        .slice(0, 20);

      if (names.length > 0) {
        const numberedList = names.map((name, idx) => `${idx + 1}. ${name}`).join('\n');
        return NextResponse.json({
          answer: `Here are the resources currently available:\n${numberedList}\n\nOpen /resources to view and open each file.`,
          sources: names,
          mode: 'drive-list',
        });
      }
    }

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
