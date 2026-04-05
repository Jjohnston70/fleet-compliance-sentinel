"""
integrations/federal_intel/subawards.py
SAM.gov Subaward API Clients (Contract + Assistance)

Ported from:
  - executeSubawardSearch (APPSCRIPT GOV.txt:6313)
  - executeAssistanceSubawardSearch (APPSCRIPT GOV.txt:5984)

Auth: SAM.gov API key (same key as opportunities)
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import Subaward, IntelSource

logger = logging.getLogger(__name__)

CONTRACT_SUBAWARD_API = "https://api.sam.gov/prod/contract/v1/subcontracts/search"
ASSISTANCE_SUBAWARD_API = "https://api.sam.gov/prod/assistance/v1/subawards/search"
REQUEST_TIMEOUT = 30.0


class SubawardsClient:
    def __init__(self, api_key: str):
        self._api_key = api_key

    async def search_contract_subawards(
        self,
        agency_id: str = "",
        from_date: str = "",
        to_date: str = "",
        piid: str = "",
        naics_filter: str = "",
        page_size: int = 500,
    ) -> list[Subaward]:
        """Search contract subawards from SAM.gov."""
        params: dict = {
            "api_key": self._api_key,
            "pageSize": str(page_size),
            "pageNumber": "0",
            "status": "Published",
        }
        if agency_id:
            params["agencyId"] = agency_id
        if from_date:
            params["fromDate"] = from_date
        if to_date:
            params["toDate"] = to_date
        if piid:
            params["PIID"] = piid

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                CONTRACT_SUBAWARD_API, params=params,
                headers={"Accept": "application/json"},
            )
            if response.status_code != 200:
                logger.error("subaward_contract_error", extra={"status": response.status_code})
                return []

            data = response.json()
            records = data.get("data", [])

            # Client-side NAICS filter (API doesn't support direct NAICS param)
            if naics_filter and records:
                records = [r for r in records if str(r.get("primeNaics", "")).startswith(naics_filter)]

            results = []
            for r in records[:200]:
                results.append(Subaward(
                    prime_entity_name=r.get("primeEntityName", ""),
                    prime_uei=r.get("primeEntityUei", ""),
                    sub_entity_name=r.get("subEntityLegalBusinessName", ""),
                    sub_uei=r.get("subEntityUei", ""),
                    subaward_amount=r.get("subAwardAmount"),
                    subaward_date=r.get("subAwardDate", ""),
                    naics=str(r.get("primeNaics", "")),
                    agency=r.get("agencyId", ""),
                    description=r.get("description", ""),
                    contract_piid=r.get("piid", ""),
                    source=IntelSource.SAM_SUBAWARDS,
                ))

            logger.info("subaward_contract_search_complete", extra={"total": len(results)})
            return results

    async def search_assistance_subawards(
        self,
        fain: str = "",
        agency_code: str = "",
        from_date: str = "",
        to_date: str = "",
        page_size: int = 100,
    ) -> list[Subaward]:
        """Search assistance (grant) subawards from SAM.gov."""
        params: dict = {
            "api_key": self._api_key,
            "pageSize": str(page_size),
            "pageNumber": "0",
        }
        if fain:
            params["fain"] = fain
        if agency_code:
            params["agencyCode"] = agency_code
        if from_date:
            params["fromDate"] = from_date
        if to_date:
            params["toDate"] = to_date

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                ASSISTANCE_SUBAWARD_API, params=params,
                headers={"Accept": "application/json"},
            )
            if response.status_code != 200:
                logger.error("subaward_assistance_error", extra={"status": response.status_code})
                return []

            data = response.json()
            records = data.get("results") or data.get("data") or data.get("subawards") or []

            results = []
            for r in records:
                results.append(Subaward(
                    prime_entity_name=r.get("primeEntityName") or r.get("primeAwardeeName", ""),
                    prime_uei=r.get("primeEntityUei") or r.get("primeAwardeeUei", ""),
                    sub_entity_name=r.get("subEntityLegalBusinessName") or r.get("subVendorName") or r.get("subawardeeName", ""),
                    sub_uei=r.get("subEntityUei") or r.get("subVendorUei") or r.get("subawardeeUei", ""),
                    subaward_amount=r.get("subAwardAmount") or r.get("subawardAmount"),
                    subaward_date=r.get("subAwardDate", ""),
                    naics="",
                    agency=r.get("agencyCode", ""),
                    description=r.get("description", ""),
                    contract_piid=r.get("FAIN") or r.get("fain", ""),
                    source=IntelSource.SAM_ASSISTANCE_SUBAWARDS,
                ))

            logger.info("subaward_assistance_search_complete", extra={"total": len(results)})
            return results
