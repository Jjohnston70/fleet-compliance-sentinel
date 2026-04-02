-- 013_hazmat_training_compliance.sql
-- Hazmat training compliance records used by training-command phase 7.

CREATE TABLE IF NOT EXISTS hazmat_training_modules (
  module_code TEXT PRIMARY KEY,
  module_title TEXT NOT NULL,
  module_category TEXT NOT NULL DEFAULT 'required',
  cfr_reference TEXT,
  phmsa_equivalent TEXT,
  recurrence_cycle_years INT NOT NULL DEFAULT 3,
  sort_order INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hazmat_training_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT,
  employee_email TEXT,
  module_code TEXT NOT NULL REFERENCES hazmat_training_modules(module_code),
  module_title TEXT NOT NULL,
  module_category TEXT NOT NULL DEFAULT 'required',
  status TEXT NOT NULL DEFAULT 'not_started', -- not_started | in_progress | complete | delinquent
  credit_pathway TEXT, -- scorm | general_task | classroom | other | fcs_training
  completion_date TIMESTAMPTZ,
  training_window_start TIMESTAMPTZ,
  training_window_end TIMESTAMPTZ,
  recurrence_cycle_years INT NOT NULL DEFAULT 3,
  next_due_date TIMESTAMPTZ,
  certificate_url TEXT,
  certificate_uploaded_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  UNIQUE (org_id, employee_id, module_code)
);

CREATE INDEX IF NOT EXISTS idx_hazmat_training_records_org ON hazmat_training_records(org_id);
CREATE INDEX IF NOT EXISTS idx_hazmat_training_records_employee ON hazmat_training_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_hazmat_training_records_status ON hazmat_training_records(status);
CREATE INDEX IF NOT EXISTS idx_hazmat_training_records_due ON hazmat_training_records(next_due_date);

INSERT INTO hazmat_training_modules (
  module_code,
  module_title,
  module_category,
  cfr_reference,
  phmsa_equivalent,
  recurrence_cycle_years,
  sort_order
)
VALUES
  ('TNDS-HZ-000', 'Hazardous Materials Regulations Introduction', 'required', '49 CFR Parts 171-180', 'Module 0.0', 3, 1),
  ('TNDS-HZ-001', 'Hazardous Materials Table', 'required', '49 CFR 172.101', 'Module 1.0', 3, 2),
  ('TNDS-HZ-002', 'Shipping Papers', 'required', '49 CFR 172.200-205', 'Module 2.0', 3, 3),
  ('TNDS-HZ-003', 'Packaging Requirements', 'required', '49 CFR Parts 173/178', 'Module 3.0', 3, 4),
  ('TNDS-HZ-004', 'Marking Requirements', 'required', '49 CFR 172.300-338', 'Module 4.0', 3, 5),
  ('TNDS-HZ-005', 'Labeling Requirements', 'required', '49 CFR 172.400-450', 'Module 5.0', 3, 6),
  ('TNDS-HZ-006', 'Placarding Requirements', 'required', '49 CFR 172.500-560', 'Module 6.0', 3, 7),
  ('TNDS-HZ-007a', 'Carrier Requirements: Highway', 'required', '49 CFR Parts 177/397', 'Module 7.0a', 3, 8),
  ('TNDS-HZ-007b', 'Carrier Requirements: Air', 'required', '49 CFR Part 175', 'Module 7.0b', 3, 9),
  ('TNDS-HZ-007c', 'Carrier Requirements: Rail', 'required', '49 CFR Part 174', 'Module 7.0c', 3, 10),
  ('TNDS-HZ-007d', 'Carrier Requirements: Vessel', 'required', '49 CFR Part 176', 'Module 7.0d', 3, 11),
  ('TNDS-HZ-008', 'Security Requirements', 'required', '49 CFR 172.800-804', 'Module 8.0', 3, 12)
ON CONFLICT (module_code) DO UPDATE SET
  module_title = EXCLUDED.module_title,
  module_category = EXCLUDED.module_category,
  cfr_reference = EXCLUDED.cfr_reference,
  phmsa_equivalent = EXCLUDED.phmsa_equivalent,
  recurrence_cycle_years = EXCLUDED.recurrence_cycle_years,
  sort_order = EXCLUDED.sort_order,
  updated_at = NOW();
