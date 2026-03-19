import { neon } from '@neondatabase/serverless';

/**
 * Returns a Neon SQL tagged-template client.
 * Reads DATABASE_URL from env (set automatically by Vercel/Neon integration).
 */
export function getSQL() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  return neon(url);
}

/**
 * Ensures the chief_records table exists.
 * Safe to call on every request — uses IF NOT EXISTS.
 */
export async function ensureChiefTables() {
  const sql = getSQL();
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
}

/**
 * Insert approved rows for a given collection.
 * Returns the number of rows inserted.
 */
export async function insertChiefRecords(
  collection: string,
  rows: Record<string, string>[],
  importedBy?: string
): Promise<number> {
  if (rows.length === 0) return 0;
  const sql = getSQL();

  // Insert in batches of 50 to stay within query size limits
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    for (const row of batch) {
      await sql`
        INSERT INTO chief_records (collection, data, imported_by)
        VALUES (${collection}, ${JSON.stringify(row)}::jsonb, ${importedBy ?? null})
      `;
      inserted++;
    }
  }

  return inserted;
}

/**
 * Read all records for a given collection, ordered by import date desc.
 */
export async function listChiefRecords(collection: string) {
  const sql = getSQL();
  const rows = await sql`
    SELECT id, collection, data, imported_at, imported_by
    FROM chief_records
    WHERE collection = ${collection}
    ORDER BY imported_at DESC
  `;
  return rows;
}

/**
 * Get record counts per collection.
 */
export async function getChiefRecordCounts(): Promise<Record<string, number>> {
  const sql = getSQL();
  const rows = await sql`
    SELECT collection, COUNT(*)::int as count
    FROM chief_records
    GROUP BY collection
    ORDER BY collection
  `;
  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.collection as string] = row.count as number;
  }
  return counts;
}

/**
 * Delete all records for a collection (for re-import scenarios).
 */
export async function clearChiefCollection(collection: string): Promise<number> {
  const sql = getSQL();
  const result = await sql`
    DELETE FROM chief_records
    WHERE collection = ${collection}
  `;
  return result.length;
}
