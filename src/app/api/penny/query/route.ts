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
import { buildMergedPennyCatalog } from '@/lib/penny-catalog';
import { auditLog } from '@/lib/audit-logger';
import { setSentryRequestContext } from '@/lib/sentry-context';
import { recordAiUsageCostAndBudgetAlerts } from '@/lib/modules-gateway/persistence';
import { randomUUID } from 'node:crypto';

const PENNY_API_URL = process.env.PENNY_API_URL || 'http://localhost:8000';
const PENNY_API_KEY = process.env.PENNY_API_KEY || '';
const PENNY_ALLOW_NO_ORG = ['1', 'true', 'yes', 'on'].includes(
  (
    process.env.PENNY_ALLOW_NO_ORG ||
    (process.env.NODE_ENV === 'production' ? 'false' : 'true')
  )
    .trim()
    .toLowerCase()
);
const GENERAL_FALLBACK_COOKIE_NAME = 'penny_general_fallback_used';
const GENERAL_FALLBACK_ENABLED = ['1', 'true', 'yes', 'on'].includes(
  (process.env.PENNY_ENABLE_GENERAL_FALLBACK || 'false').trim().toLowerCase()
);
const GENERAL_FALLBACK_SESSION_LIMIT = (() => {
  const parsed = Number.parseInt(process.env.PENNY_GENERAL_FALLBACK_SESSION_LIMIT || '3', 10);
  if (!Number.isFinite(parsed)) return 3;
  return Math.max(0, Math.min(parsed, 20));
})();
const RAILWAY_ORG_CONTEXT_MAX_CHARS = 7900;
const ORG_CONTEXT_BUDGET_CHARS = 5200;
const GROUNDED_CONTEXT_BUDGET_CHARS = 2400;
const PENNY_COST_PROMPT_PER_1K_USD = Number.parseFloat(process.env.PENNY_COST_PROMPT_PER_1K_USD || '0');
const PENNY_COST_COMPLETION_PER_1K_USD = Number.parseFloat(process.env.PENNY_COST_COMPLETION_PER_1K_USD || '0');
const PENNY_COST_TOTAL_PER_1K_USD = Number.parseFloat(process.env.PENNY_COST_TOTAL_PER_1K_USD || '0');

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
    q.includes("what's available") ||
    q.includes('whats available') ||
    q.includes('what is available') ||
    q.includes('what docs') ||
    q.includes('what documents do you have') ||
    q.includes('show knowledge') ||
    q.includes('show sources') ||
    q.includes('list sources')
  );
}

function shouldIncludeOrgContext(query: string): boolean {
  const q = query.toLowerCase();
  const fleetSignals = [
    'my fleet',
    'our fleet',
    'my company',
    'our company',
    'my drivers',
    'our drivers',
    'my assets',
    'our assets',
    'my permits',
    'our permits',
    'my invoices',
    'our invoices',
    'suspense',
    'telematics',
    'asset id',
    'unit ',
    'employee',
    'driver id',
    'for us',
    'for my operation',
  ];
  return fleetSignals.some((signal) => q.includes(signal));
}

