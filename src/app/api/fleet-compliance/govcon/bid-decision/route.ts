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
import {
  deriveBidInputsFromDocumentation,
  ensureGovConIntelForOpportunity,
  getGovConIntelRecord,
} from '@/lib/govcon-intel';

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
  const autoMode = String(body.mode ?? '').trim().toLowerCase() === 'auto'
    || body.use_documentation === true;
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

  if (!autoMode && (
    technicalFit == null
    || setAsideMatch == null
    || competitionLevel == null
    || contractValue == null
    || timelineFeasibility == null
    || relationship == null
    || strategicValue == null
  )) {
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
    const opportunity = await runtimeRef.opportunityService.getOpportunity(opportunityId);
    if (!opportunity) {
      return NextResponse.json(
        { ok: false, error: `Opportunity ${opportunityId} not found` },
        { status: 404 },
      );
    }

    let scoringInput: {
      technicalFit: number;
      setAsideMatch: number;
      competitionLevel: number;
      contractValue: number;
      timelineFeasibility: number;
      relationship: number;
      strategicValue: number;
    };
    let autoEvidence: string[] = [];
    let usedIntel: { extractedAt: string; sourceUrl: string | null } | null = null;

    if (autoMode) {
      let intel = await getGovConIntelRecord(orgId, opportunityId);
      if (!intel && opportunity.url) {
        intel = await ensureGovConIntelForOpportunity({ orgId, opportunity });
      }
      if (!intel) {
        return NextResponse.json(
          {
            ok: false,
            error: 'No solicitation intelligence available. Pull documentation first from the opportunity page.',
          },
          { status: 422 },
        );
      }

      const derived = deriveBidInputsFromDocumentation(opportunity, intel.sourceText);
      scoringInput = {
        technicalFit: derived.technical_fit,
        setAsideMatch: derived.set_aside_match,
        competitionLevel: derived.competition_level,
        contractValue: derived.contract_value,
        timelineFeasibility: derived.timeline_feasibility,
        relationship: derived.relationship,
        strategicValue: derived.strategic_value,
      };
      autoEvidence = derived.evidence;
      usedIntel = { extractedAt: intel.extractedAt, sourceUrl: intel.sourceUrl };
    } else {
      scoringInput = {
        technicalFit: technicalFit as number,
        setAsideMatch: setAsideMatch as number,
        competitionLevel: competitionLevel as number,
        contractValue: contractValue as number,
        timelineFeasibility: timelineFeasibility as number,
        relationship: relationship as number,
        strategicValue: strategicValue as number,
      };
    }

    const decision = await runtimeRef.bidDecisionService.runBidDecision(opportunityId, scoringInput);

    const updatedOpportunity = await runtimeRef.opportunityService.markBidDecision(
      opportunityId,
      decision.decision,
    );

    return NextResponse.json({
      ok: true,
      decision: serializeBidDecision(decision),
      opportunity: serializeOpportunity(updatedOpportunity),
      autoMode,
      autoInput: autoMode ? {
        technical_fit: scoringInput.technicalFit,
        set_aside_match: scoringInput.setAsideMatch,
        competition_level: scoringInput.competitionLevel,
        contract_value: scoringInput.contractValue,
        timeline_feasibility: scoringInput.timelineFeasibility,
        relationship: scoringInput.relationship,
        strategic_value: scoringInput.strategicValue,
      } : null,
      autoEvidence: autoMode ? autoEvidence : [],
      intel: usedIntel,
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
