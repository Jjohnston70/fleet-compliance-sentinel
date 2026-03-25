import { chiefAuthErrorResponse, requireChiefOrg } from '@/lib/chief-auth';
import { ensureOrgProvisioned } from '@/lib/org-provisioner';
import { getSQL } from '@/lib/chief-db';
import { auditLog } from '@/lib/audit-logger';
import { recordOrgAuditEvent } from '@/lib/org-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface OnboardingPayload {
  companyName?: string;
  primaryContact?: string;
  fleetSize?: string;
  primaryDotConcern?: string;
}

function normalize(value: unknown, maxLength: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireChiefOrg(request));
  } catch (error: unknown) {
    const authResponse = chiefAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let payload: OnboardingPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const companyName = normalize(payload.companyName, 160);
  const primaryContact = normalize(payload.primaryContact, 160);
  const fleetSize = normalize(payload.fleetSize, 80);
  const primaryDotConcern = normalize(payload.primaryDotConcern, 240);

  if (!companyName || !primaryContact || !fleetSize || !primaryDotConcern) {
    return Response.json({
      error: 'companyName, primaryContact, fleetSize, and primaryDotConcern are required',
    }, { status: 422 });
  }

  try {
    await ensureOrgProvisioned(orgId, companyName);
    const sql = getSQL();
    const metadata = {
      fleetSize,
      primaryDotConcern,
    };

    await sql`
      INSERT INTO organization_contacts (org_id, primary_contact, updated_at)
      VALUES (${orgId}, ${primaryContact}, NOW())
      ON CONFLICT (org_id) DO UPDATE
      SET
        primary_contact = EXCLUDED.primary_contact,
        updated_at = NOW()
    `;

    const rows = await sql`
      UPDATE organizations
      SET
        name = ${companyName},
        metadata = (COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(metadata)}::jsonb) - 'primaryContact',
        onboarding_complete = TRUE,
        updated_at = NOW()
      WHERE id = ${orgId}
      RETURNING id, name, plan, onboarding_complete, trial_ends_at
    `;

    if (rows.length === 0) {
      return Response.json({ error: 'Organization not found' }, { status: 404 });
    }

    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'chief.onboarding',
      metadata: {
        onboardingComplete: true,
      },
    });
    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.onboarding.completed',
      actorUserId: userId,
      actorType: 'user',
      metadata: {
        fleetSize,
        hasPrimaryDotConcern: primaryDotConcern.length > 0,
      },
    });

    return Response.json({
      status: 'ok',
      organization: rows[0],
    });
  } catch (error: unknown) {
    console.error('[chief-onboarding-post] failed:', error);
    auditLog({
      action: 'data.write',
      userId,
      orgId,
      resourceType: 'chief.onboarding',
      severity: 'error',
      metadata: {
        failed: true,
      },
    });
    return Response.json({ error: 'Failed to save onboarding' }, { status: 500 });
  }
}
