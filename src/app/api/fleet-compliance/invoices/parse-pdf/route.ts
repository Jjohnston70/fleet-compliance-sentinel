import { PDFParse } from 'pdf-parse';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { recordOrgAuditEvent } from '@/lib/org-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ExtractedInvoiceFields = {
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  amount: string;
  partsCost: string;
  laborCost: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalizeWhitespace(value: string): string {
  return value.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function normalizeDate(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;

  const slashMatch = trimmed.match(/^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})$/);
  if (slashMatch) {
    const month = Number(slashMatch[1]);
    const day = Number(slashMatch[2]);
    const rawYear = Number(slashMatch[3]);
    const year = rawYear < 100 ? 2000 + rawYear : rawYear;
    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${year.toString().padStart(4, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function normalizeAmount(value: string): string {
  const cleaned = value.replace(/[^0-9.,-]/g, '').trim();
  if (!cleaned) return '';
  const asNumber = Number(cleaned.replace(/,/g, ''));
  if (Number.isNaN(asNumber)) return '';
  return `$${asNumber.toFixed(2)}`;
}

function extractValueByPatterns(text: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return match[1].trim();
    }
  }
  return '';
}

function extractCurrencyNearLabels(text: string, labels: string[]): string {
  for (const label of labels) {
    const labelPattern = escapeRegExp(label);
    const regex = new RegExp(`${labelPattern}\\s*[:#-]?\\s*\\$?\\s*([0-9][0-9,]*(?:\\.[0-9]{2})?)`, 'i');
    const match = text.match(regex);
    if (match?.[1]) {
      return normalizeAmount(match[1]);
    }
  }
  return '';
}

function extractVendor(text: string): string {
  const lines = text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 14);

  for (const line of lines) {
    if (!/[A-Za-z]/.test(line)) continue;
    if (line.length < 3 || line.length > 80) continue;
    if (/invoice|statement|date|bill to|ship to|remit|account|po\s*#?/i.test(line)) continue;
    if (/^(phone|fax|email|www\.|http)/i.test(line)) continue;
    if (/^\d+\s+[A-Za-z]/.test(line)) continue;
    return line;
  }

  return '';
}

function extractInvoiceFields(text: string): ExtractedInvoiceFields {
  const invoiceNumber = extractValueByPatterns(text, [
    /invoice\s*(?:#|no\.?|number)\s*[:#-]?\s*([A-Z0-9-]{3,})/i,
    /\b(INV-[A-Z0-9-]{2,})\b/i,
  ]);

  const invoiceDateRaw = extractValueByPatterns(text, [
    /invoice\s*date\s*[:#-]?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
    /\bdate\b\s*[:#-]?\s*([A-Za-z]{3,9}\s+\d{1,2},\s+\d{4}|\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i,
  ]);

  return {
    vendor: extractVendor(text),
    invoiceNumber,
    invoiceDate: normalizeDate(invoiceDateRaw),
    amount: extractCurrencyNearLabels(text, ['Total', 'Invoice Total', 'Amount Due', 'Balance Due', 'Grand Total']),
    partsCost: extractCurrencyNearLabels(text, ['Parts', 'Parts Cost', 'Parts Total']),
    laborCost: extractCurrencyNearLabels(text, ['Labor', 'Labor Cost', 'Labor Total']),
  };
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

  const pdfFile = file as File;
  const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10 MB
  if (pdfFile.size > MAX_PDF_SIZE) {
    return Response.json({ error: 'PDF file exceeds 10 MB limit' }, { status: 413 });
  }

  const looksLikePdf =
    pdfFile.type.toLowerCase().includes('pdf') ||
    pdfFile.name.toLowerCase().endsWith('.pdf');

  if (!looksLikePdf) {
    return Response.json({ error: 'Only PDF files are supported' }, { status: 400 });
  }

  try {
    const parser = new PDFParse({ data: Buffer.from(await pdfFile.arrayBuffer()) });
    const textResult = await parser.getText();
    await parser.destroy();

    const rawText = normalizeWhitespace(textResult.text ?? '');
    const extracted = extractInvoiceFields(rawText);

    await recordOrgAuditEvent({
      orgId,
      eventType: 'invoice.pdf_parsed',
      actorUserId: userId,
      actorType: 'user',
      metadata: {
        fileName: pdfFile.name || 'invoice.pdf',
        fileSize: pdfFile.size,
        extractedKeys: Object.entries(extracted)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key),
        rawTextLength: rawText.length,
      },
    });

    return Response.json({
      extracted,
      rawText,
    });
  } catch (error: unknown) {
    console.error('[fleet-compliance-invoices-parse-pdf] failed:', error);
    return Response.json({ error: 'Could not parse PDF invoice' }, { status: 422 });
  }
}
