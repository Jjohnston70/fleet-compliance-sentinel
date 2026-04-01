-- 012_training_tables.sql
-- Training plans, assignments, and progress tracking for the training-command module.
-- Supports B2 of the April 2-25 sprint (Workstream B: training-command).

-- Training plans: sets of modules an org can assign to employees
CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  description TEXT,
  modules JSONB NOT NULL,              -- ordered array of module_codes
  passing_score_override INT,          -- null = use per-module default
  deadline_days INT,                   -- days from assignment to due
  is_required BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_training_plans_org_id ON training_plans(org_id);

-- Training assignments: plan assigned to an employee
CREATE TABLE IF NOT EXISTS training_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  assigned_by TEXT NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deadline TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'assigned',     -- assigned | in_progress | complete | overdue
  completed_at TIMESTAMPTZ,
  completion_percentage NUMERIC(5,2) DEFAULT 0,
  UNIQUE(org_id, employee_id, plan_id)
);

CREATE INDEX IF NOT EXISTS idx_training_assignments_org_id ON training_assignments(org_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_employee ON training_assignments(org_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_training_assignments_status ON training_assignments(org_id, status);

-- Training progress: per-module completion within an assignment
CREATE TABLE IF NOT EXISTS training_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES training_assignments(id) ON DELETE CASCADE,
  module_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started',  -- not_started | viewing | deck_complete | assessment_passed | assessment_failed
  deck_started_at TIMESTAMPTZ,
  deck_completed_at TIMESTAMPTZ,
  time_spent_seconds INT DEFAULT 0,
  assessment_score INT,
  assessment_passed BOOLEAN,
  assessment_completed_at TIMESTAMPTZ,
  attempts_count INT DEFAULT 0,
  certificate_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(assignment_id, module_code)
);

CREATE INDEX IF NOT EXISTS idx_training_progress_assignment ON training_progress(assignment_id);
CREATE INDEX IF NOT EXISTS idx_training_progress_module ON training_progress(module_code);

-- Seed: PHMSA Hazmat Required training plan with all 12 module codes
INSERT INTO training_plans (
  org_id,
  plan_name,
  description,
  modules,
  passing_score_override,
  deadline_days,
  is_required
) VALUES (
  'org_default',
  'PHMSA Hazmat Required Training',
  'All 12 required PHMSA hazardous materials training modules per 49 CFR 172, Subpart H. Covers HMR introduction through security requirements. Recurrent every 3 years.',
  '["TNDS-HZ-000","TNDS-HZ-001","TNDS-HZ-002","TNDS-HZ-003","TNDS-HZ-004","TNDS-HZ-005","TNDS-HZ-006","TNDS-HZ-007a","TNDS-HZ-007b","TNDS-HZ-007c","TNDS-HZ-007d","TNDS-HZ-008"]'::jsonb,
  80,
  90,
  TRUE
) ON CONFLICT DO NOTHING;
