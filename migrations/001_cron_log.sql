CREATE TABLE IF NOT EXISTS cron_log (
  id SERIAL PRIMARY KEY,
  job_name TEXT NOT NULL,
  org_id TEXT,
  status TEXT NOT NULL,
  message TEXT,
  records_processed INTEGER DEFAULT 0,
  executed_at TIMESTAMPTZ DEFAULT NOW()
);
