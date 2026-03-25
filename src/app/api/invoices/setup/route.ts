import { NextResponse } from 'next/server';
import { ensureInvoiceTables } from '@/lib/invoice-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';
import { auditLog } from '@/lib/audit-logger';

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureInvoiceTables();
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'invoices.setup',
      metadata: {
        action: 'ensureInvoiceTables',
      },
    });
    return NextResponse.json({ success: true, message: 'Invoice tables created' });
  } catch (error: unknown) {
    console.error('[invoices/setup] failed:', error);
    auditLog({
      action: 'admin.action',
      userId,
      orgId,
      resourceType: 'invoices.setup',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return NextResponse.json({ success: false, error: 'Setup failed' }, { status: 500 });
  }
}
