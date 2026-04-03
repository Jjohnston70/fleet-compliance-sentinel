export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getProposalRuntime,
  getProposalTemplateById,
  toIsoString,
} from '@/lib/proposal-command-runtime';

function buildEmailBody(proposal: any, client: any, organizationName: string): string {
  const clientName = String(client.contactName || client.companyName || 'there');
  return `
    <p>Hello ${clientName},</p>
    <p>Please review proposal <strong>${proposal.proposalNumber}</strong> for <strong>${proposal.title}</strong>.</p>
    <p>The proposal document is attached. Let us know if you have any questions.</p>
    <p>Regards,<br/>${organizationName}</p>
  `;
}

export async function POST(
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

  try {
    const { id } = await params;
    const runtimeRef = await getProposalRuntime(orgId);
    const proposal = await runtimeRef.proposalService.getProposal(id);
    if (!proposal) {
      return NextResponse.json({ ok: false, error: 'Proposal not found' }, { status: 404 });
    }

    if (proposal.status === 'accepted' || proposal.status === 'declined' || proposal.status === 'expired') {
      return NextResponse.json(
        { ok: false, error: `Cannot send proposal in ${proposal.status} status` },
        { status: 409 },
      );
    }

    const client = await runtimeRef.clientService.getClient(proposal.clientId);
    if (!client) {
      return NextResponse.json({ ok: false, error: 'Client not found' }, { status: 404 });
    }
    if (!client.email) {
      return NextResponse.json({ ok: false, error: 'Client email is required' }, { status: 422 });
    }

    const template = await getProposalTemplateById(orgId, proposal.templateId);
    if (!template) {
      return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 });
    }

    const lineItems = await runtimeRef.pricingService.getLineItems(proposal.id);
    const summary = await runtimeRef.pricingService.calculatePricingSummary(proposal.id);
    const docBuffer: Buffer = await runtimeRef.pdfGenerator.generateDocx(
      proposal,
      template,
      client.contactName,
      client.companyName,
      lineItems,
      summary.subtotal,
      summary.taxAmount,
      summary.discountAmount,
      summary.total,
    );

    const organizationName = process.env.COMPANY_NAME || 'Fleet-Compliance Sentinel';
    const result = await runtimeRef.emailService.sendProposalEmail({
      to: client.email,
      subject: `Proposal ${proposal.proposalNumber}: ${proposal.title}`,
      htmlBody: buildEmailBody(proposal, client, organizationName),
      plainText: `Proposal ${proposal.proposalNumber} is attached for ${proposal.title}.`,
      attachments: [
        {
          filename: `${proposal.proposalNumber}.docx`,
          content: docBuffer,
          contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        },
      ],
    });

    const resendConfigured = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
    const simulated = !result?.success;

    if (!result?.success && resendConfigured) {
      return NextResponse.json(
        { ok: false, error: 'Email delivery failed with configured provider' },
        { status: 502 },
      );
    }

    if (proposal.status === 'draft' || proposal.status === 'generated') {
      await runtimeRef.proposalService.markAsSent(proposal.id);
    }

    const updated = await runtimeRef.proposalService.getProposal(proposal.id);
    return NextResponse.json({
      ok: true,
      simulated,
      messageId: result?.messageId ?? null,
      proposal: updated
        ? {
            id: String(updated.id),
            proposalNumber: String(updated.proposalNumber),
            status: String(updated.status),
            sentAt: toIsoString(updated.sentAt),
            updatedAt: toIsoString(updated.updatedAt),
          }
        : null,
    });
  } catch (error: any) {
    console.error('[proposal-send-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to send proposal' },
      { status: 500 },
    );
  }
}

