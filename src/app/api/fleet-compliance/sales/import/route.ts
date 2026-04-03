export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { runSalesCommandTool } from '@/lib/sales-command-runtime';

interface CsvImportResponse {
  status?: string;
  rowsProcessed?: number;
  rowsInserted?: number;
  errors?: string[];
}

function moduleSetupResponse(error: unknown): NextResponse | null {
  const message = error instanceof Error ? error.message : String(error);
  if (!message.includes('Cannot find module')) return null;
  return NextResponse.json(
    {
      ok: false,
      error:
        'sales-command dist bundle is missing. Build it first: cd tooling/sales-command && npx tsc --outDir dist --rootDir src --module ESNext --target ES2020 --moduleResolution bundler --declaration false --noEmit false',
    },
    { status: 503 },
  );
}

async function parseCsvPayload(req: NextRequest): Promise<{ csvContent: string; hasHeader: boolean }> {
  const contentType = req.headers.get('content-type') || '';

  if (contentType.includes('multipart/form-data')) {
    const formData = await req.formData();
    const file = formData.get('file');
    const csvContentField = formData.get('csvContent');
    const hasHeaderRaw = String(formData.get('hasHeader') ?? 'true').toLowerCase();
    const hasHeader = hasHeaderRaw !== 'false';

    if (typeof csvContentField === 'string' && csvContentField.trim()) {
      return { csvContent: csvContentField, hasHeader };
    }

    if (file instanceof File) {
      const text = await file.text();
      return { csvContent: text, hasHeader };
    }

    throw new Error('CSV file or csvContent field is required');
  }

  const body = (await req.json()) as Record<string, unknown>;
  const csvContent = String(body.csvContent ?? body.csv_content ?? '').trim();
  const hasHeader = body.hasHeader === undefined ? true : Boolean(body.hasHeader);

  if (!csvContent) {
    throw new Error('csvContent is required');
  }

  return { csvContent, hasHeader };
}

export async function POST(req: NextRequest) {
  try {
    await requireFleetComplianceOrgWithRole(req, 'admin');
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let csvContent = '';
  let hasHeader = true;
  try {
    const parsed = await parseCsvPayload(req);
    csvContent = parsed.csvContent;
    hasHeader = parsed.hasHeader;
  } catch (error: unknown) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Invalid payload' },
      { status: 400 },
    );
  }

  try {
    const result = await runSalesCommandTool<CsvImportResponse>('import_csv', {
      csv_content: csvContent,
      has_header: hasHeader,
    });

    const errors = Array.isArray(result.errors)
      ? result.errors.map((entry) => String(entry))
      : [];

    return NextResponse.json({
      ok: result.status !== 'error',
      rowsProcessed: Number(result.rowsProcessed || 0),
      rowsInserted: Number(result.rowsInserted || 0),
      errors,
    });
  } catch (error) {
    const setupResponse = moduleSetupResponse(error);
    if (setupResponse) return setupResponse;

    console.error('[sales-import-post] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to import CSV data' }, { status: 500 });
  }
}
