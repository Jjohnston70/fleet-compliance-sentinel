"""
integrations/federal_intel/usaspending.py
USAspending.gov API Client

Ported from executeUSAspendingSearch (APPSCRIPT GOV.txt:3271).
API: https://api.usaspending.gov/api/v2/search/spending_by_award/
Auth: None (public API, no key required)
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import ContractAward

logger = logging.getLogger(__name__)

USASPENDING_API = "https://api.usaspending.gov/api/v2/search/spending_by_award/"
REQUEST_TIMEOUT = 30.0

# Award type code mappings
AWARD_TYPE_CODES = {
    "contracts": ["A", "B", "C", "D"],
    "idvs": ["IDV_A", "IDV_B", "IDV_B_A", "IDV_B_B", "IDV_B_C", "IDV_C", "IDV_D", "IDV_E"],
    "grants": ["02", "03", "04", "05"],
}


class USAspendingClient:
    async def search_awards(
        self,
        start_date: str,
        end_date: str,
        naics_codes: Optional[list[str]] = None,
        keyword: Optional[str] = None,
        agency: Optional[str] = None,
        award_type: str = "contracts",
        limit: int = 100,
    ) -> list[ContractAward]:
        """Search USAspending contract/grant awards."""
        filters: dict = {
            "time_period": [{"start_date": start_date, "end_date": end_date}],
        }
        if award_type in AWARD_TYPE_CODES:
            filters["award_type_codes"] = AWARD_TYPE_CODES[award_type]
        if naics_codes:
            filters["naics_codes"] = naics_codes
        if keyword:
            filters["keyword"] = keyword
        if agency:
            filters["agencies"] = [{"type": "awarding", "tier": "toptier", "name": agency}]

        body = {
            "filters": filters,
            "fields": [
                "Award ID", "Recipient Name", "Award Amount", "Description",
                "Start Date", "End Date", "Awarding Agency", "Awarding Sub Agency",
                "NAICS Code", "generated_internal_id",
            ],
            "limit": limit,
            "page": 1,
            "sort": "Award Amount",
            "order": "desc",
        }

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(USASPENDING_API, json=body)
            if response.status_code != 200:
                logger.error("usaspending_error", extra={"status": response.status_code})
                return []

            data = response.json()
            results = []
            for r in data.get("results", []):
                internal_id = r.get("generated_internal_id", "")
                results.append(ContractAward(
                    award_id=r.get("Award ID", ""),
                    recipient_name=r.get("Recipient Name", ""),
                    award_amount=r.get("Award Amount") or 0,
                    agency=r.get("Awarding Agency", ""),
                    sub_agency=r.get("Awarding Sub Agency", ""),
                    naics_code=r.get("NAICS Code", ""),
                    description=r.get("Description", ""),
                    start_date=r.get("Start Date", ""),
                    end_date=r.get("End Date", ""),
                    link=f"https://www.usaspending.gov/award/{internal_id}" if internal_id else "",
                ))

            logger.info("usaspending_search_complete", extra={"total": len(results)})
            return results
