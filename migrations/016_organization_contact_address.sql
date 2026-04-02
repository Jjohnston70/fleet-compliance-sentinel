-- 016_organization_contact_address.sql
-- Adds per-organization trainer address support for DOT audit package output.

ALTER TABLE organization_contacts
  ADD COLUMN IF NOT EXISTS primary_contact_address TEXT;
