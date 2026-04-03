import ExcelJS from 'exceljs';
import { fleetComplianceUploadTemplateManifest } from '@/lib/fleet-compliance-upload-template.generated';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';

const SALES_TEMPLATE_HEADERS = [
  'Date',
  'Product',
  'Region',
  'SalesRep',
  'Channel',
  'Revenue',
  'UnitsSold',
  'COGS',
];

const SALES_TEMPLATE_SAMPLE = {
  Date: '2026-04-01',
  Product: 'Diesel Fuel',
  Region: 'Front Range',
  SalesRep: 'A. Johnson',
  Channel: 'direct',
  Revenue: '12500.00',
  UnitsSold: '2500',
  COGS: '9100.00',
};

function createManifestRows() {
  const rows: Array<{
    Sheet: string;
    Source: string;
    Type: string;
    Worksheet: string;
    Headers: string;
    Notes: string;
  }> = fleetComplianceUploadTemplateManifest.map((sheet) => ({
    Sheet: sheet.sheetName,
    Source: sheet.sourcePath,
    Type: sheet.kind,
    Worksheet: sheet.worksheet || '',
    Headers: sheet.headers.join(', '),
    Notes: sheet.notes,
  }));

  rows.push({
    Sheet: 'SALES CSV FORMAT',
    Source: '/api/fleet-compliance/sales/template',
    Type: 'csv',
    Worksheet: '',
    Headers: SALES_TEMPLATE_HEADERS.join(', '),
    Notes: 'Use this format for /fleet-compliance/sales CSV import.',
  });

  return rows;
}

function addRowsToWorksheet(
  worksheet: ExcelJS.Worksheet,
  headers: string[],
  rows: Array<Record<string, unknown>>
) {
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.max(header.length + 2, 18),
  }));

  for (const row of rows) {
    const rowData = Object.fromEntries(
      headers.map((header) => [header, String(row[header] ?? '')])
    );
    worksheet.addRow(rowData);
  }
}

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const workbook = new ExcelJS.Workbook();

  const manifestRows = createManifestRows();
  const manifestHeaders = ['Sheet', 'Source', 'Type', 'Worksheet', 'Headers', 'Notes'];
  const manifestWorksheet = workbook.addWorksheet('README');
  addRowsToWorksheet(manifestWorksheet, manifestHeaders, manifestRows);

  for (const sheet of fleetComplianceUploadTemplateManifest) {
    const worksheet = workbook.addWorksheet(sheet.sheetName);
    const sampleRows = sheet.sampleRows.length
      ? sheet.sampleRows.map((row) => ({ ...row }))
      : [Object.fromEntries(sheet.headers.map((header) => [header, '']))];
    addRowsToWorksheet(worksheet, sheet.headers.length ? [...sheet.headers] : ['Column'], sampleRows);
  }

  const salesWorksheet = workbook.addWorksheet('SALES CSV FORMAT');
  addRowsToWorksheet(salesWorksheet, SALES_TEMPLATE_HEADERS, [SALES_TEMPLATE_SAMPLE]);

  const workbookBuffer = await workbook.xlsx.writeBuffer();
  const buffer = Buffer.from(workbookBuffer as ArrayBuffer);

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'fleet-compliance.bulk-template',
    metadata: {
      collection: 'fleet_compliance_template',
      recordCount: fleetComplianceUploadTemplateManifest.length,
    },
  });

  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="fleet-compliance-bulk-upload-template.xlsx"',
      'Cache-Control': 'no-store',
    },
  });
}
