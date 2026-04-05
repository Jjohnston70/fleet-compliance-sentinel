"""
models/federal_intel.py
True North Data Strategies LLC — Fleet-Compliance Sentinel
Normalized Federal Intelligence Models

All federal data adapters (SAM, USAspending, Grants.gov, SBIR, etc.)
normalize their API responses into these models.

The GovCon pipeline, Penny briefing, and compliance tools only read
from these models. Raw API payloads never leak upward.
"""

from datetime import date, datetime, timezone
from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class IntelSource(str, Enum):
    SAM_GOV = "sam_gov"
    USASPENDING = "usaspending"
    GRANTS_GOV = "grants_gov"
    SBIR_GOV = "sbir_gov"
    GSA_CALC = "gsa_calc"
    SAM_PSC = "sam_psc"
    REGULATIONS_GOV = "regulations_gov"
    SAM_SUBAWARDS = "sam_subawards"
    SAM_ASSISTANCE_SUBAWARDS = "sam_assistance_subawards"


class SetAsideType(str, Enum):
    SDVOSB = "SDVOSB"
    VOSB = "VOSB"
    EIGHT_A = "8a"
    HUBZONE = "HUBZone"
    WOSB = "WOSB"
    SMALL_BUSINESS = "small_business"
    FULL_OPEN = "full_open"
    SOLE_SOURCE = "sole_source"


# ---------------------------------------------------------------------------
# SAM.gov Opportunities
# ---------------------------------------------------------------------------

class SAMOpportunity(BaseModel):
    notice_id: str
    title: str
    agency: str
    type: str = ""
    set_aside: str = "Full & Open"
    posted_date: str = ""
    due_date: str = ""
    naics: str = ""
    state: str = ""
    link: str = ""
    source: IntelSource = IntelSource.SAM_GOV
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# USAspending Contract Awards
# ---------------------------------------------------------------------------

class ContractAward(BaseModel):
    award_id: str
    recipient_name: str = ""
    award_amount: float = 0
    agency: str = ""
    sub_agency: str = ""
    naics_code: str = ""
    description: str = ""
    start_date: str = ""
    end_date: str = ""
    link: str = ""
    source: IntelSource = IntelSource.USASPENDING
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Grants.gov Opportunities
# ---------------------------------------------------------------------------

class GrantOpportunity(BaseModel):
    opp_number: str
    title: str = ""
    agency: str = ""
    status: str = ""
    posted_date: str = ""
    close_date: str = ""
    award_ceiling: Optional[float] = None
    award_floor: Optional[float] = None
    category: str = ""
    link: str = ""
    source: IntelSource = IntelSource.GRANTS_GOV
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# SBIR/STTR Awards
# ---------------------------------------------------------------------------

class SBIRAward(BaseModel):
    firm: str = ""
    award_title: str = ""
    agency: str = ""
    phase: str = ""
    program: str = ""
    award_amount: Optional[float] = None
    award_year: str = ""
    state: str = ""
    abstract: str = ""
    source: IntelSource = IntelSource.SBIR_GOV
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# GSA Labor Rates (CALC+)
# ---------------------------------------------------------------------------

class LaborRate(BaseModel):
    labor_category: str = ""
    vendor_name: str = ""
    hourly_rate: Optional[float] = None
    education_level: str = ""
    min_years_experience: Optional[int] = None
    business_size: str = ""
    security_clearance: str = ""
    schedule: str = ""
    contract_number: str = ""
    source: IntelSource = IntelSource.GSA_CALC
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# PSC Codes
# ---------------------------------------------------------------------------

class PSCCode(BaseModel):
    psc_code: str
    psc_name: str = ""
    full_name: str = ""
    active: bool = True
    parent_psc: str = ""
    level1_category: str = ""
    level1_name: str = ""
    level2_category: str = ""
    level2_name: str = ""
    source: IntelSource = IntelSource.SAM_PSC
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Regulations.gov Documents
# ---------------------------------------------------------------------------

class RegulatoryDocument(BaseModel):
    document_id: str
    title: str = ""
    document_type: str = ""
    agency: str = ""
    docket_id: str = ""
    posted_date: str = ""
    comment_end_date: str = ""
    withdrawn: bool = False
    link: str = ""
    source: IntelSource = IntelSource.REGULATIONS_GOV
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Subawards (Contract + Assistance)
# ---------------------------------------------------------------------------

class Subaward(BaseModel):
    prime_entity_name: str = ""
    prime_uei: str = ""
    sub_entity_name: str = ""
    sub_uei: str = ""
    subaward_amount: Optional[float] = None
    subaward_date: str = ""
    naics: str = ""
    agency: str = ""
    description: str = ""
    contract_piid: str = ""
    source: IntelSource = IntelSource.SAM_SUBAWARDS
    fetched_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


# ---------------------------------------------------------------------------
# Unified search parameters
# ---------------------------------------------------------------------------

class FederalSearchParams(BaseModel):
    naics_codes: list[str] = Field(default_factory=lambda: ["541512", "541519", "541511", "518210", "541611"])
    keywords: str = ""
    set_aside: str = ""
    agency: str = ""
    months_back: int = 3
