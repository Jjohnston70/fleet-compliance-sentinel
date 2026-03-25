ALTER TABLE IF EXISTS assets ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS drivers ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS permits ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS suspense_items ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS employees ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS invoices ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';
ALTER TABLE IF EXISTS chief_records ADD COLUMN IF NOT EXISTS org_id TEXT NOT NULL DEFAULT 'org_default';

DO $$
BEGIN
  IF to_regclass('public.assets') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_assets_org_id ON assets(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.drivers') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_drivers_org_id ON drivers(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.permits') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_permits_org_id ON permits(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.suspense_items') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_suspense_org_id ON suspense_items(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.employees') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_employees_org_id ON employees(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.invoices') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
  END IF;
END $$;

DO $$
BEGIN
  IF to_regclass('public.chief_records') IS NOT NULL THEN
    CREATE INDEX IF NOT EXISTS idx_chief_records_org_id ON chief_records(org_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'trial',
  trial_started_at TIMESTAMPTZ DEFAULT NOW(),
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
  onboarding_complete BOOLEAN DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  org_id TEXT NOT NULL REFERENCES organizations(id),
  stripe_customer_id TEXT,
  plan TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  current_period_ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_org_id_created_at ON subscriptions(org_id, created_at DESC);
