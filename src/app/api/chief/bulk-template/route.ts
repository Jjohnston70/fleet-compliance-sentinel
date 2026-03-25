import * as XLSX from 'xlsx';
import { chiefUploadTemplateManifest } from '@/lib/chief-upload-template.generated';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';

function createManifestSheet() {
  const rows = chiefUploadTemplateManifest.map((sheet) => ({
    Sheet: sheet.sheetName,
    Source: sheet.sourcePath,
    Type: sheet.kind,
    Worksheet: sheet.worksheet || '',
    Headers: sheet.headers.join(', '),
    Notes: sheet.notes,
  }));
  return XLSX.utils.json_to_sheet(rows);
}

function createTemplateSheet(sheet: (typeof chiefUploadTemplateManifest)[number]) {
  const rows = sheet.sampleRows.length
    ? sheet.sampleRows.map((row) => ({ ...row }))
    : [Object.fromEntries(sheet.headers.map((header) => [header, '']))];
  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: sheet.headers.length ? [...sheet.headers] : undefined,
    skipHeader: false,
  });
  return worksheet;
}

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrg(request));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, createManifestSheet(), 'README');

  for (const sheet of chiefUploadTemplateManifest) {
    XLSX.utils.book_append_sheet(workbook, createTemplateSheet(sheet), sheet.sheetName);
  }

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'chief.bulk-template',
    metadata: {
      collection: 'chief_template',
      recordCount: chiefUploadTemplateManifest.length,
    },
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="chief-bulk-upload-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
