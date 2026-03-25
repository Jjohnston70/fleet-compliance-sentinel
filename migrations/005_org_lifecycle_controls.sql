CREATE TABLE IF NOT EXISTS org_audit_events (
  id BIGSERIAL PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  event_type TEXT NOT NULL,
  actor_user_id TEXT,
  actor_type TEXT NOT NULL DEFAULT 'system',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_org_audit_events_org_time
  ON org_audit_events(org_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_org_audit_events_type_time
  ON org_audit_events(event_type, occurred_at DESC);

CREATE TABLE IF NOT EXISTS organization_contacts (
  org_id TEXT PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  primary_contact TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id BIGSERIAL PRIMARY KEY,
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  org_id TEXT,
  payload JSONB NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processing_status TEXT NOT NULL DEFAULT 'received',
  message TEXT
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_org_time
  ON stripe_webhook_events(org_id, received_at DESC);
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_type_time
  ON stripe_webhook_events(event_type, received_at DESC);

INSERT INTO organization_contacts (org_id, primary_contact)
SELECT id, metadata->>'primaryContact'
FROM organizations
WHERE metadata ? 'primaryContact'
  AND COALESCE(metadata->>'primaryContact', '') <> ''
ON CONFLICT (org_id) DO UPDATE
SET primary_contact = EXCLUDED.primary_contact,
    updated_at = NOW();

UPDATE organizations
SET metadata = metadata - 'primaryContact',
    updated_at = NOW()
WHERE metadata ? 'primaryContact';
