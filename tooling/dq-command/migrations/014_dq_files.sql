-- 014_dq_files.sql
-- DOT Driver Qualification File System — Core Tables
-- Fleet-Compliance Sentinel | dq-command module
-- Implements 49 CFR §391.51 (DQF) and §391.53 (DHF)

-- ─────────────────────────────────────────────────────────────────────────────
-- dq_files: One record per driver per file type (dqf or dhf)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE dq_files (
  id                    SERIAL PRIMARY KEY,
  org_id                TEXT NOT NULL,                        -- Clerk org ID (tenant isolation)
  driver_id             TEXT NOT NULL,                        -- FK to people collection
  driver_name           TEXT NOT NULL,                        -- Denormalized for query speed
  cdl_holder            BOOLEAN NOT NULL DEFAULT false,
  status                TEXT NOT NULL DEFAULT 'incomplete',   -- incomplete | complete | expired | flagged
  file_type             TEXT NOT NULL DEFAULT 'dqf',          -- dqf | dhf
  intake_token          UUID UNIQUE,                          -- one-time driver intake link token
  intake_completed_at   TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now(),
  deleted_at            TIMESTAMPTZ                           -- soft delete
);

CREATE INDEX idx_dq_files_org_driver ON dq_files (org_id, driver_id);
CREATE INDEX idx_dq_files_status     ON dq_files (org_id, status);

-- ─────────────────────────────────────────────────────────────────────────────
-- dq_documents: Individual documents within a DQ file
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE dq_documents (
  id                    SERIAL PRIMARY KEY,
  dq_file_id            INTEGER REFERENCES dq_files(id) ON DELETE CASCADE,
  org_id                TEXT NOT NULL,
  doc_type              TEXT NOT NULL,                        -- enum: see DQ_DOC_TYPES
  doc_label             TEXT NOT NULL,                        -- human-readable label
  cfr_reference         TEXT,                                 -- e.g., "§391.21"
  status                TEXT NOT NULL DEFAULT 'missing',      -- missing | uploaded | generated | verified | expired
  required_for          TEXT NOT NULL DEFAULT 'all',          -- all | cdl_only | non_cdl_only | conditional
  cadence               TEXT NOT NULL DEFAULT 'one_time',     -- one_time | annual | biennial
  expires_at            TIMESTAMPTZ,                          -- null for non-expiring docs
  uploaded_at           TIMESTAMPTZ,
  generated_at          TIMESTAMPTZ,
  file_path             TEXT,                                 -- storage path for uploaded docs
  generated_doc_path    TEXT,                                 -- path for system-generated docs
  notes                 TEXT,                                 -- reviewer notes
  reviewed_by           TEXT,                                 -- userId
  reviewed_at           TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_dq_docs_file   ON dq_documents (dq_file_id);
CREATE INDEX idx_dq_docs_status ON dq_documents (org_id, status);
CREATE INDEX idx_dq_docs_expiry ON dq_documents (org_id, expires_at) WHERE expires_at IS NOT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- dq_intake_responses: Section-by-section driver intake form data
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE dq_intake_responses (
  id                    SERIAL PRIMARY KEY,
  dq_file_id            INTEGER REFERENCES dq_files(id),
  org_id                TEXT NOT NULL,
  section               TEXT NOT NULL,                        -- personal | employment_history | violations | certifications
  response_data         JSONB NOT NULL,                       -- structured form data per section
  submitted_at          TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────────────────────
-- dq_audit_log: Immutable audit trail for all DQ file actions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE dq_audit_log (
  id                    BIGSERIAL PRIMARY KEY,
  dq_file_id            INTEGER REFERENCES dq_files(id),
  org_id                TEXT NOT NULL,
  actor_id              TEXT NOT NULL,                        -- userId or 'system' or 'driver'
  actor_type            TEXT NOT NULL,                        -- user | system | driver
  action                TEXT NOT NULL,                        -- doc.uploaded | doc.generated | status.changed | intake.completed | suspense.created
  doc_type              TEXT,
  metadata              JSONB,
  created_at            TIMESTAMPTZ DEFAULT now()
);
