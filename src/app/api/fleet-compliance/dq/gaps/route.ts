export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getGaps,
  ensureOrgHydrated,
} from '@/lib/dq-store';
import {
  requireFleetComplianceOrg,
  fleetComplianceAuthErrorResponse,
} from '@/lib/fleet-compliance-auth';

export async function GET(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrg(req));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  await ensureOrgHydrated(orgId);

  const expiringWithinDays =
    parseInt(req.nextUrl.searchParams.get('expiringWithinDays') || '30', 10);

  const gaps = getGaps(orgId, expiringWithinDays);
  const mappedGaps = gaps.map((gap) => ({
    driverName: gap.driver_name,
    document: gap.doc_label,
    reference: gap.cfr_reference,
    gapType: gap.gap_type,
    severity: gap.severity,
    expiryDate: gap.expires_at ?? '',
    daysUntil: gap.days_until_expiry ?? 0,
    driver_name: gap.driver_name,
    doc_label: gap.doc_label,
    cfr_reference: gap.cfr_reference,
    gap_type: gap.gap_type,
    expires_at: gap.expires_at,
    days_until_expiry: gap.days_until_expiry,
  }));

  const summary = {
    missing: gaps.filter((gap) => gap.gap_type === 'missing').length,
    expiring: gaps.filter((gap) => gap.gap_type === 'expiring').length,
    expired: gaps.filter((gap) => gap.gap_type === 'expired').length,
  };

  return NextResponse.json({
    ok: true,
    gaps: mappedGaps,
    summary,
  });
}