function enrichComplianceQuery(query: string): string {
  const q = query.toLowerCase();
  const extras: string[] = [];
  if (/\bmodule\s*0(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-000', 'Hazardous Materials Regulations Introduction', '49 CFR Parts 171-180');
  }
  if (/\bmodule\s*1(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-001', 'Hazardous Materials Table', '49 CFR 172.101');
  }
  if (/\bmodule\s*2(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-002', 'Shipping Papers', '49 CFR 172.200-205');
  }
  if (/\bmodule\s*3(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-003', 'Packaging Requirements', '49 CFR Parts 173/178');
  }
  if (/\bmodule\s*4(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-004', 'Marking Requirements', '49 CFR 172.300-338');
  }
  if (/\bmodule\s*5(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-005', 'Labeling Requirements', '49 CFR 172.400-450');
  }
  if (/\bmodule\s*6(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-006', 'Placarding Requirements', '49 CFR 172.500-560');
  }
  if (/\bmodule\s*7(\.0)?a\b/.test(q)) {
    extras.push('TNDS-HZ-007a', 'Carrier Requirements: Highway', '49 CFR Parts 177/397');
  }
  if (/\bmodule\s*7(\.0)?b\b/.test(q)) {
    extras.push('TNDS-HZ-007b', 'Carrier Requirements: Air', '49 CFR Part 175');
  }
  if (/\bmodule\s*7(\.0)?c\b/.test(q)) {
    extras.push('TNDS-HZ-007c', 'Carrier Requirements: Rail', '49 CFR Part 174');
  }
  if (/\bmodule\s*7(\.0)?d\b/.test(q)) {
    extras.push('TNDS-HZ-007d', 'Carrier Requirements: Vessel', '49 CFR Part 176');
  }
  if (/\bmodule\s*8(\.0)?\b/.test(q)) {
    extras.push('TNDS-HZ-008', 'Security Requirements', '49 CFR 172.800-804');
  }
  if (
    q.includes('hazmat training') &&
    (q.includes('complete') || q.includes('completed') || q.includes('due') || q.includes('deadline'))
  ) {
    extras.push(
      'hazmat_training_records',
      'training assignments',
      'next due date',
      'assessment passed',
      'certificate status',
      'fcs_training'
    );
  }
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
    (q.includes('hazmat') || q.includes('hazardous material')) &&
    (q.includes('manual') || q.includes('on truck') || q.includes('carry') || q.includes('required document'))
  ) {
    extras.push(
      '49 CFR Part 172',
      '172.602',
      'shipping papers',
      'emergency response information',
      'emergency response guidebook',
      'ERG'
    );
  }
  if (q.includes('part 397') || q.includes('transportation of hazardous materials')) {
    extras.push(
      'cfr-part-397-hazardous-materials-driving',
      'driving and parking rules',
      'attendance and parking',
      'hazmat routing'
    );
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

function truncateContext(value: string, maxChars: number): string {
  if (!value) return '';
  if (value.length <= maxChars) return value;
  const slice = value.slice(0, maxChars);
  const breakAt = Math.max(slice.lastIndexOf('\n'), slice.lastIndexOf(' '));
  if (breakAt > Math.floor(maxChars * 0.6)) {
    return slice.slice(0, breakAt).trim();
  }
  return slice.trim();
}

function buildCombinedContext(options: { orgContext: string; groundedContext: string | null }): string {
  const orgContext = options.orgContext.trim();
  const groundedContext = (options.groundedContext || '').trim();

  if (orgContext && groundedContext) {
    const parts = [
      `### Operator Fleet Context\n${truncateContext(orgContext, ORG_CONTEXT_BUDGET_CHARS)}`,
      `### CFR Grounding Context\n${truncateContext(groundedContext, GROUNDED_CONTEXT_BUDGET_CHARS)}`,
    ];
    return truncateContext(parts.join('\n\n'), RAILWAY_ORG_CONTEXT_MAX_CHARS);
  }

  if (orgContext) {
    return truncateContext(orgContext, RAILWAY_ORG_CONTEXT_MAX_CHARS);
  }

  if (groundedContext) {
    return truncateContext(groundedContext, RAILWAY_ORG_CONTEXT_MAX_CHARS);
  }

  return '';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function parseNonNegativeNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && parsed >= 0) return parsed;
  }
  return null;
}

function normalizeBudgetNumber(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Number(value.toFixed(6));
}

function extractUsageTelemetry(
  rawData: unknown,
  options: { llmProvider?: string; llmModel?: string },
): {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  provider: string;
  model: string;
} | null {
  const data = asRecord(rawData);
  const usage = asRecord(data.usage || data.token_usage || data.usage_metrics);

  const promptTokens = parseNonNegativeNumber(
    usage.prompt_tokens ?? usage.input_tokens ?? data.prompt_tokens ?? data.input_tokens,
  ) || 0;
  const completionTokens = parseNonNegativeNumber(
    usage.completion_tokens ?? usage.output_tokens ?? data.completion_tokens ?? data.output_tokens,
  ) || 0;
  const totalTokens = parseNonNegativeNumber(
    usage.total_tokens ?? data.total_tokens,
  ) || (promptTokens + completionTokens);

  if (totalTokens <= 0) {
    return null;
  }

  const backendCost = parseNonNegativeNumber(
    usage.cost_usd
    ?? usage.total_cost_usd
    ?? usage.estimated_cost_usd
    ?? data.cost_usd
    ?? data.total_cost_usd
    ?? data.estimated_cost_usd,
  );

  let estimatedCostUsd = backendCost ?? 0;
  if (backendCost === null) {
    if (PENNY_COST_PROMPT_PER_1K_USD > 0 || PENNY_COST_COMPLETION_PER_1K_USD > 0) {
      estimatedCostUsd =
        ((promptTokens / 1000) * Math.max(PENNY_COST_PROMPT_PER_1K_USD, 0))
        + ((completionTokens / 1000) * Math.max(PENNY_COST_COMPLETION_PER_1K_USD, 0));
    } else if (PENNY_COST_TOTAL_PER_1K_USD > 0) {
      estimatedCostUsd = (totalTokens / 1000) * Math.max(PENNY_COST_TOTAL_PER_1K_USD, 0);
    }
  }

  const providerRaw = (
    (typeof data.llm_provider === 'string' && data.llm_provider)
    || (typeof data.provider === 'string' && data.provider)
    || options.llmProvider
    || 'default'
  ).trim();
  const modelRaw = (
    (typeof data.llm_model === 'string' && data.llm_model)
    || (typeof data.model === 'string' && data.model)
    || options.llmModel
    || 'default'
  ).trim();

  return {
    promptTokens: Math.floor(promptTokens),
    completionTokens: Math.floor(completionTokens),
    totalTokens: Math.floor(totalTokens),
    estimatedCostUsd: normalizeBudgetNumber(estimatedCostUsd),
    provider: providerRaw.slice(0, 64) || 'default',
    model: modelRaw.slice(0, 120) || 'default',
  };
}

export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  const requestId = request.headers.get('x-request-id')?.trim() || `penny_${randomUUID()}`;
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
  const contextMode = orgId ? 'org' : 'no-org';

  if (!canAccessPenny(role) && !hasEmailBypass) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  if (!orgId && !PENNY_ALLOW_NO_ORG) {
    return NextResponse.json(
      { error: 'Active organization required for Penny access' },
      { status: 403 }
    );
  }

  if (!orgId && effectiveRole !== 'admin') {
    return NextResponse.json(
      { error: 'No-organization Penny mode is restricted to admins' },
      { status: 403 }
    );
  }

  const rateLimitResult = await checkPennyRateLimit(userId);
  if (!rateLimitResult.success) {
    auditLog({
      action: 'rate_limit.exceeded',
      userId,
      orgId: auditOrgId,
      resourceType: 'penny.query',
      metadata: { userId, contextMode },
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
    const includeOrgContext = orgId ? shouldIncludeOrgContext(query) : false;
    orgContext = orgId && includeOrgContext ? await buildOrgContext(orgId) : '';
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
    let groundedSources: string[] = [];
    try {
      const { groundedPrompt, sources } = await buildPennyContext({
        query: effectiveQuery,
        orgId,
        topK: 5,
      });
      if (groundedPrompt && sources.length > 0) {
        groundedContext = groundedPrompt;
        groundedSources = sources;
      }
    } catch {
      // Index not built yet or empty — continue with Railway's own knowledge store
    }
    // --- END CFR RETRIEVAL ---

    if (isKnowledgeCatalogQuery(query)) {
      const catalog = await buildMergedPennyCatalog({
        limit: 200,
        pennyApiUrl: PENNY_API_URL,
        pennyApiKey: PENNY_API_KEY,
      });
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
            contextMode,
            orgContextIncluded: orgContext.length > 0,
            orgContextChars: orgContext.length,
            orgContextPreview,
          },
        });
        const categoryLine = categories.slice(0, 12).map((cat) => `${cat.name} (${cat.count})`).join(', ');
        const docList = documents.slice(0, 25).map((doc, idx) => `${idx + 1}. ${doc.title}`).join('\n');
        return NextResponse.json({
          answer:
            `I currently have ${total} indexed knowledge documents available.` +
            (categoryLine ? `\n\nCategories: ${categoryLine}` : '') +
            `\n\nSample documents:\n${docList}\n\nAsk me to summarize any listed document by name.`,
          sources: documents.slice(0, 10).map((doc) => doc.title),
          mode: 'catalog',
        });
      }
    }

    // Forward to Railway — send the SHORT user query as `query` (must stay under
    // Railway's MAX_QUERY_CHARS=2500) and pass CFR grounding through `org_context`
    // which feeds into the LLM system prompt (ORG_CONTEXT_MAX_CHARS=8000).
    // NOTE: Only send fields Railway's QueryRequest Pydantic v2 model accepts.
    const combinedContext = buildCombinedContext({ orgContext, groundedContext });

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
        query: effectiveQuery,
        ...(typeof skillMode === 'string' ? { skill_mode: skillMode } : {}),
        ...(typeof llmProvider === 'string' && llmProvider.trim().length > 0
          ? { llm_provider: llmProvider.trim().toLowerCase().slice(0, 32) } : {}),
        ...(typeof llmModel === 'string' && llmModel.trim().length > 0
          ? { llm_model: llmModel.trim().slice(0, 120) } : {}),
        org_context: combinedContext,
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
          contextMode,
            orgContextIncluded: orgContext.length > 0,
            orgContextChars: orgContext.length,
            groundedContextChars: groundedContext?.length ?? 0,
            combinedContextChars: combinedContext.length,
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
    // Merge locally grounded sources with any sources Railway returned
    const sources = [...new Set([...groundedSources, ...backendSources])];
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
        contextMode,
        orgContextIncluded: orgContext.length > 0,
        orgContextChars: orgContext.length,
        groundedContextChars: groundedContext?.length ?? 0,
        combinedContextChars: combinedContext.length,
        orgContextPreview,
      },
    });

    const usageTelemetry = extractUsageTelemetry(data, {
      llmProvider: typeof llmProvider === 'string' ? llmProvider.trim().toLowerCase() : undefined,
      llmModel: typeof llmModel === 'string' ? llmModel.trim() : undefined,
    });

    if (usageTelemetry) {
      try {
        const usageResult = await recordAiUsageCostAndBudgetAlerts({
          requestId,
          orgId: auditOrgId,
          userId,
          feature: 'penny.query',
          provider: usageTelemetry.provider,
          model: usageTelemetry.model,
          promptTokens: usageTelemetry.promptTokens,
          completionTokens: usageTelemetry.completionTokens,
          totalTokens: usageTelemetry.totalTokens,
          estimatedCostUsd: usageTelemetry.estimatedCostUsd,
          metadata: {
            responseMs,
            contextMode,
            kbHit: sources.length > 0,
            fallbackUsed: generalFallbackUsed,
          },
        });

        auditLog({
          action: 'ai.usage.recorded',
          userId,
          orgId: auditOrgId,
          resourceType: 'penny.query',
          metadata: {
            requestId,
            provider: usageTelemetry.provider,
            model: usageTelemetry.model,
            promptTokens: usageTelemetry.promptTokens,
            completionTokens: usageTelemetry.completionTokens,
            totalTokens: usageTelemetry.totalTokens,
            estimatedCostUsd: usageTelemetry.estimatedCostUsd,
          },
        });

        for (const alert of usageResult.alerts) {
          auditLog({
            action: 'budget.alert',
            userId,
            orgId: auditOrgId,
            resourceType: 'penny.query',
            severity: alert.level === 'critical' ? 'error' : 'warn',
            metadata: {
              level: alert.level,
              spendUsd: alert.spendUsd,
              thresholdUsd: alert.thresholdUsd,
              periodStart: alert.periodStart,
              periodEnd: alert.periodEnd,
            },
          });
        }
      } catch (usageError) {
        console.error('[penny.query] failed to persist usage cost record', {
          requestId,
          orgId: auditOrgId,
          userId,
          message: usageError instanceof Error ? usageError.message : String(usageError),
        });
      }
    }

    const response = NextResponse.json({
      answer:
        typeof data?.answer === 'string' && data.answer.trim().length > 0
          ? `${data.answer}${fallbackLimitNotice}`
          : "I couldn't find an answer to that in the knowledge base.",
      sources,
      mode: groundedContext ? 'grounded' : (typeof data?.mode === 'string' ? data.mode : 'rag'),
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
        contextMode,
        orgContextIncluded: orgContext.length > 0,
        orgContextChars: orgContext.length,
        groundedContextChars: 0,
        combinedContextChars: 0,
        orgContextPreview,
      },
    });
    return NextResponse.json(
      { error: 'Failed to reach backend', answer: 'Cannot connect to Pipeline Penny backend.' },
      { status: 503 }
    );
  }
}
