// app/api/penny/query/route.ts
// Proxies chat queries to Pipeline Penny FastAPI backend on Railway
// Keeps PENNY_API_URL server-side, adds Clerk auth verification

import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { isClerkEnabled } from '@/lib/clerk';
import { canAccessPenny, canBypassPennyRoleByEmail, resolvePennyRole } from '@/lib/penny-access';
import { buildPennyContext } from '@/lib/penny-ingest';
import { buildOrgContext } from '@/lib/penny-context';
import { checkPennyRateLimit } from '@/lib/penny-rate-limit';
import { auditLog } from '@/lib/audit-logger';
import { setSentryRequestContext } from '@/lib/sentry-context';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';
const GENERAL_FALLBACK_COOKIE_NAME = 'penny_general_fallback_used';
const GENERAL_FALLBACK_ENABLED = ['1', 'true', 'yes', 'on'].includes(
  (process.env.PENNY_ENABLE_GENERAL_FALLBACK || 'false').trim().toLowerCase()
);
const GENERAL_FALLBACK_SESSION_LIMIT = (() => {
  const parsed = Number.parseInt(process.env.PENNY_GENERAL_FALLBACK_SESSION_LIMIT || '3', 10);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(0, Math.min(parsed, 20));
})();

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
  if (title && category) return `${title} (${category})`;
  if (title) return title;
  if (section && fileSource) return `${section} - ${fileSource}`;
  if (fileSource) return fileSource;
  return '';
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

function enrichComplianceQuery(query: string): string {
  const q = query.toLowerCase();
  const extras: string[] = [];
  if ((q.includes('drink') || q.includes('alcohol') || q.includes('alchohol')) &&
      (q.includes('shift') || q.includes('duty') || q.includes('drive'))) {
    extras.push('382 207', 'pre duty use', 'four hours', 'safety sensitive functions');
  }
  if (q.includes('mvr') || q.includes('motor vehicle record') || q.includes('driving record')) {
    extras.push('391 25', 'annual inquiry', 'review of driving record', 'motor vehicle record', '12 months');
  }
  if (q.includes('tsa') || q.includes('background check') || q.includes('security threat assessment')) {
    extras.push('383.141(d)', 'hazardous materials endorsement', 'for CDL hazmat endorsement',
      'security threat assessment', 'renewed every 5 years or less', 'hazmat endorsement renewal cycle');
  }
  if (q.includes('dvir') || q.includes('driver vehicle inspection report')) {
    extras.push('396.11(a)(4)', 'driver vehicle inspection report', 'three months', 'certification of repairs');
  }
  if (q.includes('roadside inspection')) {
    extras.push('396.9(d)(3)', 'roadside inspection form', '12 months', 'inspection report retention');
  }
  if (
    (q.includes('hours of service') || q.includes('hos') || q.includes('hours') || q.includes('drive a day')) &&
    (q.includes('local') || q.includes('short haul') || q.includes('short-haul') || q.includes('150 mile') || q.includes('150 air-mile'))
  ) {
    extras.push('395.1(e)', '395.3', 'short-haul exception', '150 air-mile radius driver',
      '11 hours', '14th hour', 'normal work reporting location');
  }
  if (
    (q.includes('hazmat') || q.includes('fuel delivery') || q.includes('delivering fuel')) &&
    (q.includes('route') || q.includes('delivery address') || q.includes('address') || q.includes('deviat'))
  ) {
    extras.push('397.67', '49 CFR Part 397', 'hazardous materials routing', 'route deviation', 'delivery destination');
  }
  if (
    (q.includes('maintenance') || q.includes('inspection report') || q.includes('vehicle records')) &&
    !q.includes('driver vehicle inspection report') && !q.includes('dvir') && !q.includes('roadside inspection') &&
    (q.includes('keep') || q.includes('retention') || q.includes('retain') || q.includes('how long'))
  ) {
    extras.push('396.3(c)', 'record retention', 'inspection repair and maintenance',
      '1 year', '6 months after the vehicle leaves the motor carrier control');
  }
  if (extras.length === 0) return query;
  return `${query} ${extras.join(' ')}`.trim();
}

