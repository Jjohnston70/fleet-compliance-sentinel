-- 015_hazmat_training_module_catalog.sql
-- Expands hazmat training reference catalog to 31 modules and adds module descriptors.

ALTER TABLE hazmat_training_modules
  ADD COLUMN IF NOT EXISTS erg_section TEXT;

ALTER TABLE hazmat_training_modules
  ADD COLUMN IF NOT EXISTS description TEXT;

INSERT INTO hazmat_training_modules (
  module_code,
  module_title,
  module_category,
  cfr_reference,
  phmsa_equivalent,
  recurrence_cycle_years,
  sort_order,
  erg_section,
  description
)
VALUES
  ('TNDS-HZ-000', 'Hazardous Materials Regulations Introduction', 'required', '49 CFR Parts 171-180', 'Module 0.0', 3, 1, 'White Pages', 'Foundational hazardous materials regulations and compliance framework.'),
  ('TNDS-HZ-001', 'Hazardous Materials Table', 'required', '49 CFR 172.101', 'Module 1.0', 3, 2, 'Yellow/Blue Pages', 'Hazardous materials table interpretation and lookup process.'),
  ('TNDS-HZ-002', 'Shipping Papers', 'required', '49 CFR 172.200-205', 'Module 2.0', 3, 3, 'White Pages', 'Shipping paper requirements, sequencing, and emergency response details.'),
  ('TNDS-HZ-003', 'Packaging Requirements', 'required', '49 CFR Parts 173/178', 'Module 3.0', 3, 4, 'White Pages', 'Packaging selection, compatibility, and performance requirements.'),
  ('TNDS-HZ-004', 'Marking Requirements', 'required', '49 CFR 172.300-338', 'Module 4.0', 3, 5, 'White Pages', 'Package and transport-unit marking requirements.'),
  ('TNDS-HZ-005', 'Labeling Requirements', 'required', '49 CFR 172.400-450', 'Module 5.0', 3, 6, 'White Pages', 'Hazard label classes, placement, and exceptions.'),
  ('TNDS-HZ-006', 'Placarding Requirements', 'required', '49 CFR 172.500-560', 'Module 6.0', 3, 7, 'White Pages', 'Placarding thresholds, exceptions, and transport display rules.'),
  ('TNDS-HZ-007a', 'Carrier Requirements: Highway', 'required', '49 CFR Parts 177/397', 'Module 7.0a', 3, 8, 'Orange Pages', 'Highway carrier operational and routing requirements.'),
  ('TNDS-HZ-007b', 'Carrier Requirements: Air', 'required', '49 CFR Part 175', 'Module 7.0b', 3, 9, 'Orange Pages', 'Air carrier handling, stowage, and acceptance requirements.'),
  ('TNDS-HZ-007c', 'Carrier Requirements: Rail', 'required', '49 CFR Part 174', 'Module 7.0c', 3, 10, 'Orange Pages', 'Rail carrier loading, segregation, and transport controls.'),
  ('TNDS-HZ-007d', 'Carrier Requirements: Vessel', 'required', '49 CFR Part 176', 'Module 7.0d', 3, 11, 'Orange Pages', 'Vessel carrier stowage, segregation, and handling requirements.'),
  ('TNDS-HZ-008', 'Security Requirements', 'required', '49 CFR 172.800-804', 'Module 8.0', 3, 12, 'White Pages', 'Hazmat security awareness and security plan requirements.'),
  ('NFPA-AW-01', 'NFPA 472 Awareness Unit 01: Hazard Recognition', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-01', 3, 13, 'NFPA 472 Awareness', 'Awareness-level hazard identification and recognition principles.'),
  ('NFPA-AW-02', 'NFPA 472 Awareness Unit 02: Initial Isolation and Protection', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-02', 3, 14, 'NFPA 472 Awareness', 'Initial isolation distances and public protective actions.'),
  ('NFPA-AW-03', 'NFPA 472 Awareness Unit 03: Notification and Documentation', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-03', 3, 15, 'NFPA 472 Awareness', 'Incident notification, communication, and documentation expectations.'),
  ('NFPA-AW-04', 'NFPA 472 Awareness Unit 04: ERG Application Basics', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-04', 3, 16, 'NFPA 472 Awareness', 'Emergency Response Guidebook usage for awareness-level responders.'),
  ('NFPA-AW-05', 'NFPA 472 Awareness Unit 05: Incident Safety and PPE Awareness', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-05', 3, 17, 'NFPA 472 Awareness', 'Incident safety controls and PPE awareness fundamentals.'),
  ('NFPA-AW-06', 'NFPA 472 Awareness Unit 06: Public Protection Actions', 'nfpa_awareness', 'NFPA 472 (Awareness)', 'NFPA-AW-06', 3, 18, 'NFPA 472 Awareness', 'Public protective action decision support at awareness level.'),
  ('NFPA-OP-01', 'NFPA 472 Operations Unit 01: Incident Assessment', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-01', 3, 19, 'NFPA 472 Operations', 'Operations-level incident assessment and action planning.'),
  ('NFPA-OP-02', 'NFPA 472 Operations Unit 02: Hazard and Risk Evaluation', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-02', 3, 20, 'NFPA 472 Operations', 'Hazard and risk evaluation for defensive operations.'),
  ('NFPA-OP-03', 'NFPA 472 Operations Unit 03: Defensive Control Options', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-03', 3, 21, 'NFPA 472 Operations', 'Defensive product control and containment options.'),
  ('NFPA-OP-04', 'NFPA 472 Operations Unit 04: Protective Actions', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-04', 3, 22, 'NFPA 472 Operations', 'Protective actions and responder safety decision-making.'),
  ('NFPA-OP-05', 'NFPA 472 Operations Unit 05: Site Safety Plan Execution', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-05', 3, 23, 'NFPA 472 Operations', 'Site safety plan development and execution support.'),
  ('NFPA-OP-06', 'NFPA 472 Operations Unit 06: PPE Selection and Use', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-06', 3, 24, 'NFPA 472 Operations', 'PPE selection, limitations, and operational use.'),
  ('NFPA-OP-07', 'NFPA 472 Operations Unit 07: Product Control and Containment', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-07', 3, 25, 'NFPA 472 Operations', 'Control and containment operations for hazmat releases.'),
  ('NFPA-OP-08', 'NFPA 472 Operations Unit 08: Decontamination Support', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-08', 3, 26, 'NFPA 472 Operations', 'Responder and victim decontamination support activities.'),
  ('NFPA-OP-09', 'NFPA 472 Operations Unit 09: Victim and Exposure Management', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-09', 3, 27, 'NFPA 472 Operations', 'Victim handling and exposure management controls.'),
  ('NFPA-OP-10', 'NFPA 472 Operations Unit 10: Incident Documentation', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-10', 3, 28, 'NFPA 472 Operations', 'Incident documentation and handoff for operations teams.'),
  ('NFPA-OP-11', 'NFPA 472 Operations Unit 11: Multi-Agency Coordination', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-11', 3, 29, 'NFPA 472 Operations', 'Coordination with unified command and partner agencies.'),
  ('NFPA-OP-12', 'NFPA 472 Operations Unit 12: Post-Incident Recovery', 'nfpa_operations', 'NFPA 472 (Operations)', 'NFPA-OP-12', 3, 30, 'NFPA 472 Operations', 'Post-incident recovery, transition, and closeout actions.'),
  ('PHMSA-GRANT', 'PHMSA Hazmat Grant Program Overview', 'supplemental', '49 CFR 172 Subpart H', 'PHMSA-GRANT', 3, 31, 'Grant Program', 'Supplemental overview of PHMSA training grant pathways.')
ON CONFLICT (module_code)
DO UPDATE SET
  module_title = EXCLUDED.module_title,
  module_category = EXCLUDED.module_category,
  cfr_reference = EXCLUDED.cfr_reference,
  phmsa_equivalent = EXCLUDED.phmsa_equivalent,
  recurrence_cycle_years = EXCLUDED.recurrence_cycle_years,
  sort_order = EXCLUDED.sort_order,
  erg_section = EXCLUDED.erg_section,
  description = EXCLUDED.description,
  updated_at = NOW();
