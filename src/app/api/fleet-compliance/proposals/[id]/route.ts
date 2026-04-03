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
  normalizeLineItemCategory,
  normalizeProposalStatus,
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
      if (quantity <= 0 || unitPrice < 0) return null;

      return { description, quantity, unitPrice, category } satisfies ProposalLineItemInput;
    })
    .filter((item): item is ProposalLineItemInput => Boolean(item));
}

async function buildProposalResponse(runtimeRef: any, proposalId: string) {
  const proposal = await runtimeRef.proposalService.getProposal(proposalId);
  if (!proposal) return null;

  const client = await runtimeRef.clientService.getClient(proposal.clientId);
  const lineItems = await runtimeRef.pricingService.getLineItems(proposal.id);
  const pricingSummary = await runtimeRef.pricingService.calculatePricingSummary(proposal.id);
  const activity = await runtimeRef.proposalService.getActivityHistory(proposal.id);

  return {
    id: String(proposal.id),
    proposalNumber: String(proposal.proposalNumber),
    title: String(proposal.title ?? ''),
    description: String(proposal.description ?? ''),
    notes: String(proposal.notes ?? ''),
    serviceType: String(proposal.serviceType ?? ''),
    status: String(proposal.status ?? 'draft'),
    totalAmount: Number(pricingSummary.total ?? proposal.totalValue ?? 0),
    subtotal: Number(pricingSummary.subtotal ?? 0),
    taxAmount: Number(pricingSummary.taxAmount ?? 0),
    discountAmount: Number(pricingSummary.discountAmount ?? 0),
    client: {
      id: String(client?.id ?? proposal.clientId),
      contactName: String(client?.contactName ?? ''),
      companyName: String(client?.companyName ?? ''),
      email: String(client?.email ?? ''),
      phone: String(client?.phone ?? ''),
    },
    createdAt: toIsoString(proposal.createdAt),
    updatedAt: toIsoString(proposal.updatedAt),
    validUntil: toIsoString(proposal.validUntil),
    sentAt: toIsoString(proposal.sentAt),
    viewedAt: toIsoString(proposal.viewedAt),
    respondedAt: toIsoString(proposal.respondedAt),
    lineItems: lineItems.map((item: any) => ({
      id: String(item.id),
      description: String(item.description ?? ''),
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
      total: Number(item.total ?? 0),
      category: String(item.category ?? 'Other'),
      order: Number(item.order ?? 0),
      createdAt: toIsoString(item.createdAt),
    })),
    activity: activity.map((entry: any) => ({
      id: String(entry.id),
      activityType: String(entry.activityType ?? ''),
      description: String(entry.description ?? ''),
      actor: String(entry.actor ?? 'system'),
      timestamp: toIsoString(entry.timestamp),
    })),
  };
}

