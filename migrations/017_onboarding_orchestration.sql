CREATE TABLE IF NOT EXISTS employee_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  external_employee_id TEXT,
  clerk_user_id TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  work_email TEXT,
  department TEXT,
  job_title TEXT,
  hire_date DATE,
  status TEXT NOT NULL DEFAULT 'active',
  is_driver BOOLEAN NOT NULL DEFAULT FALSE,
  hazmat_required BOOLEAN NOT NULL DEFAULT FALSE,
  hazmat_endorsement TEXT,
  cdl_class TEXT,
  cdl_expiration DATE,
  medical_expiration DATE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (org_id, external_employee_id),
  UNIQUE (org_id, clerk_user_id)
);

CREATE INDEX IF NOT EXISTS idx_employee_profiles_org ON employee_profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_employee_profiles_org_driver_hazmat
  ON employee_profiles(org_id, is_driver, hazmat_required);

CREATE TABLE IF NOT EXISTS employee_onboarding_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued',
  source TEXT NOT NULL,
  initiated_by TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_summary TEXT,
  idempotency_key TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_runs_org_status
  ON employee_onboarding_runs(org_id, status, created_at DESC);

CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_runs_idempotency
  ON employee_onboarding_runs(org_id, employee_profile_id, source, idempotency_key)
  WHERE idempotency_key IS NOT NULL;

CREATE TABLE IF NOT EXISTS employee_onboarding_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  step_key TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  attempt_count INT NOT NULL DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  error_message TEXT,
  output JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, step_key)
);

CREATE TABLE IF NOT EXISTS onboarding_outbox_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_id UUID REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  attempt_count INT NOT NULL DEFAULT 0,
  next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_pending
  ON onboarding_outbox_events(status, next_attempt_at);
CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_org
  ON onboarding_outbox_events(org_id, created_at DESC);

CREATE TABLE IF NOT EXISTS onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
  employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
  task_key TEXT NOT NULL,
  title TEXT NOT NULL,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  external_task_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (run_id, task_key)
);

CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_org
  ON onboarding_tasks(org_id, created_at DESC);
