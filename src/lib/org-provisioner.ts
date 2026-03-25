import { getSQL, ensureOrgScopingTables } from '@/lib/chief-db';
import { recordOrgAuditEvent } from '@/lib/org-audit';

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
  return trimmed.length > 0 ? trimmed.slice(0, 160) : 'Chief Organization';
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

export async function ensureOrgProvisioned(orgId: string, orgName: string): Promise<OrganizationRecord> {
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
  await recordOrgAuditEvent({
    orgId,
    eventType: 'org.provisioned',
    actorType: 'system',
    metadata: {
      plan: row.plan,
      onboardingComplete: row.onboardingComplete,
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
