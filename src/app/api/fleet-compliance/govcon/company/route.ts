export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
  toIsoString,
} from '@/lib/govcon-compliance-command-runtime';

function normalizeStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .map((entry) => String(entry ?? '').trim())
    .filter((entry) => entry.length > 0);
}

function parseOptionalBoolean(value: unknown): boolean | undefined {
  if (value == null || value === '') return undefined;
  if (typeof value === 'boolean') return value;
  const normalized = String(value).trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return undefined;
}

function parseOptionalNumber(value: unknown): number | undefined {
  if (value == null || value === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return parsed;
}

function serializeCompany(company: any): Record<string, unknown> {
  return {
    id: String(company?.id ?? ''),
    company_name: String(company?.company_name ?? ''),
    legal_name: company?.legal_name ? String(company.legal_name) : null,
    owner_name: company?.owner_name ? String(company.owner_name) : null,
    owner_title: company?.owner_title ? String(company.owner_title) : null,
    address: company?.address ? String(company.address) : null,
    city: company?.city ? String(company.city) : null,
    state: company?.state ? String(company.state) : null,
    zip: company?.zip ? String(company.zip) : null,
    phone: company?.phone ? String(company.phone) : null,
    email: company?.email ? String(company.email) : null,
    website: company?.website ? String(company.website) : null,
    naics_primary: company?.naics_primary ? String(company.naics_primary) : null,
    business_type: company?.business_type ? String(company.business_type) : null,
    certifications: Array.isArray(company?.certifications) ? company.certifications : [],
    frameworks_required: Array.isArray(company?.frameworks_required) ? company.frameworks_required : [],
    federal_contracts: Boolean(company?.federal_contracts),
    handles_phi: Boolean(company?.handles_phi),
    handles_pci: Boolean(company?.handles_pci),
    handles_cui: Boolean(company?.handles_cui),
    created_at: toIsoString(company?.created_at),
    updated_at: toIsoString(company?.updated_at),
  };
}

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const companyName = String(body.company_name ?? '').trim();
  if (!companyName) {
    return NextResponse.json(
      { ok: false, error: 'company_name is required' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    const payload = {
      company_name: companyName,
      legal_name: typeof body.legal_name === 'string' ? body.legal_name.trim() : undefined,
      owner_name: typeof body.owner_name === 'string' ? body.owner_name.trim() : undefined,
      owner_title: typeof body.owner_title === 'string' ? body.owner_title.trim() : undefined,
      address: typeof body.address === 'string' ? body.address.trim() : undefined,
      city: typeof body.city === 'string' ? body.city.trim() : undefined,
      state: typeof body.state === 'string' ? body.state.trim() : undefined,
      zip: typeof body.zip === 'string' ? body.zip.trim() : undefined,
      phone: typeof body.phone === 'string' ? body.phone.trim() : undefined,
      email: typeof body.email === 'string' ? body.email.trim() : undefined,
      website: typeof body.website === 'string' ? body.website.trim() : undefined,
      naics_primary: typeof body.naics_primary === 'string' ? body.naics_primary.trim() : undefined,
      business_type: typeof body.business_type === 'string' ? body.business_type.trim() : undefined,
      employee_count: parseOptionalNumber(body.employee_count),
      annual_revenue: parseOptionalNumber(body.annual_revenue),
      year_founded: parseOptionalNumber(body.year_founded),
      certifications: normalizeStringArray(body.certifications),
      frameworks_required: normalizeStringArray(body.frameworks_required),
      federal_contracts: parseOptionalBoolean(body.federal_contracts),
      handles_phi: parseOptionalBoolean(body.handles_phi),
      handles_pci: parseOptionalBoolean(body.handles_pci),
      handles_cui: parseOptionalBoolean(body.handles_cui),
      cloud_provider: typeof body.cloud_provider === 'string' ? body.cloud_provider.trim() : undefined,
      security_officer: typeof body.security_officer === 'string' ? body.security_officer.trim() : undefined,
      privacy_officer: typeof body.privacy_officer === 'string' ? body.privacy_officer.trim() : undefined,
      compliance_officer: typeof body.compliance_officer === 'string' ? body.compliance_officer.trim() : undefined,
      it_contact: typeof body.it_contact === 'string' ? body.it_contact.trim() : undefined,
    } as Record<string, unknown>;

    const existing = await runtimeRef.repo.getCompanyByName(companyName);
    const company = existing
      ? await runtimeRef.repo.updateCompany(existing.id, payload)
      : await runtimeRef.repo.createCompany(payload);

    return NextResponse.json({
      ok: true,
      company: serializeCompany(company),
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-company-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to submit company info' },
      { status: 500 },
    );
  }
}
