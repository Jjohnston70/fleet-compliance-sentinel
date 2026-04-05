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
  normalizeOpportunityStatus,
  normalizeSetAsideType,
  serializeBidDecision,
  serializeBidDocument,
  serializeContact,
  serializeOpportunity,
} from '@/lib/govcon-compliance-command-runtime';
import { getGovConIntelRecord } from '@/lib/govcon-intel';

function parseDateOrUndefined(value: unknown): Date | undefined {
  if (value == null || value === '') return undefined;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed;
}

function parseNumberOrUndefined(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const runtimeRef = await getGovConRuntime(orgId);
    const opportunity = await runtimeRef.opportunityService.getOpportunity(id);

    if (!opportunity) {
      return NextResponse.json({ ok: false, error: 'Opportunity not found' }, { status: 404 });
    }

    const [bidDecision, bidDocuments, contacts, intel] = await Promise.all([
      runtimeRef.bidDecisionService.getBidDecision(id),
      runtimeRef.bidDocumentService.listBidDocuments(id),
      runtimeRef.outreachService.listContacts({ agency: opportunity.agency }),
      getGovConIntelRecord(orgId, id),
    ]);

    return NextResponse.json({
      ok: true,
      opportunity: serializeOpportunity(opportunity),
      bidDecision: bidDecision ? serializeBidDecision(bidDecision) : null,
      bidDocuments: bidDocuments.map((document: any) => serializeBidDocument(document)),
      contacts: contacts.map((contact: any) => serializeContact(contact)),
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
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-opportunity-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load opportunity detail' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  try {
    const { id } = await params;
    const runtimeRef = await getGovConRuntime(orgId);
    const existing = await runtimeRef.opportunityService.getOpportunity(id);

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Opportunity not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};

    if (typeof body.title === 'string') updates.title = body.title.trim();
    if (typeof body.solicitation_number === 'string') updates.solicitation_number = body.solicitation_number.trim();
    if (typeof body.agency === 'string') updates.agency = body.agency.trim();
    if (typeof body.sub_agency === 'string') updates.sub_agency = body.sub_agency.trim();
    if (typeof body.naics_code === 'string') updates.naics_code = body.naics_code.trim();
    if (typeof body.naics_description === 'string') updates.naics_description = body.naics_description.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.place_of_performance === 'string') updates.place_of_performance = body.place_of_performance.trim();
    if (typeof body.url === 'string') updates.url = body.url.trim();

    const parsedStatus = normalizeOpportunityStatus(body.status);
    if (body.status != null && !parsedStatus) {
      return NextResponse.json({ ok: false, error: 'Invalid status value' }, { status: 422 });
    }
    if (parsedStatus) updates.status = parsedStatus;

    const parsedSetAside = normalizeSetAsideType(body.set_aside_type);
    if (body.set_aside_type != null && !parsedSetAside) {
      return NextResponse.json({ ok: false, error: 'Invalid set_aside_type value' }, { status: 422 });
    }
    if (parsedSetAside) updates.set_aside_type = parsedSetAside;

    const responseDeadline = parseDateOrUndefined(body.response_deadline);
    if (body.response_deadline != null && !responseDeadline) {
      return NextResponse.json({ ok: false, error: 'response_deadline must be a valid date' }, { status: 422 });
    }
    if (responseDeadline) updates.response_deadline = responseDeadline;

    const estimatedValue = parseNumberOrUndefined(body.estimated_value);
    if (body.estimated_value != null && body.estimated_value !== '' && estimatedValue == null) {
      return NextResponse.json({ ok: false, error: 'estimated_value must be a number' }, { status: 422 });
    }
    if (estimatedValue != null) updates.estimated_value = estimatedValue;

    const updated = await runtimeRef.opportunityService.updateOpportunity(id, updates);

    return NextResponse.json({
      ok: true,
      opportunity: serializeOpportunity(updated),
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-opportunity-patch] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to update opportunity' },
      { status: 500 },
    );
  }
}
