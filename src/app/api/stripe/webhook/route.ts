import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import { syncModulesForPlanChange } from '@/lib/plan-gate';
import { recordOrgAuditEvent } from '@/lib/org-audit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StripeEvent {
  id: string;
  type: string;
  created?: number;
  data?: {
    object?: Record<string, unknown>;
  };
}

function parseStripeSignature(header: string | null): { timestamp: string; signatures: string[] } | null {
  if (!header) return null;
  const parts = header.split(',').map((part) => part.trim()).filter(Boolean);
  const timestamp = parts.find((part) => part.startsWith('t='))?.slice(2);
  const signatures = parts
    .filter((part) => part.startsWith('v1='))
    .map((part) => part.slice(3))
    .filter(Boolean);
  if (!timestamp || signatures.length === 0) return null;
  return { timestamp, signatures };
}

function timingSafeEqualsHex(a: string, b: string): boolean {
  if (!/^[0-9a-f]+$/i.test(a) || !/^[0-9a-f]+$/i.test(b)) return false;
  const left = Buffer.from(a, 'hex');
  const right = Buffer.from(b, 'hex');
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

function verifyStripeSignature(rawBody: string, header: string | null, secret: string): boolean {
  const parsed = parseStripeSignature(header);
  if (!parsed) return false;
  const payload = `${parsed.timestamp}.${rawBody}`;
  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex');
  return parsed.signatures.some((signature) => timingSafeEqualsHex(signature, expected));
}

function metadataOrgId(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null;
  const values = metadata as Record<string, unknown>;
  const raw = values.org_id ?? values.orgId ?? values.organization_id ?? values.organizationId;
  return typeof raw === 'string' && raw.trim().length > 0 ? raw.trim() : null;
}

function subscriptionPlanFromObject(obj: Record<string, unknown>): string {
  const planId = obj.plan && typeof obj.plan === 'object' ? (obj.plan as Record<string, unknown>).id : null;
  const items = obj.items && typeof obj.items === 'object' ? (obj.items as Record<string, unknown>) : null;
  const item0 = items && Array.isArray(items.data) && items.data.length > 0 ? items.data[0] as Record<string, unknown> : null;
  const price = item0?.price && typeof item0.price === 'object' ? item0.price as Record<string, unknown> : null;
  const candidate =
    (typeof price?.nickname === 'string' ? price.nickname : null) ||
    (typeof price?.id === 'string' ? price.id : null) ||
    (typeof planId === 'string' ? planId : null) ||
    (typeof obj.status === 'string' ? `plan_${obj.status}` : null);
  return candidate || 'unknown';
}

function subscriptionPeriodEnd(obj: Record<string, unknown>): string | null {
  const periodEnd = obj.current_period_end;
  if (typeof periodEnd === 'number' && Number.isFinite(periodEnd)) {
    return new Date(periodEnd * 1000).toISOString();
  }
  return null;
}

function parseMetadataObject(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed as Record<string, unknown>;
      }
    } catch {
      return {};
    }
  }
  return {};
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

async function syncOrganizationLifecycleFromSubscription(
  sql: ReturnType<typeof getSQL>,
  orgId: string,
  nextPlan: string,
  nextStatus: string
) {
  const orgRows = await sql`
    SELECT plan, metadata, data_deletion_scheduled_at
    FROM organizations
    WHERE id = ${orgId}
    LIMIT 1
  `;
  const org = orgRows[0] as Record<string, unknown> | undefined;
  if (!org) return;

  const normalizedStatus = nextStatus.toLowerCase();
  const isCanceled = ['canceled', 'cancelled', 'unpaid', 'incomplete_expired'].includes(normalizedStatus);
  const isBillingActive = ['active', 'trialing', 'past_due'].includes(normalizedStatus);

  const metadata = parseMetadataObject(org.metadata);
  const offboarding = parseMetadataObject(metadata.offboarding);
  const scheduledAtRaw = org.data_deletion_scheduled_at ? new Date(String(org.data_deletion_scheduled_at)) : null;
  const scheduledAt = scheduledAtRaw && !Number.isNaN(scheduledAtRaw.getTime()) ? scheduledAtRaw : null;
  const now = new Date();

  if (isCanceled) {
    const nextScheduledAt = scheduledAt ?? addDays(now, 30);
    offboarding.canceledAt = typeof offboarding.canceledAt === 'string' ? offboarding.canceledAt : now.toISOString();
    metadata.offboarding = offboarding;

    await sql`
      UPDATE organizations
      SET
        plan = 'canceled',
        data_deletion_scheduled_at = ${nextScheduledAt.toISOString()},
        metadata = ${JSON.stringify(metadata)}::jsonb,
        updated_at = NOW()
      WHERE id = ${orgId}
    `;
    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.offboarding.scheduled',
      actorType: 'stripe',
      metadata: {
        status: normalizedStatus,
        scheduledFor: nextScheduledAt.toISOString(),
      },
    });
    return;
  }

  if (!isBillingActive) {
    return;
  }

  if (typeof offboarding.canceledAt === 'string') {
    offboarding.reactivatedAt = now.toISOString();
    delete offboarding.softDeletedAt;
    delete offboarding.hardDeletedAt;
    delete offboarding.softDeleteCounts;
    delete offboarding.hardDeleteCounts;
  }
  metadata.offboarding = offboarding;

  await sql`
    UPDATE organizations
    SET
      plan = ${nextPlan},
      data_deletion_scheduled_at = NULL,
      metadata = ${JSON.stringify(metadata)}::jsonb,
      updated_at = NOW()
    WHERE id = ${orgId}
  `;
}