async function applyRequestedStatus(runtimeRef: any, proposal: any, status: string, reason?: string) {
  if (status === proposal.status) return;

  if (status === 'sent') {
    if (proposal.status === 'draft' || proposal.status === 'generated') {
      await runtimeRef.proposalService.markAsSent(proposal.id);
      return;
    }
    throw new Error(`Invalid status transition: ${proposal.status} -> sent`);
  }

  if (status === 'viewed') {
    if (proposal.status === 'draft' || proposal.status === 'generated') {
      await runtimeRef.proposalService.markAsSent(proposal.id);
      await runtimeRef.proposalService.markAsViewed(proposal.id);
      return;
    }
    if (proposal.status === 'sent') {
      await runtimeRef.proposalService.markAsViewed(proposal.id);
      return;
    }
    throw new Error(`Invalid status transition: ${proposal.status} -> viewed`);
  }

  if (status === 'accepted' || status === 'declined') {
    if (proposal.status === 'draft' || proposal.status === 'generated') {
      await runtimeRef.proposalService.markAsSent(proposal.id);
      await runtimeRef.proposalService.markAsViewed(proposal.id);
    } else if (proposal.status === 'sent') {
      await runtimeRef.proposalService.markAsViewed(proposal.id);
    }

    if (status === 'accepted') {
      await runtimeRef.proposalService.markAsAccepted(proposal.id);
    } else {
      await runtimeRef.proposalService.markAsDeclined(proposal.id, reason || undefined);
    }
    return;
  }

  if (status === 'expired') {
    await runtimeRef.proposalService.markAsExpired(proposal.id);
    return;
  }

  if (status === 'generated') {
    if (proposal.status !== 'draft') {
      throw new Error(`Invalid status transition: ${proposal.status} -> generated`);
    }
    await runtimeRef.proposalService.updateStatus(proposal.id, 'generated');
    return;
  }

  if (status === 'draft') {
    await runtimeRef.proposalService.updateStatus(proposal.id, 'draft');
    return;
  }

  throw new Error(`Unsupported status: ${status}`);
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
    const runtimeRef = await getProposalRuntime(orgId);
    const detail = await buildProposalResponse(runtimeRef, id);
    if (!detail) {
      return NextResponse.json({ ok: false, error: 'Proposal not found' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, proposal: detail });
  } catch (error) {
    console.error('[proposal-detail-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load proposal' }, { status: 500 });
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
    const runtimeRef = await getProposalRuntime(orgId);
    const existing = await runtimeRef.proposalService.getProposal(id);
    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Proposal not found' }, { status: 404 });
    }

    const requestedStatus = normalizeProposalStatus(body.status);
    if (requestedStatus) {
      const reason = String(body.reason ?? '').trim();
      try {
        await applyRequestedStatus(runtimeRef, existing, requestedStatus, reason || undefined);
      } catch (error: any) {
        return NextResponse.json(
          { ok: false, error: error?.message || 'Invalid status transition' },
          { status: 409 },
        );
      }
    }

    const updates: Record<string, unknown> = {};
    if (typeof body.title === 'string') updates.title = body.title.trim();
    if (typeof body.description === 'string') updates.description = body.description.trim();
    if (typeof body.notes === 'string') updates.notes = body.notes.trim();

    const validityDays = Number(body.validityDays);
    if (Number.isFinite(validityDays) && validityDays > 0) {
      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + validityDays);
      updates.validUntil = validUntil;
    }

    if (Object.keys(updates).length > 0) {
      await runtimeRef.proposalService.updateProposal(id, updates);
    }

    const clientPayload =
      body.client && typeof body.client === 'object' ? (body.client as Record<string, unknown>) : null;
    if (clientPayload) {
      await runtimeRef.clientService.updateClient(existing.clientId, {
        contactName:
          typeof clientPayload.contactName === 'string'
            ? clientPayload.contactName.trim()
            : undefined,
        companyName:
          typeof clientPayload.companyName === 'string'
            ? clientPayload.companyName.trim()
            : undefined,
        email: typeof clientPayload.email === 'string' ? clientPayload.email.trim() : undefined,
        phone: typeof clientPayload.phone === 'string' ? clientPayload.phone.trim() : undefined,
      });
    }

    if (Object.prototype.hasOwnProperty.call(body, 'lineItems')) {
      const newItems = parseLineItems(body.lineItems);
      if (newItems.length === 0) {
        return NextResponse.json(
          { ok: false, error: 'lineItems must include at least one valid row' },
          { status: 422 },
        );
      }

      const existingItems = await runtimeRef.pricingService.getLineItems(id);
      for (const item of existingItems) {
        await runtimeRef.pricingService.deleteLineItem(item.id);
      }
      await runtimeRef.pricingService.addLineItems(id, newItems);
    }

    const pricingSummary = await runtimeRef.pricingService.calculatePricingSummary(id);
    await runtimeRef.proposalService.updateProposal(id, { totalValue: pricingSummary.total });

    const detail = await buildProposalResponse(runtimeRef, id);
    return NextResponse.json({ ok: true, proposal: detail });
  } catch (error: any) {
    console.error('[proposal-detail-patch] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to update proposal' },
      { status: 500 },
    );
  }
}
