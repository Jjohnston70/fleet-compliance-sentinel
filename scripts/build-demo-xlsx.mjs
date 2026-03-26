#!/usr/bin/env node
/**
 * build-demo-xlsx.mjs
 *
 * Generates a demo XLSX file from the CSV seed data in tooling/fleet-compliance-sentinel/databases/.
 * The output file matches the import schema expected by the Fleet-Compliance import pipeline.
 *
 * Usage: node scripts/build-demo-xlsx.mjs
 * Output: demo-fleet-data.xlsx (in repo root)
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DB_DIR = join(ROOT, 'tooling', 'fleet-compliance-sentinel', 'databases');

// ── CSV Parser (simple, handles quoted fields with commas) ──────────────
function parseCSV(text) {
  const lines = text.replace(/\r\n/g, '\n').replace(/^\uFEFF/, '').split('\n');
  const rows = [];
  for (const line of lines) {
    if (!line.trim()) continue;
    const row = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    row.push(current.trim());
    rows.push(row);
  }
  return rows;
}

// ── Date converter (various formats → YYYY-MM-DD) ──────────────────────
function toISODate(val) {
  if (!val || val === '') return '';
  // Already ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // M/D/YYYY or MM/DD/YYYY
  const slashMatch = val.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, m, d, y] = slashMatch;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  // D-Mon or Mon-YY (like "25-Nov" or "12/4/2025")
  const months = { Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                   Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12' };
  const monMatch = val.match(/^(\d{1,2})-(\w{3})$/);
  if (monMatch) {
    const [, d, mon] = monMatch;
    const m = months[mon];
    if (m) return `2026-${m}-${d.padStart(2, '0')}`;
  }
  return val; // return as-is if can't parse
}

// ── Load CSV file and return { headers, rows } ─────────────────────────
function loadCSV(filename) {
  const text = readFileSync(join(DB_DIR, filename), 'utf-8');
  const parsed = parseCSV(text);
  if (parsed.length < 2) return { headers: [], rows: [] };
  return { headers: parsed[0], rows: parsed.slice(1) };
}

// ── Strip PII fields (SSN, DOB as standalone) for demo safety ──────────
function stripPII(headers, rows) {
  const piiFields = ['Social Security Number'];
  const piiIndexes = headers.reduce((acc, h, i) => {
    if (piiFields.includes(h)) acc.push(i);
    return acc;
  }, []);
  const cleanHeaders = headers.filter((_, i) => !piiIndexes.includes(i));
  const cleanRows = rows.map(row => row.filter((_, i) => !piiIndexes.includes(i)));
  return { headers: cleanHeaders, rows: cleanRows };
}

// ── Map CSV columns to import schema columns ───────────────────────────
// The import schemas expect specific column names. Map CSV headers to match.

const EMPLOYEES_DATE_FIELDS = [
  'Hire Date', 'CDL Expiration', 'Hazmat Expiration', 'Medical Expiration',
  'Last MVR Check', 'Next MVR Due', 'Last Drug Test',
  'Expiration HAZMAT TRAINING 3 YEAR CERT', 'Last Safety Training',
  'Date of Birth', 'DOB', 'TSA Expiration', '90 Day Review',
  'MVR ANNUAL REVIEWS', 'HAZMAT TRAINING 3 YEAR CERT'
];

const VEHICLES_DATE_FIELDS = [
  'Registration Expiration', 'Insurance Expiration', 'Last Oil Change',
  'Next Oil Change Due', 'Last DOT Inspection', 'Next DOT Inspection Due',
  'Last Vapor Test', 'Next Vapor Test Due', 'Purchase Date', 'Next Service Due'
];

const PERMITS_DATE_FIELDS = [
  'Issue Date', 'Expiration Date', 'Renewal Due Date',
  'Last Inspection', 'Next Inspection'
];

const TANKS_DATE_FIELDS = [
  'Installation Date', 'Permit Expiration', 'Last Inspection Date',
  'Next Inspection Due', 'Last Leak Test', 'Next Leak Test Due',
  'Last Calibration', 'Next Calibration Due'
];

const MAINT_DATE_FIELDS = [
  'Last Performed', 'Next Due Date'
];

// ── Build sheets ────────────────────────────────────────────────────────

function buildSheet(filename, sheetName, dateFields) {
  const { headers, rows } = loadCSV(filename);
  const { headers: cleanH, rows: cleanR } = stripPII(headers, rows);

  // Convert date fields to ISO format
  const dateIndexes = cleanH.reduce((acc, h, i) => {
    if (dateFields.includes(h)) acc.push(i);
    return acc;
  }, []);

  const convertedRows = cleanR.map(row =>
    row.map((val, i) => dateIndexes.includes(i) ? toISODate(val) : val)
  );

  return { name: sheetName, headers: cleanH, rows: convertedRows };
}

// ── XLSX Builder (minimal OOXML — no dependencies) ──────────────────────
// ExcelJS is in package.json but this script avoids the import for simplicity.
// We'll generate a valid XLSX (ZIP of XML files) using only Node.js built-ins.

function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function colLetter(n) {
  let s = '';
  while (n >= 0) {
    s = String.fromCharCode(65 + (n % 26)) + s;
    n = Math.floor(n / 26) - 1;
  }
  return s;
}

function buildSheetXml(sheet) {
  let xml = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  xml += '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">\n';
  xml += '<sheetData>\n';

  // Header row
  xml += '<row r="1">';
  sheet.headers.forEach((h, i) => {
    xml += `<c r="${colLetter(i)}1" t="inlineStr"><is><t>${escapeXml(h)}</t></is></c>`;
  });
  xml += '</row>\n';

  // Data rows
  sheet.rows.forEach((row, ri) => {
    const rowNum = ri + 2;
    xml += `<row r="${rowNum}">`;
    row.forEach((val, ci) => {
      if (val !== '' && val !== undefined && val !== null) {
        // Try to detect numbers
        const numVal = Number(val);
        if (!isNaN(numVal) && val !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(val) && !/^[\d-]+$/.test(val)) {
          xml += `<c r="${colLetter(ci)}${rowNum}"><v>${numVal}</v></c>`;
        } else {
          xml += `<c r="${colLetter(ci)}${rowNum}" t="inlineStr"><is><t>${escapeXml(val)}</t></is></c>`;
        }
      }
    });
    xml += '</row>\n';
  });

  xml += '</sheetData>\n</worksheet>';
  return xml;
}

// ── Use ExcelJS instead (it's already in package.json) ──────────────────

async function buildWithExcelJS(sheets) {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Fleet-Compliance Demo Generator';
  workbook.created = new Date();

  for (const sheet of sheets) {
    const ws = workbook.addWorksheet(sheet.name);

    // Add header row with bold styling
    const headerRow = ws.addRow(sheet.headers);
    headerRow.font = { bold: true };
    headerRow.eachCell(cell => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1a1a2e' }
      };
      cell.font = { bold: true, color: { argb: 'FFe0e0e0' } };
      cell.border = {
        bottom: { style: 'thin', color: { argb: 'FF444444' } }
      };
    });

    // Add data rows
    for (const row of sheet.rows) {
      if (row.some(cell => cell !== '')) {
        ws.addRow(row);
      }
    }

    // Auto-width columns (cap at 30)
    ws.columns.forEach(col => {
      let maxLen = 10;
      col.eachCell({ includeEmpty: false }, cell => {
        const len = String(cell.value || '').length;
        if (len > maxLen) maxLen = len;
      });
      col.width = Math.min(maxLen + 2, 35);
    });
  }

  const outPath = join(ROOT, 'demo-fleet-data.xlsx');
  await workbook.xlsx.writeFile(outPath);
  return outPath;
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
  console.log('Building demo XLSX from CSV seed data...\n');

  const sheets = [
    buildSheet('EMPLOYEES.csv', 'EMPLOYEES', EMPLOYEES_DATE_FIELDS),
    buildSheet('VEHICLES & EQUIPMENT.csv', 'VEHICLES & EQUIPMENT', VEHICLES_DATE_FIELDS),
    buildSheet('PERMITS & LICENSES.csv', 'PERMITS & LICENSES', PERMITS_DATE_FIELDS),
    buildSheet('STORAGE TANKS.csv', 'STORAGE TANKS', TANKS_DATE_FIELDS),
    buildSheet('MAINTENANCE SCHEDULE.csv', 'MAINTENANCE SCHEDULE', MAINT_DATE_FIELDS),
    buildSheet('EMERGENCY CONTACTS.csv', 'EMERGENCY CONTACTS', []),
    buildSheet('COLORADO CONTACTS.csv', 'COLORADO CONTACTS', []),
  ];

  for (const sheet of sheets) {
    console.log(`  ${sheet.name}: ${sheet.rows.length} rows, ${sheet.headers.length} columns`);
  }

  console.log('');
  const outPath = await buildWithExcelJS(sheets);
  console.log(`Demo XLSX written to: ${outPath}`);
  console.log('\nTo import:');
  console.log('  1. Create a demo org in Clerk');
  console.log('  2. Sign in as the demo org admin');
  console.log('  3. Go to /fleet-compliance/import');
  console.log('  4. Upload demo-fleet-data.xlsx');
  console.log('  5. Review and approve the import');
}

main().catch(err => {
  console.error('Failed to build demo XLSX:', err);
  process.exit(1);
});
