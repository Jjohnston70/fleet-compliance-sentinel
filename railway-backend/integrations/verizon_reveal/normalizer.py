"""
integrations/verizon_reveal/normalizer.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Verizon Connect Reveal — Data Normalizer

Maps raw Verizon Connect Reveal API payloads to the normalized
internal telematics schema defined in models/telematics_event.py.

This is where vendor schema ugliness lives and dies.
Nothing above this layer ever sees Reveal field names.

Key mapping decisions documented inline — some Reveal fields are
ambiguous or undocumented; notes explain what we know and what
we're inferring.

If Reveal changes their schema, only this file changes.
"""

import logging
from datetime import datetime
from typing import Optional

from models.telematics_event import (
    AlertSeverity,
    DVIROutcome,
    HOSStatus,
    NormalizedAlert,
    NormalizedDriver,
    NormalizedDVIR,
    NormalizedGPSEvent,
    NormalizedHOSLog,
    NormalizedVehicle,
    TelematicsProvider,
)

logger = logging.getLogger(__name__)

PROVIDER = TelematicsProvider.VERIZON_REVEAL


# ---------------------------------------------------------------------------
# Alert type → normalized category + risk weight mapping
# ---------------------------------------------------------------------------

# DOT compliance relevance drives risk weight (1-10 scale)
# Tuned for petroleum/fuel fleet operations (Example Fleet Co profile)
ALERT_TYPE_MAP: dict[str, tuple[str, AlertSeverity, float]] = {
    # (category, severity, risk_weight)
    "Speeding": ("speeding", AlertSeverity.MEDIUM, 5.0),
    "HardBraking": ("driver_behavior", AlertSeverity.MEDIUM, 4.0),
    "HardAcceleration": ("driver_behavior", AlertSeverity.LOW, 3.0),
    "Idling": ("fuel_efficiency", AlertSeverity.LOW, 1.0),
    "GeofenceExit": ("geofence", AlertSeverity.MEDIUM, 4.0),
    "GeofenceEntry": ("geofence", AlertSeverity.LOW, 2.0),
    "HOSViolation": ("hos", AlertSeverity.HIGH, 9.0),
    "HOSWarning": ("hos", AlertSeverity.MEDIUM, 6.0),
    "ELDMalfunction": ("eld", AlertSeverity.CRITICAL, 10.0),
    "ELDDiagnostic": ("eld", AlertSeverity.HIGH, 8.0),
    "EngineFault": ("maintenance", AlertSeverity.HIGH, 7.0),
    "CheckEngine": ("maintenance", AlertSeverity.MEDIUM, 5.0),
    "SeatBelt": ("safety", AlertSeverity.MEDIUM, 4.0),
    "PowerDisconnect": ("tampering", AlertSeverity.HIGH, 8.0),
    "AfterHours": ("geofence", AlertSeverity.MEDIUM, 3.0),
    "DVIRDefect": ("dvir", AlertSeverity.HIGH, 9.0),
}

# Default for unmapped alert types
DEFAULT_ALERT = ("unknown", AlertSeverity.LOW, 1.0)


# ---------------------------------------------------------------------------
# HOS duty status mapping — Reveal → internal HOSStatus enum
# ---------------------------------------------------------------------------

HOS_STATUS_MAP: dict[str, HOSStatus] = {
    "OffDuty": HOSStatus.OFF_DUTY,
    "Off Duty": HOSStatus.OFF_DUTY,
    "SleeperBerth": HOSStatus.SLEEPER_BERTH,
    "Sleeper Berth": HOSStatus.SLEEPER_BERTH,
    "Driving": HOSStatus.DRIVING,
    "OnDutyNotDriving": HOSStatus.ON_DUTY_NOT_DRIVING,
    "On Duty Not Driving": HOSStatus.ON_DUTY_NOT_DRIVING,
    "PersonalConveyance": HOSStatus.PERSONAL_CONVEYANCE,
    "YardMoves": HOSStatus.YARD_MOVES,
}


# ---------------------------------------------------------------------------
# Normalizer class
# ---------------------------------------------------------------------------

