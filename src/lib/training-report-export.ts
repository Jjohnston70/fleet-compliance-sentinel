function escapeCsvField(value: unknown): string {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv(headers: string[], rows: Array<Record<string, unknown>>): string {
  const lines = [headers.map(escapeCsvField).join(',')];
  for (const row of rows) {
    lines.push(headers.map((header) => escapeCsvField(row[header])).join(','));
  }
  return `${lines.join('\n')}\n`;
}

function escapePdfText(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
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

export function toSimplePdf(title: string, lines: string[]): Buffer {
  const bodyLines: string[] = [
    'q',
    '0.06 0.17 0.27 rg',
    '0 742 612 50 re f',
    'Q',
    `BT /F1 16 Tf 72 765 Td (${escapePdfText(title)}) Tj ET`,
  ];

  let y = 720;
  for (const line of lines.slice(0, 42)) {
    const safe = escapePdfText(line.slice(0, 110));
    bodyLines.push(`BT /F1 10 Tf 72 ${y} Td (${safe}) Tj ET`);
    y -= 14;
    if (y < 50) break;
  }

  return buildPdfDocument(bodyLines.join('\n'));
}
