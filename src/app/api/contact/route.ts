import { NextRequest, NextResponse } from 'next/server';

// Replace SHEET_URL with your Google Apps Script Web App URL after deployment
const SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL || '';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, business, phone, email, message } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required.' }, { status: 400 });
    }

    const payload = {
      timestamp: new Date().toISOString(),
      name,
      business: business || '',
      phone,
      email: email || '',
      message: message || '',
      source: 'truenorthstrategyops.com contact form',
    };

    // Post to Google Sheet via Apps Script webhook
    if (SHEET_URL) {
      await fetch(SHEET_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Contact API error:', err);
    return NextResponse.json({ error: 'Server error.' }, { status: 500 });
  }
}
