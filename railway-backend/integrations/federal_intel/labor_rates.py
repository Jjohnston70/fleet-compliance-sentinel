"""
integrations/federal_intel/labor_rates.py
GSA CALC+ Labor Rates API Client

Ported from executeLaborRatesSearch (APPSCRIPT GOV.txt:4383).
API: https://api.gsa.gov/acquisition/calc/v3/api/ceilingrates/
Auth: None (public API, no key required)
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import LaborRate

logger = logging.getLogger(__name__)

CALC_API = "https://api.gsa.gov/acquisition/calc/v3/api/ceilingrates/"
REQUEST_TIMEOUT = 30.0


class LaborRatesClient:
    async def search_rates(
        self,
        keyword: str,
        education: str = "",
        business_size: str = "",
        exp_min: Optional[int] = None,
        exp_max: Optional[int] = None,
        price_min: Optional[float] = None,
        price_max: Optional[float] = None,
        clearance: str = "",
        page_size: int = 200,
    ) -> tuple[list[LaborRate], dict]:
        """
        Search GSA CALC+ ceiling labor rates.
        Returns (results, wage_stats) where wage_stats has min/max/avg.
        """
        params: dict = {
            "page": "1",
            "page_size": str(page_size),
            "keyword": keyword,
            "ordering": "current_price",
            "sort": "asc",
        }

        filters = []
        if education:
            filters.append(f"education_level:{education}")
        if business_size:
            filters.append(f"business_size:{business_size}")
        if exp_min is not None and exp_max is not None:
            filters.append(f"experience_range:{exp_min},{exp_max}")
        if price_min is not None and price_max is not None:
            filters.append(f"price_range:{price_min},{price_max}")
        if clearance:
            filters.append(f"security_clearance:{clearance}")
        if filters:
            params["filter"] = "&filter=".join(filters)

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                CALC_API, params=params,
                headers={"Accept": "application/json"},
            )
            if response.status_code != 200:
                logger.error("calc_error", extra={"status": response.status_code})
                return [], {}

            data = response.json()
            hits = data.get("hits", {}).get("hits", [])
            stats = data.get("aggregations", {}).get("wage_stats", {})

            results = []
            for hit in hits:
                r = hit.get("_source", {})
                results.append(LaborRate(
                    labor_category=r.get("labor_category", ""),
                    vendor_name=r.get("vendor_name", ""),
                    hourly_rate=r.get("current_price"),
                    education_level=r.get("education_level", ""),
                    min_years_experience=r.get("min_years_experience"),
                    business_size="Small" if r.get("business_size") == "S" else "Other",
                    security_clearance=r.get("security_clearance", ""),
                    schedule=r.get("schedule", ""),
                    contract_number=r.get("idv_piid", ""),
                ))

            logger.info("calc_search_complete", extra={"total": len(results), "keyword": keyword})
            return results, stats
