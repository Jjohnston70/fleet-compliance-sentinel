import { mkdir, readFile, stat, writeFile } from 'fs/promises';
import path from 'path';

const STORAGE_ROOT = path.resolve(
  process.env.TRAINING_CERT_STORAGE_ROOT || path.join(process.cwd(), 'storage')
);

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function truncate(value: string, max = 90): string {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 3)}...`;
}

function buildPdfDocument(contentStream: string): Buffer {
  const objects: string[] = [];
  objects.push('<< /Type /Catalog /Pages 2 0 R >>');
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 5 0 R /Resources << /Font << /F1 4 0 R >> >> >>');
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
  objects.push(`<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream`);

  const header = '%PDF-1.4\n';
  let body = '';
  const offsets: number[] = [0];

  for (let index = 0; index < objects.length; index += 1) {
    const objectNumber = index + 1;
    const objectBody = `${objectNumber} 0 obj\n${objects[index]}\nendobj\n`;
    const offset = Buffer.byteLength(header + body, 'utf8');
    offsets.push(offset);
    body += objectBody;
  }

  const xrefOffset = Buffer.byteLength(header + body, 'utf8');
  const xrefRows = offsets
    .map((offset, index) => {
      if (index === 0) return '0000000000 65535 f ';
      return `${offset.toString().padStart(10, '0')} 00000 n `;
    })
    .join('\n');

  const trailer = `xref\n0 ${objects.length + 1}\n${xrefRows}\ntrailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(`${header}${body}${trailer}`, 'utf8');
}

export interface TrainingCertificateInput {
  certificateId: string;
  orgName: string;
  orgId: string;
  employeeId: string;
  employeeName: string;
  moduleCode: string;
  moduleTitle: string;
  completionDate: string;
  scorePercentage: number | null;
  cfrReference: string;
  phmsaEquivalent: string;
  certificateUrl: string;
}

export function resolveCertificateAbsolutePath(certificateUrl: string): string {
  const trimmed = certificateUrl.trim();
  if (!trimmed.startsWith('/')) {
    throw new Error('Certificate URL must be an absolute app path');
  }

  const relative = trimmed.replace(/^\/+/, '');
  const absolute = path.resolve(STORAGE_ROOT, relative);
  if (!absolute.startsWith(STORAGE_ROOT)) {
    throw new Error('Certificate path resolved outside storage root');
  }
  return absolute;
}

function buildCertificateContent(input: TrainingCertificateInput): string {
  const scoreText = input.scorePercentage === null ? 'N/A' : `${Math.round(input.scorePercentage)}%`;
  const lines = [
    'q',
    '0.06 0.17 0.27 rg',
    '0 742 612 50 re f',
    '0.10 0.48 0.48 rg',
    '0 0 612 18 re f',
    'Q',

    'BT /F1 12 Tf 72 766 Td (TRUE NORTH DATA STRATEGIES) Tj ET',
    'BT /F1 10 Tf 430 766 Td (Fleet Compliance Sentinel) Tj ET',
    'BT /F1 30 Tf 120 650 Td (TRAINING CERTIFICATE) Tj ET',
    'BT /F1 14 Tf 90 620 Td (This certifies that) Tj ET',
    `BT /F1 24 Tf 90 585 Td (${escapePdfText(truncate(input.employeeName, 40))}) Tj ET`,
    'BT /F1 12 Tf 90 555 Td (has successfully completed the required training module) Tj ET',
    `BT /F1 16 Tf 90 525 Td (${escapePdfText(truncate(`${input.moduleTitle} (${input.moduleCode})`, 62))}) Tj ET`,
    `BT /F1 12 Tf 90 495 Td (PHMSA Equivalent: ${escapePdfText(input.phmsaEquivalent)}) Tj ET`,
    `BT /F1 12 Tf 90 470 Td (Completion Date: ${escapePdfText(input.completionDate)}) Tj ET`,
    `BT /F1 12 Tf 90 445 Td (Assessment Score: ${escapePdfText(scoreText)}) Tj ET`,
    `BT /F1 12 Tf 90 420 Td (CFR Reference: ${escapePdfText(input.cfrReference)}) Tj ET`,
    `BT /F1 12 Tf 90 395 Td (Organization: ${escapePdfText(truncate(input.orgName, 55))}) Tj ET`,
    `BT /F1 10 Tf 90 370 Td (Certificate ID: ${escapePdfText(input.certificateId)}) Tj ET`,
    `BT /F1 9 Tf 90 352 Td (Storage Path: ${escapePdfText(truncate(input.certificateUrl, 80))}) Tj ET`,

    '0.2 0.2 0.2 RG',
    '90 220 m 330 220 l S',
    'BT /F1 10 Tf 90 205 Td (Fleet Manager Signature) Tj ET',
    'BT /F1 9 Tf 90 170 Td (This training is equivalent to the referenced PHMSA module.) Tj ET',
  ];
  return lines.join('\n');
}

export async function generateTrainingCertificate(input: TrainingCertificateInput): Promise<{ absolutePath: string; sizeBytes: number }> {
  const absolutePath = resolveCertificateAbsolutePath(input.certificateUrl);
  await mkdir(path.dirname(absolutePath), { recursive: true });
  const content = buildCertificateContent(input);
  const pdfBuffer = buildPdfDocument(content);
  await writeFile(absolutePath, pdfBuffer);
  return {
    absolutePath,
    sizeBytes: pdfBuffer.length,
  };
}

export async function readTrainingCertificateBuffer(certificateUrl: string): Promise<Buffer | null> {
  try {
    const absolutePath = resolveCertificateAbsolutePath(certificateUrl);
    const file = await readFile(absolutePath);
    return file;
  } catch {
    return null;
  }
}

export async function certificateFileExists(certificateUrl: string): Promise<boolean> {
  try {
    const absolutePath = resolveCertificateAbsolutePath(certificateUrl);
    const fileStat = await stat(absolutePath);
    return fileStat.isFile();
  } catch {
    return false;
  }
}
