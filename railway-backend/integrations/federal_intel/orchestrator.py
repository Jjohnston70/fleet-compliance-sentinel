"""
integrations/federal_intel/orchestrator.py
Federal Intel Orchestrator — "Run All" ingestion

Ported from runAllFederalSearches (APPSCRIPT GOV.txt:7133).
Coordinates SAM, USAspending, Grants.gov, SBIR, and Subaward searches
with TNDS default NAICS codes and settings.
"""

import asyncio
import logging
from datetime import datetime, timedelta, timezone
from dataclasses import dataclass, field
from typing import Optional

from integrations.federal_intel.sam import SAMClient
from integrations.federal_intel.usaspending import USAspendingClient
from integrations.federal_intel.grants import GrantsGovClient
from integrations.federal_intel.sbir import SBIRClient
from integrations.federal_intel.subawards import SubawardsClient

from models.federal_intel import (
    SAMOpportunity,
    ContractAward,
    GrantOpportunity,
    SBIRAward,
    Subaward,
)

logger = logging.getLogger(__name__)

# TNDS default NAICS codes (from runAllFederalSearches)
DEFAULT_NAICS = ["541512", "541519", "541511", "518210", "541611"]


@dataclass
class IngestResults:
    sam_opportunities: list[SAMOpportunity] = field(default_factory=list)
    contract_awards: list[ContractAward] = field(default_factory=list)
    grants: list[GrantOpportunity] = field(default_factory=list)
    sbir_awards: list[SBIRAward] = field(default_factory=list)
    subawards: list[Subaward] = field(default_factory=list)
    started_at: datetime = field(default_factory=lambda: datetime.now(timezone.utc))
    completed_at: Optional[datetime] = None
    errors: list[str] = field(default_factory=list)

    @property
    def summary(self) -> dict:
        return {
            "sam": len(self.sam_opportunities),
            "usaspending": len(self.contract_awards),
            "grants": len(self.grants),
            "sbir": len(self.sbir_awards),
            "subawards": len(self.subawards),
            "total": (
                len(self.sam_opportunities)
                + len(self.contract_awards)
                + len(self.grants)
                + len(self.sbir_awards)
                + len(self.subawards)
            ),
            "errors": self.errors,
            "duration_seconds": (
                (self.completed_at - self.started_at).total_seconds()
                if self.completed_at
                else None
            ),
        }


class FederalIntelOrchestrator:
    """
    Coordinates all federal data source searches.
    Mirrors runAllFederalSearches / runFederalSearchesWithSettings.
    """

    def __init__(self, sam_api_key: str = "DEMO_KEY"):
        self._sam_key = sam_api_key

    async def run_all(
        self,
        naics_codes: Optional[list[str]] = None,
        months_back: int = 3,
    ) -> IngestResults:
        """
        Run all federal searches with TNDS defaults.
        Executes SAM, USAspending, Grants.gov, SBIR, and Subawards
        with 1-second pauses between sources (matching Apps Script).
        """
        naics = naics_codes or DEFAULT_NAICS
        results = IngestResults()

        now = datetime.now(timezone.utc)
        start_date = (now - timedelta(days=months_back * 30)).strftime("%Y-%m-%d")
        end_date = now.strftime("%Y-%m-%d")

        # 1. SAM.gov SDVOSB opportunities
        try:
            sam = SAMClient(self._sam_key)
            results.sam_opportunities = await sam.search_opportunities(
                naics_codes=naics,
                set_aside="SDVOSBC",
                ptypes=["o", "k", "p"],
                status="active",
                months_back=months_back,
            )
        except Exception as e:
            results.errors.append(f"SAM: {e}")
            logger.error("orchestrator_sam_error", extra={"error": str(e)})

        await asyncio.sleep(1)

        # 2. USAspending contract awards
        try:
            usa = USAspendingClient()
            results.contract_awards = await usa.search_awards(
                start_date=start_date,
                end_date=end_date,
                naics_codes=naics,
                award_type="contracts",
            )
        except Exception as e:
            results.errors.append(f"USAspending: {e}")
            logger.error("orchestrator_usaspending_error", extra={"error": str(e)})

        await asyncio.sleep(1)

        # 3. Grants.gov
        try:
            grants = GrantsGovClient()
            results.grants = await grants.search_grants(
                keyword="technology, innovation, small business",
                statuses=["posted"],
            )
        except Exception as e:
            results.errors.append(f"Grants.gov: {e}")
            logger.error("orchestrator_grants_error", extra={"error": str(e)})

        await asyncio.sleep(1)

        # 4. SBIR/STTR
        try:
            sbir = SBIRClient()
            results.sbir_awards = await sbir.search_awards(
                year=str(now.year),
            )
        except Exception as e:
            results.errors.append(f"SBIR: {e}")
            logger.error("orchestrator_sbir_error", extra={"error": str(e)})

        await asyncio.sleep(1)

        # 5. Contract subawards
        try:
            sub = SubawardsClient(self._sam_key)
            from_date = (now - timedelta(days=90)).strftime("%yyyy-%MM-%dd")
            # Use ISO format dates
            from_date = (now - timedelta(days=90)).strftime("%Y-%m-%d")
            to_date = now.strftime("%Y-%m-%d")
            results.subawards = await sub.search_contract_subawards(
                from_date=from_date,
                to_date=to_date,
            )
        except Exception as e:
            results.errors.append(f"Subawards: {e}")
            logger.error("orchestrator_subawards_error", extra={"error": str(e)})

        results.completed_at = datetime.now(timezone.utc)
        logger.info("orchestrator_complete", extra=results.summary)
        return results
