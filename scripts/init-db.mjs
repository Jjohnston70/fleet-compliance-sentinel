import { readFileSync } from 'fs';
import { neon } from '@neondatabase/serverless';

// Load .env.local manually
const envContent = readFileSync('.env.local', 'utf8');
for (const line of envContent.split('\n')) {
  if (line.startsWith('#') || !line.includes('=')) continue;
  const idx = line.indexOf('=');
  const key = line.slice(0, idx).trim();
  let val = line.slice(idx + 1).trim();
  // Strip surrounding quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('DATABASE_URL not found in .env.local');
  process.exit(1);
}
console.log('Connecting to:', dbUrl.replace(/:[^@]+@/, ':***@'));

const sql = neon(dbUrl);

try {
  await sql`
    CREATE TABLE IF NOT EXISTS chief_records (
      id          SERIAL PRIMARY KEY,
      collection  TEXT NOT NULL,
      data        JSONB NOT NULL,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      imported_by TEXT
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_chief_records_collection
    ON chief_records (collection)
  `;
  console.log('chief_records table created successfully');

  const result = await sql`SELECT count(*) FROM chief_records`;
  console.log('Current row count:', result[0].count);
} catch (err) {
  console.error('Error:', err.message);
  process.exit(1);
}
