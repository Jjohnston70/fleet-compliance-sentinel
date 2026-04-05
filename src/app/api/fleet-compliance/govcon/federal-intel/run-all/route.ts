export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
} from '@/lib/govcon-compliance-command-runtime';

const PENNY_API_URL = (process.env.PENNY_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
const PENNY_API_KEY = (process.env.PENNY_API_KEY || '').trim();

type GovConSetAsideType =
  | 'SDVOSB'
  | 'VOSB'
  | '8a'
  | 'HUBZone'
  | 'WOSB'
  | 'small_business'
  | 'full_open'
  | 'sole_source';

interface RunAllRequestBody {
  naics_codes?: unknown;
  months_back?: unknown;
}

interface FederalIntelSamOpportunity {
  notice_id?: unknown;
  title?: unknown;
  agency?: unknown;
  set_aside?: unknown;
  posted_date?: unknown;
  due_date?: unknown;
  naics?: unknown;
  state?: unknown;
  link?: unknown;
}

interface FederalIntelRunAllResponse {
  summary?: unknown;
  sam?: unknown;
  usaspending?: unknown;
  grants?: unknown;
  sbir?: unknown;
  subawards?: unknown;
}

function parseDateOrNull(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function parseNaicsCodes(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const parsed = value
    .filter((entry): entry is string => typeof entry === 'string')
    .map((entry) => entry.trim())
    .filter((entry) => entry.length > 0)
    .slice(0, 12);
  return parsed.length > 0 ? parsed : undefined;
}

function parseMonthsBack(value: unknown): number {
  const fallback = 3;
  if (value == null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  const rounded = Math.floor(parsed);
  if (rounded < 1) return 1;
  if (rounded > 24) return 24;
  return rounded;
}

function toNonEmptyString(value: unknown): string {
  const parsed = String(value ?? '').trim();
  return parsed;
}

function toSafeUrl(value: unknown): string | undefined {
  const parsed = toNonEmptyString(value);
  if (!parsed) return undefined;
  try {
    const url = new URL(parsed);
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString();
    }
    return undefined;
  } catch {
    return undefined;
  }
}

function mapSetAsideType(rawValue: unknown): GovConSetAsideType {
  const raw = toNonEmptyString(rawValue).toUpperCase();
  if (!raw) return 'full_open';
  if (raw.includes('SDVOSB')) return 'SDVOSB';
  if (raw.includes('VOSB')) return 'VOSB';
  if (raw.includes('8(A') || raw.includes('8A')) return '8a';
  if (raw.includes('HUBZONE')) return 'HUBZone';
  if (raw.includes('WOSB') || raw.includes('WOMEN')) return 'WOSB';
  if (raw.includes('SOLE')) return 'sole_source';
  if (raw.includes('SMALL')) return 'small_business';
  return 'full_open';
}

function summarizeRemoteCounts(payload: FederalIntelRunAllResponse): Record<string, number> {
  const sources: Record<string, unknown> = {
    sam: payload.sam,
    usaspending: payload.usaspending,
    grants: payload.grants,
    sbir: payload.sbir,
    subawards: payload.subawards,
  };

  const counts: Record<string, number> = {};
  for (const [key, value] of Object.entries(sources)) {
    counts[key] = Array.isArray(value) ? value.length : 0;
  }
  return counts;
}

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: RunAllRequestBody = {};
  try {
    body = (await req.json()) as RunAllRequestBody;
  } catch {
    body = {};
  }

  const monthsBack = parseMonthsBack(body.months_back);
  const naicsCodes = parseNaicsCodes(body.naics_codes);

  const requestBody: Record<string, unknown> = {
    months_back: monthsBack,
  };
  if (naicsCodes) {
    requestBody.naics_codes = naicsCodes;
  }

  let remotePayload: FederalIntelRunAllResponse = {};
  try {
    const remoteResponse = await fetch(`${PENNY_API_URL}/api/federal-intel/run-all`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(PENNY_API_KEY ? { 'X-Penny-Api-Key': PENNY_API_KEY } : {}),
      },
      body: JSON.stringify(requestBody),
      cache: 'no-store',
      signal: AbortSignal.timeout(120_000),
    });

    remotePayload = (await remoteResponse.json().catch(() => ({}))) as FederalIntelRunAllResponse;

    if (!remoteResponse.ok) {
      const detail = typeof (remotePayload as { detail?: unknown }).detail === 'string'
        ? String((remotePayload as { detail?: unknown }).detail)
        : `Federal intel backend returned HTTP ${remoteResponse.status}`;
      return NextResponse.json({ ok: false, error: detail }, { status: 502 });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to contact federal intel backend';
    return NextResponse.json({ ok: false, error: message }, { status: 502 });
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const existingOpportunities = await runtimeRef.opportunityService.listOpportunities();
    const knownSolicitationNumbers = new Set(
      existingOpportunities
        .map((entry: unknown) => toNonEmptyString((entry as { solicitation_number?: unknown })?.solicitation_number).toLowerCase())
        .filter((entry: string) => entry.length > 0),
    );

    const samResults = Array.isArray(remotePayload.sam) ? remotePayload.sam as FederalIntelSamOpportunity[] : [];
    const importErrors: string[] = [];
    let imported = 0;
    let skippedDuplicates = 0;
    let skippedMissingNoticeId = 0;

    for (const row of samResults) {
      const noticeId = toNonEmptyString(row.notice_id);
      if (!noticeId) {
        skippedMissingNoticeId += 1;
        continue;
      }

      const solicitationKey = noticeId.toLowerCase();
      if (knownSolicitationNumbers.has(solicitationKey)) {
        skippedDuplicates += 1;
        continue;
      }

      try {
        const now = new Date();
        const fallbackDeadline = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        const responseDeadline = parseDateOrNull(row.due_date) || fallbackDeadline;
        const postedDate = parseDateOrNull(row.posted_date) || now;
        const naicsCode = toNonEmptyString(row.naics) || '000000';
        const agency = toNonEmptyString(row.agency) || 'Unknown Agency';
        const title = toNonEmptyString(row.title) || `SAM opportunity ${noticeId}`;
        const state = toNonEmptyString(row.state);
        const setAsideType = mapSetAsideType(row.set_aside);
        const description = [
          'Imported from Federal Intel run-all.',
          `Set-aside: ${toNonEmptyString(row.set_aside) || 'n/a'}.`,
          `NAICS: ${naicsCode}.`,
        ].join(' ');

        await runtimeRef.opportunityService.createOpportunity(
          title,
          noticeId,
          agency,
          responseDeadline,
          setAsideType,
          naicsCode,
          'Imported from SAM.gov federal intelligence feed',
          description,
          {
            posted_date: postedDate,
            status: 'identified',
            source: 'sam_gov',
            place_of_performance: state || undefined,
            url: toSafeUrl(row.link),
          },
        );

        knownSolicitationNumbers.add(solicitationKey);
        imported += 1;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown import error';
        importErrors.push(`${noticeId}: ${message}`);
      }
    }

    return NextResponse.json({
      ok: true,
      imported,
      skippedDuplicates,
      skippedMissingNoticeId,
      importErrors: importErrors.slice(0, 50),
      remoteSummary: remotePayload.summary || null,
      remoteCounts: summarizeRemoteCounts(remotePayload),
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-federal-intel-run-all] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to import federal intelligence data' }, { status: 500 });
  }
}
