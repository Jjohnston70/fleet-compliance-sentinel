"""
integrations/verizon_reveal/rest_client.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Verizon Connect Reveal — REST API Polling Client

Handles all scheduled (polling) data pulls from the Reveal
Integration Services REST API.

Auth: HTTP Basic Auth (username:password from RevealCredentialStore)
Base URL: https://fm.api.verizonconnect.com/v1
Format: JSON

Call schedule (set in your Vercel cron or Railway scheduler):
  - get_vehicles()       → every 6 hours  (asset changes are slow)
  - get_drivers()        → every 6 hours
  - get_hos_logs()       → every hour     (HOS changes frequently)
  - get_alerts()         → every hour
  - get_dvir_records()   → every 4 hours

Rate limiting: Reveal does not publish explicit rate limits.
Implement conservative backoff. 429 response → wait 60s, retry once.
If second attempt fails, log and skip — do not retry in a loop.
"""

import logging
from datetime import datetime, timedelta
from typing import Optional

import httpx

from integrations.verizon_reveal.auth import RevealCredentials
from integrations.verizon_reveal.normalizer import RevealNormalizer
from models.telematics_event import (
    NormalizedAlert,
    NormalizedDriver,
    NormalizedDVIR,
    NormalizedHOSLog,
    NormalizedVehicle,
)

logger = logging.getLogger(__name__)

REVEAL_API_BASE = "https://fm.api.verizonconnect.com/v1"

# Conservative timeout — Reveal can be slow on large fleets
REQUEST_TIMEOUT = 30.0

# Max records per page — use pagination for fleets > 100 vehicles
PAGE_SIZE = 100


