import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MIGRATION_PATH = path.join(process.cwd(), 'migrations', '018_onboarding_phase3_adapters.sql');

test('phase 3 onboarding migration is additive and defines outbox/task sync fields', () => {
  const sql = readFileSync(MIGRATION_PATH, 'utf8');

  assert.match(sql, /ALTER TABLE onboarding_outbox_events\s+ADD COLUMN IF NOT EXISTS dedupe_key/i);
  assert.match(sql, /idx_onboarding_outbox_dedupe_active/i);
  assert.match(sql, /ALTER TABLE onboarding_tasks\s+ADD COLUMN IF NOT EXISTS sync_attempt_count/i);
  assert.match(sql, /ALTER TABLE onboarding_tasks\s+ADD COLUMN IF NOT EXISTS sync_last_error/i);
  assert.ok(!/DROP TABLE/i.test(sql), 'migration should remain additive');
});
