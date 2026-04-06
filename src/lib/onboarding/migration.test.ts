import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MIGRATION_PATH = path.join(process.cwd(), 'migrations', '017_onboarding_orchestration.sql');

test('onboarding migration defines required tables/indexes and uses safe creation semantics', () => {
  const sql = readFileSync(MIGRATION_PATH, 'utf8');

  const requiredTables = [
    'employee_profiles',
    'employee_onboarding_runs',
    'employee_onboarding_steps',
    'onboarding_outbox_events',
    'onboarding_tasks',
  ];

  for (const tableName of requiredTables) {
    assert.match(
      sql,
      new RegExp(`CREATE TABLE IF NOT EXISTS\\s+${tableName}`, 'i'),
      `missing CREATE TABLE IF NOT EXISTS for ${tableName}`,
    );
  }

  assert.match(sql, /UNIQUE\s*\(\s*run_id\s*,\s*step_key\s*\)/i);
  assert.match(sql, /UNIQUE\s*\(\s*run_id\s*,\s*task_key\s*\)/i);
  assert.match(sql, /CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_runs_idempotency/i);
  assert.ok(!/DROP TABLE/i.test(sql), 'migration should be additive and non-destructive');
});
