"""
integrations/base_adapter.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Telematics Adapter Base Interface

All telematics provider adapters implement this interface.
The risk score engine and compliance logic ONLY touch this contract —
never the vendor-specific implementation underneath.

Adding a new provider (Geotab, Samsara, Motive) = implement this class.
Zero changes required to compliance logic above.
"""

from abc import ABC, abstractmethod
from typing import Optional
from models.telematics_event import (
    NormalizedVehicle,
    NormalizedDriver,
    NormalizedHOSLog,
    NormalizedAlert,
    NormalizedDVIR,
    NormalizedGPSEvent,
)


class BaseTelematicsAdapter(ABC):
    """
    Abstract base class for all telematics provider adapters.

    Each provider adapter must implement every method below.
    Return types are always normalized internal models — never
    raw vendor payloads. Normalization happens inside the adapter,
    not in the calling code.

    Tenant isolation: every method accepts org_id so multi-tenant
    credential lookup stays consistent across providers.
    """

    @abstractmethod
    async def get_vehicles(self, org_id: str) -> list[NormalizedVehicle]:
        """
        Return all active vehicles for this org/tenant.
        Maps to: vehicle list, asset inventory, unit roster
        depending on provider terminology.
        """
        ...

    @abstractmethod
    async def get_drivers(self, org_id: str) -> list[NormalizedDriver]:
        """
        Return all active drivers for this org/tenant.
        Maps to: driver roster, operator list, user list.
        """
        ...

    @abstractmethod
    async def get_hos_logs(
        self,
        org_id: str,
        vehicle_id: Optional[str] = None,
        driver_id: Optional[str] = None,
        days_back: int = 8,  # FMCSA requires 8 days of HOS records on vehicle
    ) -> list[NormalizedHOSLog]:
        """
        Return HOS/ELD log records.
        days_back defaults to 8 — the FMCSA minimum lookback window.
        Filter by vehicle OR driver, or pass neither for full fleet.
        """
        ...

    @abstractmethod
    async def get_alerts(
        self,
        org_id: str,
        days_back: int = 7,
    ) -> list[NormalizedAlert]:
        """
        Return exception/alert events (speeding, geofence, harsh braking, etc.)
        Used to feed the driver behavior component of the risk score engine.
        """
        ...

    @abstractmethod
    async def get_dvir_records(
        self,
        org_id: str,
        vehicle_id: Optional[str] = None,
        days_back: int = 30,
    ) -> list[NormalizedDVIR]:
        """
        Return Driver Vehicle Inspection Reports (pre/post-trip).
        DVIR defects with no corrective action = compliance violation.
        """
        ...

    @abstractmethod
    async def validate_credentials(self, org_id: str) -> bool:
        """
        Test that stored credentials for this org are valid and the
        provider API is reachable. Called during onboarding and by
        the cron health check.
        """
        ...

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """
        Human-readable provider identifier.
        e.g. "verizon_reveal", "geotab", "samsara"
        Used for logging and the telematics_credentials table.
        """
        ...
