export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import JSZip from 'jszip';
import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConCommandModule,
  getGovConModuleSetupError,
  getGovConRuntime,
} from '@/lib/govcon-compliance-command-runtime';

type OutputFormat = 'docx' | 'pdf' | 'markdown';

function parseFormats(value: unknown): OutputFormat[] {
  if (!Array.isArray(value)) return ['docx', 'pdf', 'markdown'];
  const parsed = value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry): entry is OutputFormat => (
      entry === 'docx' || entry === 'pdf' || entry === 'markdown'
    ));
  return parsed.length > 0 ? parsed : ['docx', 'pdf', 'markdown'];
}

function parseSingleFormat(value: unknown): OutputFormat {
  const normalized = String(value ?? '').trim();
  if (normalized === 'docx' || normalized === 'pdf' || normalized === 'markdown') {
    return normalized;
  }
  return 'docx';
}

function toBuffer(value: Buffer | string): Buffer {
  return Buffer.isBuffer(value) ? value : Buffer.from(value, 'utf8');
}

function toTimestamp(value: unknown): number {
  const parsed = new Date(String(value ?? ''));
  const millis = parsed.getTime();
  return Number.isFinite(millis) ? millis : 0;
}

function selectLatestPerType(documents: any[]): any[] {
  const byType = new Map<string, any>();
  for (const document of documents) {
    const type = String(document?.document_type ?? '').trim();
    if (!type) continue;
    const existing = byType.get(type);
    if (!existing) {
      byType.set(type, document);
      continue;
    }

    const currentTs = Math.max(toTimestamp(document?.updated_at), toTimestamp(document?.created_at));
    const existingTs = Math.max(toTimestamp(existing?.updated_at), toTimestamp(existing?.created_at));
    if (currentTs >= existingTs) {
      byType.set(type, document);
    }
  }
  return Array.from(byType.values());
}

function sanitizeFileSlug(value: string): string {
  return value.replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '') || 'bid_package';
}

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
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
    const runtimeRef = await getGovConRuntime(orgId);
    const moduleRef = await getGovConCommandModule();

    const documentId = String(body.document_id ?? '').trim();
    if (documentId) {
      const format = parseSingleFormat(body.format);
      const document = await runtimeRef.bidDocumentService.getBidDocument(documentId);
      if (!document) {
        return NextResponse.json({ ok: false, error: 'Bid document not found' }, { status: 404 });
      }

      const opportunity = await runtimeRef.opportunityService.getOpportunity(String(document.opportunity_id ?? ''));
      const slug = `${String(opportunity?.solicitation_number ?? 'bid')}_${String(document.document_type ?? 'document')}`;
      const outputs = await moduleRef.generateDocumentOutputs(
        String(document.title ?? 'Bid Document'),
        slug,
        String(document.content ?? ''),
        [format],
      );

      const output = outputs[0];
      if (!output) {
        return NextResponse.json({ ok: false, error: 'No output generated' }, { status: 500 });
      }

      return new NextResponse(new Uint8Array(toBuffer(output.content)), {
        status: 200,
        headers: {
          'Content-Type': output.mimeType,
          'Content-Disposition': `attachment; filename="${output.filename}"`,
          'Cache-Control': 'no-store',
        },
      });
    }

    const opportunityId = String(body.opportunity_id ?? '').trim();
    if (!opportunityId) {
      return NextResponse.json(
        { ok: false, error: 'document_id or opportunity_id is required' },
        { status: 422 },
      );
    }

    const opportunity = await runtimeRef.opportunityService.getOpportunity(opportunityId);
    if (!opportunity) {
      return NextResponse.json({ ok: false, error: 'Opportunity not found' }, { status: 404 });
    }

    const formats = parseFormats(body.formats);
    const existingDocuments = await runtimeRef.bidDocumentService.listBidDocuments(opportunityId);
    const latestDocuments = selectLatestPerType(existingDocuments);

    const outputs: Array<{ filename: string; content: Buffer | string }> = [];
    if (latestDocuments.length === 0) {
      const generated = await runtimeRef.bidDocumentService.generateFullBidPackage(opportunityId, undefined, formats);
      for (const entry of generated.documents ?? []) {
        for (const output of entry.outputs ?? []) {
          outputs.push({ filename: output.filename, content: output.content });
        }
      }
    } else {
      for (const document of latestDocuments) {
        const slug = `${String(opportunity.solicitation_number ?? 'bid')}_${String(document.document_type ?? 'document')}`;
        const generated = await moduleRef.generateDocumentOutputs(
          String(document.title ?? 'Bid Document'),
          slug,
          String(document.content ?? ''),
          formats,
        );
        for (const output of generated) {
          outputs.push({ filename: output.filename, content: output.content });
        }
      }
    }

    if (outputs.length === 0) {
      return NextResponse.json({ ok: false, error: 'No documents available to package' }, { status: 404 });
    }

    const zip = new JSZip();
    for (const output of outputs) {
      zip.file(output.filename, toBuffer(output.content));
    }

    const zipBytes = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    });

    const solicitation = sanitizeFileSlug(String(opportunity.solicitation_number ?? 'bid_package'));
    const zipName = `${solicitation}_bid_package.zip`;
    return new NextResponse(new Uint8Array(zipBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-bid-documents-download-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to download bid document(s)' },
      { status: 500 },
    );
  }
}

