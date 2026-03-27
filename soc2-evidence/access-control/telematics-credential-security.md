# Telematics Credential Security — Evidence Document

**Date**: 2026-03-27
**System**: Fleet-Compliance Sentinel — Telematics Integration Layer
**Provider**: Verizon Connect Reveal
**Control Mapping**: CC6.1 (Logical Access), CC6.7 (Transmission Security), P4.3 (Data Retention)

---

## 1. Credential Storage Model

Telematics provider credentials are stored in the `telematics_credentials` table in Neon Postgres. The design follows these principles:

- **Per-org isolation**: Each organization has exactly one credential record per provider, enforced by the unique constraint `(org_id, provider)`.
- **Encryption at rest**: Passwords are encrypted using PostgreSQL `pgcrypto` extension (`pgp_sym_encrypt` with AES-256).
- **Deactivate, not delete**: Client offboarding sets `is_active = false` rather than deleting the row. This preserves the audit trail (who had access, when it was granted, when it was revoked).
- **Consent recording**: The `consent_recorded_at` field stores the datetime when the client explicitly authorized data sharing via the Verizon Reveal Marketplace.

---

## 2. Encryption Specification

| Property | Value |
|---|---|
| Algorithm | AES-256 via pgcrypto `pgp_sym_encrypt` |
| Key source | PostgreSQL session variable `app.encryption_key` set from `APP_ENCRYPTION_KEY` environment variable |
| Key storage | Railway environment variable (managed secret) |
| Encrypted column | `password_enc` in `telematics_credentials` table |
| Encryption call | `pgp_sym_encrypt($3, current_setting('app.encryption_key'))` |
| Decryption call | `pgp_sym_decrypt(password_enc::bytea, current_setting('app.encryption_key'))` |

**Code reference — encryption at write time**:
```sql
-- railway-backend/integrations/verizon_reveal/auth.py lines 148-155
INSERT INTO telematics_credentials
    (org_id, provider, username, password_enc, consent_recorded_at, is_active, created_at, updated_at)
VALUES
    ($1, 'verizon_reveal', $2,
     pgp_sym_encrypt($3, current_setting('app.encryption_key')),
     $4, true, now(), now())
ON CONFLICT (org_id, provider)
DO UPDATE SET
    username = EXCLUDED.username,
    password_enc = EXCLUDED.password_enc,
    consent_recorded_at = EXCLUDED.consent_recorded_at,
    is_active = true,
    updated_at = now()
```

**Audit finding**: The read path in `RevealCredentialStore.get()` (`auth.py` lines 98-107) currently reads `password_enc` without calling `pgp_sym_decrypt()`. This is flagged as finding CS-3 in the Phase 9 audit and requires remediation.

---

## 3. Credential Lifecycle

### Onboarding

1. Client logs into their Verizon Reveal account.
2. Client navigates to: User Icon → Marketplace → API Integrations → GET STARTED.
3. Client enters True North Data Strategies as the third-party company and provides developer email.
4. Verizon emails integration credentials to the TNDS developer (username in `REST@domain.verizonconnect.com` format, generated password).
5. TNDS operator runs onboarding script or adapter `save_credentials()` method.
6. Password is encrypted via `pgp_sym_encrypt` and stored in `telematics_credentials`.
7. `consent_recorded_at` is set to the current timestamp.

**Code reference**: `railway-backend/integrations/verizon_reveal/adapter.py` — `RevealAdapter.save_credentials()` (lines 72-86)

### Validation

1. `validate_credentials()` makes a lightweight `GET /vehicles?limit=1` request to Reveal API using stored credentials.
2. HTTP 200 = credentials valid. HTTP 401 = credentials invalid.
3. Called during onboarding and by cron health check.

**Code reference**: `railway-backend/integrations/verizon_reveal/auth.py` — `validate_reveal_credentials()` (lines 215-266)

### Usage (Runtime)

1. Sync cron or webhook receiver calls `RevealCredentialStore.get(org_id)`.
2. Credentials are read from Neon (with in-memory cache for process lifetime).
3. Credentials are used for HTTP Basic Auth against Verizon REST API.
4. Credentials are never logged, never serialized to JSON responses, never sent to Penny/LLM.

### Deactivation (Offboarding)

1. Client revokes access from their Reveal Marketplace dashboard.
2. TNDS operator calls `RevealAdapter.deactivate_credentials(org_id)`.
3. `is_active` is set to `false`. Row is preserved for audit trail.
4. In-memory cache is invalidated via `RevealCredentialStore.invalidate(org_id)`.
5. Subsequent sync attempts for this org_id will fail gracefully with "No active credentials" error.

