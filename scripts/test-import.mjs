import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';
import XLSX from 'xlsx';

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

// Parse the Excel file
const wb = XLSX.readFile('chief-bulk-upload-filled.xlsx');
const SKIP = new Set(['README', 'Config']);
const SHEET_MAP = {
  'Drivers': 'drivers',
  'Assets Master': 'assets_master',
  'STORAGE TANKS': 'storage_tanks',
  'COLORADO CONTACTS': 'colorado_contacts',
  'VEHICLES & EQUIPMENT': 'vehicles_equipment',
  'PERMITS & LICENSES': 'permits_licenses',
  'EMERGENCY CONTACTS': 'emergency_contacts',
  'EMPLOYEES': 'employees',
  'MAINTENANCE SCHEDULE': 'maintenance_schedule',
  'Activity Log': 'activity_log',
  'Maintenance Tracker': 'maintenance_tracker',
};

let totalInserted = 0;

for (const sheetName of wb.SheetNames) {
  if (SKIP.has(sheetName)) continue;
  const collection = SHEET_MAP[sheetName];
  if (!collection) {
    console.log(`Skipping unmatched sheet: ${sheetName}`);
    continue;
  }

  const ws = wb.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '', raw: false });
  if (rows.length === 0) continue;

  // Clear existing data for this collection
  await sql`DELETE FROM chief_records WHERE collection = ${collection}`;

  // Insert rows
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

// Verify
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
