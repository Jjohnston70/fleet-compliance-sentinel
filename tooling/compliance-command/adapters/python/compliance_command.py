"""
compliance-command — Python Platform Wrapper
True North Data Strategies

Client fills out company info once, all compliance documents auto-populate.

USAGE:
    from compliance_command import submit_company, generate_all, get_package_status

    result = submit_company(company_name="Acme Corp", primary_contact="Jane Doe", ein="12-3456789")
    packages = generate_all(company_id=result["companyId"])
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass, field, asdict
from typing import Any, Optional

try:
    import httpx
    _client = httpx.Client(timeout=180.0, follow_redirects=True)
    def _post(url: str, payload: dict) -> dict:
        r = _client.post(url, json=payload)
        r.raise_for_status()
        return r.json()
except ImportError:
    from urllib.request import Request, urlopen
    def _post(url: str, payload: dict) -> dict:
        req = Request(url, data=json.dumps(payload).encode(), headers={"Content-Type": "application/json"})
        with urlopen(req, timeout=180) as resp:
            return json.loads(resp.read().decode())


WEBAPP_URL: str = ""
API_KEY: str = ""


# ── Data Classes ──────────────────────────────────────────────

@dataclass
class CompanyInfo:
    """All fields a client can provide. Only company_name and primary_contact are required."""
    company_name: str = ""
    company_short_name: str = ""
    company_address: str = ""
    company_city: str = ""
    company_state: str = ""
    company_zip: str = ""
    company_email: str = ""
    company_phone: str = ""
    website: str = ""
    ein: str = ""
    state_of_incorporation: str = ""
    year_founded: str = ""
    entity_type: str = ""
    cage_code: str = ""
    duns_number: str = ""
    sam_uei: str = ""
    naics_codes: str = ""
    sic_codes: str = ""
    contract_types: str = ""
    clearance_level: str = ""
    set_aside_status: str = ""
    ceo: str = ""
    cfo: str = ""
    cto: str = ""
    ciso: str = ""
    primary_contact: str = ""
    it_poc: str = ""
    security_poc: str = ""
    compliance_poc: str = ""
    hr_poc: str = ""
    employee_count: str = ""
    annual_revenue: str = ""
    physical_locations: str = ""
    remote_workforce: str = ""
    cloud_provider: str = ""
    email_platform: str = ""
    insurance_carrier: str = ""
    cyber_insurance: str = ""


@dataclass
class PackageResult:
    package_name: str = ""
    package_number: int = 0
    documents_generated: int = 0
    folder_url: str = ""
    status: str = ""
    error: str = ""


# ── Helpers ───────────────────────────────────────────────────

def _snake_to_camel(s: str) -> str:
    parts = s.split("_")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def _convert_keys(d: dict) -> dict:
    return {_snake_to_camel(k): v for k, v in d.items() if v}


def _call_webapp(action: str, data: dict | None = None) -> Any:
    if not WEBAPP_URL:
        raise RuntimeError("WEBAPP_URL not set. Configure before calling.")
    payload: dict = {"action": action, "data": data or {}}
    if API_KEY:
        payload["apiKey"] = API_KEY
    result = _post(WEBAPP_URL, payload)
    if not result.get("success"):
        raise RuntimeError(f"compliance-command error: {result.get('error', 'Unknown')}")
    return result.get("data", result)


# ── Public API ────────────────────────────────────────────────

def run(context: dict) -> Any:
    """Generic entry point. context must include 'action'."""
    action = context.pop("action", None)
    if not action:
        raise ValueError("Missing 'action' in context")
    return _call_webapp(action, _convert_keys(context))


def submit_company(company_name: str, primary_contact: str, **kwargs) -> dict:
    """Submit or update company info. Returns { companyId, status, timestamp }."""
    data = {"companyName": company_name, "primaryContact": primary_contact}
    for k, v in kwargs.items():
        if v:
            data[_snake_to_camel(k)] = v
    return _call_webapp("submitCompanyInfo", data)


def submit_company_info(info: CompanyInfo) -> dict:
    """Submit a full CompanyInfo dataclass."""
    data = _convert_keys(asdict(info))
    return _call_webapp("submitCompanyInfo", data)


def generate_package(company_id: str, package_number: int, output_folder_id: str = "") -> PackageResult:
    """Generate a single compliance package (1-7)."""
    data: dict = {"companyId": company_id, "packageNumber": package_number}
    if output_folder_id:
        data["outputFolderId"] = output_folder_id
    result = _call_webapp("generatePackage", data)
    return PackageResult(
        package_name=result.get("packageName", ""),
        package_number=result.get("packageNumber", 0),
        documents_generated=result.get("documentsGenerated", 0),
        folder_url=result.get("folderUrl", ""),
        status="generated",
    )


def generate_all(company_id: str, output_folder_id: str = "") -> dict:
    """Generate all 7 compliance packages. Returns { packages[], totalDocuments, folderUrl }."""
    data: dict = {"companyId": company_id}
    if output_folder_id:
        data["outputFolderId"] = output_folder_id
    return _call_webapp("generateAll", data)


def get_company_info(company_id: str) -> dict:
    """Retrieve full company profile."""
    return _call_webapp("getCompanyInfo", {"companyId": company_id})


def list_companies() -> dict:
    """List all companies with compliance profiles. Returns { companies[], count }."""
    return _call_webapp("listCompanies", {})


def get_package_status(company_id: str) -> dict:
    """Check generation status for all 7 packages. Returns { companyId, packages[] }."""
    return _call_webapp("getPackageStatus", {"companyId": company_id})


# ── CLI Entry ─────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python compliance_command.py <action> [key=value ...]")
        print("Actions: submitCompanyInfo, generatePackage, generateAll, getCompanyInfo, listCompanies, getPackageStatus")
        sys.exit(1)

    action = sys.argv[1]
    ctx = {"action": action}
    for arg in sys.argv[2:]:
        if "=" in arg:
            k, v = arg.split("=", 1)
            ctx[k] = v
    print(json.dumps(run(ctx), indent=2, default=str))
