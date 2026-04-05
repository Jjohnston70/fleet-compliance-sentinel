"""
integrations/federal_intel/regulations.py
Regulations.gov API Client

Ported from executeRegulationsSearch (APPSCRIPT GOV.txt:5455).
API: https://api.regulations.gov/v4/documents
Auth: X-Api-Key header (separate from SAM key — register at https://api.regulations.gov)
"""

import logging
from typing import Optional

import httpx

from models.federal_intel import RegulatoryDocument

logger = logging.getLogger(__name__)

REGULATIONS_API = "https://api.regulations.gov/v4/documents"
REQUEST_TIMEOUT = 30.0


class RegulationsClient:
    def __init__(self, api_key: str):
        self._api_key = api_key

    async def search_documents(
        self,
        search_term: str = "",
        agency_id: str = "",
        document_type: str = "",
        posted_date_from: str = "",
        posted_date_to: str = "",
        docket_id: str = "",
        sort_by: str = "",
        page_size: int = 25,
    ) -> list[RegulatoryDocument]:
        """Search regulatory documents on Regulations.gov."""
        params: dict = {}
        if search_term:
            params["filter[searchTerm]"] = search_term
        if agency_id:
            params["filter[agencyId]"] = agency_id
        if document_type:
            params["filter[documentType]"] = document_type
        if posted_date_from:
            params["filter[postedDate][ge]"] = posted_date_from
        if posted_date_to:
            params["filter[postedDate][le]"] = posted_date_to
        if docket_id:
            params["filter[docketId]"] = docket_id
        if sort_by:
            params["sort"] = sort_by
        params["page[size]"] = str(page_size)

        async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
            response = await client.get(
                REGULATIONS_API,
                params=params,
                headers={"X-Api-Key": self._api_key, "Accept": "application/json"},
            )
            if response.status_code != 200:
                logger.error("regulations_error", extra={"status": response.status_code})
                return []

            data = response.json()
            documents = data.get("data", [])

            results = []
            for doc in documents:
                attr = doc.get("attributes", {})
                doc_id = doc.get("id", "")
                results.append(RegulatoryDocument(
                    document_id=doc_id,
                    title=attr.get("title", ""),
                    document_type=attr.get("documentType", ""),
                    agency=attr.get("agencyId", ""),
                    docket_id=attr.get("docketId", ""),
                    posted_date=attr.get("postedDate", ""),
                    comment_end_date=attr.get("commentEndDate", ""),
                    withdrawn=attr.get("withdrawn", False),
                    link=f"https://www.regulations.gov/document/{doc_id}" if doc_id else "",
                ))

            logger.info("regulations_search_complete", extra={"total": len(results)})
            return results
