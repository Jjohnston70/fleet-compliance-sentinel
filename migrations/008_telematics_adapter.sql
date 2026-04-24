-- migrations/008_telematics_adapter.sql
-- True North Data Strategies LLC — Fleet-Compliance Sentinel
-- Telematics Adapter — Database Schema
--
-- Run after your existing 7 migrations.
-- Requires pgcrypto extension for credential encryption.
-- Compatible with Neon Postgres (serverless).
--
-- Tables:
--   telematics_credentials     Per-org provider credentials (encrypted)
--   telematics_vehicles        Normalized vehicle roster (synced from provider)
--   telematics_drivers         Normalized driver roster
--   telematics_hos_logs        HOS/ELD records (8-day rolling)
--   telematics_alerts          Exception/alert events
--   telematics_dvir_records    DVIR inspection records
--   telematics_gps_events      Real-time GPS feed (high-volume, partitioned)
--   telematics_sync_log        Sync job history + error tracking

-- ============================================================
-- Extensions
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- Credentials (encrypted at rest)
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_credentials (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id               TEXT NOT NULL,
    provider             TEXT NOT NULL,          -- 'verizon_reveal' | 'geotab' | 'samsara'
    username             TEXT NOT NULL,          -- Integration username from provider
    password_enc         TEXT NOT NULL,          -- pgp_sym_encrypt output
    consent_recorded_at  TIMESTAMPTZ,            -- When client granted data access consent
    last_validated_at    TIMESTAMPTZ,            -- Last successful credential validation
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_credentials_org_provider_uq
        UNIQUE (org_id, provider)
);

-- Index for username→org_id lookup (webhook receiver pattern)
CREATE INDEX idx_telematics_credentials_username
    ON telematics_credentials (username)
    WHERE is_active = TRUE;

COMMENT ON TABLE telematics_credentials IS
    'Per-org telematics provider credentials. Passwords stored encrypted via pgcrypto. '
    'Never log, never expose via API. Consent date = audit record of client authorization.';


-- ============================================================
-- Vehicles
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_vehicles (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                TEXT NOT NULL,
    provider              TEXT NOT NULL,
    provider_vehicle_id   TEXT NOT NULL,
    vehicle_number        TEXT NOT NULL,
    vin                   TEXT,
    make                  TEXT,
    model                 TEXT,
    year                  SMALLINT,
    license_plate         TEXT,
    license_state         CHAR(2),
    odometer_miles        NUMERIC(10, 1),
    engine_hours          NUMERIC(10, 2),
    last_gps_lat          NUMERIC(10, 7),
    last_gps_lon          NUMERIC(10, 7),
    last_seen_at          TIMESTAMPTZ,
    is_active             BOOLEAN NOT NULL DEFAULT TRUE,
    synced_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_vehicles_org_provider_vid_uq
        UNIQUE (org_id, provider, provider_vehicle_id)
);

CREATE INDEX idx_telematics_vehicles_org ON telematics_vehicles (org_id)
    WHERE is_active = TRUE;


-- ============================================================
-- Drivers
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_drivers (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                   TEXT NOT NULL,
    provider                 TEXT NOT NULL,
    provider_driver_id       TEXT NOT NULL,
    driver_name              TEXT NOT NULL,
    driver_license_number    TEXT,            -- PII — do not log
    driver_license_state     CHAR(2),
    email                    TEXT,            -- PII — do not log
    phone                    TEXT,            -- PII — do not log
    current_hos_status       TEXT,
    hours_driven_today       NUMERIC(4, 2),
    hours_driven_this_week   NUMERIC(5, 2),
    hours_available_today    NUMERIC(4, 2),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    synced_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_drivers_org_provider_did_uq
        UNIQUE (org_id, provider, provider_driver_id)
);

CREATE INDEX idx_telematics_drivers_org ON telematics_drivers (org_id)
    WHERE is_active = TRUE;

COMMENT ON COLUMN telematics_drivers.driver_license_number IS 'PII — never include in logs or LLM prompts';
COMMENT ON COLUMN telematics_drivers.email IS 'PII — never include in logs or LLM prompts';
COMMENT ON COLUMN telematics_drivers.phone IS 'PII — never include in logs or LLM prompts';


-- ============================================================
-- HOS Logs
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_hos_logs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                TEXT NOT NULL,
    provider              TEXT NOT NULL,
    provider_log_id       TEXT NOT NULL,
    provider_driver_id    TEXT NOT NULL,
    provider_vehicle_id   TEXT,
    status                TEXT NOT NULL,         -- HOSStatus enum value
    started_at            TIMESTAMPTZ NOT NULL,
    ended_at              TIMESTAMPTZ,
    duration_minutes      NUMERIC(8, 2),
    location_description  TEXT,
    odometer_at_change    NUMERIC(10, 1),
    is_violation          BOOLEAN NOT NULL DEFAULT FALSE,
    violation_description TEXT,
    synced_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_hos_logs_uq
        UNIQUE (org_id, provider, provider_log_id)
);

