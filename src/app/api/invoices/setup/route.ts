import { NextResponse } from 'next/server';
import { ensureInvoiceTables } from '@/lib/invoice-db';

export async function POST() {
  try {
    await ensureInvoiceTables();
    return NextResponse.json({ success: true, message: 'Invoice tables created' });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
