"""
tests/test_federal_intel.py
Unit tests for federal intel models and client construction.
Live API tests are separate (require keys + network).
"""

import pytest
from datetime import datetime, timezone

from models.federal_intel import (
    SAMOpportunity,
    ContractAward,
    GrantOpportunity,
    SBIRAward,
    LaborRate,
    PSCCode,
    RegulatoryDocument,
    Subaward,
    FederalSearchParams,
    IntelSource,
)
from integrations.federal_intel.sam import SAMClient
from integrations.federal_intel.usaspending import USAspendingClient
from integrations.federal_intel.grants import GrantsGovClient
from integrations.federal_intel.sbir import SBIRClient
from integrations.federal_intel.subawards import SubawardsClient
from integrations.federal_intel.psc import PSCClient
from integrations.federal_intel.regulations import RegulationsClient
from integrations.federal_intel.labor_rates import LaborRatesClient
from integrations.federal_intel.orchestrator import FederalIntelOrchestrator, IngestResults


# ---------------------------------------------------------------------------
# Model validation tests
# ---------------------------------------------------------------------------

class TestModels:
    def test_sam_opportunity_defaults(self):
        opp = SAMOpportunity(notice_id="abc-123", title="Test Opp", agency="GSA")
        assert opp.source == IntelSource.SAM_GOV
        assert opp.set_aside == "Full & Open"
        assert isinstance(opp.fetched_at, datetime)

    def test_contract_award_defaults(self):
        award = ContractAward(award_id="CONT-001")
        assert award.source == IntelSource.USASPENDING
        assert award.award_amount == 0

    def test_grant_opportunity_nullable_amounts(self):
        grant = GrantOpportunity(opp_number="GRANT-001")
        assert grant.award_ceiling is None
        assert grant.award_floor is None

    def test_sbir_award_abstract_truncation(self):
        """Model accepts long abstracts; truncation happens in client."""
        long_text = "x" * 500
        award = SBIRAward(abstract=long_text)
        assert len(award.abstract) == 500  # model doesn't truncate

    def test_labor_rate_construction(self):
        rate = LaborRate(
            labor_category="Software Engineer",
            hourly_rate=125.50,
            vendor_name="Acme Corp",
        )
        assert rate.hourly_rate == 125.50
        assert rate.source == IntelSource.GSA_CALC

    def test_psc_code_active_flag(self):
        psc = PSCCode(psc_code="D301", psc_name="ADP Facility Management", active=True)
        assert psc.active is True

    def test_regulatory_document(self):
        doc = RegulatoryDocument(document_id="FAR-2025-001", title="FAR Update")
        assert doc.source == IntelSource.REGULATIONS_GOV
        assert doc.withdrawn is False

    def test_subaward_sources(self):
        contract_sub = Subaward(source=IntelSource.SAM_SUBAWARDS)
        assist_sub = Subaward(source=IntelSource.SAM_ASSISTANCE_SUBAWARDS)
        assert contract_sub.source != assist_sub.source

    def test_federal_search_params_defaults(self):
        params = FederalSearchParams()
        assert "541512" in params.naics_codes
        assert len(params.naics_codes) == 5
        assert params.months_back == 3


# ---------------------------------------------------------------------------
# Client construction tests (no network calls)
# ---------------------------------------------------------------------------

class TestClientConstruction:
    def test_sam_client_accepts_key(self):
        client = SAMClient(api_key="test-key-123")
        assert client._api_key == "test-key-123"

    def test_sam_client_default_demo_key(self):
        client = SAMClient()
        assert client._api_key == "DEMO_KEY"

    def test_usaspending_client_no_key(self):
        client = USAspendingClient()
        assert client is not None

    def test_grants_client_no_key(self):
        client = GrantsGovClient()
        assert client is not None

    def test_sbir_client_no_key(self):
        client = SBIRClient()
        assert client is not None

    def test_subawards_client_requires_key(self):
        client = SubawardsClient(api_key="sam-key")
        assert client._api_key == "sam-key"

    def test_psc_client_requires_key(self):
        client = PSCClient(api_key="sam-key")
        assert client._api_key == "sam-key"

    def test_regulations_client_requires_key(self):
        client = RegulationsClient(api_key="reg-key")
        assert client._api_key == "reg-key"

    def test_labor_rates_no_key(self):
        client = LaborRatesClient()
        assert client is not None


# ---------------------------------------------------------------------------
# Orchestrator tests
# ---------------------------------------------------------------------------

class TestOrchestrator:
    def test_orchestrator_construction(self):
        orch = FederalIntelOrchestrator(sam_api_key="test-key")
        assert orch._sam_key == "test-key"

    def test_ingest_results_summary(self):
        results = IngestResults()
        results.completed_at = datetime.now(timezone.utc)
        summary = results.summary
        assert summary["total"] == 0
        assert summary["sam"] == 0
        assert summary["errors"] == []
        assert summary["duration_seconds"] is not None
