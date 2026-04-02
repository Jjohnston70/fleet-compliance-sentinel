import { neon } from '@neondatabase/serverless';

const REQUIRED_TABLES = [
  'training_plans',
  'training_assignments',
  'training_progress',
  'hazmat_training_records',
  'training_certificate_files',
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL is required');
  process.exit(1);
}

const sql = neon(databaseUrl);
const projection = REQUIRED_TABLES
  .map((table) => `to_regclass('public.${table}') IS NOT NULL AS "${table}"`)
  .join(', ');

try {
  const rows = await sql.query(`SELECT ${projection}`);
  const row = rows[0] || {};
  const missing = REQUIRED_TABLES.filter((table) => row[table] !== true);

  if (missing.length > 0) {
    console.error('❌ Training schema is not ready. Missing tables:');
    for (const table of missing) {
      console.error(`  - ${table}`);
    }
    process.exit(1);
  }

  console.log('✅ Training schema is ready.');
} catch (error) {
  console.error('❌ Failed to verify training schema:', error);
  process.exit(1);
}
