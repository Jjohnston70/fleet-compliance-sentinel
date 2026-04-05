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

  const companyId = String(body.company_id ?? '').trim();
  if (!companyId) {
    return NextResponse.json({ ok: false, error: 'company_id is required' }, { status: 422 });
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const result = await runtimeRef.intakeService.runIntake(companyId);

    return NextResponse.json({
      ok: true,
      result: {
        id: String(result?.id ?? ''),
        company_id: String(result?.company_id ?? ''),
        business_type: String(result?.business_type ?? ''),
        employee_count: Number(result?.employee_count ?? 0),
        handles_phi: Boolean(result?.handles_phi),
        handles_pci: Boolean(result?.handles_pci),
        federal_contracts: Boolean(result?.federal_contracts),
        cloud_platform: result?.cloud_platform ? String(result.cloud_platform) : null,
        frameworks_requested: Array.isArray(result?.frameworks_requested) ? result.frameworks_requested : [],
        recommended_skills: Array.isArray(result?.recommended_skills)
          ? result.recommended_skills.map((skill: any) => ({
            skill_id: String(skill?.skill_id ?? ''),
            skill_name: String(skill?.skill_name ?? ''),
            priority: String(skill?.priority ?? ''),
            reason: String(skill?.reason ?? ''),
          }))
          : [],
        created_at: toIsoString(result?.created_at),
      },
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    if (String(error?.message ?? '').includes('not found')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }

    console.error('[govcon-intake-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to run intake wizard' },
      { status: 500 },
    );
  }
}
