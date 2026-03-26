import { NextRequest, NextResponse } from 'next/server';
import { ensureInvoiceTables, importInvoice } from '@/lib/invoice-db';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';

export async function POST(req: NextRequest) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
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
    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'invoices',
      resourceId: String(invoiceId),
      metadata: {
        collection: 'invoices',
        lineItemCount: data.line_items?.length ?? 0,
      },
    });

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      line_items_count: data.line_items?.length ?? 0,
      work_descriptions_count: data.work_descriptions?.length ?? 0,
    });
  } catch (error: unknown) {
    console.error('Invoice import error:', error);
    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'invoices',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return NextResponse.json({ success: false, error: 'Import failed' }, { status: 500 });
  }
}
