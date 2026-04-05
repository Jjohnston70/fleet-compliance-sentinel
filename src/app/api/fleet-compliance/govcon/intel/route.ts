export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
} from '@/lib/govcon-compliance-command-runtime';
import {
  ensureGovConIntelForOpportunity,
  getGovConIntelRecord,
} from '@/lib/govcon-intel';

function getOpportunityIdFromUrl(req: NextRequest): string {
  const url = new URL(req.url);
  return String(url.searchParams.get('opportunity_id') || '').trim();
}

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const opportunityId = getOpportunityIdFromUrl(req);
  if (!opportunityId) {
    return NextResponse.json({ ok: false, error: 'opportunity_id is required' }, { status: 422 });
  }

  try {
    const intel = await getGovConIntelRecord(orgId, opportunityId);
    return NextResponse.json({
      ok: true,
      intel: intel
        ? {
          sourceUrl: intel.sourceUrl,
          sourceSummary: intel.sourceSummary,
          extractedAt: intel.extractedAt,
          sourceLength: intel.sourceText.length,
        }
        : null,
    });
  } catch (error) {
    console.error('[govcon-intel-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load solicitation intelligence' }, { status: 500 });
  }
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

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const opportunityId = String(body.opportunity_id || '').trim();
  const forceRefresh = body.force_refresh === true;
  if (!opportunityId) {
    return NextResponse.json({ ok: false, error: 'opportunity_id is required' }, { status: 422 });
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const opportunity = await runtimeRef.opportunityService.getOpportunity(opportunityId);
    if (!opportunity) {
      return NextResponse.json({ ok: false, error: 'Opportunity not found' }, { status: 404 });
    }
    if (!opportunity.url) {
      return NextResponse.json(
        { ok: false, error: 'Opportunity has no source URL. Add a SAM.gov URL first.' },
        { status: 422 },
      );
    }

    const intel = await ensureGovConIntelForOpportunity({
      orgId,
      opportunity,
      forceRefresh,
    });
    if (!intel) {
      return NextResponse.json({ ok: false, error: 'Unable to extract solicitation intelligence' }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      intel: {
        sourceUrl: intel.sourceUrl,
        sourceSummary: intel.sourceSummary,
        extractedAt: intel.extractedAt,
        sourceLength: intel.sourceText.length,
      },
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-intel-post] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to extract solicitation intelligence' }, { status: 500 });
  }
}