async function resolveOrgId(sql: ReturnType<typeof getSQL>, obj: Record<string, unknown>): Promise<string | null> {
  const fromMetadata = metadataOrgId(obj.metadata);
  if (fromMetadata) return fromMetadata;

  const customerId = typeof obj.customer === 'string' ? obj.customer : null;
  if (!customerId) return null;

  const rows = await sql`
    SELECT org_id
    FROM subscriptions
    WHERE stripe_customer_id = ${customerId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  return typeof row?.org_id === 'string' ? row.org_id : null;
}

async function handleSubscriptionEvent(sql: ReturnType<typeof getSQL>, event: StripeEvent) {
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const orgId = await resolveOrgId(sql, obj);
  if (!orgId) {
    return {
      orgId: null,
      status: 'ignored',
      message: 'missing org_id for subscription event',
    };
  }

  const stripeCustomerId = typeof obj.customer === 'string' ? obj.customer : null;
  const nextPlan = subscriptionPlanFromObject(obj);
  const nextStatus = typeof obj.status === 'string' ? obj.status : 'unknown';
  const nextPeriodEnd = subscriptionPeriodEnd(obj);

  const prevRows = await sql`
    SELECT plan, status
    FROM subscriptions
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const previous = prevRows[0] as Record<string, unknown> | undefined;
  const previousPlan = typeof previous?.plan === 'string' ? previous.plan : 'trial';

  await sql`
    INSERT INTO subscriptions (
      org_id,
      stripe_customer_id,
      plan,
      status,
      current_period_ends_at
    ) VALUES (
      ${orgId},
      ${stripeCustomerId},
      ${nextPlan},
      ${nextStatus},
      ${nextPeriodEnd}
    )
  `;
  await syncOrganizationLifecycleFromSubscription(sql, orgId, nextPlan, nextStatus);

  let moduleSyncResult: {
    previousTier: 'trial' | 'starter' | 'pro' | 'enterprise';
    nextTier: 'trial' | 'starter' | 'pro' | 'enterprise';
    enabled: string[];
    disabled: string[];
  } | null = null;
  try {
    moduleSyncResult = await syncModulesForPlanChange({
      orgId,
      previousPlan,
      nextPlan,
      changedByUserId: 'stripe_webhook',
    });
  } catch {
    moduleSyncResult = null;
  }

  await recordOrgAuditEvent({
    orgId,
    eventType: 'org.subscription.webhook_received',
    actorType: 'stripe',
    metadata: {
      eventType: event.type,
      status: nextStatus,
      plan: nextPlan,
    },
  });

  if (!previous) {
    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.subscription.created',
      actorType: 'stripe',
      metadata: {
        status: nextStatus,
        plan: nextPlan,
      },
    });
  } else {
    if (String(previous.plan ?? '') !== nextPlan) {
      await recordOrgAuditEvent({
        orgId,
        eventType: 'org.plan.changed',
        actorType: 'stripe',
        metadata: {
          previousPlan,
          nextPlan,
          moduleSync: moduleSyncResult
            ? {
                previousTier: moduleSyncResult.previousTier,
                nextTier: moduleSyncResult.nextTier,
                enabledCount: moduleSyncResult.enabled.length,
                disabledCount: moduleSyncResult.disabled.length,
              }
            : null,
        },
      });
    }
    if (String(previous.status ?? '') !== nextStatus) {
      await recordOrgAuditEvent({
        orgId,
        eventType: 'org.subscription.status_changed',
        actorType: 'stripe',
        metadata: {
          previousStatus: String(previous.status ?? ''),
          nextStatus,
        },
      });
    }
  }

  return {
    orgId,
    status: 'processed',
    message: `${event.type} processed`,
  };
}

