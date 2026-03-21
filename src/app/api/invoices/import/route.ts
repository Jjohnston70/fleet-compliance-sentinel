import { NextRequest, NextResponse } from 'next/server';
import { ensureInvoiceTables, importInvoice } from '@/lib/invoice-db';
import { chiefAuthErrorResponse, requireChiefOrgWithRole } from '@/lib/chief-auth';

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireChiefOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await req.json();

    // Ensure tables exist
    await ensureInvoiceTables();

    // Import the invoice
    const invoiceId = await importInvoice({
      ...data,
      org_id: orgId,
    });

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      line_items_count: data.line_items?.length ?? 0,
      work_descriptions_count: data.work_descriptions?.length ?? 0,
    });
  } catch (error: unknown) {
    console.error('Invoice import error:', error);
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
