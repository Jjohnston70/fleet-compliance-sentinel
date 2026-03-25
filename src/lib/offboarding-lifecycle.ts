import { auditLog } from '@/lib/audit-logger';
import {
  ensureFleetComplianceTables,
  ensureOrgScopingTables,
  getSQL,
} from '@/lib/fleet-compliance-db';
import { recordOrgAuditEvent } from '@/lib/org-audit';

const SOFT_DELETE_DELAY_DAYS = 30;
const HARD_DELETE_OFFSET_DAYS = 30;

type RowCounts = Record<string, number>;

type OffboardingMetadata = {
  canceledAt?: string;
  softDeletedAt?: string;
  hardDeletedAt?: string;
  softDeleteCounts?: RowCounts;
  hardDeleteCounts?: RowCounts;
};

type TableAvailability = Record<string, boolean>;

export type OffboardingSweepSummary = {
  runAt: string;
  orgsEvaluated: number;
  orgsScheduled: number;
  orgsSoftDeleted: number;
  orgsHardDeleted: number;
  softDeleteRowsByTable: RowCounts;
  hardDeleteRowsByTable: RowCounts;
  errors: string[];
};

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

function parseOffboardingMetadata(value: unknown): OffboardingMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const metadata = value as Record<string, unknown>;
  const softDeleteCounts = parseMetadata(metadata.softDeleteCounts);
  const hardDeleteCounts = parseMetadata(metadata.hardDeleteCounts);
  const castCounts = (input: Record<string, unknown>): RowCounts => {
    const output: RowCounts = {};
    for (const [key, raw] of Object.entries(input)) {
      const parsed = Number(raw);
      if (Number.isFinite(parsed) && parsed >= 0) {
        output[key] = parsed;
      }
    }
    return output;
  };

  return {
    canceledAt: typeof metadata.canceledAt === 'string' ? metadata.canceledAt : undefined,
    softDeletedAt: typeof metadata.softDeletedAt === 'string' ? metadata.softDeletedAt : undefined,
    hardDeletedAt: typeof metadata.hardDeletedAt === 'string' ? metadata.hardDeletedAt : undefined,
    softDeleteCounts: castCounts(softDeleteCounts),
    hardDeleteCounts: castCounts(hardDeleteCounts),
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function addCounts(target: RowCounts, source: RowCounts) {
  for (const [table, count] of Object.entries(source)) {
    target[table] = (target[table] ?? 0) + count;
  }
}

async function runSoftDeleteForOrg(orgId: string): Promise<RowCounts> {
  const sql = getSQL();
  const tableAvailability = await getTableAvailability();

  const fleetComplianceRows = tableAvailability.fleet_compliance_records
    ? await sql`
        UPDATE fleet_compliance_records
        SET deleted_at = NOW()
        WHERE org_id = ${orgId}
          AND deleted_at IS NULL
        RETURNING id
      `
    : [];
  const invoiceRows = tableAvailability.invoices
    ? await sql`
        UPDATE invoices
        SET deleted_at = NOW()
        WHERE org_id = ${orgId}
          AND deleted_at IS NULL
        RETURNING id
      `
    : [];

  return {
    fleet_compliance_records: fleetComplianceRows.length,
    invoices: invoiceRows.length,
  };
}

async function runHardDeleteForOrg(orgId: string): Promise<RowCounts> {
  const sql = getSQL();
  const tableAvailability = await getTableAvailability();

  const lineItemRows = tableAvailability.invoice_line_items && tableAvailability.invoices
    ? await sql`
        DELETE FROM invoice_line_items
        WHERE invoice_id IN (
          SELECT id FROM invoices WHERE org_id = ${orgId}
        )
        RETURNING id
      `
    : [];
  const workDescriptionRows = tableAvailability.invoice_work_descriptions && tableAvailability.invoices
    ? await sql`
        DELETE FROM invoice_work_descriptions
        WHERE invoice_id IN (
          SELECT id FROM invoices WHERE org_id = ${orgId}
        )
        RETURNING id
      `
    : [];
  const invoiceRows = tableAvailability.invoices
    ? await sql`
        DELETE FROM invoices
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const fleetComplianceRows = tableAvailability.fleet_compliance_records
    ? await sql`
        DELETE FROM fleet_compliance_records
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const errorEventRows = tableAvailability.fleet_compliance_error_events
    ? await sql`
        DELETE FROM fleet_compliance_error_events
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const cronRows = tableAvailability.cron_log
    ? await sql`
        DELETE FROM cron_log
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const subscriptionRows = tableAvailability.subscriptions
    ? await sql`
        DELETE FROM subscriptions
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const webhookRows = tableAvailability.stripe_webhook_events
    ? await sql`
        DELETE FROM stripe_webhook_events
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];
  const contactRows = tableAvailability.organization_contacts
    ? await sql`
        DELETE FROM organization_contacts
        WHERE org_id = ${orgId}
        RETURNING org_id
      `
    : [];
  const orgAuditRows = tableAvailability.org_audit_events
    ? await sql`
        DELETE FROM org_audit_events
        WHERE org_id = ${orgId}
        RETURNING id
      `
    : [];

  return {
    invoice_line_items: lineItemRows.length,
    invoice_work_descriptions: workDescriptionRows.length,
    invoices: invoiceRows.length,
    fleet_compliance_records: fleetComplianceRows.length,
    fleet_compliance_error_events: errorEventRows.length,
    cron_log: cronRows.length,
    subscriptions: subscriptionRows.length,
    stripe_webhook_events: webhookRows.length,
    organization_contacts: contactRows.length,
    org_audit_events: orgAuditRows.length,
  };
}

