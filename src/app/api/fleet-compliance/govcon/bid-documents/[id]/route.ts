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
  serializeBidDocument,
} from '@/lib/govcon-compliance-command-runtime';

function normalizeDocumentStatus(value: unknown): 'draft' | 'review' | 'final' | null {
  const normalized = String(value ?? '').trim();
  if (normalized === 'draft' || normalized === 'review' || normalized === 'final') {
    return normalized;
  }
  return null;
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
    const document = await runtimeRef.bidDocumentService.getBidDocument(id);

    if (!document) {
      return NextResponse.json({ ok: false, error: 'Bid document not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      document: {
        ...serializeBidDocument(document),
        content: String(document?.content ?? ''),
      },
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-bid-document-get] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to load bid document' },
      { status: 500 },
    );
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
    const existing = await runtimeRef.bidDocumentService.getBidDocument(id);

    if (!existing) {
      return NextResponse.json({ ok: false, error: 'Bid document not found' }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    const nextContent = typeof body.content === 'string' ? body.content : undefined;
    if (typeof nextContent === 'string') {
      updates.content = nextContent;
      if (nextContent !== existing.content) {
        updates.version = Number(existing.version ?? 1) + 1;
      }
    }

    const status = normalizeDocumentStatus(body.status);
    if (body.status != null && !status) {
      return NextResponse.json({ ok: false, error: 'Invalid status value' }, { status: 422 });
    }
    if (status) {
      updates.status = status;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ ok: false, error: 'No valid fields to update' }, { status: 422 });
    }

    const updated = await runtimeRef.repo.updateBidDocument(id, updates);
    return NextResponse.json({
      ok: true,
      document: {
        ...serializeBidDocument(updated),
        content: String(updated?.content ?? ''),
      },
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-bid-document-patch] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to update bid document' },
      { status: 500 },
    );
  }
}