class RevealNormalizer:
    """
    Stateless normalizer for Verizon Connect Reveal payloads.
    org_id is set at construction — all normalized objects carry it.

    Methods accept the raw dict from the Reveal API response.
    Each method returns one normalized model instance.
    Raises ValueError on critically missing fields (caller should catch
    and log, not crash — see rest_client.py exception handling).
    """

    def __init__(self, org_id: str):
        self.org_id = org_id

    def vehicle(self, raw: dict) -> NormalizedVehicle:
        """
        Map Reveal vehicle/unit object to NormalizedVehicle.

        Reveal vehicle fields (known):
          Id, VehicleNumber, VIN, Make, Model, Year,
          LicensePlate, LicenseState, Odometer, EngineHours,
          LastLatitude, LastLongitude, LastContactTime, IsActive
        """
        return NormalizedVehicle(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_vehicle_id=str(raw["Id"]),
            vehicle_number=str(raw.get("VehicleNumber", raw.get("Id", ""))),
            vin=raw.get("VIN") or raw.get("Vin"),
            make=raw.get("Make"),
            model=raw.get("Model"),
            year=_safe_int(raw.get("Year")),
            license_plate=raw.get("LicensePlate"),
            license_state=raw.get("LicenseState"),
            odometer_miles=_safe_float(raw.get("Odometer")),
            engine_hours=_safe_float(raw.get("EngineHours")),
            last_gps_lat=_safe_float(raw.get("LastLatitude")),
            last_gps_lon=_safe_float(raw.get("LastLongitude")),
            last_seen_at=_parse_dt(raw.get("LastContactTime")),
            is_active=raw.get("IsActive", True),
            raw_provider_data=raw,
        )

    def driver(self, raw: dict) -> NormalizedDriver:
        """
        Map Reveal driver object to NormalizedDriver.

        Reveal driver fields (known):
          Id, FirstName, LastName, LicenseNumber, LicenseState,
          Email, Phone, CurrentHOSStatus, HoursDrivenToday,
          HoursDrivenThisWeek, IsActive
        """
        first = raw.get("FirstName", "")
        last = raw.get("LastName", "")
        full_name = f"{first} {last}".strip() or raw.get("Name", "Unknown Driver")

        return NormalizedDriver(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_driver_id=str(raw["Id"]),
            driver_name=full_name,
            driver_license_number=raw.get("LicenseNumber"),
            driver_license_state=raw.get("LicenseState"),
            email=raw.get("Email"),
            phone=raw.get("Phone"),
            current_hos_status=_map_hos_status(raw.get("CurrentHOSStatus")),
            hours_driven_today=_safe_float(raw.get("HoursDrivenToday")),
            hours_driven_this_week=_safe_float(raw.get("HoursDrivenThisWeek")),
            hours_available_today=_compute_hours_available(raw.get("HoursDrivenToday")),
            is_active=raw.get("IsActive", True),
            raw_provider_data=raw,
        )

    def hos_log(self, raw: dict) -> NormalizedHOSLog:
        """
        Map Reveal HOS log entry to NormalizedHOSLog.

        Reveal HOS fields (known):
          Id, DriverId, VehicleId, Status, StartDateTime,
          EndDateTime, Location, Odometer
        """
        status = _map_hos_status(raw.get("Status", ""))
        started_at = _parse_dt(raw.get("StartDateTime"))
        ended_at = _parse_dt(raw.get("EndDateTime"))

        duration_minutes = None
        if started_at and ended_at:
            duration_minutes = (ended_at - started_at).total_seconds() / 60

        # Flag violation: driving > 11 hours or on-duty > 14 hours
        is_violation, violation_desc = _check_hos_violation(
            status, duration_minutes
        )

        return NormalizedHOSLog(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_log_id=str(raw.get("Id", "")),
            provider_driver_id=str(raw.get("DriverId", "")),
            provider_vehicle_id=str(raw.get("VehicleId", "")) or None,
            status=status,
            started_at=started_at or datetime.utcnow(),
            ended_at=ended_at,
            duration_minutes=duration_minutes,
            location_description=raw.get("Location"),
            odometer_at_change=_safe_float(raw.get("Odometer")),
            is_violation=is_violation,
            violation_description=violation_desc,
            raw_provider_data=raw,
        )

    def alert(self, raw: dict) -> NormalizedAlert:
        """
        Map Reveal alert/exception to NormalizedAlert.
        Works for both REST polling response and webhook payload.
        """
        alert_type = raw.get("AlertType", raw.get("Type", "Unknown"))
        category, severity, risk_weight = ALERT_TYPE_MAP.get(
            alert_type, DEFAULT_ALERT
        )

        return NormalizedAlert(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_alert_id=str(raw.get("Id", raw.get("AlertId", ""))),
            provider_vehicle_id=str(raw.get("VehicleId", "")) or None,
            provider_driver_id=str(raw.get("DriverId", "")) or None,
            alert_type=alert_type,
            alert_category=category,
            severity=severity,
            description=raw.get("AlertDescription", raw.get("Description", alert_type)),
            occurred_at=_parse_dt(raw.get("EventDateTime", raw.get("AlertDateTime")))
                or datetime.utcnow(),
            location_lat=_safe_float(raw.get("Latitude")),
            location_lon=_safe_float(raw.get("Longitude")),
            location_description=raw.get("Address"),
            risk_weight=risk_weight,
            raw_provider_data=raw,
        )

    def dvir(self, raw: dict) -> NormalizedDVIR:
        """
        Map Reveal DVIR record to NormalizedDVIR.

        Reveal DVIR fields (known):
          Id, VehicleId, DriverId, InspectionType, InspectionDateTime,
          Defects (list), DefectsCorrected, DefectsCorrectedBy,
          DefectsCorrectedAt, MechanicNotes
        """
        defects = raw.get("Defects", [])
        if isinstance(defects, list):
            defect_list = [str(d) for d in defects]
        else:
            defect_list = [str(defects)] if defects else []

        defects_corrected = raw.get("DefectsCorrected", False)
        has_defects = len(defect_list) > 0

        if not has_defects:
            outcome = DVIROutcome.NO_DEFECTS
        elif has_defects and defects_corrected:
            outcome = DVIROutcome.DEFECTS_CORRECTED
        elif has_defects and not defects_corrected:
            outcome = DVIROutcome.DEFECTS_NEED_CORRECTION
        else:
            outcome = DVIROutcome.UNKNOWN

        return NormalizedDVIR(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_dvir_id=str(raw["Id"]),
            provider_vehicle_id=str(raw["VehicleId"]),
            provider_driver_id=str(raw.get("DriverId", "")) or None,
            inspection_type=raw.get("InspectionType", "unknown").lower().replace(" ", "_"),
            inspected_at=_parse_dt(raw.get("InspectionDateTime")) or datetime.utcnow(),
            outcome=outcome,
            defects=defect_list,
            defects_corrected_by=raw.get("DefectsCorrectedBy"),
            defects_corrected_at=_parse_dt(raw.get("DefectsCorrectedAt")),
            mechanic_notes=raw.get("MechanicNotes"),
            requires_action=(outcome == DVIROutcome.DEFECTS_NEED_CORRECTION),
            raw_provider_data=raw,
        )

    def gps_event(self, raw: dict) -> NormalizedGPSEvent:
        """
        Map Reveal GPS Push Service event to NormalizedGPSEvent.
        Raw dict has PascalCase keys (Reveal webhook format).
        """
        speed_mph = _safe_float(raw.get("Speed"))

        return NormalizedGPSEvent(
            provider=PROVIDER,
            org_id=self.org_id,
            provider_vehicle_id=str(raw["VehicleId"]),
            provider_driver_id=str(raw.get("DriverId", "")) or None,
            occurred_at=_parse_dt(raw.get("EventDateTime")) or datetime.utcnow(),
            lat=float(raw["Latitude"]),
            lon=float(raw["Longitude"]),
            speed_mph=speed_mph,
            heading_degrees=_safe_float(raw.get("Heading")),
            odometer_miles=_safe_float(raw.get("Odometer")),
            engine_on=_parse_ignition(raw.get("IgnitionStatus")),
            ignition_on=_parse_ignition(raw.get("IgnitionStatus")),
            # Speeding detection: flag if speed > 80mph (federal threshold)
            # Fine-grained posted limit check requires HERE/Google Maps API — Phase 2
            is_speeding=speed_mph is not None and speed_mph > 80,
            posted_speed_limit_mph=None,  # Populated in Phase 2 with map API
            raw_provider_data=raw,
        )


