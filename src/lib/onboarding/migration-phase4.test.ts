import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const MIGRATION_PATH = path.join(process.cwd(), 'migrations', '019_onboarding_intake_tokens.sql');

test('phase 4 onboarding migration is additive and defines intake token persistence', () => {
  const sql = readFileSync(MIGRATION_PATH, 'utf8');

  assert.match(sql, /CREATE TABLE IF NOT EXISTS onboarding_intake_tokens/i);
  assert.match(sql, /token_hash TEXT NOT NULL UNIQUE/i);
  assert.match(sql, /status TEXT NOT NULL DEFAULT 'issued'/i);
  assert.match(sql, /expires_at TIMESTAMPTZ NOT NULL/i);
  assert.match(sql, /consumed_at TIMESTAMPTZ/i);
  assert.ok(!/DROP TABLE/i.test(sql), 'migration should remain additive');
});
