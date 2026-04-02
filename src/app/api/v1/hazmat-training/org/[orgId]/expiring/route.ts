import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { dueWindowDays, toIsoDateOnly } from '@/lib/hazmat-training';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function parseDays(value: string | null): number {
  const parsed = Number(value || '90');
  if (!Number.isFinite(parsed)) return 90;
  return Math.min(365, Math.max(1, Math.floor(parsed)));
}

function parseBool(value: string | null): boolean {
  if (!value) return false;
  return ['1', 'true', 'yes', 'y'].includes(value.trim().toLowerCase());
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgContext(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { orgId: orgIdFromPath } = await params;
  if (orgIdFromPath.trim() !== orgId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseDays(searchParams.get('days'));
  const includeOverdue = parseBool(searchParams.get('include_overdue'));

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const rows = includeOverdue
    ? await sql`
      SELECT
        hr.id,
        hr.employee_id,
        COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
        hr.module_code,
        hr.module_title,
        hr.status,
        hr.next_due_date,
        hr.certificate_url,
        hm.module_category,
        hm.cfr_reference
      FROM hazmat_training_records hr
      LEFT JOIN hazmat_training_modules hm ON hm.module_code = hr.module_code
      WHERE hr.org_id = ${orgId}
        AND hr.next_due_date IS NOT NULL
        AND hr.next_due_date <= NOW() + (${days} * INTERVAL '1 day')
      ORDER BY hr.next_due_date ASC
      LIMIT 500
    `
    : await sql`
      SELECT
        hr.id,
        hr.employee_id,
        COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
        hr.module_code,
        hr.module_title,
        hr.status,
        hr.next_due_date,
        hr.certificate_url,
        hm.module_category,
        hm.cfr_reference
      FROM hazmat_training_records hr
      LEFT JOIN hazmat_training_modules hm ON hm.module_code = hr.module_code
      WHERE hr.org_id = ${orgId}
        AND hr.next_due_date IS NOT NULL
        AND hr.next_due_date >= NOW()
        AND hr.next_due_date <= NOW() + (${days} * INTERVAL '1 day')
      ORDER BY hr.next_due_date ASC
      LIMIT 500
    `;

  const expiring = rows.map((row) => ({
    id: String(row.id),
    employee_id: String(row.employee_id || ''),
    employee_name: String(row.employee_name || ''),
    module_code: String(row.module_code || ''),
    module_title: String(row.module_title || ''),
    module_category: row.module_category ? String(row.module_category) : null,
    cfr_reference: row.cfr_reference ? String(row.cfr_reference) : null,
    status: String(row.status || ''),
    next_due_date: toIsoDateOnly(row.next_due_date),
    days_until_due: dueWindowDays(row.next_due_date),
    certificate_status: row.certificate_url ? 'available' : 'missing',
  }));

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'hazmat-training.expiring',
    metadata: {
      days,
      includeOverdue,
      rows: expiring.length,
    },
  });

  return Response.json({
    org_id: orgId,
    generated_at: new Date().toISOString(),
    days_window: days,
    include_overdue: includeOverdue,
    rows: expiring,
  });
}