**Code reference**: `railway-backend/integrations/verizon_reveal/adapter.py` — `deactivate_credentials()` (lines 88-91)
**Code reference**: `railway-backend/integrations/verizon_reveal/auth.py` — `RevealCredentialStore.deactivate()` (lines 182-204)

---

## 4. Per-Org Isolation Evidence

### Database Constraint

```sql
-- migrations/008_telematics_adapter.sql lines 42-43
CONSTRAINT telematics_credentials_org_provider_uq
    UNIQUE (org_id, provider)
```

This constraint ensures:
- Each org can have at most one credential record per telematics provider.
- Two orgs cannot share the same credential record.
- Upsert via `ON CONFLICT (org_id, provider)` updates existing records rather than creating duplicates.

### Username Index for Webhook Resolution

```sql
-- migrations/008_telematics_adapter.sql lines 47-49
CREATE INDEX idx_telematics_credentials_username
    ON telematics_credentials (username)
    WHERE is_active = TRUE;
```

This index supports the webhook receiver pattern: map incoming Verizon integration username to the correct org_id for tenant-scoped data writes.

---

## 5. Audit Trail Fields

| Field | Purpose | Set When |
|---|---|---|
| `consent_recorded_at` | Datetime client authorized data sharing via Reveal Marketplace | Onboarding |
| `created_at` | Row creation timestamp | First onboarding |
| `updated_at` | Last modification timestamp | Any credential update or deactivation |
| `is_active` | Whether credentials are currently valid and in use | Onboarding (true), Offboarding (false) |
| `last_validated_at` | Last successful credential validation | Health check / validation |

---

## 6. Code References

| File | Purpose |
|---|---|
| `railway-backend/integrations/verizon_reveal/auth.py` | `RevealCredentialStore` — read/write/deactivate/cache |
| `railway-backend/integrations/verizon_reveal/adapter.py` | `RevealAdapter.save_credentials()`, `deactivate_credentials()` |
| `migrations/008_telematics_adapter.sql` | `telematics_credentials` table DDL |
| `scripts/onboard_chief_petroleum.py` | Initial client onboarding (stores encrypted credentials) |

---

## 7. What Is Never Stored

| Item | Status | Evidence |
|---|---|---|
| Plaintext passwords in database | **Never** — encrypted via `pgp_sym_encrypt` | `auth.py` line 154 |
| Passwords in application logs | **Never** — explicit "DO NOT log" comments | `auth.py` line 245, `rest_client.py` line 376 |
| Passwords in environment files committed to git | **Should be never** — see audit finding CS-1 | `onboard_chief_petroleum.py` has a hardcoded password (CRITICAL finding, remediation required) |
| Passwords in API responses | **Never** — `RevealCredentials.__repr__` masks as `***` | `auth.py` line 63 |
| Passwords sent to Penny/LLM | **Never** — telematics routes have no LLM integration | Verified: no Penny calls in telematics code |

---

## 8. Key Rotation Procedure

### APP_ENCRYPTION_KEY Rotation

1. Generate a new encryption key (minimum 32 bytes, base64-encoded).
2. Set the new key in Railway environment variables as `APP_ENCRYPTION_KEY_NEW`.
3. Run a migration script that:
   a. Sets old key: `SET app.encryption_key = '{old_key}'`
   b. Reads and decrypts all active credentials.
   c. Sets new key: `SET app.encryption_key = '{new_key}'`
   d. Re-encrypts all credentials with the new key.
4. Update `APP_ENCRYPTION_KEY` to the new value.
5. Remove `APP_ENCRYPTION_KEY_NEW`.
6. Validate all credentials still work via `validate_credentials()`.
7. Record rotation date in secret rotation log.

**Note**: All SQL statements in the rotation script must use parameterized queries (see audit finding CS-2).

### Verizon Reveal Credential Rotation

1. Client logs into Reveal Marketplace → API Integrations.
2. Client revokes current integration and creates new one.
3. Verizon emails new credentials to TNDS developer.
4. TNDS operator updates credentials via `RevealAdapter.save_credentials()` (upsert pattern).
5. Old encrypted credential is overwritten in place.
6. Validate new credentials via `validate_credentials()`.

---

## 9. Client Revocation Procedure

1. Client navigates to Verizon Reveal → User Icon → Marketplace → API Integrations.
2. Client revokes the TNDS integration access.
3. Verizon immediately invalidates the issued credentials.
4. TNDS detects revocation on next sync attempt (API returns 401).
5. TNDS operator runs `RevealAdapter.deactivate_credentials(org_id)`.
6. Credential record is soft-deleted (`is_active = false`).
7. All future sync/webhook processing for this org returns gracefully without data access.
8. Audit trail preserved: `created_at`, `consent_recorded_at`, `updated_at`, `is_active = false`.