class RevealRESTClient:
    """
    Polling REST client for Verizon Connect Reveal.

    All methods return normalized internal models.
    Raw Reveal payloads are passed through RevealNormalizer before return.
    Raw data is preserved in `raw_provider_data` field for debugging.

    Usage:
        creds = await credential_store.get(org_id)
        client = RevealRESTClient(creds)
        vehicles = await client.get_vehicles()
    """

    def __init__(self, creds: RevealCredentials):
        self._creds = creds
        self._normalizer = RevealNormalizer(org_id=creds.org_id)
        self._auth = (creds.username, creds.password)

    # -----------------------------------------------------------------------
    # Vehicles
    # -----------------------------------------------------------------------

    async def get_vehicles(self) -> list[NormalizedVehicle]:
        """
        Pull full vehicle/unit roster from Reveal.
        Endpoint: GET /vehicles
        Returns all active vehicles in the account.
        """
        raw_vehicles = await self._paginate("/vehicles")
        normalized = []
        for raw in raw_vehicles:
            try:
                normalized.append(self._normalizer.vehicle(raw))
            except Exception as e:
                logger.warning(
                    "reveal_vehicle_normalize_error",
                    extra={
                        "org_id": self._creds.org_id,
                        "vehicle_id": raw.get("Id", "unknown"),
                        "error": str(e),
                    },
                )
        logger.info(
            "reveal_vehicles_fetched",
            extra={"org_id": self._creds.org_id, "count": len(normalized)},
        )
        return normalized

    # -----------------------------------------------------------------------
    # Drivers
    # -----------------------------------------------------------------------

    async def get_drivers(self) -> list[NormalizedDriver]:
        """
        Pull driver roster from Reveal.
        Endpoint: GET /drivers
        """
        raw_drivers = await self._paginate("/drivers")
        normalized = []
        for raw in raw_drivers:
            try:
                normalized.append(self._normalizer.driver(raw))
            except Exception as e:
                logger.warning(
                    "reveal_driver_normalize_error",
                    extra={
                        "org_id": self._creds.org_id,
                        "driver_id": raw.get("Id", "unknown"),
                        "error": str(e),
                    },
                )
        logger.info(
            "reveal_drivers_fetched",
            extra={"org_id": self._creds.org_id, "count": len(normalized)},
        )
        return normalized

    # -----------------------------------------------------------------------
    # HOS / ELD Logbook
    # -----------------------------------------------------------------------

    async def get_hos_logs(
        self,
        vehicle_id: Optional[str] = None,
        driver_id: Optional[str] = None,
        days_back: int = 8,
    ) -> list[NormalizedHOSLog]:
        """
        Pull HOS/ELD Logbook records from Reveal.
        Endpoint: GET /logbook/hos

        FMCSA requires 8 days of HOS records on the vehicle —
        defaults match that requirement.

        Reveal returns one record per duty status change.
        Each record has a start time; end time is the start of the next record.
        We compute duration in the normalizer.
        """
        since = datetime.utcnow() - timedelta(days=days_back)
        params: dict = {
            "from": since.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "to": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        if vehicle_id:
            params["vehicleId"] = vehicle_id
        if driver_id:
            params["driverId"] = driver_id

        raw_logs = await self._paginate("/logbook/hos", params=params)
        normalized = []
        for raw in raw_logs:
            try:
                normalized.append(self._normalizer.hos_log(raw))
            except Exception as e:
                logger.warning(
                    "reveal_hos_normalize_error",
                    extra={
                        "org_id": self._creds.org_id,
                        "log_id": raw.get("Id", "unknown"),
                        "error": str(e),
                    },
                )
        logger.info(
            "reveal_hos_logs_fetched",
            extra={
                "org_id": self._creds.org_id,
                "count": len(normalized),
                "days_back": days_back,
            },
        )
        return normalized

    # -----------------------------------------------------------------------
    # Alerts / Exceptions
    # -----------------------------------------------------------------------

    async def get_alerts(self, days_back: int = 7) -> list[NormalizedAlert]:
        """
        Pull alert/exception events from Reveal.
        Endpoint: GET /alerts

        Alert types relevant to DOT compliance:
          - Speeding (federal and state speed limit violations)
          - Hours of Service violations
          - Geofence entry/exit (unauthorized location)
          - Harsh braking / harsh acceleration
          - Vehicle diagnostics (engine fault codes)
          - Seat belt violations
          - ELD malfunctions
        """
        since = datetime.utcnow() - timedelta(days=days_back)
        params = {
            "from": since.strftime("%Y-%m-%dT%H:%M:%SZ"),
            "to": datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        raw_alerts = await self._paginate("/alerts", params=params)
        normalized = []
        for raw in raw_alerts:
            try:
                normalized.append(self._normalizer.alert(raw))
            except Exception as e:
                logger.warning(
                    "reveal_alert_normalize_error",
                    extra={
                        "org_id": self._creds.org_id,
                        "alert_id": raw.get("Id", "unknown"),
                        "error": str(e),
                    },
                )
        logger.info(
            "reveal_alerts_fetched",
            extra={"org_id": self._creds.org_id, "count": len(normalized)},
        )
        return normalized

    # -----------------------------------------------------------------------
    # DVIR Records
    # -----------------------------------------------------------------------

    async def get_dvir_records(
        self,
        vehicle_id: Optional[str] = None,
        days_back: int = 30,
    ) -> list[NormalizedDVIR]:
        """
        Pull DVIR records from Reveal.
        Endpoint: GET /dvir

        Unresolved defects (outcome = DEFECTS_NEED_CORRECTION) are a
        direct DOT compliance risk. These should trigger a HIGH severity
        alert in Fleet-Compliance Sentinel immediately.

        49 CFR 396.11: Driver must complete DVIR every day.
        49 CFR 396.13: Driver must review previous DVIR before operating vehicle.
        """
        since = datetime.utcnow() - timedelta(days=days_back)
        params: dict = {
            "from": since.strftime("%Y-%m-%dT%H:%M:%SZ"),
        }
        if vehicle_id:
            params["vehicleId"] = vehicle_id

        raw_dvirs = await self._paginate("/dvir", params=params)
        normalized = []
        for raw in raw_dvirs:
            try:
                normalized.append(self._normalizer.dvir(raw))
            except Exception as e:
                logger.warning(
                    "reveal_dvir_normalize_error",
                    extra={
                        "org_id": self._creds.org_id,
                        "dvir_id": raw.get("Id", "unknown"),
                        "error": str(e),
                    },
                )
        logger.info(
            "reveal_dvir_fetched",
            extra={"org_id": self._creds.org_id, "count": len(normalized)},
        )
        return normalized

    # -----------------------------------------------------------------------
    # Internal: pagination + HTTP
    # -----------------------------------------------------------------------

    async def _paginate(
        self,
        endpoint: str,
        params: Optional[dict] = None,
    ) -> list[dict]:
        """
        Handle paginated responses from Reveal REST API.
        Reveal uses offset-based pagination: ?offset=0&limit=100

        Collects all pages and returns a flat list of records.
        Stops when returned count < page size (last page).
        """
        params = params or {}
        params["limit"] = PAGE_SIZE
        all_records: list[dict] = []
        offset = 0

        while True:
            params["offset"] = offset
            data = await self._get(endpoint, params=params)

            # Reveal wraps results — handle both list and dict response shapes
            if isinstance(data, list):
                records = data
            elif isinstance(data, dict):
                # Common Reveal wrapper: {"Data": [...], "TotalCount": N}
                records = data.get("Data", data.get("data", []))
            else:
                records = []

            all_records.extend(records)

            # Stop if this is the last page
            if len(records) < PAGE_SIZE:
                break

            offset += PAGE_SIZE

            # Safety ceiling — prevent runaway loops on malformed responses
            if offset > 10_000:
                logger.warning(
                    "reveal_pagination_ceiling_hit",
                    extra={"org_id": self._creds.org_id, "endpoint": endpoint},
                )
                break

        return all_records

    async def _get(self, endpoint: str, params: Optional[dict] = None) -> dict | list:
        """
        Single authenticated GET request to Reveal API.
        Handles 429 rate limit with one retry after 60s.
        Raises on all other non-200 responses.
        """
        url = f"{REVEAL_API_BASE}{endpoint}"
        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            try:
                response = await client.get(
                    url,
                    auth=self._auth,
                    params=params,
                    headers={"Accept": "application/json"},
                )
            except httpx.TimeoutException:
                logger.error(
                    "reveal_request_timeout",
                    extra={"org_id": self._creds.org_id, "endpoint": endpoint},
                )
                raise

        if response.status_code == 200:
            return response.json()

        if response.status_code == 429:
            logger.warning(
                "reveal_rate_limited",
                extra={"org_id": self._creds.org_id, "endpoint": endpoint},
            )
            import asyncio
            await asyncio.sleep(60)
            # One retry
            async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
                response = await client.get(
                    url,
                    auth=self._auth,
                    params=params,
                    headers={"Accept": "application/json"},
                )
            if response.status_code == 200:
                return response.json()

        logger.error(
            "reveal_request_failed",
            extra={
                "org_id": self._creds.org_id,
                "endpoint": endpoint,
                "status": response.status_code,
                # Do NOT log response body — may contain PII
            },
        )
        response.raise_for_status()
