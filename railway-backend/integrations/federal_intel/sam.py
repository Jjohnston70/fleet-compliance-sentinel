"""
integrations/federal_intel/sam.py
SAM.gov Opportunities API Client

Ported from executeSAMSearch (APPSCRIPT GOV.txt:2879).
API: https://api.sam.gov/opportunities/v2/search
Auth: api_key query param (register at https://api.sam.gov)

Key behavior preserved from Apps Script:
  - Per-NAICS loop (API only accepts single ncode per request)
  - Dedupe by noticeId across NAICS iterations
  - DEMO_KEY fallback when no key configured
"""

import logging
from datetime import datetime, timedelta, timezone
from typing import Optional

import httpx

from models.federal_intel import SAMOpportunity

logger = logging.getLogger(__name__)

SAM_API_BASE = "https://api.sam.gov/opportunities/v2/search"
REQUEST_TIMEOUT = 30.0


class SAMClient:
    def __init__(self, api_key: str = "DEMO_KEY"):
        self._api_key = api_key

    async def search_opportunities(
        self,
        naics_codes: list[str],
        set_aside: str = "",
        title: str = "",
        ptypes: Optional[list[str]] = None,
        status: str = "active",
        months_back: int = 3,
    ) -> list[SAMOpportunity]:
        """
        Search SAM.gov opportunities. Loops per NAICS code and dedupes,
        matching the Apps Script behavior.
        """
        posted_from = (datetime.now(timezone.utc) - timedelta(days=months_back * 30)).strftime("%m/%d/%Y")
        posted_to = datetime.now(timezone.utc).strftime("%m/%d/%Y")

        params: dict = {
            "api_key": self._api_key,
            "limit": "1000",
            "postedFrom": posted_from,
            "postedTo": posted_to,
        }
        if title:
            params["title"] = title
        if set_aside:
            params["typeOfSetAside"] = set_aside
        if ptypes:
            params["ptype"] = ",".join(ptypes)
        if status:
            params["status"] = status

        seen_ids: set[str] = set()
        results: list[SAMOpportunity] = []

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            for naics in naics_codes:
                params["ncode"] = naics
                try:
                    response = await client.get(
                        SAM_API_BASE,
                        params=params,
                        headers={"Accept": "application/json"},
                    )
                    if response.status_code != 200:
                        logger.warning("sam_search_error", extra={"naics": naics, "status": response.status_code})
                        continue

                    data = response.json()
                    for opp in data.get("opportunitiesData", []):
                        notice_id = opp.get("noticeId", "")
                        if notice_id and notice_id not in seen_ids:
                            seen_ids.add(notice_id)
                            results.append(SAMOpportunity(
                                notice_id=notice_id,
                                title=opp.get("title", "Untitled"),
                                agency=opp.get("fullParentPathName") or opp.get("departmentName", "Unknown"),
                                type=opp.get("type", ""),
                                set_aside=opp.get("typeOfSetAsideDescription", "Full & Open"),
                                posted_date=opp.get("postedDate", ""),
                                due_date=opp.get("responseDeadLine", "See listing"),
                                naics=opp.get("naicsCode") or naics,
                                state=opp.get("placeOfPerformance", {}).get("state", {}).get("code", "") if isinstance(opp.get("placeOfPerformance"), dict) else "",
                                link=f"https://sam.gov/opp/{notice_id}/view",
                            ))
                except httpx.TimeoutException:
                    logger.error("sam_timeout", extra={"naics": naics})
                except Exception as e:
                    logger.error("sam_error", extra={"naics": naics, "error": str(e)})

        logger.info("sam_search_complete", extra={"total": len(results), "naics_count": len(naics_codes)})
        return results