-- Compliance sweep queries: violations by org, recent logs by driver
CREATE INDEX idx_hos_logs_org_driver
    ON telematics_hos_logs (org_id, provider_driver_id, started_at DESC);

CREATE INDEX idx_hos_logs_violations
    ON telematics_hos_logs (org_id, is_violation)
    WHERE is_violation = TRUE;


-- ============================================================
-- Alerts
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_alerts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                TEXT NOT NULL,
    provider              TEXT NOT NULL,
    provider_alert_id     TEXT NOT NULL,
    provider_vehicle_id   TEXT,
    provider_driver_id    TEXT,
    alert_type            TEXT NOT NULL,
    alert_category        TEXT NOT NULL,
    severity              TEXT NOT NULL,         -- AlertSeverity enum
    description           TEXT NOT NULL,
    occurred_at           TIMESTAMPTZ NOT NULL,
    location_lat          NUMERIC(10, 7),
    location_lon          NUMERIC(10, 7),
    location_description  TEXT,
    risk_weight           NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
    synced_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_alerts_uq
        UNIQUE (org_id, provider, provider_alert_id)
);

CREATE INDEX idx_telematics_alerts_org_severity
    ON telematics_alerts (org_id, severity, occurred_at DESC);

CREATE INDEX idx_telematics_alerts_risk
    ON telematics_alerts (org_id, risk_weight DESC, occurred_at DESC);


-- ============================================================
-- DVIR Records
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_dvir_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  TEXT NOT NULL,
    provider                TEXT NOT NULL,
    provider_dvir_id        TEXT NOT NULL,
    provider_vehicle_id     TEXT NOT NULL,
    provider_driver_id      TEXT,
    inspection_type         TEXT NOT NULL,       -- 'pre_trip' | 'post_trip'
    inspected_at            TIMESTAMPTZ NOT NULL,
    outcome                 TEXT NOT NULL,        -- DVIROutcome enum
    defects                 JSONB NOT NULL DEFAULT '[]',
    defects_corrected_by    TEXT,
    defects_corrected_at    TIMESTAMPTZ,
    mechanic_notes          TEXT,
    requires_action         BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT telematics_dvir_uq
        UNIQUE (org_id, provider, provider_dvir_id)
);

-- Compliance critical: unresolved defects query
CREATE INDEX idx_dvir_requires_action
    ON telematics_dvir_records (org_id, requires_action, inspected_at DESC)
    WHERE requires_action = TRUE;


-- ============================================================
-- GPS Events (high volume — partition by week in production)
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_gps_events (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  TEXT NOT NULL,
    provider                TEXT NOT NULL,
    provider_vehicle_id     TEXT NOT NULL,
    provider_driver_id      TEXT,
    occurred_at             TIMESTAMPTZ NOT NULL,
    lat                     NUMERIC(10, 7) NOT NULL,
    lon                     NUMERIC(10, 7) NOT NULL,
    speed_mph               NUMERIC(5, 1),
    heading_degrees         NUMERIC(5, 1),
    odometer_miles          NUMERIC(10, 1),
    engine_on               BOOLEAN,
    ignition_on             BOOLEAN,
    is_speeding             BOOLEAN NOT NULL DEFAULT FALSE,
    posted_speed_limit_mph  NUMERIC(5, 1),
    received_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Time-series query pattern: latest events by vehicle
CREATE INDEX idx_gps_events_vehicle_time
    ON telematics_gps_events (org_id, provider_vehicle_id, occurred_at DESC);

-- Speeding event queries for risk score engine
CREATE INDEX idx_gps_events_speeding
    ON telematics_gps_events (org_id, is_speeding, occurred_at DESC)
    WHERE is_speeding = TRUE;

COMMENT ON TABLE telematics_gps_events IS
    'High-volume real-time GPS stream. Consider partitioning by week '
    'once Sample Fleet test data volume is understood. '
    'Retention policy: 90 days active, archive to cold storage.';


-- ============================================================
-- Sync Job Log
-- ============================================================

CREATE TABLE IF NOT EXISTS telematics_sync_log (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id        TEXT NOT NULL,
    provider      TEXT NOT NULL,
    sync_type     TEXT NOT NULL,    -- 'vehicles' | 'drivers' | 'hos' | 'alerts' | 'dvir'
    started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at  TIMESTAMPTZ,
    records_fetched  INTEGER,
    records_written  INTEGER,
    status        TEXT NOT NULL DEFAULT 'running',  -- 'running' | 'success' | 'error'
    error_message TEXT,
    duration_ms   INTEGER GENERATED ALWAYS AS (
        EXTRACT(EPOCH FROM (completed_at - started_at)) * 1000
    ) STORED
);

CREATE INDEX idx_sync_log_org_type
    ON telematics_sync_log (org_id, sync_type, started_at DESC);

COMMENT ON TABLE telematics_sync_log IS
    'Audit trail for all telematics sync jobs. '
    'Used by cron health check dead-man switch and SOC 2 evidence.';

