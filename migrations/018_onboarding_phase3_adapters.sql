ALTER TABLE onboarding_outbox_events
ADD COLUMN IF NOT EXISTS dedupe_key TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_outbox_dedupe_active
  ON onboarding_outbox_events(dedupe_key)
  WHERE dedupe_key IS NOT NULL AND status IN ('pending', 'retrying');

ALTER TABLE onboarding_tasks
ADD COLUMN IF NOT EXISTS sync_attempt_count INT NOT NULL DEFAULT 0;

ALTER TABLE onboarding_tasks
ADD COLUMN IF NOT EXISTS sync_last_error TEXT;
