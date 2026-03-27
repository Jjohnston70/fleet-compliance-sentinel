import asyncio
import os
from datetime import datetime, timezone
import asyncpg

ENCRYPTION_KEY = os.environ["APP_ENCRYPTION_KEY"]
DATABASE_URL   = os.environ["DATABASE_URL"]
ORG_ID         = os.getenv("REVEAL_ORG_ID", "example-fleet-co")
USERNAME       = os.environ["REVEAL_USERNAME"]
PASSWORD       = os.environ["REVEAL_PASSWORD"]
APP_ID         = os.environ["REVEAL_APP_ID"]

MIGRATION_SQL = """
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS telematics_credentials (
    id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id               TEXT NOT NULL,
    provider             TEXT NOT NULL,
    username             TEXT NOT NULL,
    password_enc         TEXT NOT NULL,
    consent_recorded_at  TIMESTAMPTZ,
    last_validated_at    TIMESTAMPTZ,
    is_active            BOOLEAN NOT NULL DEFAULT TRUE,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT telematics_credentials_org_provider_uq UNIQUE (org_id, provider)
);

CREATE INDEX IF NOT EXISTS idx_telematics_credentials_username
    ON telematics_credentials (username)
    WHERE is_active = TRUE;

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
    CONSTRAINT telematics_vehicles_org_provider_vid_uq UNIQUE (org_id, provider, provider_vehicle_id)
);

CREATE INDEX IF NOT EXISTS idx_telematics_vehicles_org
    ON telematics_vehicles (org_id) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS telematics_drivers (
    id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                   TEXT NOT NULL,
    provider                 TEXT NOT NULL,
    provider_driver_id       TEXT NOT NULL,
    driver_name              TEXT NOT NULL,
    driver_license_number    TEXT,
    driver_license_state     CHAR(2),
    email                    TEXT,
    phone                    TEXT,
    current_hos_status       TEXT,
    hours_driven_today       NUMERIC(4, 2),
    hours_driven_this_week   NUMERIC(5, 2),
    hours_available_today    NUMERIC(4, 2),
    is_active                BOOLEAN NOT NULL DEFAULT TRUE,
    synced_at                TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT telematics_drivers_org_provider_did_uq UNIQUE (org_id, provider, provider_driver_id)
);

CREATE INDEX IF NOT EXISTS idx_telematics_drivers_org
    ON telematics_drivers (org_id) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS telematics_hos_logs (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                TEXT NOT NULL,
    provider              TEXT NOT NULL,
    provider_log_id       TEXT NOT NULL,
    provider_driver_id    TEXT NOT NULL,
    provider_vehicle_id   TEXT,
    status                TEXT NOT NULL,
    started_at            TIMESTAMPTZ NOT NULL,
    ended_at              TIMESTAMPTZ,
    duration_minutes      NUMERIC(8, 2),
    location_description  TEXT,
    odometer_at_change    NUMERIC(10, 1),
    is_violation          BOOLEAN NOT NULL DEFAULT FALSE,
    violation_description TEXT,
    synced_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT telematics_hos_logs_uq UNIQUE (org_id, provider, provider_log_id)
);

CREATE INDEX IF NOT EXISTS idx_hos_logs_org_driver
    ON telematics_hos_logs (org_id, provider_driver_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_hos_logs_violations
    ON telematics_hos_logs (org_id, is_violation) WHERE is_violation = TRUE;

CREATE TABLE IF NOT EXISTS telematics_alerts (
    id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                TEXT NOT NULL,
    provider              TEXT NOT NULL,
    provider_alert_id     TEXT NOT NULL,
    provider_vehicle_id   TEXT,
    provider_driver_id    TEXT,
    alert_type            TEXT NOT NULL,
    alert_category        TEXT NOT NULL,
    severity              TEXT NOT NULL,
    description           TEXT NOT NULL,
    occurred_at           TIMESTAMPTZ NOT NULL,
    location_lat          NUMERIC(10, 7),
    location_lon          NUMERIC(10, 7),
    location_description  TEXT,
    risk_weight           NUMERIC(3, 1) NOT NULL DEFAULT 1.0,
    synced_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT telematics_alerts_uq UNIQUE (org_id, provider, provider_alert_id)
);

CREATE INDEX IF NOT EXISTS idx_telematics_alerts_org_severity
    ON telematics_alerts (org_id, severity, occurred_at DESC);

CREATE TABLE IF NOT EXISTS telematics_dvir_records (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id                  TEXT NOT NULL,
    provider                TEXT NOT NULL,
    provider_dvir_id        TEXT NOT NULL,
    provider_vehicle_id     TEXT NOT NULL,
    provider_driver_id      TEXT,
    inspection_type         TEXT NOT NULL,
    inspected_at            TIMESTAMPTZ NOT NULL,
    outcome                 TEXT NOT NULL,
    defects                 JSONB NOT NULL DEFAULT '[]',
    defects_corrected_by    TEXT,
    defects_corrected_at    TIMESTAMPTZ,
    mechanic_notes          TEXT,
    requires_action         BOOLEAN NOT NULL DEFAULT FALSE,
    synced_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT telematics_dvir_uq UNIQUE (org_id, provider, provider_dvir_id)
);

CREATE INDEX IF NOT EXISTS idx_dvir_requires_action
    ON telematics_dvir_records (org_id, requires_action, inspected_at DESC)
    WHERE requires_action = TRUE;

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

CREATE INDEX IF NOT EXISTS idx_gps_events_vehicle_time
    ON telematics_gps_events (org_id, provider_vehicle_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS telematics_sync_log (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id           TEXT NOT NULL,
    provider         TEXT NOT NULL,
    sync_type        TEXT NOT NULL,
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    records_fetched  INTEGER,
    records_written  INTEGER,
    status           TEXT NOT NULL DEFAULT 'running',
    error_message    TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_log_org_type
    ON telematics_sync_log (org_id, sync_type, started_at DESC);
"""

