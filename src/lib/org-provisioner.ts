import { clerkClient } from '@clerk/nextjs/server';
import { getSQL, ensureOrgScopingTables } from '@/lib/fleet-compliance-db';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import { getStripeClient } from '@/lib/stripe';

export interface OrganizationRecord {
  id: string;
  name: string;
  plan: string;
  trialStartedAt: Date | null;
  trialEndsAt: Date | null;
  onboardingComplete: boolean;
  metadata: Record<string, unknown>;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface OrganizationContactRecord {
  orgId: string;
  primaryContact: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface EnsureOrgProvisionedOptions {
  adminEmail?: string | null;
  adminUserId?: string | null;
}

function parseDate(value: unknown): Date | null {
  if (!value) return null;
  const parsed = new Date(String(value));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) return value as Record<string, unknown>;
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

function normalizeOrgName(orgName: string): string {
  const trimmed = orgName.trim();
  return trimmed.length > 0 ? trimmed.slice(0, 160) : 'Fleet-Compliance Organization';
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed.slice(0, 320) : null;
}

async function resolveClerkUserEmail(userId: string): Promise<string | null> {
  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const primary = normalizeEmail(user.primaryEmailAddress?.emailAddress);
  if (primary) return primary;
  for (const item of user.emailAddresses ?? []) {
    const value = normalizeEmail(item.emailAddress);
    if (value) return value;
  }
  return null;
}

function mapOrgRow(row: Record<string, unknown>): OrganizationRecord {
  return {
    id: String(row.id),
    name: String(row.name ?? ''),
    plan: String(row.plan ?? 'trial'),
    trialStartedAt: parseDate(row.trial_started_at),
    trialEndsAt: parseDate(row.trial_ends_at),
    onboardingComplete: Boolean(row.onboarding_complete),
    metadata: parseMetadata(row.metadata),
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}

export async function ensureOrgProvisioned(
  orgId: string,
  orgName: string,
  options: EnsureOrgProvisionedOptions = {},
): Promise<OrganizationRecord> {
  await ensureOrgScopingTables();
  const sql = getSQL();
  const safeOrgName = normalizeOrgName(orgName);

  const existing = await sql`
    SELECT
      id,
      name,
      plan,
      trial_started_at,
      trial_ends_at,
      onboarding_complete,
      metadata,
      created_at,
      updated_at
    FROM organizations
    WHERE id = ${orgId}
    LIMIT 1
  `;
  if (existing.length > 0) {
    return mapOrgRow(existing[0] as Record<string, unknown>);
  }

  const inserted = await sql`
    INSERT INTO organizations (
      id,
      name,
      plan,
      trial_started_at,
      trial_ends_at,
      onboarding_complete
    ) VALUES (
      ${orgId},
      ${safeOrgName},
      'trial',
      NOW(),
      NOW() + INTERVAL '30 days',
      FALSE
    )
    ON CONFLICT (id) DO UPDATE
      SET name = COALESCE(NULLIF(organizations.name, ''), EXCLUDED.name),
          updated_at = NOW()
    RETURNING
      id,
      name,
      plan,
      trial_started_at,
      trial_ends_at,
      onboarding_complete,
      metadata,
      created_at,
      updated_at
  `;

  const row = mapOrgRow(inserted[0] as Record<string, unknown>);
  const existingSubscriptionRows = await sql`
    SELECT id, stripe_customer_id
    FROM subscriptions
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const existingSubscriptionId = Number(existingSubscriptionRows[0]?.id);
  const existingStripeCustomerId = typeof existingSubscriptionRows[0]?.stripe_customer_id === 'string'
    ? existingSubscriptionRows[0].stripe_customer_id.trim()
    : '';

  if (existingStripeCustomerId) {
    return row;
  }

  const adminEmail = normalizeEmail(options.adminEmail)
    ?? (options.adminUserId ? await resolveClerkUserEmail(options.adminUserId) : null);
  const stripe = getStripeClient();

  if (!stripe) {
    if (!(Number.isFinite(existingSubscriptionId) && existingSubscriptionId > 0)) {
      await sql`
        INSERT INTO subscriptions (
          org_id,
          plan,
          status,
          current_period_ends_at
        ) VALUES (
          ${orgId},
          'trial',
          'trialing',
          ${row.trialEndsAt ? row.trialEndsAt.toISOString() : null}
        )
      `;
    }
    await recordOrgAuditEvent({
      orgId,
      eventType: 'org.provisioned',
      actorType: 'system',
      metadata: {
        plan: row.plan,
        onboardingComplete: row.onboardingComplete,
        stripeConfigured: false,
      },
    });
    return row;
  }

  const customer = await stripe.customers.create({
    name: row.name,
    email: adminEmail ?? undefined,
    metadata: {
      org_id: orgId,
      user_id: options.adminUserId ?? '',
    },
  });

  if (Number.isFinite(existingSubscriptionId) && existingSubscriptionId > 0) {
    await sql`
      UPDATE subscriptions
      SET stripe_customer_id = ${customer.id}
      WHERE id = ${existingSubscriptionId}
    `;
  } else {
    await sql`
      INSERT INTO subscriptions (
        org_id,
        stripe_customer_id,
        plan,
        status,
        current_period_ends_at
      ) VALUES (
        ${orgId},
        ${customer.id},
        'trial',
        'trialing',
        ${row.trialEndsAt ? row.trialEndsAt.toISOString() : null}
      )
    `;
  }

  await recordOrgAuditEvent({
    orgId,
    eventType: 'org.provisioned',
    actorType: 'system',
    metadata: {
      plan: row.plan,
      onboardingComplete: row.onboardingComplete,
      stripeCustomerId: customer.id,
      stripeConfigured: true,
    },
  });
  return row;
}

export async function getOrganizationContact(orgId: string): Promise<OrganizationContactRecord | null> {
  await ensureOrgScopingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT org_id, primary_contact, created_at, updated_at
    FROM organization_contacts
    WHERE org_id = ${orgId}
    LIMIT 1
  `;
  const row = rows[0] as Record<string, unknown> | undefined;
  if (!row) return null;
  return {
    orgId: String(row.org_id),
    primaryContact: String(row.primary_contact ?? ''),
    createdAt: parseDate(row.created_at),
    updatedAt: parseDate(row.updated_at),
  };
}
