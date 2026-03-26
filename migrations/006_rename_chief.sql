-- Migration 006: Rename chief_* tables and indexes to fleet_compliance_*
-- This is part of the Chief → Fleet-Compliance rebrand (pre-Phase 6)

-- Rename tables
ALTER TABLE IF EXISTS chief_records RENAME TO fleet_compliance_records;
ALTER TABLE IF EXISTS chief_error_events RENAME TO fleet_compliance_error_events;

-- Rename indexes on fleet_compliance_records (formerly chief_records)
ALTER INDEX IF EXISTS idx_chief_records_collection RENAME TO idx_fleet_compliance_records_collection;
ALTER INDEX IF EXISTS idx_chief_records_org_collection RENAME TO idx_fleet_compliance_records_org_collection;
ALTER INDEX IF EXISTS idx_chief_records_batch RENAME TO idx_fleet_compliance_records_batch;
ALTER INDEX IF EXISTS idx_chief_records_org_id RENAME TO idx_fleet_compliance_records_org_id;
