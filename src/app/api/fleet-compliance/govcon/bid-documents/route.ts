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
  serializeBidDocument,
  serializeGeneratedDocuments,
} from '@/lib/govcon-compliance-command-runtime';

type BidDocumentType =
  | 'capability_statement'
  | 'technical_approach'
  | 'past_performance'
  | 'price_proposal'
  | 'management_approach'
  | 'compliance_matrix'
  | 'full_proposal';

function normalizeDocumentType(value: unknown): BidDocumentType | undefined {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'capability_statement'
    || normalized === 'technical_approach'
    || normalized === 'past_performance'
    || normalized === 'price_proposal'
    || normalized === 'management_approach'
    || normalized === 'compliance_matrix'
    || normalized === 'full_proposal'
  ) {
    return normalized;
  }
  return undefined;
}

function parseFormats(value: unknown): Array<'docx' | 'pdf' | 'markdown'> | undefined {
  if (!Array.isArray(value)) return undefined;

  const parsed = value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry): entry is 'docx' | 'pdf' | 'markdown' => (
      entry === 'docx' || entry === 'pdf' || entry === 'markdown'
    ));

  return parsed.length > 0 ? parsed : undefined;
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
  if (!opportunityId) {
    return NextResponse.json({ ok: false, error: 'opportunity_id is required' }, { status: 422 });
  }

  const documentType = normalizeDocumentType(body.document_type);
  if (body.document_type != null && !documentType) {
    return NextResponse.json({ ok: false, error: 'Invalid document_type value' }, { status: 422 });
  }

  const companyId = body.company_id ? String(body.company_id).trim() : undefined;
  const formats = parseFormats(body.formats);

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    if (documentType) {
      const result = await runtimeRef.bidDocumentService.generateBidDocument(
        opportunityId,
        documentType,
        companyId,
        formats,
      );

      return NextResponse.json({
        ok: true,
        document: {
          record: serializeBidDocument(result?.bidDocument),
          outputs: serializeGeneratedDocuments(result?.outputs),
        },
      });
    }

    const result = await runtimeRef.bidDocumentService.generateFullBidPackage(
      opportunityId,
      companyId,
      formats,
    );

    return NextResponse.json({
      ok: true,
      documents: Array.isArray(result?.documents)
        ? result.documents.map((entry: any) => ({
          type: String(entry?.type ?? ''),
          record: serializeBidDocument(entry?.bidDocument),
          outputs: serializeGeneratedDocuments(entry?.outputs),
        }))
        : [],
      summary: {
        total: Number(result?.summary?.total ?? 0),
        generated: Number(result?.summary?.generated ?? 0),
      },
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

    console.error('[govcon-bid-documents-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to generate bid document(s)' },
      { status: 500 },
    );
  }
}
