"""
integrations/federal_intel/sbir.py
SBIR.gov API Client

Ported from executeSBIRSearch (APPSCRIPT GOV.txt:3940).
API: https://api.www.sbir.gov/public/api/awards
Auth: None (public API, no key required)

Key behavior preserved:
  - Progressive backoff on 429 (2s, 4s, 6s)
  - Smaller batch size (50) to avoid rate limits
"""

import asyncio
import logging
from typing import Optional

import httpx

from models.federal_intel import SBIRAward

logger = logging.getLogger(__name__)

SBIR_API = "https://api.www.sbir.gov/public/api/awards"
REQUEST_TIMEOUT = 30.0
MAX_RETRIES = 3


class SBIRClient:
    async def search_awards(
        self,
        agency: str = "",
        year: str = "",
        company: str = "",
        keyword: str = "",
        rows: int = 50,
    ) -> list[SBIRAward]:
        """Search SBIR/STTR awards with rate-limit retry."""
        params: dict = {"rows": str(rows)}
        if agency:
            params["agency"] = agency
        if year:
            params["year"] = year
        if company:
            params["firm"] = company
        if keyword:
            params["keyword"] = keyword

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            for attempt in range(MAX_RETRIES):
                response = await client.get(
                    SBIR_API, params=params,
                    headers={"Accept": "application/json"},
                )
                if response.status_code == 200:
                    break
                if response.status_code == 429:
                    wait = 2 * (attempt + 1)
                    logger.warning("sbir_rate_limited", extra={"attempt": attempt + 1, "wait": wait})
                    await asyncio.sleep(wait)
                else:
                    logger.error("sbir_error", extra={"status": response.status_code})
                    return []
            else:
                logger.error("sbir_max_retries")
                return []

            raw_results = response.json()
            if not isinstance(raw_results, list):
                raw_results = []

            results = []
            for r in raw_results[:100]:
                results.append(SBIRAward(
                    firm=r.get("firm", ""),
                    award_title=r.get("award_title", ""),
                    agency=r.get("agency", ""),
                    phase=r.get("phase", ""),
                    program=r.get("program", ""),
                    award_amount=float(r["award_amount"]) if r.get("award_amount") else None,
                    award_year=str(r.get("award_year", "")),
                    state=r.get("firm_state", ""),
                    abstract=(r.get("abstract") or "")[:300],
                ))

            logger.info("sbir_search_complete", extra={"total": len(results)})
            return results
