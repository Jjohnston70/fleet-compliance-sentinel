-- 015_dq_retention_flag.sql
-- Adds retention enforcement column per 49 CFR §391.51(c)
-- DQ files must be retained for duration of employment + 3 years after termination

ALTER TABLE dq_files ADD COLUMN retention_delete_after TIMESTAMPTZ;
-- Populated on soft-delete as: termination_date + 3 years (per §391.51(c))
-- The offboarding cron checks this column; DQ files are never hard-deleted before this date
