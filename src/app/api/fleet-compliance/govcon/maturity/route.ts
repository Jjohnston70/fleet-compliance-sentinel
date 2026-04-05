export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
} from '@/lib/govcon-compliance-command-runtime';

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const companyId = String(req.nextUrl.searchParams.get('company_id') ?? '').trim();
  if (!companyId) {
    return NextResponse.json({ ok: false, error: 'company_id is required' }, { status: 422 });
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const maturity = await runtimeRef.maturityService.getScoreBreakdown(companyId);

    if (!maturity) {
      return NextResponse.json(
        { ok: false, error: 'No maturity tracker found for this company' },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      maturity: {
        overall: Number(maturity?.overall ?? 0),
        byDomain: Array.isArray(maturity?.byDomain)
          ? maturity.byDomain.map((entry: any) => ({
            domain: String(entry?.domain ?? ''),
            domainName: String(entry?.domainName ?? ''),
            score: Number(entry?.score ?? 0),
            templateCount: Number(entry?.templateCount ?? 0),
            completedCount: Number(entry?.completedCount ?? 0),
          }))
          : [],
      },
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-maturity-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load maturity score' }, { status: 500 });
  }
}
