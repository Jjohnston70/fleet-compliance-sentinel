CREATE TABLE IF NOT EXISTS onboarding_intake_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  employee_profile_id UUID REFERENCES employee_profiles(id) ON DELETE SET NULL,
  token_hash TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'issued',
  expires_at TIMESTAMPTZ NOT NULL,
  issued_by TEXT NOT NULL,
  consumed_at TIMESTAMPTZ,
  invite_after_intake BOOLEAN NOT NULL DEFAULT TRUE,
  invite_override_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  intake_email TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_onboarding_intake_tokens_org
  ON onboarding_intake_tokens(org_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_onboarding_intake_tokens_status
  ON onboarding_intake_tokens(status, expires_at);
