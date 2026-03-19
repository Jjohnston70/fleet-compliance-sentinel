import { auth } from '@clerk/nextjs/server';
import { isClerkEnabled } from '@/lib/clerk';
import * as XLSX from 'xlsx';
import {
  IMPORT_SCHEMAS,
  validateRows,
  type CollectionKey,
} from '@/lib/chief-import-schemas';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB

export async function POST(request: Request) {
  if (isClerkEnabled()) {
    const { userId } = await auth();
    if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
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

  const collection = (formData.get('collection') as string | null) ?? '';
  if (!collection || !(collection in IMPORT_SCHEMAS)) {
    return Response.json(
      { error: `collection must be one of: ${Object.keys(IMPORT_SCHEMAS).join(', ')}` },
      { status: 400 }
    );
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const fileBlob = file as File;
  if (fileBlob.size > MAX_FILE_BYTES) {
    return Response.json({ error: 'File exceeds 2 MB limit' }, { status: 413 });
  }

  const arrayBuffer = await fileBlob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let rows: Record<string, string>[];
  let headers: string[];
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', raw: false });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) throw new Error('File contains no sheets');
    const worksheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
      defval: '',
      raw: false,
    });
    if (rawRows.length === 0) throw new Error('Sheet is empty');
    headers = Object.keys(rawRows[0]);
    rows = rawRows.map((r) =>
      Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(v ?? '')]))
    );
  } catch (err: unknown) {
    return Response.json({ error: `Could not parse file: ${String(err)}` }, { status: 422 });
  }

  const schema = IMPORT_SCHEMAS[collection as CollectionKey];
  const expectedHeaders = Object.keys(schema.fields);
  const missingHeaders = expectedHeaders.filter(
    (h) => schema.fields[h].required && !headers.includes(h)
  );

  const parsedRows = validateRows(collection as CollectionKey, rows);
  const passCount = parsedRows.filter((r) => r.issues.length === 0).length;
  const warnCount = parsedRows.filter((r) => r.issues.length > 0).length;

  return Response.json({
    collection,
    collectionLabel: schema.label,
    headers,
    expectedHeaders,
    missingHeaders,
    totalRows: rows.length,
    passCount,
    warnCount,
    rows: parsedRows,
  });
}
