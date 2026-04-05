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
  serializeComplianceItem,
  toIsoString,
} from '@/lib/govcon-compliance-command-runtime';

type ComplianceAuthority = 'SBA' | 'SAM' | 'IRS' | 'state' | 'VA';

function normalizeAuthority(value: unknown): ComplianceAuthority | undefined {
  const normalized = String(value ?? '').trim();
  if (normalized === 'SBA' || normalized === 'SAM' || normalized === 'IRS' || normalized === 'state' || normalized === 'VA') {
    return normalized;
  }
  return undefined;
}

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const authority = normalizeAuthority(req.nextUrl.searchParams.get('authority'));

  try {
    const runtimeRef = await getGovConRuntime(orgId);

    if (authority) {
      const compliance = await runtimeRef.complianceService.checkAuthorityCompliance(authority);
      return NextResponse.json({
        ok: true,
        authority,
        compliance: {
          compliant: Boolean(compliance?.compliant),
          alerts: Array.isArray(compliance?.alerts) ? compliance.alerts : [],
          items: Array.isArray(compliance?.items)
            ? compliance.items.map((item: any) => serializeComplianceItem(item))
            : [],
        },
      });
    }

    const [items, alerts] = await Promise.all([
      runtimeRef.complianceService.listComplianceItems(),
      runtimeRef.complianceMonitor.checkCompliance(),
    ]);

    return NextResponse.json({
      ok: true,
      items: items.map((item: any) => serializeComplianceItem(item)),
      alerts: alerts.map((alert: any) => ({
        itemId: String(alert?.itemId ?? ''),
        name: String(alert?.name ?? ''),
        expirationDate: toIsoString(alert?.expirationDate),
        daysRemaining: Number(alert?.daysRemaining ?? 0),
        severity: String(alert?.severity ?? ''),
      })),
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-compliance-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load compliance status' }, { status: 500 });
  }
}
