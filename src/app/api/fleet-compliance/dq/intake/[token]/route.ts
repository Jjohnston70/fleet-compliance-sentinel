export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  getFileByToken,
  saveIntakeResponse,
  getIntakeResponses,
  getIntakeStatus,
  completeIntake,
  ensureOrgHydrated,
} from '@/lib/dq-store';

const INTAKE_SECTIONS = [
  { id: 'personal', title: 'Personal Information' },
  { id: 'licensing', title: 'Licensing & Qualifications' },
  { id: 'employment_history', title: 'Employment History' },
  { id: 'violations', title: 'Violations & Incidents' },
  { id: 'certifications', title: 'Certifications & Training' },
  { id: 'uploads', title: 'Document Uploads' },
];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const file = await getFileByToken(token);

  if (!file) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or expired token' },
      { status: 404 }
    );
  }

  await ensureOrgHydrated(file.org_id);

  const intake_status = await getIntakeStatus(file.id);

  return NextResponse.json({
    ok: true,
    driver_name: file.driver_name,
    driverName: file.driver_name,
    cdl_holder: file.cdl_holder,
    sections: INTAKE_SECTIONS,
    intake_status,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const file = await getFileByToken(token);

  if (!file) {
    return NextResponse.json(
      { ok: false, error: 'Invalid or expired token' },
      { status: 404 }
    );
  }

  await ensureOrgHydrated(file.org_id);

  const body = await req.json();
  const { section, response_data, action } = body;

  if (action === 'complete') {
    await completeIntake(token);
    return NextResponse.json({ ok: true, message: 'Intake completed' });
  }

  if (section && response_data) {
    await saveIntakeResponse(file.id, section, response_data);
    return NextResponse.json({ ok: true, message: 'Section saved' });
  }

  return NextResponse.json(
    { ok: false, error: 'Invalid request' },
    { status: 400 }
  );
}