# ---------------------------------------------------------------------------
# Private helpers
# ---------------------------------------------------------------------------

def _safe_float(val) -> Optional[float]:
    try:
        return float(val) if val is not None else None
    except (TypeError, ValueError):
        return None


def _safe_int(val) -> Optional[int]:
    try:
        return int(val) if val is not None else None
    except (TypeError, ValueError):
        return None


def _parse_dt(val) -> Optional[datetime]:
    if not val:
        return None
    if isinstance(val, datetime):
        return val
    formats = [
        "%Y-%m-%dT%H:%M:%SZ",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%fZ",
        "%Y-%m-%d %H:%M:%S",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(str(val), fmt)
        except ValueError:
            continue
    logger.warning("reveal_datetime_parse_failed", extra={"value": val})
    return None


def _map_hos_status(raw_status: Optional[str]) -> HOSStatus:
    if not raw_status:
        return HOSStatus.UNKNOWN
    return HOS_STATUS_MAP.get(raw_status, HOSStatus.UNKNOWN)


def _compute_hours_available(hours_driven_today) -> Optional[float]:
    """11-hour driving rule: max 11 hours driving after 10 consecutive off-duty."""
    driven = _safe_float(hours_driven_today)
    if driven is None:
        return None
    return max(0.0, 11.0 - driven)


def _check_hos_violation(
    status: HOSStatus,
    duration_minutes: Optional[float],
) -> tuple[bool, Optional[str]]:
    """
    Simple violation detection on individual log records.
    Full 60/70-hour rule checking requires aggregate across records —
    done in the risk score engine, not here.
    """
    if duration_minutes is None:
        return False, None

    duration_hours = duration_minutes / 60

    if status == HOSStatus.DRIVING and duration_hours > 11:
        return True, f"Driving {duration_hours:.1f}h exceeds 11-hour limit (49 CFR 395.3)"

    if status == HOSStatus.ON_DUTY_NOT_DRIVING and duration_hours > 14:
        return True, f"On-duty {duration_hours:.1f}h exceeds 14-hour window (49 CFR 395.3)"

    return False, None


def _parse_ignition(val: Optional[str]) -> Optional[bool]:
    if val is None:
        return None
    return val.lower() in ("on", "true", "1", "yes")
