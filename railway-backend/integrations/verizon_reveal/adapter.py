"""
integrations/verizon_reveal/adapter.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Verizon Connect Reveal — Concrete Adapter Implementation

Implements BaseTelematicsAdapter for Verizon Connect Reveal.
This is the only class the rest of the application talks to.

Wires together:
  RevealCredentialStore  → credential lookup
  RevealRESTClient       → polling data fetches
  validate_credentials() → health check

Usage:
    adapter = RevealAdapter(db_pool=db, org_id="example-fleet-co-org-id")

    # Onboarding — save client credentials
    await adapter.save_credentials(
        username="REST@examplefleetco.verizonconnect.com",
        password="<from-reveal-email>",
        consent_recorded_at=datetime.utcnow(),
    )

    # Data pull
    vehicles = await adapter.get_vehicles(org_id="example-fleet-co-org-id")
    drivers  = await adapter.get_drivers(org_id="example-fleet-co-org-id")
    hos_logs = await adapter.get_hos_logs(org_id="example-fleet-co-org-id")
"""

import logging
from datetime import datetime
from typing import Optional

from integrations.base_adapter import BaseTelematicsAdapter
from integrations.verizon_reveal.auth import (
    RevealCredentialStore,
    validate_reveal_credentials,
)
from integrations.verizon_reveal.rest_client import RevealRESTClient
from models.telematics_event import (
    NormalizedAlert,
    NormalizedDriver,
    NormalizedDVIR,
    NormalizedHOSLog,
    NormalizedVehicle,
    TelematicsProvider,
)

logger = logging.getLogger(__name__)


class RevealAdapter(BaseTelematicsAdapter):
    """
    Verizon Connect Reveal implementation of BaseTelematicsAdapter.

    Multi-tenant: one adapter instance per org_id, or pass org_id
    at call time (both patterns supported — call-time takes precedence).
    """

    def __init__(self, db_pool, org_id: Optional[str] = None):
        self._credential_store = RevealCredentialStore(db_pool)
        self._default_org_id = org_id

    @property
    def provider_name(self) -> str:
        return TelematicsProvider.VERIZON_REVEAL.value

    # -----------------------------------------------------------------------
    # Credential management (call during client onboarding)
    # -----------------------------------------------------------------------

    async def save_credentials(
        self,
        username: str,
        password: str,
        org_id: Optional[str] = None,
        consent_recorded_at: Optional[datetime] = None,
    ) -> bool:
        oid = org_id or self._default_org_id
        self._require_org_id(oid)
        return await self._credential_store.save(
            org_id=oid,
            username=username,
            password=password,
            consent_recorded_at=consent_recorded_at,
        )

    async def deactivate_credentials(self, org_id: Optional[str] = None) -> bool:
        oid = org_id or self._default_org_id
        self._require_org_id(oid)
        return await self._credential_store.deactivate(org_id=oid)

    # -----------------------------------------------------------------------
    # BaseTelematicsAdapter implementation
    # -----------------------------------------------------------------------

    async def validate_credentials(self, org_id: Optional[str] = None) -> bool:
        oid = org_id or self._default_org_id
        self._require_org_id(oid)
        creds = await self._credential_store.get(oid)
        if not creds:
            return False
        return await validate_reveal_credentials(creds)

    async def get_vehicles(self, org_id: Optional[str] = None) -> list[NormalizedVehicle]:
        client = await self._get_client(org_id)
        return await client.get_vehicles()

    async def get_drivers(self, org_id: Optional[str] = None) -> list[NormalizedDriver]:
        client = await self._get_client(org_id)
        return await client.get_drivers()

    async def get_hos_logs(
        self,
        org_id: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        driver_id: Optional[str] = None,
        days_back: int = 8,
    ) -> list[NormalizedHOSLog]:
        client = await self._get_client(org_id)
        return await client.get_hos_logs(
            vehicle_id=vehicle_id,
            driver_id=driver_id,
            days_back=days_back,
        )

    async def get_alerts(
        self,
        org_id: Optional[str] = None,
        days_back: int = 7,
    ) -> list[NormalizedAlert]:
        client = await self._get_client(org_id)
        return await client.get_alerts(days_back=days_back)

    async def get_dvir_records(
        self,
        org_id: Optional[str] = None,
        vehicle_id: Optional[str] = None,
        days_back: int = 30,
    ) -> list[NormalizedDVIR]:
        client = await self._get_client(org_id)
        return await client.get_dvir_records(
            vehicle_id=vehicle_id,
            days_back=days_back,
        )

    # -----------------------------------------------------------------------
    # Internal helpers
    # -----------------------------------------------------------------------

    async def _get_client(self, org_id: Optional[str]) -> RevealRESTClient:
        """Resolve org_id, fetch credentials, return configured REST client."""
        oid = org_id or self._default_org_id
        self._require_org_id(oid)

        creds = await self._credential_store.get(oid)
        if not creds:
            raise ValueError(
                f"No active Verizon Reveal credentials for org_id={oid}. "
                f"Complete client onboarding first: "
                f"client must authorize via Reveal Marketplace → API Integrations."
            )

        return RevealRESTClient(creds)

    @staticmethod
    def _require_org_id(org_id: Optional[str]) -> None:
        if not org_id:
            raise ValueError(
                "org_id is required. Pass it at call time or set default "
                "at RevealAdapter construction."
            )
