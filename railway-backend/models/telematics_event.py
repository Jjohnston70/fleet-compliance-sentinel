"""
models/telematics_event.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Normalized Telematics Schema

This is the internal canonical schema. ALL telematics adapters
(Verizon Reveal, Geotab, Samsara, etc.) normalize their raw vendor
payloads into these models before returning data.

The risk score engine, Penny briefing system, and compliance logic
only ever read from these models. Vendor schemas never leak upward.

Pydantic v2 models — compatible with your existing Next.js/FastAPI stack.
"""

from datetime import datetime
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Enums
# ---------------------------------------------------------------------------

class HOSStatus(str, Enum):
    OFF_DUTY = "off_duty"
    SLEEPER_BERTH = "sleeper_berth"
    DRIVING = "driving"
    ON_DUTY_NOT_DRIVING = "on_duty_not_driving"
    PERSONAL_CONVEYANCE = "personal_conveyance"
    YARD_MOVES = "yard_moves"
    UNKNOWN = "unknown"


class AlertSeverity(str, Enum):
    LOW = "low"        # Informational — idle time, minor speeding
    MEDIUM = "medium"  # Action recommended — geofence breach, harsh braking
    HIGH = "high"      # Compliance risk — HOS violation, unresolved DVIR defect
    CRITICAL = "critical"  # Immediate action — ELD malfunction, DOT-reportable


class DVIROutcome(str, Enum):
    NO_DEFECTS = "no_defects"
    DEFECTS_CORRECTED = "defects_corrected"
    DEFECTS_NEED_CORRECTION = "defects_need_correction"  # Vehicle should be OOS
    UNKNOWN = "unknown"


class TelematicsProvider(str, Enum):
    VERIZON_REVEAL = "verizon_reveal"
    GEOTAB = "geotab"
    SAMSARA = "samsara"
    MOTIVE = "motive"
    MANUAL = "manual"  # For orgs without telematics — manual data entry


# ---------------------------------------------------------------------------
# Normalized Models
# ---------------------------------------------------------------------------

class NormalizedVehicle(BaseModel):
    """Canonical vehicle record — maps from any provider's asset/unit object."""

    # Identifiers
    provider: TelematicsProvider
    org_id: str                          # Fleet-Compliance Sentinel tenant
    provider_vehicle_id: str             # Vendor's internal ID (never exposed to client)
    vehicle_number: str                  # Client-facing vehicle number / unit number

    # Asset details
    vin: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    license_plate: Optional[str] = None
    license_state: Optional[str] = None

    # Operational state
    odometer_miles: Optional[float] = None
    engine_hours: Optional[float] = None
    last_gps_lat: Optional[float] = None
    last_gps_lon: Optional[float] = None
    last_seen_at: Optional[datetime] = None
    is_active: bool = True

    # Metadata
    raw_provider_data: Optional[dict] = None  # Stored for debugging, not exposed to UI
    synced_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizedDriver(BaseModel):
    """Canonical driver record."""

    provider: TelematicsProvider
    org_id: str
    provider_driver_id: str
    driver_name: str
    driver_license_number: Optional[str] = None
    driver_license_state: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None

    # HOS state snapshot (latest known)
    current_hos_status: Optional[HOSStatus] = None
    hours_driven_today: Optional[float] = None
    hours_driven_this_week: Optional[float] = None  # 60/70-hour rule tracking
    hours_available_today: Optional[float] = None   # 11-hour driving limit

    is_active: bool = True
    raw_provider_data: Optional[dict] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizedHOSLog(BaseModel):
    """
    Single HOS duty status record.
    FMCSA requires 8 days of records on the vehicle at all times.
    Each status change = one record.
    """

    provider: TelematicsProvider
    org_id: str
    provider_log_id: str
    provider_driver_id: str
    provider_vehicle_id: Optional[str] = None

    status: HOSStatus
    started_at: datetime
    ended_at: Optional[datetime] = None          # None = still in this status
    duration_minutes: Optional[float] = None

    location_description: Optional[str] = None  # City/state at status change
    odometer_at_change: Optional[float] = None

    # Violation flags — set during normalization if detectable
    is_violation: bool = False
    violation_description: Optional[str] = None

    raw_provider_data: Optional[dict] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizedAlert(BaseModel):
    """
    Exception/alert event from the telematics platform.
    Feeds the driver behavior component of the risk score engine.
    """

    provider: TelematicsProvider
    org_id: str
    provider_alert_id: str
    provider_vehicle_id: Optional[str] = None
    provider_driver_id: Optional[str] = None

    alert_type: str                  # Raw type string from provider (preserved)
    alert_category: str              # Normalized category: "speeding", "hos", "geofence", etc.
    severity: AlertSeverity
    description: str

    occurred_at: datetime
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    location_description: Optional[str] = None

    # Risk scoring weight — set by normalizer based on alert type
    # Scale 1-10. Speeding 5mph over = 2. HOS violation = 9. ELD malfunction = 10.
    risk_weight: float = Field(default=1.0, ge=1.0, le=10.0)

    raw_provider_data: Optional[dict] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizedDVIR(BaseModel):
    """
    Driver Vehicle Inspection Report.
    Unresolved defects are a direct DOT compliance risk.
    """

    provider: TelematicsProvider
    org_id: str
    provider_dvir_id: str
    provider_vehicle_id: str
    provider_driver_id: Optional[str] = None

    inspection_type: str             # "pre_trip" | "post_trip" | "unknown"
    inspected_at: datetime
    outcome: DVIROutcome

    defects: list[str] = Field(default_factory=list)  # List of defect descriptions
    defects_corrected_by: Optional[str] = None
    defects_corrected_at: Optional[datetime] = None
    mechanic_notes: Optional[str] = None

    # Compliance flag — True if defects exist and are NOT corrected
    requires_action: bool = False

    raw_provider_data: Optional[dict] = None
    synced_at: datetime = Field(default_factory=datetime.utcnow)


class NormalizedGPSEvent(BaseModel):
    """
    Real-time GPS push event from the provider's webhook/push service.
    These stream in continuously and are used for live risk score updates.
    Stored in a time-series partition of the telematics_events table.
    """

    provider: TelematicsProvider
    org_id: str
    provider_vehicle_id: str
    provider_driver_id: Optional[str] = None

    occurred_at: datetime
    lat: float
    lon: float
    speed_mph: Optional[float] = None
    heading_degrees: Optional[float] = None
    odometer_miles: Optional[float] = None
    engine_on: Optional[bool] = None
    ignition_on: Optional[bool] = None

    # Derived fields — set by normalizer
    is_speeding: bool = False
    posted_speed_limit_mph: Optional[float] = None

    raw_provider_data: Optional[dict] = None
    received_at: datetime = Field(default_factory=datetime.utcnow)
