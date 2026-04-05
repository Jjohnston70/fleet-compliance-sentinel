export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrg,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import {
  getGovConModuleSetupError,
  getGovConRuntime,
  serializeActivity,
  serializeContact,
} from '@/lib/govcon-compliance-command-runtime';

type OutreachStatus = 'prospect' | 'warm' | 'active' | 'cold';

type OutreachActivityType = 'email' | 'phone' | 'meeting' | 'event' | 'linkedin';

function normalizeOutreachStatus(value: unknown): OutreachStatus | undefined {
  const normalized = String(value ?? '').trim();
  if (normalized === 'prospect' || normalized === 'warm' || normalized === 'active' || normalized === 'cold') {
    return normalized;
  }
  return undefined;
}

function normalizeActivityType(value: unknown): OutreachActivityType | null {
  const normalized = String(value ?? '').trim();
  if (
    normalized === 'email'
    || normalized === 'phone'
    || normalized === 'meeting'
    || normalized === 'event'
    || normalized === 'linkedin'
  ) {
    return normalized;
  }
  return null;
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

  const agency = String(req.nextUrl.searchParams.get('agency') ?? '').trim();
  const status = normalizeOutreachStatus(req.nextUrl.searchParams.get('status'));

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const contacts = await runtimeRef.outreachService.listContacts({
      agency: agency || undefined,
      status,
    });

    return NextResponse.json({
      ok: true,
      contacts: contacts.map((contact: any) => serializeContact(contact)),
    });
  } catch (error) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    console.error('[govcon-contacts-get] failed:', error);
    return NextResponse.json({ ok: false, error: 'Failed to load contacts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let orgId: string;
  try {
    ({ orgId } = await requireFleetComplianceOrgWithRole(req, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const contactId = String(body.contact_id ?? '').trim();
  const activityType = normalizeActivityType(body.activity_type);
  const subject = String(body.subject ?? '').trim();

  if (!contactId || !activityType || !subject) {
    return NextResponse.json(
      { ok: false, error: 'contact_id, activity_type, and subject are required' },
      { status: 422 },
    );
  }

  try {
    const runtimeRef = await getGovConRuntime(orgId);
    const activity = await runtimeRef.outreachService.logActivity(contactId, activityType, subject);
    const history = await runtimeRef.outreachService.getContactHistory(contactId);

    return NextResponse.json({
      ok: true,
      activity: serializeActivity(activity),
      history: history.map((entry: any) => serializeActivity(entry)),
    });
  } catch (error: any) {
    const setupError = getGovConModuleSetupError(error);
    if (setupError) {
      return NextResponse.json({ ok: false, error: setupError }, { status: 503 });
    }

    if (String(error?.message ?? '').includes('not found')) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 404 });
    }

    console.error('[govcon-contacts-post] failed:', error);
    return NextResponse.json(
      { ok: false, error: error?.message || 'Failed to log outreach activity' },
      { status: 500 },
    );
  }
}
