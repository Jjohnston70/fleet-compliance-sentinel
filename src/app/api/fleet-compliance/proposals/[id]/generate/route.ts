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
} from '@/lib/proposal-command-runtime';

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

    const template = await getProposalTemplateById(orgId, proposal.templateId);
    if (!template) {
      return NextResponse.json({ ok: false, error: 'Template not found' }, { status: 404 });
    }

    const client = await runtimeRef.clientService.getClient(proposal.clientId);
    if (!client) {
      return NextResponse.json({ ok: false, error: 'Client not found' }, { status: 404 });
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

    if (proposal.status === 'draft') {
      await runtimeRef.proposalService.updateStatus(
        proposal.id,
        'generated',
        'Proposal document generated',
      );
    }

    const filename = `${proposal.proposalNumber}.docx`;
    return new NextResponse(new Uint8Array(docBuffer), {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('[proposal-generate-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to generate document' },
      { status: 500 },
    );
  }
}
