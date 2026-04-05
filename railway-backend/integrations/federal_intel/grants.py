"""
integrations/federal_intel/grants.py
Grants.gov API Client

Ported from executeGrantsGovSearch (APPSCRIPT GOV.txt:3569).
API: https://api.grants.gov/v1/api/search2
Auth: None (public API, no key required)
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import GrantOpportunity

logger = logging.getLogger(__name__)

GRANTS_GOV_API = "https://api.grants.gov/v1/api/search2"
REQUEST_TIMEOUT = 30.0


class GrantsGovClient:
    async def search_grants(
        self,
        keyword: str = "",
        category: str = "",
        agency: str = "",
        statuses: Optional[list[str]] = None,
        rows: int = 100,
    ) -> list[GrantOpportunity]:
        """Search Grants.gov opportunities."""
        body: dict = {"rows": rows}
        if keyword:
            body["keyword"] = keyword
        if category:
            body["fundingActivityCategories"] = category
        if agency:
            body["agency"] = agency
        if statuses:
            body["oppStatuses"] = ",".join(statuses)

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.post(GRANTS_GOV_API, json=body)
            if response.status_code != 200:
                logger.error("grants_gov_error", extra={"status": response.status_code})
                return []

            data = response.json()
            if data.get("errorMsgs"):
                logger.error("grants_gov_api_error", extra={"errors": data["errorMsgs"]})
                return []

            results = []
            for r in data.get("oppHits", []):
                opp_number = r.get("number") or r.get("id", "")
                results.append(GrantOpportunity(
                    opp_number=opp_number,
                    title=r.get("title", ""),
                    agency=r.get("agency") or r.get("agencyCode", ""),
                    status=r.get("oppStatus", ""),
                    posted_date=r.get("openDate") or r.get("postedDate", ""),
                    close_date=r.get("closeDate", ""),
                    award_ceiling=float(r["awardCeiling"]) if r.get("awardCeiling") else None,
                    award_floor=float(r["awardFloor"]) if r.get("awardFloor") else None,
                    category=r.get("cfdaList") or r.get("cfda", ""),
                    link=f"https://www.grants.gov/search-results-detail/{opp_number}" if opp_number else "",
                ))

            logger.info("grants_gov_search_complete", extra={"total": len(results), "hit_count": data.get("hitCount", 0)})
            return results
