import ExcelJS from 'exceljs';
import { parse as parseCsv } from 'csv-parse/sync';
import {
  IMPORT_SCHEMAS,
  SHEET_NAME_TO_COLLECTION,
  SKIP_SHEETS,
  validateRows,
  type CollectionKey,
} from '@/lib/fleet-compliance-import-schemas';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB (increased for multi-sheet files)

interface SheetParseResult {
  collection: string;
  collectionLabel: string;
  sheetName: string;
  headers: string[];
  expectedHeaders: string[];
  missingHeaders: string[];
  totalRows: number;
  passCount: number;
  warnCount: number;
  rows: { rowIndex: number; data: Record<string, string>; issues: string[] }[];
}

function toCellText(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    const objectValue = value as Record<string, unknown>;
    if (typeof objectValue.text === 'string') return objectValue.text;
    if (typeof objectValue.result === 'string' || typeof objectValue.result === 'number') {
      return String(objectValue.result);
    }
    if (Array.isArray(objectValue.richText)) {
      return objectValue.richText
        .map((part) => (part && typeof part === 'object' && 'text' in part ? String((part as { text?: unknown }).text ?? '') : ''))
        .join('');
    }
  }
  return String(value);
}

function rowsFromWorksheet(worksheet: ExcelJS.Worksheet): Record<string, unknown>[] {
  const headerValues = worksheet.getRow(1).values as unknown[];
  const headers = headerValues
    .slice(1)
    .map((value) => toCellText(value).trim());

  const rows: Record<string, unknown>[] = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const next: Record<string, unknown> = {};
    let hasAnyValue = false;

    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (!header) continue;
      const value = toCellText(row.getCell(index + 1).value).trim();
      next[header] = value;
      if (value !== '') hasAnyValue = true;
    }

    if (hasAnyValue) {
      rows.push(next);
    }
  }

  return rows;
}

function parseRows(
  rawRows: Record<string, unknown>[],
  sheetName: string,
  collectionKey: CollectionKey
): SheetParseResult {
  const schema = IMPORT_SCHEMAS[collectionKey];

  if (rawRows.length === 0) {
    return {
      collection: collectionKey,
      collectionLabel: schema.label,
      sheetName,
      headers: [],
      expectedHeaders: Object.keys(schema.fields),
      missingHeaders: [],
      totalRows: 0,
      passCount: 0,
      warnCount: 0,
      rows: [],
    };
  }

  const headers = Object.keys(rawRows[0]);
  const rows = rawRows.map((r) =>
    Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')]))
  );

  const expectedHeaders = Object.keys(schema.fields);
  const missingHeaders = expectedHeaders.filter(
    (h) => schema.fields[h].required && !headers.includes(h)
  );

  const parsedRows = validateRows(collectionKey, rows);
  const passCount = parsedRows.filter((r) => r.issues.length === 0).length;
  const warnCount = parsedRows.filter((r) => r.issues.length > 0).length;

  return {
    collection: collectionKey,
    collectionLabel: schema.label,
    sheetName,
    headers,
    expectedHeaders,
    missingHeaders,
    totalRows: rows.length,
    passCount,
    warnCount,
    rows: parsedRows,
  };
}

