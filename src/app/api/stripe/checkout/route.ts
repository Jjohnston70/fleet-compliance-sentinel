import { clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import { getStripeClient } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface CheckoutBody {
  priceId?: string;
}

function getSiteUrl(request: Request): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/+$/, '');
  }
  return new URL(request.url).origin;
}

function extractEmail(value: string): string | null {
  const match = value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);
  return match ? match[0].toLowerCase() : null;
}

async function resolveClerkUserEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primary = user.primaryEmailAddress?.emailAddress?.trim().toLowerCase();
  if (primary) return primary;
  for (const item of user.emailAddresses ?? []) {
    const value = item.emailAddress?.trim().toLowerCase();
    if (value) return value;
  }
  return null;
}

async function resolveExistingStripeCustomerId(sql: ReturnType<typeof getSQL>, orgId: string): Promise<string | null> {
  const rows = await sql`
    SELECT stripe_customer_id
    FROM subscriptions
    WHERE org_id = ${orgId}
      AND stripe_customer_id IS NOT NULL
      AND stripe_customer_id <> ''
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const id = rows[0]?.stripe_customer_id;
  return typeof id === 'string' && id.trim().length > 0 ? id.trim() : null;
}

async function storeStripeCustomerOnSubscription(
  sql: ReturnType<typeof getSQL>,
  orgId: string,
  stripeCustomerId: string,
) {
  const latestRows = await sql`
    SELECT id
    FROM subscriptions
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const latestId = Number(latestRows[0]?.id);

  if (Number.isFinite(latestId) && latestId > 0) {
    await sql`
      UPDATE subscriptions
      SET stripe_customer_id = ${stripeCustomerId}
      WHERE id = ${latestId}
    `;
    return;
  }

  await sql`
    INSERT INTO subscriptions (
      org_id,
      stripe_customer_id,
      plan,
      status
    ) VALUES (
      ${orgId},
      ${stripeCustomerId},
      'trial',
      'trialing'
    )
  `;
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

  let body: CheckoutBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const priceId = typeof body.priceId === 'string' ? body.priceId.trim() : '';
  if (!priceId) {
    return NextResponse.json({ error: 'priceId is required' }, { status: 422 });
  }

  const starterPriceId = process.env.STRIPE_STARTER_PRICE_ID?.trim();
  const proPriceId = process.env.STRIPE_PRO_PRICE_ID?.trim();
  if (!starterPriceId || !proPriceId) {
    return NextResponse.json({ error: 'Stripe price ids are not configured' }, { status: 503 });
  }
  const allowedPrices = new Set([starterPriceId, proPriceId].filter((value): value is string => Boolean(value)));

  if (!allowedPrices.has(priceId)) {
    return NextResponse.json({ error: 'Unsupported priceId' }, { status: 400 });
  }

  await ensureOrgScopingTables();
  const sql = getSQL();
  const stripe = getStripeClient();
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 503 });
  }

  try {
    const orgRows = await sql`
      SELECT
        o.name,
        c.primary_contact
      FROM organizations o
      LEFT JOIN organization_contacts c
        ON c.org_id = o.id
      WHERE o.id = ${orgId}
      LIMIT 1
    `;
    const orgRow = orgRows[0] as Record<string, unknown> | undefined;
    if (!orgRow) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const orgName = typeof orgRow.name === 'string' && orgRow.name.trim().length > 0
      ? orgRow.name.trim().slice(0, 160)
      : `Organization ${orgId}`;
    const contactEmail = typeof orgRow.primary_contact === 'string'
      ? extractEmail(orgRow.primary_contact)
      : null;
    const userEmail = await resolveClerkUserEmail(userId);
    const customerEmail = contactEmail ?? userEmail;

    if (!customerEmail) {
      return NextResponse.json({ error: 'Unable to determine billing email' }, { status: 422 });
    }

    let stripeCustomerId = await resolveExistingStripeCustomerId(sql, orgId);

    if (stripeCustomerId) {
      const existingCustomer = await stripe.customers.retrieve(stripeCustomerId);
      if ('deleted' in existingCustomer && existingCustomer.deleted) {
        stripeCustomerId = null;
      }
    }

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: customerEmail,
        name: orgName,
        metadata: {
          org_id: orgId,
          user_id: userId,
        },
      });
      stripeCustomerId = customer.id;
    } else {
      await stripe.customers.update(stripeCustomerId, {
        email: customerEmail,
        name: orgName,
        metadata: {
          org_id: orgId,
          user_id: userId,
        },
      });
    }

    await storeStripeCustomerOnSubscription(sql, orgId, stripeCustomerId);

    const siteUrl = getSiteUrl(request);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${siteUrl}/fleet-compliance?checkout=success`,
      cancel_url: `${siteUrl}/fleet-compliance?checkout=canceled`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: {
          org_id: orgId,
          user_id: userId,
        },
      },
      customer_update: {
        name: 'auto',
      },
    });

    if (!session.url) {
      return NextResponse.json({ error: 'Stripe checkout session missing url' }, { status: 502 });
    }

    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.subscription.checkout_started',
      actorUserId: userId,
      actorType: 'user',
      metadata: {
        priceId,
        stripeCustomerId,
        sessionId: session.id,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout session creation failed';
    console.error('[stripe-checkout-post] failed:', message);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
