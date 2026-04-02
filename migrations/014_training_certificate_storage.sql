-- 014_training_certificate_storage.sql
-- Durable certificate storage for training completion artifacts.

CREATE TABLE IF NOT EXISTS training_certificate_files (
  certificate_url TEXT PRIMARY KEY,
  content_base64 TEXT NOT NULL,
  size_bytes INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
