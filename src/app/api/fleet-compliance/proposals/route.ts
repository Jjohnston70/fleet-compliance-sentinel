export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getProposalRuntime,
  getProposalTemplateByServiceType,
  normalizeLineItemCategory,
  toIsoString,
  type ProposalLineItemInput,
} from '@/lib/proposal-command-runtime';

function parseLineItems(value: unknown): ProposalLineItemInput[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      const description = String((item as Record<string, unknown>)?.description ?? '').trim();
      const quantity = Number((item as Record<string, unknown>)?.quantity ?? 0);
      const unitPrice = Number((item as Record<string, unknown>)?.unitPrice ?? 0);
      const category = normalizeLineItemCategory((item as Record<string, unknown>)?.category);

      if (!description || !Number.isFinite(quantity) || !Number.isFinite(unitPrice)) {
        return null;
      }
      if (quantity <= 0 || unitPrice < 0) {
        return null;
      }

      return {
        description,
        quantity,
        unitPrice,
        category,
      } satisfies ProposalLineItemInput;
    })
    .filter((item): item is ProposalLineItemInput => Boolean(item));
}

function sumLineItems(items: ProposalLineItemInput[]): number {
  return items.reduce((total, item) => total + item.quantity * item.unitPrice, 0);
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

  try {
    const runtimeRef = await getProposalRuntime(orgId);
    const statusFilter = req.nextUrl.searchParams.get('status');
    const proposals = await runtimeRef.proposalService.listProposals(
      statusFilter ? { status: statusFilter } : undefined,
    );

    const rows = await Promise.all(
      proposals.map(async (proposal: any) => {
        const client = await runtimeRef.clientService.getClient(proposal.clientId);
        const pricingSummary = await runtimeRef.pricingService.calculatePricingSummary(proposal.id);

        return {
          id: String(proposal.id),
          proposalNumber: String(proposal.proposalNumber),
          title: String(proposal.title ?? ''),
          serviceType: String(proposal.serviceType ?? ''),
          status: String(proposal.status ?? 'draft'),
          totalAmount: Number(pricingSummary.total ?? proposal.totalValue ?? 0),
          clientName: String(client?.contactName ?? ''),
          clientCompany: String(client?.companyName ?? ''),
          createdAt: toIsoString(proposal.createdAt),
          updatedAt: toIsoString(proposal.updatedAt),
          validUntil: toIsoString(proposal.validUntil),
        };
      }),
    );

    rows.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ ok: true, proposals: rows });
  } catch (error) {
    console.error('[proposal-list-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load proposals' }, { status: 500 });
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

  const clientName = String(body.clientName ?? '').trim();
  const clientCompany = String(body.clientCompany ?? '').trim();
  const clientEmail = String(body.clientEmail ?? '').trim().toLowerCase();
  const clientPhone = String(body.clientPhone ?? '').trim();
  const serviceType = String(body.serviceType ?? '').trim();
  const projectTitle = String(body.projectTitle ?? '').trim();
  const projectDescription = String(body.description ?? '').trim();
  const validityDays = Number(body.validityDays ?? 30);
  const lineItems = parseLineItems(body.lineItems);

  if (!clientName || !clientCompany || !clientEmail || !serviceType || !projectTitle) {
    return NextResponse.json(
      {
        ok: false,
        error:
          'clientName, clientCompany, clientEmail, serviceType, and projectTitle are required',
      },
      { status: 422 },
    );
  }

  if (!Number.isFinite(validityDays) || validityDays <= 0) {
    return NextResponse.json(
      { ok: false, error: 'validityDays must be a positive number' },
      { status: 422 },
    );
  }

  if (lineItems.length === 0) {
    return NextResponse.json(
      { ok: false, error: 'At least one valid line item is required' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getProposalRuntime(orgId);
    const template = await getProposalTemplateByServiceType(orgId, serviceType);
    if (!template) {
      return NextResponse.json(
        { ok: false, error: `No template found for service type "${serviceType}"` },
        { status: 404 },
      );
    }

    const client = await runtimeRef.clientService.getOrCreateClient({
      companyName: clientCompany,
      contactName: clientName,
      email: clientEmail,
      phone: clientPhone || undefined,
    });

    const totalAmount = sumLineItems(lineItems);
    const proposal = await runtimeRef.proposalService.createProposal(
      client.id,
      template.id,
      projectTitle,
      projectDescription,
      totalAmount,
      validityDays,
    );

    proposal.serviceType = serviceType;
    await runtimeRef.repository.saveProposal(proposal);

    await runtimeRef.pricingService.addLineItems(proposal.id, lineItems);
    const summary = await runtimeRef.pricingService.calculatePricingSummary(proposal.id);
    await runtimeRef.proposalService.updateProposal(proposal.id, { totalValue: summary.total });

    return NextResponse.json(
      {
        ok: true,
        proposal: {
          id: String(proposal.id),
          proposalNumber: String(proposal.proposalNumber),
          status: String(proposal.status),
          totalAmount: summary.total,
          createdAt: toIsoString(proposal.createdAt),
          validUntil: toIsoString(proposal.validUntil),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('[proposal-create-post] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to create proposal' }, { status: 500 });
  }
}

