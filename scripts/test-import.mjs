import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import ExcelJS from 'exceljs';

// Load .env.local
const envContent = readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  if (line.startsWith('#') || !line.includes('=')) continue;
  const idx = line.indexOf('=');
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const sql = neon(process.env.DATABASE_URL);

function toCellText(value) {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'object') {
    if (typeof value.text === 'string') return value.text;
    if (typeof value.result === 'string' || typeof value.result === 'number') return String(value.result);
  }
  return String(value);
}

function rowsFromWorksheet(worksheet) {
  const headers = (worksheet.getRow(1).values || [])
    .slice(1)
    .map((value) => toCellText(value).trim());

  const rows = [];
  for (let rowNumber = 2; rowNumber <= worksheet.rowCount; rowNumber += 1) {
    const row = worksheet.getRow(rowNumber);
    const next = {};
    let hasValue = false;

    headers.forEach((header, index) => {
      if (!header) return;
      const value = toCellText(row.getCell(index + 1).value).trim();
      next[header] = value;
      if (value) hasValue = true;
    });

    if (hasValue) rows.push(next);
  }

  return rows;
}

const workbook = new ExcelJS.Workbook();
await workbook.xlsx.readFile('chief-bulk-upload-filled.xlsx');
const SKIP = new Set(['README', 'Config']);
const SHEET_MAP = {
  Drivers: 'drivers',
  'Assets Master': 'assets_master',
  'STORAGE TANKS': 'storage_tanks',
  'COLORADO CONTACTS': 'colorado_contacts',
  'VEHICLES & EQUIPMENT': 'vehicles_equipment',
  'PERMITS & LICENSES': 'permits_licenses',
  'EMERGENCY CONTACTS': 'emergency_contacts',
  EMPLOYEES: 'employees',
  'MAINTENANCE SCHEDULE': 'maintenance_schedule',
  'Activity Log': 'activity_log',
  'Maintenance Tracker': 'maintenance_tracker',
};

let totalInserted = 0;

for (const worksheet of workbook.worksheets) {
  const sheetName = worksheet.name;
  if (SKIP.has(sheetName)) continue;

  const collection = SHEET_MAP[sheetName];
  if (!collection) {
    console.log(`Skipping unmatched sheet: ${sheetName}`);
    continue;
  }

  const rows = rowsFromWorksheet(worksheet);
  if (rows.length === 0) continue;

  await sql`DELETE FROM chief_records WHERE collection = ${collection}`;

  for (const row of rows) {
    await sql`
      INSERT INTO chief_records (collection, data, imported_by)
      VALUES (${collection}, ${JSON.stringify(row)}::jsonb, ${'test-script'})
    `;
  }

  console.log(`${collection}: ${rows.length} rows inserted`);
  totalInserted += rows.length;
}

console.log(`\nTotal: ${totalInserted} rows inserted`);

const counts = await sql`
  SELECT collection, count(*)::int as count
  FROM chief_records
  GROUP BY collection
  ORDER BY collection
`;
console.log('\nDatabase contents:');
for (const row of counts) {
  console.log(`  ${row.collection}: ${row.count}`);
}