let tableAvailabilityCache: TableAvailability | null = null;

async function getTableAvailability(): Promise<TableAvailability> {
  if (tableAvailabilityCache) return tableAvailabilityCache;
  const sql = getSQL();

  const tableNames = [
    'fleet_compliance_records',
    'invoices',
    'invoice_line_items',
    'invoice_work_descriptions',
    'fleet_compliance_error_events',
    'cron_log',
    'subscriptions',
    'stripe_webhook_events',
    'organization_contacts',
    'org_audit_events',
  ];

  const availability: TableAvailability = {};
  for (const tableName of tableNames) {
    const rows = await sql`
      SELECT to_regclass(${`public.${tableName}`}) AS table_ref
    `;
    availability[tableName] = Boolean(rows[0]?.table_ref);
  }

  tableAvailabilityCache = availability;
  return availability;
}

export async function runOffboardingLifecycleSweep(
  now: Date = new Date()
): Promise<OffboardingSweepSummary> {
  tableAvailabilityCache = null;
  await ensureFleetComplianceTables();
  await ensureOrgScopingTables();

  const summary: OffboardingSweepSummary = {
    runAt: now.toISOString(),
    orgsEvaluated: 0,
    orgsScheduled: 0,
    orgsSoftDeleted: 0,
    orgsHardDeleted: 0,
    softDeleteRowsByTable: {},
    hardDeleteRowsByTable: {},
    errors: [],
  };

  const sql = getSQL();
  const orgRows = await sql`
    SELECT id, plan, metadata, data_deletion_scheduled_at
    FROM organizations
    WHERE plan = 'canceled'
       OR data_deletion_scheduled_at IS NOT NULL
    ORDER BY updated_at ASC
  `;

  for (const rawRow of orgRows) {
    const row = rawRow as Record<string, unknown>;
    const orgId = typeof row.id === 'string' ? row.id.trim() : '';
    if (!orgId) continue;

    summary.orgsEvaluated += 1;

    try {
      const orgPlan = String(row.plan ?? '').toLowerCase();
      const metadata = parseMetadata(row.metadata);
      const offboarding = parseOffboardingMetadata(metadata.offboarding);
      let scheduledAt = parseDate(row.data_deletion_scheduled_at);
      const mergedMetadata = { ...metadata };
      let metadataChanged = false;

      if (orgPlan === 'canceled' && !scheduledAt) {
        scheduledAt = addDays(now, SOFT_DELETE_DELAY_DAYS);
        offboarding.canceledAt = offboarding.canceledAt ?? now.toISOString();
        summary.orgsScheduled += 1;
        metadataChanged = true;
        await recordOrgAuditEvent({
          orgId,
          eventType: 'org.offboarding.scheduled',
          actorType: 'system',
          metadata: {
            scheduledFor: scheduledAt.toISOString(),
          },
        });
      }

      if (scheduledAt && !offboarding.softDeletedAt && scheduledAt.getTime() <= now.getTime()) {
        const rowCounts = await runSoftDeleteForOrg(orgId);
        offboarding.softDeletedAt = now.toISOString();
        offboarding.softDeleteCounts = rowCounts;
        summary.orgsSoftDeleted += 1;
        addCounts(summary.softDeleteRowsByTable, rowCounts);
        metadataChanged = true;
        await recordOrgAuditEvent({
          orgId,
          eventType: 'org.offboarding.soft_deleted',
          actorType: 'cron',
          metadata: {
            fleetComplianceRows: rowCounts.fleet_compliance_records ?? 0,
            invoices: rowCounts.invoices ?? 0,
          },
        });
      }

      if (scheduledAt) {
        const hardDeleteAt = addDays(scheduledAt, HARD_DELETE_OFFSET_DAYS);
        if (!offboarding.hardDeletedAt && hardDeleteAt.getTime() <= now.getTime()) {
          auditLog({
            action: 'data.delete',
            userId: 'system',
            orgId,
            resourceType: 'fleet-compliance.offboarding',
            metadata: {
              phase: 'hard-delete',
            },
            severity: 'warn',
          });

          const rowCounts = await runHardDeleteForOrg(orgId);
          offboarding.hardDeletedAt = now.toISOString();
          offboarding.hardDeleteCounts = rowCounts;
          summary.orgsHardDeleted += 1;
          addCounts(summary.hardDeleteRowsByTable, rowCounts);
          metadataChanged = true;
        }
      }

      if (metadataChanged) {
        mergedMetadata.offboarding = offboarding;
        await sql`
          UPDATE organizations
          SET
            metadata = ${JSON.stringify(mergedMetadata)}::jsonb,
            data_deletion_scheduled_at = ${scheduledAt ? scheduledAt.toISOString() : null},
            updated_at = NOW()
          WHERE id = ${orgId}
        `;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      summary.errors.push(`[${orgId}] ${message.slice(0, 300)}`);
    }
  }

  return summary;
}
