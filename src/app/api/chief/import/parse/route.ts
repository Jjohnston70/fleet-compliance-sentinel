import * as XLSX from 'xlsx';
import {
  IMPORT_SCHEMAS,
  SHEET_NAME_TO_COLLECTION,
  SKIP_SHEETS,
  validateRows,
  type CollectionKey,
} from '@/lib/chief-import-schemas';
import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';

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

function parseSheet(
  workbook: XLSX.WorkBook,
  sheetName: string,
  collectionKey: CollectionKey
): SheetParseResult {
  const worksheet = workbook.Sheets[sheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

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

export async function POST(request: Request) {
  try {
    await requireChiefOrg(request);
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
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

  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
    if (workbook.SheetNames.length === 0) throw new Error('File contains no sheets');
  } catch (err: unknown) {
    console.error('[chief-import-parse] file parse failed:', err);
    return Response.json({ error: 'Could not parse file' }, { status: 422 });
  }

  // Check if a specific collection was requested (single-sheet mode, backwards compatible)
  const collection = (formData.get('collection') as string | null) ?? '';

  if (collection) {
    // Single-sheet mode
    if (!(collection in IMPORT_SCHEMAS)) {
      return Response.json(
        { error: `collection must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
        { status: 400 }
      );
    }

    const schema = IMPORT_SCHEMAS[collection as CollectionKey];
    // Find matching sheet by schema sheetName, or fall back to first sheet
    const targetSheet = workbook.SheetNames.find((s) => s === schema.sheetName)
      || workbook.SheetNames[0];

    try {
      const result = parseSheet(workbook, targetSheet, collection as CollectionKey);
      return Response.json(result);
    } catch (err: unknown) {
      console.error('[chief-import-parse] sheet parse failed:', err);
      return Response.json({ error: 'Could not parse sheet' }, { status: 422 });
    }
  }

  // Multi-sheet mode: parse all recognized sheets
  const sheets: SheetParseResult[] = [];
  const skippedSheets: string[] = [];
  const unmatchedSheets: string[] = [];

  for (const sheetName of workbook.SheetNames) {
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
      const result = parseSheet(workbook, sheetName, collectionKey);
      if (result.totalRows > 0) {
        sheets.push(result);
      }
    } catch {
      // Skip sheets that fail to parse
      unmatchedSheets.push(sheetName);
    }
  }

  const totalRows = sheets.reduce((sum, s) => sum + s.totalRows, 0);
  const totalPass = sheets.reduce((sum, s) => sum + s.passCount, 0);
  const totalWarn = sheets.reduce((sum, s) => sum + s.warnCount, 0);

  return Response.json({
    mode: 'multi-sheet',
    sheetsFound: workbook.SheetNames.length,
    sheetsParsed: sheets.length,
    skippedSheets,
    unmatchedSheets,
    totalRows,
    totalPass,
    totalWarn,
    sheets,
  });
}
