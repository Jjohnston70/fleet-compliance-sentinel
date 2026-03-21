import { NextResponse } from 'next/server';
import { ensureInvoiceTables } from '@/lib/invoice-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export async function POST(request: Request) {
  try {
    await requireChiefOrgWithRole(request, 'admin');
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await ensureInvoiceTables();
    return NextResponse.json({ success: true, message: 'Invoice tables created' });
  } catch (error: unknown) {
    console.error('[invoices/setup] failed:', error);
    return NextResponse.json({ success: false, error: 'Setup failed' }, { status: 500 });
  }
}