async def main():
    print("Connecting to Neon...")
    db = await asyncpg.connect(DATABASE_URL)

    print("Setting encryption key...")
    await db.execute("SELECT set_config('app.encryption_key', $1, false)", ENCRYPTION_KEY)

    print("Running migration (CREATE IF NOT EXISTS)...")
    try:
        await db.execute(MIGRATION_SQL)
        print("Migration complete — all tables ready.")
    except Exception as e:
        print(f"Migration error: {e}")
        await db.close()
        return

    print("Saving credentials...")
    try:
        await db.execute(
            """
            INSERT INTO telematics_credentials
                (org_id, provider, username, password_enc,
                 consent_recorded_at, is_active, created_at, updated_at)
            VALUES
                ($1, 'verizon_reveal', $2,
                 pgp_sym_encrypt($3, current_setting('app.encryption_key')),
                 $4, true, now(), now())
            ON CONFLICT (org_id, provider)
            DO UPDATE SET
                username            = EXCLUDED.username,
                password_enc        = EXCLUDED.password_enc,
                consent_recorded_at = EXCLUDED.consent_recorded_at,
                is_active           = true,
                updated_at          = now()
            """,
            ORG_ID, USERNAME, PASSWORD,
            datetime.now(timezone.utc),
        )
        print("Credentials saved and encrypted.")
    except Exception as e:
        print(f"FAILED to save credentials: {e}")
        await db.close()
        return

    row = await db.fetchrow(
        "SELECT org_id, username, is_active, created_at FROM telematics_credentials WHERE org_id = $1",
        ORG_ID,
    )
    print(f"\nDB record confirmed:")
    print(f"  org_id:     {row['org_id']}")
    print(f"  username:   {row['username']}")
    print(f"  is_active:  {row['is_active']}")
    print(f"  created_at: {row['created_at']}")

    await db.close()

    print("\nValidating against Verizon Connect Reveal API...")
    import httpx
    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.get(
                "https://fm.api.verizonconnect.com/v1/vehicles",
                auth=(USERNAME, PASSWORD),
                params={"limit": 1},
                headers={"Accept": "application/json"},
            )
        print(f"Reveal API: HTTP {response.status_code}")
        print(f"Body: {response.text[:400]}")
        if response.status_code == 200:
            print("\nSUCCESS — live connection to Example Fleet Co Reveal account confirmed.")
        else:
            print("\nWARNING — credentials saved but API returned unexpected status.")
            print("Check endpoint URL or contact Verizon to confirm integration is active.")
    except Exception as e:
        print(f"Reveal API error: {e}")

    print("\nDone.")

asyncio.run(main())