function parseCsvRows(buffer: Buffer): Record<string, unknown>[] {
  const text = buffer.toString('utf8');
  const records = parseCsv(text, {
    columns: true,
    bom: true,
    skip_empty_lines: true,
    relax_column_count: true,
  }) as Record<string, unknown>[];

  return records.map((row) =>
    Object.fromEntries(
      Object.entries(row).map(([key, value]) => [String(key).trim(), String(value ?? '').trim()])
    )
  );
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const contentType = request.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return Response.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: 'Could not parse form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const fileBlob = file as File;
  if (fileBlob.size > MAX_FILE_BYTES) {
    return Response.json({ error: 'File exceeds 5 MB limit' }, { status: 413 });
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const requestedCollection = (formData.get('collection') as string | null) ?? '';
  const isCsvUpload = fileBlob.name.toLowerCase().endsWith('.csv') || fileBlob.type.toLowerCase().includes('csv');

  if (isCsvUpload) {
    if (!requestedCollection) {
      return Response.json({ error: 'CSV uploads require a target collection' }, { status: 400 });
    }
    if (!(requestedCollection in IMPORT_SCHEMAS)) {
      return Response.json(
        { error: `collection must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
        { status: 400 }
      );
    }

    try {
      const csvRows = parseCsvRows(buffer);
      const result = parseRows(csvRows, 'CSV Upload', requestedCollection as CollectionKey);
      auditLog({
        action: 'import.upload',
        userId,
        orgId,
        resourceType: 'fleet-compliance.import',
        metadata: {
          mode: 'single-sheet-csv',
          collection: requestedCollection,
          fileName: fileBlob.name || 'upload',
          rowCount: result.totalRows,
          passCount: result.passCount,
          warnCount: result.warnCount,
        },
      });
      return Response.json(result);
    } catch (err: unknown) {
      console.error('[fleet-compliance-import-parse] CSV parse failed:', err);
      return Response.json({ error: 'Could not parse CSV file' }, { status: 422 });
    }
  }

  const workbook = new ExcelJS.Workbook();
  try {
    await workbook.xlsx.load(buffer as any);
    if (workbook.worksheets.length === 0) throw new Error('File contains no sheets');
  } catch (err: unknown) {
    console.error('[fleet-compliance-import-parse] workbook parse failed:', err);
    return Response.json({ error: 'Could not parse file' }, { status: 422 });
  }

  if (requestedCollection) {
    if (!(requestedCollection in IMPORT_SCHEMAS)) {
      return Response.json(
        { error: `collection must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
        { status: 400 }
      );
    }

    const schema = IMPORT_SCHEMAS[requestedCollection as CollectionKey];
    const targetWorksheet = workbook.worksheets.find((sheet) => sheet.name === schema.sheetName)
      ?? workbook.worksheets[0];

    try {
      const rawRows = rowsFromWorksheet(targetWorksheet);
      const result = parseRows(rawRows, targetWorksheet.name, requestedCollection as CollectionKey);
      auditLog({
        action: 'import.upload',
        userId,
        orgId,
        resourceType: 'fleet-compliance.import',
        metadata: {
          mode: 'single-sheet',
          collection: requestedCollection,
          fileName: fileBlob.name || 'upload',
          rowCount: result.totalRows,
          passCount: result.passCount,
          warnCount: result.warnCount,
        },
      });
      return Response.json(result);
    } catch (err: unknown) {
      console.error('[fleet-compliance-import-parse] sheet parse failed:', err);
      return Response.json({ error: 'Could not parse sheet' }, { status: 422 });
    }
  }

  const sheets: SheetParseResult[] = [];
  const skippedSheets: string[] = [];
  const unmatchedSheets: string[] = [];

  for (const worksheet of workbook.worksheets) {
    const sheetName = worksheet.name;
    if (SKIP_SHEETS.has(sheetName)) {
      skippedSheets.push(sheetName);
      continue;
    }

    const collectionKey = SHEET_NAME_TO_COLLECTION[sheetName];
    if (!collectionKey) {
      unmatchedSheets.push(sheetName);
      continue;
    }

    try {
      const rawRows = rowsFromWorksheet(worksheet);
      const result = parseRows(rawRows, sheetName, collectionKey);
      if (result.totalRows > 0) {
        sheets.push(result);
      }
    } catch {
      unmatchedSheets.push(sheetName);
    }
  }

  const totalRows = sheets.reduce((sum, s) => sum + s.totalRows, 0);
  const totalPass = sheets.reduce((sum, s) => sum + s.passCount, 0);
  const totalWarn = sheets.reduce((sum, s) => sum + s.warnCount, 0);

  auditLog({
    action: 'import.upload',
    userId,
    orgId,
    resourceType: 'fleet-compliance.import',
    metadata: {
      mode: 'multi-sheet',
      fileName: fileBlob.name || 'upload',
      sheetsParsed: sheets.length,
      rowCount: totalRows,
      passCount: totalPass,
      warnCount: totalWarn,
    },
  });

  return Response.json({
    mode: 'multi-sheet',
    sheetsFound: workbook.worksheets.length,
    sheetsParsed: sheets.length,
    skippedSheets,
    unmatchedSheets,
    totalRows,
    totalPass,
    totalWarn,
    sheets,
  });
}
