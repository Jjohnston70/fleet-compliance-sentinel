"""
integrations/federal_intel/psc.py
SAM.gov PSC (Product/Service Code) API Client

Ported from executePSCSearch (APPSCRIPT GOV.txt:4948).
API: https://api.sam.gov/prod/locationservices/v1/api/publicpscdetails
Auth: SAM.gov API key

Note: The original Apps Script uses getSAMApiKey() which is undefined.
This client correctly accepts the key in the constructor.
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import PSCCode

logger = logging.getLogger(__name__)

PSC_API = "https://api.sam.gov/prod/locationservices/v1/api/publicpscdetails"
REQUEST_TIMEOUT = 30.0


class PSCClient:
    def __init__(self, api_key: str):
        self._api_key = api_key

    async def search_psc_codes(
        self,
        query: str = "",
        search_by: str = "psc",
        active: str = "Y",
        level1_category: str = "",
        level2_category: str = "",
        limit: int = 100,
    ) -> list[PSCCode]:
        """Search PSC codes from SAM.gov."""
        params: dict = {"api_key": self._api_key}
        if query:
            params["searchBy"] = search_by
            params["q"] = query
        if active:
            params["active"] = active
        if level1_category:
            params["level1Category"] = level1_category
        if level2_category:
            params["level2Category"] = level2_category
        params["limit"] = str(limit)

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                PSC_API, params=params,
                headers={"Accept": "application/json"},
            )
            if response.status_code != 200:
                logger.error("psc_error", extra={"status": response.status_code})
                return []

            data = response.json()
            records = data.get("publicPscDetails") or data.get("pscDetails") or []

            results = []
            for r in records:
                results.append(PSCCode(
                    psc_code=r.get("pscCode", ""),
                    psc_name=r.get("pscName", ""),
                    full_name=r.get("pscFullName", ""),
                    active=r.get("activeInd") == "Y",
                    parent_psc=r.get("parentPsccode", ""),
                    level1_category=r.get("level1Category", ""),
                    level1_name=r.get("level1CategoryName", ""),
                    level2_category=r.get("level2Category", ""),
                    level2_name=r.get("level2CategoryName", ""),
                ))

            logger.info("psc_search_complete", extra={"total": len(results)})
            return results
