-- Migration 006: Add offboarding deletion schedule timestamp
ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS data_deletion_scheduled_at TIMESTAMPTZ;
