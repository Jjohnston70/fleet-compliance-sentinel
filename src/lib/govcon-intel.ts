import { getSQL } from '@/lib/fleet-compliance-db';

export interface GovConIntelRecord {
  orgId: string;
  opportunityId: string;
  sourceUrl: string | null;
  sourceSummary: string | null;
  sourceText: string;
  extractedAt: string;
  sourceMeta: Record<string, unknown>;
}

export interface DerivedBidInputs {
  technical_fit: number;
  set_aside_match: number;
  competition_level: number;
  contract_value: number;
  timeline_feasibility: number;
  relationship: number;
  strategic_value: number;
  evidence: string[];
}

interface GovConOpportunityLike {
  id: string;
  title?: string | null;
  agency?: string | null;
  set_aside_type?: string | null;
  naics_code?: string | null;
  estimated_value?: number | null;
  response_deadline?: string | Date | null;
  description?: string | null;
  url?: string | null;
}

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function toIsoString(value: unknown): string | null {
  const parsed = new Date(String(value ?? ''));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, '\n').replace(/\u0000/g, '').replace(/\n{3,}/g, '\n\n').replace(/[ \t]{2,}/g, ' ').trim();
}

function stripHtml(html: string): string {
  const noScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');

  const unescaped = noScripts
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");

  return normalizeWhitespace(
    unescaped
      .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|tr|td|th|section|article|br)>/gi, '\n')
      .replace(/<[^>]+>/g, ' '),
  );
}

function sentenceSplit(text: string): string[] {
  return text
    .split(/(?<=[.?!])\s+/)
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0);
}

function extractRequirementLines(text: string, limit = 8): string[] {
  const lines = text.split('\n').map((line) => line.trim()).filter((line) => line.length > 0);
  const keywords = [
    'shall',
    'must',
    'required',
    'requirement',
    'deliverable',
    'evaluation',
    'submission',
    'deadline',
    'period of performance',
    'scope',
  ];

  const picked: string[] = [];
  const seen = new Set<string>();
  for (const line of lines) {
    const normalized = line.toLowerCase();
    if (!keywords.some((keyword) => normalized.includes(keyword))) continue;
    const cleaned = line.replace(/^[\-\*\d\.\)\(]+\s*/, '').trim();
    if (!cleaned) continue;
    if (seen.has(cleaned.toLowerCase())) continue;
    seen.add(cleaned.toLowerCase());
    picked.push(cleaned.slice(0, 260));
    if (picked.length >= limit) break;
  }
  return picked;
}

function buildSummaryFromText(sourceText: string): string {
  if (!sourceText) return '';
  const sentences = sentenceSplit(sourceText).slice(0, 6);
  const requirements = extractRequirementLines(sourceText, 6);

  const parts: string[] = [];
  if (sentences.length > 0) {
    parts.push(`Solicitation overview: ${sentences.join(' ')}`.slice(0, 1300));
  }
  if (requirements.length > 0) {
    parts.push(`Key requirements:\n${requirements.map((item) => `- ${item}`).join('\n')}`);
  }

  return normalizeWhitespace(parts.join('\n\n')).slice(0, 2600);
}

