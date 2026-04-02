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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  let userId: string;
  let orgId: string;
  let role: 'admin' | 'member';
  try {
    ({ userId, orgId, role } = await requireFleetComplianceOrgContext(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { employeeId: rawEmployeeId } = await params;
  const employeeId = rawEmployeeId.trim();
  if (!employeeId) {
    return Response.json({ error: 'employee_id is required' }, { status: 400 });
  }
  if (role !== 'admin' && employeeId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const rows = await sql`
    SELECT
      hr.id,
      hr.employee_id,
      COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
      hr.employee_email,
      hr.module_code,
      hr.module_title,
      hr.module_category,
      hr.status,
      hr.credit_pathway,
      hr.completion_date,
      hr.training_window_start,
      hr.training_window_end,
      hr.recurrence_cycle_years,
      hr.next_due_date,
      hr.certificate_url,
      hr.certificate_uploaded_at,
      hr.notes,
      hm.cfr_reference,
      hm.phmsa_equivalent,
      hm.sort_order
    FROM hazmat_training_records hr
    LEFT JOIN hazmat_training_modules hm ON hm.module_code = hr.module_code
    WHERE hr.org_id = ${orgId}
      AND hr.employee_id = ${employeeId}
    ORDER BY COALESCE(hm.sort_order, 9999), hr.module_code
  `;

  const records = rows.map((row) => ({
    id: String(row.id),
    employee_id: String(row.employee_id || ''),
    employee_name: String(row.employee_name || ''),
    employee_email: row.employee_email ? String(row.employee_email) : null,
    module_code: String(row.module_code || ''),
    module_title: String(row.module_title || ''),
    module_category: String(row.module_category || ''),
    cfr_reference: row.cfr_reference ? String(row.cfr_reference) : null,
    phmsa_equivalent: row.phmsa_equivalent ? String(row.phmsa_equivalent) : null,
    status: String(row.status || ''),
    credit_pathway: row.credit_pathway ? String(row.credit_pathway) : null,
    completion_date: toIsoDateOnly(row.completion_date),
    training_window_start: toIsoDateOnly(row.training_window_start),
    training_window_end: toIsoDateOnly(row.training_window_end),
    recurrence_cycle_years: Number(row.recurrence_cycle_years || 3),
    next_due_date: toIsoDateOnly(row.next_due_date),
    days_until_due: dueWindowDays(row.next_due_date),
    certificate_url: row.certificate_url ? String(row.certificate_url) : null,
    certificate_uploaded_at: toIsoDateOnly(row.certificate_uploaded_at),
    notes: row.notes ? String(row.notes) : '',
  }));

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'hazmat-training.employee',
    metadata: {
      employeeId,
      role,
      rows: records.length,
    },
  });

  return Response.json({
    employee_id: employeeId,
    rows: records,
  });
}
