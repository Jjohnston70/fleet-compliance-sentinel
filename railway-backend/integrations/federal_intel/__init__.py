"""
Federal Intelligence Integration Package
Typed API clients for SAM.gov, USAspending, Grants.gov, SBIR, and more.
Ported from APPSCRIPT GOV.txt (Google Apps Script) into async Python.
"""

from integrations.federal_intel.sam import SAMClient
from integrations.federal_intel.usaspending import USAspendingClient
from integrations.federal_intel.grants import GrantsGovClient
from integrations.federal_intel.sbir import SBIRClient
from integrations.federal_intel.subawards import SubawardsClient
from integrations.federal_intel.psc import PSCClient
from integrations.federal_intel.regulations import RegulationsClient
from integrations.federal_intel.labor_rates import LaborRatesClient
from integrations.federal_intel.orchestrator import FederalIntelOrchestrator

__all__ = [
    "SAMClient",
    "USAspendingClient",
    "GrantsGovClient",
    "SBIRClient",
    "SubawardsClient",
    "PSCClient",
    "RegulationsClient",
    "LaborRatesClient",
    "FederalIntelOrchestrator",
]