export async function ensureGovConIntelTable(): Promise<void> {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS govcon_opportunity_intel (
      org_id TEXT NOT NULL,
      opportunity_id TEXT NOT NULL,
      source_url TEXT,
      source_summary TEXT,
      source_text TEXT NOT NULL,
      source_meta JSONB NOT NULL DEFAULT '{}'::jsonb,
      extracted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (org_id, opportunity_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_govcon_opportunity_intel_org_extracted
    ON govcon_opportunity_intel (org_id, extracted_at DESC)
  `;
}

export async function getGovConIntelRecord(
  orgId: string,
  opportunityId: string,
): Promise<GovConIntelRecord | null> {
  await ensureGovConIntelTable();
  const sql = getSQL();
  const rows = await sql`
    SELECT org_id, opportunity_id, source_url, source_summary, source_text, source_meta, extracted_at
    FROM govcon_opportunity_intel
    WHERE org_id = ${orgId}
      AND opportunity_id = ${opportunityId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    orgId: String(row.org_id ?? orgId),
    opportunityId: String(row.opportunity_id ?? opportunityId),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceSummary: row.source_summary ? String(row.source_summary) : null,
    sourceText: String(row.source_text ?? ''),
    sourceMeta: row.source_meta && typeof row.source_meta === 'object' ? row.source_meta as Record<string, unknown> : {},
    extractedAt: String(row.extracted_at ?? ''),
  };
}

export async function upsertGovConIntelRecord(input: {
  orgId: string;
  opportunityId: string;
  sourceUrl?: string | null;
  sourceSummary?: string | null;
  sourceText: string;
  sourceMeta?: Record<string, unknown>;
}): Promise<GovConIntelRecord> {
  await ensureGovConIntelTable();
  const sql = getSQL();
  const summary = input.sourceSummary ? input.sourceSummary.slice(0, 4000) : null;
  const text = input.sourceText.slice(0, 120_000);
  const meta = input.sourceMeta || {};

  const rows = await sql`
    INSERT INTO govcon_opportunity_intel (
      org_id,
      opportunity_id,
      source_url,
      source_summary,
      source_text,
      source_meta,
      extracted_at
    ) VALUES (
      ${input.orgId},
      ${input.opportunityId},
      ${input.sourceUrl ?? null},
      ${summary},
      ${text},
      ${JSON.stringify(meta)}::jsonb,
      NOW()
    )
    ON CONFLICT (org_id, opportunity_id) DO UPDATE
      SET source_url = EXCLUDED.source_url,
          source_summary = EXCLUDED.source_summary,
          source_text = EXCLUDED.source_text,
          source_meta = EXCLUDED.source_meta,
          extracted_at = NOW()
    RETURNING org_id, opportunity_id, source_url, source_summary, source_text, source_meta, extracted_at
  `;

  const row = rows[0] as Record<string, unknown>;
  return {
    orgId: String(row.org_id ?? input.orgId),
    opportunityId: String(row.opportunity_id ?? input.opportunityId),
    sourceUrl: row.source_url ? String(row.source_url) : null,
    sourceSummary: row.source_summary ? String(row.source_summary) : null,
    sourceText: String(row.source_text ?? ''),
    sourceMeta: row.source_meta && typeof row.source_meta === 'object' ? row.source_meta as Record<string, unknown> : {},
    extractedAt: String(row.extracted_at ?? ''),
  };
}

export async function extractSolicitationTextFromUrl(sourceUrl: string): Promise<{
  sourceText: string;
  sourceSummary: string;
  sourceMeta: Record<string, unknown>;
}> {
  const normalizedUrl = sourceUrl.trim();
  if (!normalizedUrl) {
    throw new Error('Missing source URL');
  }

  const response = await fetch(normalizedUrl, {
    method: 'GET',
    cache: 'no-store',
    signal: AbortSignal.timeout(40_000),
    headers: {
      Accept: 'text/html,application/pdf,text/plain;q=0.9,*/*;q=0.8',
      'User-Agent': 'TNDS-GovCon-Intel/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Source fetch failed with HTTP ${response.status}`);
  }

  const contentType = String(response.headers.get('content-type') || '').toLowerCase();
  let sourceText = '';

  if (contentType.includes('application/pdf') || normalizedUrl.toLowerCase().endsWith('.pdf')) {
    const { PDFParse } = await import('pdf-parse');
    const raw = Buffer.from(await response.arrayBuffer());
    const parser = new PDFParse({ data: raw });
    const parsed = await parser.getText();
    await parser.destroy();
    sourceText = normalizeWhitespace(parsed.text || '');
  } else if (contentType.includes('text/plain')) {
    sourceText = normalizeWhitespace(await response.text());
  } else {
    const html = await response.text();
    sourceText = stripHtml(html);
  }

  if (!sourceText) {
    throw new Error('No extractable text found at source URL');
  }

  const summary = buildSummaryFromText(sourceText);
  return {
    sourceText,
    sourceSummary: summary,
    sourceMeta: {
      contentType,
      sourceLength: sourceText.length,
      fetchedAt: new Date().toISOString(),
    },
  };
}

export async function ensureGovConIntelForOpportunity(input: {
  orgId: string;
  opportunity: GovConOpportunityLike;
  forceRefresh?: boolean;
}): Promise<GovConIntelRecord | null> {
  const sourceUrl = String(input.opportunity.url || '').trim();
  if (!sourceUrl) return null;

  if (!input.forceRefresh) {
    const existing = await getGovConIntelRecord(input.orgId, input.opportunity.id);
    if (existing && existing.sourceText.length > 300) {
      return existing;
    }
  }

  const extracted = await extractSolicitationTextFromUrl(sourceUrl);
  return upsertGovConIntelRecord({
    orgId: input.orgId,
    opportunityId: input.opportunity.id,
    sourceUrl,
    sourceText: extracted.sourceText,
    sourceSummary: extracted.sourceSummary,
    sourceMeta: extracted.sourceMeta,
  });
}

export function deriveBidInputsFromDocumentation(opportunity: GovConOpportunityLike, intelText: string): DerivedBidInputs {
  const text = `${String(opportunity.title || '')}\n${String(opportunity.description || '')}\n${intelText}`.toLowerCase();
  const evidence: string[] = [];

  const capabilityKeywords = [
    'data',
    'analytics',
    'dashboard',
    'integration',
    'software',
    'automation',
    'cloud',
    'cyber',
    'security',
    'nist',
    'reporting',
    'workflow',
  ];
  const technicalHits = capabilityKeywords.filter((keyword) => text.includes(keyword)).length;
  let technicalFit = clampScore(45 + technicalHits * 4 + (String(opportunity.naics_code || '').startsWith('5415') ? 12 : 0));
  evidence.push(`Technical keyword hits: ${technicalHits} (${capabilityKeywords.filter((keyword) => text.includes(keyword)).slice(0, 6).join(', ') || 'none'})`);

  const setAside = String(opportunity.set_aside_type || '').toUpperCase();
  let setAsideMatch = 55;
  if (setAside.includes('SDVOSB') || setAside.includes('VOSB')) setAsideMatch = 95;
  else if (setAside.includes('SMALL')) setAsideMatch = 82;
  else if (setAside.includes('HUBZONE') || setAside.includes('WOSB') || setAside.includes('8A')) setAsideMatch = 72;
  else if (setAside.includes('SOLE')) setAsideMatch = 90;
  else if (setAside.includes('FULL')) setAsideMatch = 42;
  evidence.push(`Set-aside interpreted as ${setAside || 'unknown'} -> ${setAsideMatch}`);

  let competitionLevel = 58;
  if (text.includes('full and open') || text.includes('unrestricted')) competitionLevel = 34;
  if (text.includes('small business set-aside')) competitionLevel = 72;
  if (text.includes('sdvosb') || text.includes('service-disabled veteran-owned')) competitionLevel = 85;
  if (text.includes('sole source')) competitionLevel = 94;
  if (text.includes('multiple award')) competitionLevel = Math.max(40, competitionLevel - 8);
  evidence.push(`Competition signal derived from solicitation language -> ${competitionLevel}`);

  const contractValue = Number.isFinite(Number(opportunity.estimated_value))
    ? Number(opportunity.estimated_value)
    : 100000;

  const deadlineIso = toIsoString(opportunity.response_deadline);
  let timelineFeasibility = 60;
  if (deadlineIso) {
    const deadline = new Date(deadlineIso);
    const days = Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days > 45) timelineFeasibility = 85;
    else if (days > 21) timelineFeasibility = 73;
    else if (days > 10) timelineFeasibility = 58;
    else timelineFeasibility = 36;

    if (text.includes('oral presentation') || text.includes('site visit')) {
      timelineFeasibility = clampScore(timelineFeasibility - 8);
    }
    evidence.push(`Timeline uses ${days} day(s) until deadline -> ${timelineFeasibility}`);
  } else {
    evidence.push('Timeline fallback used because deadline is unavailable');
  }

  let relationship = 45;
  const agency = String(opportunity.agency || '').toLowerCase();
  if (agency.includes('veterans affairs') || agency.includes('va')) relationship = 58;
  if (agency.includes('small business')) relationship = Math.max(relationship, 52);
  evidence.push(`Relationship baseline derived from agency context (${opportunity.agency || 'unknown'}) -> ${relationship}`);

  let strategicValue = 60;
  if (agency.includes('veterans affairs') || agency.includes('va')) strategicValue += 15;
  if (setAside.includes('SDVOSB') || setAside.includes('VOSB')) strategicValue += 10;
  if (text.includes('idiq') || text.includes('blanket purchase agreement')) strategicValue += 8;
  strategicValue = clampScore(strategicValue);
  evidence.push(`Strategic value from agency/set-aside/vehicle signals -> ${strategicValue}`);

  technicalFit = clampScore(technicalFit);
  setAsideMatch = clampScore(setAsideMatch);
  competitionLevel = clampScore(competitionLevel);
  timelineFeasibility = clampScore(timelineFeasibility);
  relationship = clampScore(relationship);

  return {
    technical_fit: technicalFit,
    set_aside_match: setAsideMatch,
    competition_level: competitionLevel,
    contract_value: contractValue,
    timeline_feasibility: timelineFeasibility,
    relationship,
    strategic_value: strategicValue,
    evidence,
  };
}

export function buildDocumentationAppendix(intelRecord: GovConIntelRecord): string {
  const summary = (intelRecord.sourceSummary || '').trim();
  if (!summary) return '';
  const trimmed = summary.slice(0, 3200);
  return [
    '### Solicitation Intelligence (Auto-Extracted)',
    `Source URL: ${intelRecord.sourceUrl || 'n/a'}`,
    `Extracted At: ${intelRecord.extractedAt}`,
    '',
    trimmed,
  ].join('\n');
}
