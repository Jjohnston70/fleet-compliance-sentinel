import { NextRequest, NextResponse } from 'next/server';
import { ensureInvoiceTables, importInvoice } from '@/lib/invoice-db';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Ensure tables exist
    await ensureInvoiceTables();

    // Import the invoice
    const invoiceId = await importInvoice(data);

    return NextResponse.json({
      success: true,
      invoice_id: invoiceId,
      line_items_count: data.line_items?.length ?? 0,
      work_descriptions_count: data.work_descriptions?.length ?? 0,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Invoice import error:', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
