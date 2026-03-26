import { NextResponse } from 'next/server';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import { getStripeClient } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getSiteUrl(request: Request): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return new URL(request.url).origin;
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request, { allowCanceled: true }));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await ensureOrgScopingTables();
  const sql = getSQL();
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  try {
    const rows = await sql`
      SELECT stripe_customer_id
      FROM subscriptions
      WHERE org_id = ${orgId}
        AND stripe_customer_id IS NOT NULL
        AND stripe_customer_id <> ''
      ORDER BY created_at DESC
      LIMIT 1
    `;
    const stripeCustomerId = typeof rows[0]?.stripe_customer_id === 'string'
      ? rows[0].stripe_customer_id.trim()
      : '';

    if (!stripeCustomerId) {
      return NextResponse.json({ error: 'Stripe customer not found for organization' }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${getSiteUrl(request)}/fleet-compliance`,
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe portal session missing url' }, { status: 502 });
    }

    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.subscription.portal_session_created',
      actorUserId: userId,
      actorType: 'user',
      metadata: {
        sessionId: session.id,
        stripeCustomerId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Portal session creation failed';
    console.error('[stripe-portal-post] failed:', message);
    return NextResponse.json({ error: 'Failed to create billing portal session' }, { status: 500 });
  }
}
