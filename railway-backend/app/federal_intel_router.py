"""
app/federal_intel_router.py
FastAPI router for Federal Intelligence endpoints.

Exposes SAM.gov, USAspending, Grants.gov, SBIR, subaward,
PSC, regulations, and labor rate search endpoints.
"""

import os
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from integrations.federal_intel.sam import SAMClient
from integrations.federal_intel.usaspending import USAspendingClient
from integrations.federal_intel.grants import GrantsGovClient
from integrations.federal_intel.sbir import SBIRClient
from integrations.federal_intel.subawards import SubawardsClient
from integrations.federal_intel.psc import PSCClient
from integrations.federal_intel.regulations import RegulationsClient
from integrations.federal_intel.labor_rates import LaborRatesClient
from integrations.federal_intel.orchestrator import FederalIntelOrchestrator

router = APIRouter(prefix="/api/federal-intel", tags=["federal-intel"])


def _sam_key() -> str:
    return os.environ.get("SAM_API_KEY", "DEMO_KEY")


def _regulations_key() -> str:
    key = os.environ.get("REGULATIONS_API_KEY", "")
    if not key:
        raise HTTPException(status_code=500, detail="REGULATIONS_API_KEY not configured")
    return key


# ---------------------------------------------------------------------------
# SAM.gov
# ---------------------------------------------------------------------------

class SAMSearchRequest(BaseModel):
    naics_codes: list[str] = ["541512", "541519", "541511", "518210", "541611"]
    set_aside: str = "SDVOSBC"
    title: str = ""
    status: str = "active"
    months_back: int = 3


@router.post("/sam/search")
async def search_sam(req: SAMSearchRequest):
    client = SAMClient(_sam_key())
    results = await client.search_opportunities(
        naics_codes=req.naics_codes,
        set_aside=req.set_aside,
        title=req.title,
        status=req.status,
        months_back=req.months_back,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# USAspending
# ---------------------------------------------------------------------------

class USAspendingSearchRequest(BaseModel):
    start_date: str
    end_date: str
    naics_codes: Optional[list[str]] = None
    keyword: Optional[str] = None
    agency: Optional[str] = None
    award_type: str = "contracts"


@router.post("/usaspending/search")
async def search_usaspending(req: USAspendingSearchRequest):
    client = USAspendingClient()
    results = await client.search_awards(
        start_date=req.start_date,
        end_date=req.end_date,
        naics_codes=req.naics_codes,
        keyword=req.keyword,
        agency=req.agency,
        award_type=req.award_type,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Grants.gov
# ---------------------------------------------------------------------------

class GrantsSearchRequest(BaseModel):
    keyword: str = ""
    category: str = ""
    agency: str = ""
    statuses: Optional[list[str]] = None


@router.post("/grants/search")
async def search_grants(req: GrantsSearchRequest):
    client = GrantsGovClient()
    results = await client.search_grants(
        keyword=req.keyword,
        category=req.category,
        agency=req.agency,
        statuses=req.statuses,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# SBIR
# ---------------------------------------------------------------------------

class SBIRSearchRequest(BaseModel):
    agency: str = ""
    year: str = ""
    company: str = ""
    keyword: str = ""


@router.post("/sbir/search")
async def search_sbir(req: SBIRSearchRequest):
    client = SBIRClient()
    results = await client.search_awards(
        agency=req.agency,
        year=req.year,
        company=req.company,
        keyword=req.keyword,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Labor Rates
# ---------------------------------------------------------------------------

class LaborRatesSearchRequest(BaseModel):
    keyword: str
    education: str = ""
    business_size: str = ""
    clearance: str = ""


@router.post("/labor-rates/search")
async def search_labor_rates(req: LaborRatesSearchRequest):
    client = LaborRatesClient()
    results, stats = await client.search_rates(
        keyword=req.keyword,
        education=req.education,
        business_size=req.business_size,
        clearance=req.clearance,
    )
    return {"count": len(results), "stats": stats, "results": results}


# ---------------------------------------------------------------------------
# PSC Codes
# ---------------------------------------------------------------------------

class PSCSearchRequest(BaseModel):
    query: str = ""
    search_by: str = "psc"
    active: str = "Y"


@router.post("/psc/search")
async def search_psc(req: PSCSearchRequest):
    client = PSCClient(_sam_key())
    results = await client.search_psc_codes(
        query=req.query,
        search_by=req.search_by,
        active=req.active,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Regulations.gov
# ---------------------------------------------------------------------------

class RegulationsSearchRequest(BaseModel):
    search_term: str = ""
    agency_id: str = ""
    document_type: str = ""


@router.post("/regulations/search")
async def search_regulations(req: RegulationsSearchRequest):
    client = RegulationsClient(_regulations_key())
    results = await client.search_documents(
        search_term=req.search_term,
        agency_id=req.agency_id,
        document_type=req.document_type,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Subawards
# ---------------------------------------------------------------------------

class SubawardSearchRequest(BaseModel):
    agency_id: str = ""
    from_date: str = ""
    to_date: str = ""
    naics_filter: str = ""


@router.post("/subawards/contract/search")
async def search_contract_subawards(req: SubawardSearchRequest):
    client = SubawardsClient(_sam_key())
    results = await client.search_contract_subawards(
        agency_id=req.agency_id,
        from_date=req.from_date,
        to_date=req.to_date,
        naics_filter=req.naics_filter,
    )
    return {"count": len(results), "results": results}


@router.post("/subawards/assistance/search")
async def search_assistance_subawards(req: SubawardSearchRequest):
    client = SubawardsClient(_sam_key())
    results = await client.search_assistance_subawards(
        agency_code=req.agency_id,
        from_date=req.from_date,
        to_date=req.to_date,
    )
    return {"count": len(results), "results": results}


# ---------------------------------------------------------------------------
# Orchestrator — Run All
# ---------------------------------------------------------------------------

class RunAllRequest(BaseModel):
    naics_codes: Optional[list[str]] = None
    months_back: int = 3


@router.post("/run-all")
async def run_all_searches(req: RunAllRequest):
    orchestrator = FederalIntelOrchestrator(_sam_key())
    results = await orchestrator.run_all(
        naics_codes=req.naics_codes,
        months_back=req.months_back,
    )
    return {
        "summary": results.summary,
        "sam": results.sam_opportunities,
        "usaspending": results.contract_awards,
        "grants": results.grants,
        "sbir": results.sbir_awards,
        "subawards": results.subawards,
    }
