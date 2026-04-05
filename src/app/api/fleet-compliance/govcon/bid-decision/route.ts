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
  serializeBidDecision,
  serializeOpportunity,
} from '@/lib/govcon-compliance-command-runtime';

function parseScore(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0 || parsed > 100) return null;
  return parsed;
}

function parseContractValue(value: unknown): number | null {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  if (parsed < 0) return null;
  return parsed;
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

  const opportunityId = String(body.opportunity_id ?? '').trim();
  const technicalFit = parseScore(body.technical_fit);
  const setAsideMatch = parseScore(body.set_aside_match);
  const competitionLevel = parseScore(body.competition_level);
  const contractValue = parseContractValue(body.contract_value);
  const timelineFeasibility = parseScore(body.timeline_feasibility);
  const relationship = parseScore(body.relationship);
  const strategicValue = parseScore(body.strategic_value);

  if (!opportunityId) {
    return NextResponse.json({ ok: false, error: 'opportunity_id is required' }, { status: 422 });
  }

  if (
    technicalFit == null
    || setAsideMatch == null
    || competitionLevel == null
    || contractValue == null
    || timelineFeasibility == null
    || relationship == null
    || strategicValue == null
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: 'technical_fit, set_aside_match, competition_level, contract_value, timeline_feasibility, relationship, and strategic_value are required and must be valid numbers',
      },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    const decision = await runtimeRef.bidDecisionService.runBidDecision(opportunityId, {
      technicalFit,
      setAsideMatch,
      competitionLevel,
      contractValue,
      timelineFeasibility,
      relationship,
      strategicValue,
    });

    const updatedOpportunity = await runtimeRef.opportunityService.markBidDecision(
      opportunityId,
      decision.decision,
    );

    return NextResponse.json({
      ok: true,
      decision: serializeBidDecision(decision),
      opportunity: serializeOpportunity(updatedOpportunity),
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    if (String(error?.message ?? '').includes('not found')) {
      return NextResponse.json(
        { ok: false, error: error.message },
        { status: 404 },
      );
    }

    console.error('[govcon-bid-decision-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to run bid decision' },
      { status: 500 },
    );
  }
}
