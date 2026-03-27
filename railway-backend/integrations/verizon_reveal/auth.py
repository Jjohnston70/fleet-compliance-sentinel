"""
integrations/verizon_reveal/auth.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Verizon Connect Reveal — Credential Management

How Reveal credentials work:
  1. Example Fleet Co (or any Reveal client) logs into their Reveal account
  2. They go to: User Icon → Marketplace → API Integrations → GET STARTED
  3. They enter TNDS as the third-party company and your email as developer
  4. Verizon emails YOU credentials in the form:
       username: REST@examplefleetco.verizonconnect.com (example format)
       password: [generated]
  5. You store those credentials here, scoped to their org_id
  6. All API calls use HTTP Basic Auth with those credentials

Security notes:
  - Credentials stored in Postgres `telematics_credentials` table
  - Values encrypted at rest via Postgres pgcrypto (AES-256)
  - Retrieved at runtime — NEVER logged, NEVER sent to Penny/LLM
  - Least privilege: credentials are read-only integrations scoped to
    their Reveal account data only
  - Rotate credentials: Reveal admin can revoke and reissue from their
    Marketplace dashboard at any time

COMPLIANCE FLAG: These are client-authorized data sharing credentials.
The Data Access Consent Form in Reveal is the client's explicit consent
record. Store the consent date alongside credentials for audit trail.
"""

import logging
from datetime import datetime
from typing import Optional

import httpx
from pydantic import BaseModel

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Reveal API base URL — REST Integration Services portal
# ---------------------------------------------------------------------------
REVEAL_API_BASE = "https://fm.api.verizonconnect.com/v1"
REVEAL_AUTH_TEST_ENDPOINT = f"{REVEAL_API_BASE}/vehicles"


# ---------------------------------------------------------------------------
# Credential model (in-memory representation — never serialized to logs)
# ---------------------------------------------------------------------------

class RevealCredentials(BaseModel):
    org_id: str
    username: str           # REST@domain.com format issued by Reveal
    password: str           # Treat as secret — mask in all logging
    consent_recorded_at: Optional[datetime] = None
    last_validated_at: Optional[datetime] = None
    is_active: bool = True

    class Config:
        # Prevent accidental serialization of password in repr/logs
        json_encoders = {str: lambda v: v}

    def __repr__(self):
        return f"RevealCredentials(org_id={self.org_id}, username={self.username}, password=***)"


# ---------------------------------------------------------------------------
# Credential store — wraps DB reads with in-memory cache
# ---------------------------------------------------------------------------

class RevealCredentialStore:
    """
    Manages per-tenant Verizon Reveal credentials.

    Reads from: telematics_credentials table in Neon Postgres
    Cache: simple in-memory dict (process lifetime)
    Invalidation: call invalidate(org_id) after credential update

    Usage:
        store = RevealCredentialStore(db_pool)
        creds = await store.get(org_id="example-fleet-co-org-id")
        # creds.username, creds.password → use for Basic Auth
    """

    def __init__(self, db_pool):
        self._db = db_pool
        self._cache: dict[str, RevealCredentials] = {}

    async def get(self, org_id: str) -> Optional[RevealCredentials]:
        """
        Retrieve credentials for org_id.
        Returns None if no credentials exist or they are inactive.
        Logs warning (not error) on cache miss — expected on first call.
        """
        if org_id in self._cache:
            return self._cache[org_id]

        try:
            row = await self._db.fetchrow(
                """
                SELECT username, password_enc, consent_recorded_at,
                       last_validated_at, is_active
                FROM telematics_credentials
                WHERE org_id = $1
                  AND provider = 'verizon_reveal'
                  AND is_active = true
                """,
                org_id,
            )
        except Exception as e:
            logger.error(
                "telematics_credentials_read_error",
                extra={"org_id": org_id, "error": str(e)},
            )
            return None

        if not row:
            logger.warning(
                "reveal_credentials_not_found",
                extra={"org_id": org_id},
            )
            return None

        creds = RevealCredentials(
            org_id=org_id,
            username=row["username"],
            password=row["password_enc"],  # Decrypted by Postgres pgcrypto at query time
            consent_recorded_at=row["consent_recorded_at"],
            last_validated_at=row["last_validated_at"],
            is_active=row["is_active"],
        )
        self._cache[org_id] = creds
        return creds

    async def save(
        self,
        org_id: str,
        username: str,
        password: str,
        consent_recorded_at: Optional[datetime] = None,
    ) -> bool:
        """
        Upsert credentials for org_id.
        Called during client onboarding when they share Reveal credentials.
        Password is stored encrypted via pgcrypto — never plaintext.
        """
        try:
            await self._db.execute(
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
                    username = EXCLUDED.username,
                    password_enc = EXCLUDED.password_enc,
                    consent_recorded_at = EXCLUDED.consent_recorded_at,
                    is_active = true,
                    updated_at = now()
                """,
                org_id,
                username,
                password,
                consent_recorded_at or datetime.utcnow(),
            )
            self.invalidate(org_id)
            logger.info(
                "reveal_credentials_saved",
                extra={"org_id": org_id, "username": username},
            )
            return True
        except Exception as e:
            logger.error(
                "reveal_credentials_save_error",
                extra={"org_id": org_id, "error": str(e)},
            )
            return False

    async def deactivate(self, org_id: str) -> bool:
        """
        Deactivate credentials (client offboarding or credential revocation).
        Does NOT delete — preserves audit trail.
        """
        try:
            await self._db.execute(
                """
                UPDATE telematics_credentials
                SET is_active = false, updated_at = now()
                WHERE org_id = $1 AND provider = 'verizon_reveal'
                """,
                org_id,
            )
            self.invalidate(org_id)
            logger.info("reveal_credentials_deactivated", extra={"org_id": org_id})
            return True
        except Exception as e:
            logger.error(
                "reveal_credentials_deactivate_error",
                extra={"org_id": org_id, "error": str(e)},
            )
            return False

    def invalidate(self, org_id: str) -> None:
        """Clear cached credentials for org_id — forces re-read from DB."""
        self._cache.pop(org_id, None)


# ---------------------------------------------------------------------------
# Credential validator — called during onboarding and cron health check
# ---------------------------------------------------------------------------

async def validate_reveal_credentials(creds: RevealCredentials) -> bool:
    """
    Make a lightweight authenticated request to Reveal to confirm
    credentials are valid and the account is accessible.

    Uses GET /vehicles with a limit of 1 — minimum data transfer,
    maximum signal on credential validity.

    Returns True if credentials are valid, False otherwise.
    Never raises — always returns bool.
    """
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                REVEAL_AUTH_TEST_ENDPOINT,
                auth=(creds.username, creds.password),
                params={"limit": 1},
                headers={"Accept": "application/json"},
            )

        if response.status_code == 200:
            logger.info(
                "reveal_credentials_valid",
                extra={"org_id": creds.org_id},
            )
            return True
        elif response.status_code == 401:
            logger.warning(
                "reveal_credentials_invalid_401",
                extra={"org_id": creds.org_id},
                # DO NOT log username/password even in warning
            )
            return False
        else:
            logger.warning(
                "reveal_credentials_unexpected_status",
                extra={"org_id": creds.org_id, "status": response.status_code},
            )
            return False

    except httpx.TimeoutException:
        logger.error(
            "reveal_credentials_timeout",
            extra={"org_id": creds.org_id},
        )
        return False
    except Exception as e:
        logger.error(
            "reveal_credentials_validation_error",
            extra={"org_id": creds.org_id, "error": str(e)},
        )
        return False