async function handleInvoiceEvent(sql: ReturnType<typeof getSQL>, event: StripeEvent) {
  const obj = (event.data?.object ?? {}) as Record<string, unknown>;
  const customerId = typeof obj.customer === 'string' ? obj.customer : null;
  if (!customerId) {
    return {
      orgId: null,
      status: 'ignored',
      message: 'invoice event missing customer',
    };
  }

  const rows = await sql`
    SELECT org_id, plan
    FROM subscriptions
    WHERE stripe_customer_id = ${customerId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  const orgId = typeof row?.org_id === 'string' ? row.org_id : null;
  if (!orgId) {
    return {
      orgId: null,
      status: 'ignored',
      message: 'invoice event org resolution failed',
    };
  }

  const nextStatus = event.type === 'invoice.payment_failed' ? 'past_due' : 'active';
  const plan = typeof row?.plan === 'string' ? row.plan : 'unknown';

  await sql`
    INSERT INTO subscriptions (
      org_id,
      stripe_customer_id,
      plan,
      status
    ) VALUES (
      ${orgId},
      ${customerId},
      ${plan},
      ${nextStatus}
    )
  `;
  await syncOrganizationLifecycleFromSubscription(sql, orgId, plan, nextStatus);

  await recordOrgAuditEvent({
    orgId,
    eventType: 'org.subscription.status_changed',
    actorType: 'stripe',
    metadata: {
      via: event.type,
      nextStatus,
    },
  });

  return {
    orgId,
    status: 'processed',
    message: `${event.type} processed`,
  };
}

async function processStripeEvent(sql: ReturnType<typeof getSQL>, event: StripeEvent) {
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      return handleSubscriptionEvent(sql, event);
    case 'invoice.paid':
    case 'invoice.payment_failed':
      return handleInvoiceEvent(sql, event);
    default:
      return {
        orgId: metadataOrgId(event.data?.object && typeof event.data.object === 'object' ? event.data.object.metadata : null),
        status: 'ignored',
        message: `event type ${event.type} ignored`,
      };
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: 'Stripe webhook is not configured' }, { status: 503 });
  }

  const signature = request.headers.get('stripe-signature');
  const rawBody = await request.text();
  if (!verifyStripeSignature(rawBody, signature, webhookSecret)) {
    return NextResponse.json({ error: 'Invalid Stripe signature' }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
  }

  if (!event.id || !event.type) {
    return NextResponse.json({ error: 'Webhook payload missing required fields' }, { status: 400 });
  }

  await ensureOrgScopingTables();
  const sql = getSQL();

  const inserted = await sql`
    INSERT INTO stripe_webhook_events (
      event_id,
      event_type,
      payload
    ) VALUES (
      ${event.id},
      ${event.type},
      ${rawBody}::jsonb
    )
    ON CONFLICT (event_id) DO NOTHING
    RETURNING id
  `;

  if (inserted.length === 0) {
    return NextResponse.json({ status: 'duplicate', eventId: event.id });
  }

  try {
    const outcome = await processStripeEvent(sql, event);
    await sql`
      UPDATE stripe_webhook_events
      SET
        org_id = ${outcome.orgId ?? null},
        processed_at = NOW(),
        processing_status = ${outcome.status},
        message = ${outcome.message}
      WHERE event_id = ${event.id}
    `;
    return NextResponse.json({
      status: outcome.status,
      eventId: event.id,
      orgId: outcome.orgId,
      message: outcome.message,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message.slice(0, 300) : 'Webhook processing failed';
    await sql`
      UPDATE stripe_webhook_events
      SET
        processed_at = NOW(),
        processing_status = 'error',
        message = ${message}
      WHERE event_id = ${event.id}
    `;
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