function parseGeneralFallbackUsed(cookieValue: string | undefined, userId: string): number {
  if (!cookieValue) return 0;
  const [cookieUserId, countRaw] = cookieValue.split('|', 2);
  if (!cookieUserId || cookieUserId !== userId) return 0;
  const parsed = Number.parseInt(countRaw || '0', 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(parsed, GENERAL_FALLBACK_SESSION_LIMIT);
}

function encodeGeneralFallbackUsed(userId: string, usedCount: number): string {
  return `${userId}|${Math.max(0, Math.min(usedCount, GENERAL_FALLBACK_SESSION_LIMIT))}`;
}

function buildOrgContextPreview(orgContext: string): string {
  if (!orgContext) return '';
  const preview = orgContext
    .split('\n')
    .filter((line) => line.startsWith('- Driver ID:'))
    .slice(0, 2)
    .join(' || ');
  return preview.slice(0, 220);
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const hasClerk = isClerkEnabled();
  if (!hasClerk) {
    return NextResponse.json({ error: 'Authentication is not configured' }, { status: 503 });
  }

  const { userId, orgId: authOrgId, sessionClaims } = await auth();
  const orgIdFromClaims = sessionClaims?.org_id as string | undefined;
  const orgId = authOrgId || orgIdFromClaims || undefined;
  const auditOrgId = orgId || 'no-org';
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await currentUser();
  setSentryRequestContext(userId, auditOrgId);
  const role = resolvePennyRole(sessionClaims, user);
  const hasEmailBypass = canBypassPennyRoleByEmail(user);
  const effectiveRole = canAccessPenny(role) ? role : hasEmailBypass ? 'admin' : role;

  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  const rateLimitResult = await checkPennyRateLimit(userId);
  if (!rateLimitResult.success) {
    auditLog({
      action: 'rate_limit.exceeded',
      userId,
      orgId: auditOrgId,
      resourceType: 'penny.query',
      metadata: { userId },
    });
    return NextResponse.json(
      { error: 'Rate limit exceeded', retryAfter: 60 },
      {
        status: 429,
        headers: { 'Retry-After': '60' },
      }
    );
  }

  let orgContext = '';
  let orgContextPreview = '';

  try {
    const body = await request.json();
    const { query, chat_history: chatHistory, skill_mode: skillMode, llm_provider: llmProvider, llm_model: llmModel } = body;

    if (!query || typeof query !== 'string') {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    const effectiveQuery = enrichComplianceQuery(query);
    orgContext = orgId ? await buildOrgContext(orgId) : '';
    orgContextPreview = buildOrgContextPreview(orgContext);

    const fallbackUsedCount = parseGeneralFallbackUsed(
      request.cookies.get(GENERAL_FALLBACK_COOKIE_NAME)?.value, userId
    );
    const fallbackRemainingBefore = Math.max(0, GENERAL_FALLBACK_SESSION_LIMIT - fallbackUsedCount);
    const allowGeneralFallback =
      GENERAL_FALLBACK_ENABLED && effectiveRole === 'client' && fallbackRemainingBefore > 0;

    // --- CHUNKED CFR RETRIEVAL (server-side via @tnds/retrieval-core) ---
    // Build grounded context from the local CFR index before hitting Railway.
    // Falls back gracefully if index is empty or not yet built.
    let groundedContext: string | null = null;
    let cfrSources: string[] = [];
    try {
      const { groundedPrompt, sources } = await buildPennyContext({
        query: effectiveQuery,
        orgId: orgId || 'no-org',
        topK: 5,
      });
      if (groundedPrompt && sources.length > 0) {
        groundedContext = groundedPrompt;
        cfrSources = sources;
      }
    } catch {
      // Index not built yet or empty — continue with Railway's own knowledge store
    }
    // --- END CFR RETRIEVAL ---

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
          const responseMs = Date.now() - startedAt;
          auditLog({
            action: 'penny.query',
            userId,
            orgId: auditOrgId,
            resourceType: 'penny.query',
            metadata: {
              provider: 'catalog',
              kbHit: true,
              fallbackUsed: false,
              responseMs,
              orgContextIncluded: orgContext.length > 0,
              orgContextChars: orgContext.length,
              orgContextPreview,
            },
          });
          const categoryLine = categories.slice(0, 10).map((cat: any) => `${cat.name} (${cat.count})`).join(', ');
          const docList = documents.slice(0, 20).map((doc: any, idx: number) => `${idx + 1}. ${doc.title}`).join('\n');
          return NextResponse.json({
            answer:
              `I currently have ${total} indexed knowledge documents.` +
              (categoryLine ? `\n\nTop categories: ${categoryLine}` : '') +
              `\n\nSample documents:\n${docList}\n\nAsk me to summarize any listed document by name.`,
            sources: documents.slice(0, 8).map((doc: any) => doc.title),
            mode: 'catalog',
          });
        }
      }
    }

    // Forward to Railway — use grounded prompt if CFR retrieval succeeded,
    // otherwise fall back to Railway's own knowledge store as before.
    const queryPayload = groundedContext
      ? { question: groundedContext, query: groundedContext }
      : { question: effectiveQuery, query: effectiveQuery };

    const res = await fetch(`${PENNY_API_URL}/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': userId,
        'X-User-Role': effectiveRole,
        ...(orgId ? { 'X-Org-Id': orgId } : {}),
        ...(PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {}),
      },
      body: JSON.stringify({
        ...queryPayload,
        chat_history: Array.isArray(chatHistory) ? chatHistory : [],
        ...(typeof skillMode === 'string' ? { skill_mode: skillMode } : {}),
        ...(typeof llmProvider === 'string' && llmProvider.trim().length > 0
          ? { llm_provider: llmProvider.trim().toLowerCase().slice(0, 32) } : {}),
        ...(typeof llmModel === 'string' && llmModel.trim().length > 0
          ? { llm_model: llmModel.trim().slice(0, 120) } : {}),
        org_context: orgContext,
        allow_general_fallback: allowGeneralFallback,
      }),
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Penny backend error: ${res.status} - ${errorText}`);
      auditLog({
        action: 'penny.query',
        userId,
        orgId: auditOrgId,
        resourceType: 'penny.query',
        severity: 'error',
        metadata: {
          provider: typeof llmProvider === 'string' ? llmProvider.trim().toLowerCase() || 'default' : 'default',
          kbHit: false,
          fallbackUsed: false,
          responseMs: Date.now() - startedAt,
          status: res.status,
          orgContextIncluded: orgContext.length > 0,
          orgContextChars: orgContext.length,
          orgContextPreview,
        },
      });
      return NextResponse.json(
        { error: 'Backend error', answer: 'Something went wrong on the backend. Try again in a moment.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const rawSources = Array.isArray(data?.sources) ? (data.sources as BackendSource[]) : [];
    const backendSources = rawSources.map(normalizeSource).filter((item): item is string => Boolean(item));
    // Merge CFR sources (from local index) with any sources Railway returned
    const sources = [...new Set([...cfrSources, ...backendSources])];
    const generalFallbackUsed = Boolean(data?.general_fallback_used) && allowGeneralFallback;
    const nextFallbackUsedCount = generalFallbackUsed
      ? Math.min(GENERAL_FALLBACK_SESSION_LIMIT, fallbackUsedCount + 1)
      : fallbackUsedCount;
    const fallbackRemainingAfter = Math.max(0, GENERAL_FALLBACK_SESSION_LIMIT - nextFallbackUsedCount);
    const fallbackLimitNotice =
      GENERAL_FALLBACK_ENABLED && !allowGeneralFallback &&
      typeof data?.answer === 'string' &&
      data.answer.toLowerCase().includes("i don't have that information in the current knowledge base.")
        ? `\n\nGeneral fallback limit reached for this session (${GENERAL_FALLBACK_SESSION_LIMIT}/${GENERAL_FALLBACK_SESSION_LIMIT}).`
        : '';

    const responseMs = Date.now() - startedAt;
    auditLog({
      action: 'penny.query',
      userId,
      orgId: auditOrgId,
      resourceType: 'penny.query',
      metadata: {
        provider: typeof llmProvider === 'string' ? llmProvider.trim().toLowerCase() || 'default' : 'default',
        kbHit: sources.length > 0,
        fallbackUsed: generalFallbackUsed,
        responseMs,
        orgContextIncluded: orgContext.length > 0,
        orgContextChars: orgContext.length,
        orgContextPreview,
      },
    });

    const response = NextResponse.json({
      answer:
        typeof data?.answer === 'string' && data.answer.trim().length > 0
          ? `${data.answer}${fallbackLimitNotice}`
          : "I couldn't find an answer to that in the knowledge base.",
      sources,
      mode: groundedContext ? 'cfr-grounded' : (typeof data?.mode === 'string' ? data.mode : 'rag'),
      processing_ms: typeof data?.processing_ms === 'number' ? data.processing_ms : undefined,
      general_fallback_used: generalFallbackUsed,
      general_fallback_remaining: fallbackRemainingAfter,
      general_fallback_limit: GENERAL_FALLBACK_SESSION_LIMIT,
    });

    response.cookies.set({
      name: GENERAL_FALLBACK_COOKIE_NAME,
      value: encodeGeneralFallbackUsed(userId, nextFallbackUsedCount),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Penny proxy error:', error);
    auditLog({
      action: 'penny.query',
      userId,
      orgId: auditOrgId,
      resourceType: 'penny.query',
      severity: 'error',
      metadata: {
        provider: 'unknown',
        kbHit: false,
        fallbackUsed: false,
        responseMs: Date.now() - startedAt,
        orgContextIncluded: orgContext.length > 0,
        orgContextChars: orgContext.length,
        orgContextPreview,
      },
    });
    return NextResponse.json(
      { error: 'Failed to reach backend', answer: 'Cannot connect to Pipeline Penny backend.' },
      { status: 503 }
    );
  }
}
