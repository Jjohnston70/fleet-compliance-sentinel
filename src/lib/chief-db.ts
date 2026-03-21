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
      org_id      TEXT,
      data        JSONB NOT NULL,
      import_batch_id UUID,
      deleted_at  TIMESTAMPTZ,
      imported_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      imported_by TEXT
    )
  `;
  await sql`
    ALTER TABLE chief_records
    ADD COLUMN IF NOT EXISTS org_id TEXT
  `;
  await sql`
    ALTER TABLE chief_records
    ADD COLUMN IF NOT EXISTS import_batch_id UUID
  `;
  await sql`
    ALTER TABLE chief_records
    ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_chief_records_collection
    ON chief_records (collection)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_chief_records_org_collection
    ON chief_records (org_id, collection)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_chief_records_batch
    ON chief_records (import_batch_id)
  `;
}

export async function ensureCronLogTable() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS cron_log (
      id SERIAL PRIMARY KEY,
      job_name TEXT NOT NULL,
      org_id TEXT,
      status TEXT NOT NULL,
      message TEXT,
      records_processed INTEGER DEFAULT 0,
      executed_at TIMESTAMPTZ DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_cron_log_job_executed_at
    ON cron_log (job_name, executed_at DESC)
  `;
}

export async function ensureChiefErrorEventsTable() {
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS chief_error_events (
      id SERIAL PRIMARY KEY,
      org_id TEXT NOT NULL,
      user_id TEXT,
      page TEXT,
      message TEXT NOT NULL,
      stack TEXT,
      user_agent TEXT,
      url TEXT,
      occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_chief_error_events_org_time
    ON chief_error_events (org_id, occurred_at DESC)
  `;
}

export async function insertCronLogEntry(input: {
  jobName: string;
  orgId?: string | null;
  status: string;
  message?: string | null;
  recordsProcessed?: number;
}) {
  const sql = getSQL();
  await sql`
    INSERT INTO cron_log (job_name, org_id, status, message, records_processed)
    VALUES (
      ${input.jobName},
      ${input.orgId ?? null},
      ${input.status},
      ${input.message ?? null},
      ${input.recordsProcessed ?? 0}
    )
  `;
}

export async function insertChiefErrorEvent(input: {
  orgId: string;
  userId?: string | null;
  page?: string | null;
  message: string;
  stack?: string | null;
  userAgent?: string | null;
  url?: string | null;
}) {
  const sql = getSQL();
  await sql`
    INSERT INTO chief_error_events (
      org_id,
      user_id,
      page,
      message,
      stack,
      user_agent,
      url
    ) VALUES (
      ${input.orgId},
      ${input.userId ?? null},
      ${input.page ?? null},
      ${input.message},
      ${input.stack ?? null},
      ${input.userAgent ?? null},
      ${input.url ?? null}
    )
  `;
}

export async function getLastCronLog(jobName: string): Promise<{
  executedAt: string;
  status: string;
  message: string | null;
  recordsProcessed: number;
} | null> {
  const sql = getSQL();
  const rows = await sql`
    SELECT executed_at, status, message, records_processed
    FROM cron_log
    WHERE job_name = ${jobName}
    ORDER BY executed_at DESC
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) return null;

  return {
    executedAt: String(row.executed_at),
    status: String(row.status),
    message: row.message ? String(row.message) : null,
    recordsProcessed: Number(row.records_processed ?? 0),
  };
}

/**
 * Insert approved rows for a given collection.
 * Returns the number of rows inserted.
 */
export async function insertChiefRecords(
  collection: string,
  rows: Record<string, string>[],
  options: {
    orgId: string;
    importedBy?: string;
    importBatchId?: string;
  }
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
        INSERT INTO chief_records (collection, org_id, data, imported_by, import_batch_id)
        VALUES (
          ${collection},
          ${options.orgId},
          ${JSON.stringify(row)}::jsonb,
          ${options.importedBy ?? null},
          ${options.importBatchId ?? null}
        )
      `;
      inserted++;
    }
  }

  return inserted;
}

/**
 * Read all records for a given collection, ordered by import date desc.
 */
export async function listChiefRecords(collection: string, orgId: string) {
  const sql = getSQL();
  const rows = await sql`
    SELECT id, collection, data, imported_at, imported_by
    FROM chief_records
    WHERE collection = ${collection}
      AND org_id = ${orgId}
      AND deleted_at IS NULL
    ORDER BY imported_at DESC
  `;
  return rows;
}

/**
 * Get record counts per collection.
 */
export async function getChiefRecordCounts(orgId: string): Promise<Record<string, number>> {
  const sql = getSQL();
  const rows = await sql`
    SELECT collection, COUNT(*)::int as count
    FROM chief_records
    WHERE org_id = ${orgId}
      AND deleted_at IS NULL
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
export async function clearChiefCollection(collection: string, orgId: string): Promise<number> {
  const sql = getSQL();
  const result = await sql`
    UPDATE chief_records
    SET deleted_at = NOW()
    WHERE collection = ${collection}
      AND org_id = ${orgId}
      AND deleted_at IS NULL
    RETURNING id
  `;
  return result.length;
}

export async function getImportBatchScope(orgId: string, batchId: string): Promise<{
  orgCount: number;
}> {
  const sql = getSQL();
  const rows = await sql`
    SELECT
      COUNT(*)::int AS org_count
    FROM chief_records
    WHERE import_batch_id = ${batchId}::uuid
      AND org_id = ${orgId}
  `;

  const row = rows[0];
  return {
    orgCount: Number(row?.org_count ?? 0),
  };
}

export async function rollbackChiefImportBatch(orgId: string, batchId: string): Promise<number> {
  const sql = getSQL();
  const rows = await sql`
    UPDATE chief_records
    SET deleted_at = NOW()
    WHERE org_id = ${orgId}
      AND import_batch_id = ${batchId}::uuid
      AND deleted_at IS NULL
    RETURNING id
  `;
  return rows.length;
}

export async function listChiefOrgIds(): Promise<string[]> {
  const sql = getSQL();
  const rows = await sql`
    SELECT DISTINCT org_id
    FROM chief_records
    WHERE org_id IS NOT NULL
      AND deleted_at IS NULL
  `;
  return rows
    .map((row) => (typeof row.org_id === 'string' ? row.org_id : ''))
    .filter(Boolean);
}

export async function restoreChiefRecord(collection: string, id: number, orgId: string): Promise<boolean> {
  const sql = getSQL();
  const rows = await sql`
    UPDATE chief_records
    SET deleted_at = NULL
    WHERE id = ${id}
      AND collection = ${collection}
      AND org_id = ${orgId}
    RETURNING id
  `;
  return rows.length > 0;
}
