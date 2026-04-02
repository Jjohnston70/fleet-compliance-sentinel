import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const recordSummaryRows = await sql`
    SELECT
      COUNT(*)::int AS total_records,
      COUNT(*) FILTER (WHERE status = 'complete')::int AS complete_records,
      COUNT(*) FILTER (WHERE next_due_date IS NOT NULL AND next_due_date < NOW())::int AS delinquent_records,
      COUNT(*) FILTER (
        WHERE next_due_date IS NOT NULL
          AND next_due_date >= NOW()
          AND next_due_date <= NOW() + (90 * INTERVAL '1 day')
      )::int AS at_risk_records,
      COUNT(*) FILTER (WHERE certificate_url IS NULL)::int AS missing_certificate_records,
      COUNT(DISTINCT employee_id)::int AS tracked_employees
    FROM hazmat_training_records
    WHERE org_id = ${orgId}
  `;

  const employeeSummaryRows = await sql`
    WITH required_modules AS (
      SELECT module_code
      FROM hazmat_training_modules
      WHERE module_category = 'required'
    ),
    tracked_employees AS (
      SELECT DISTINCT employee_id
      FROM hazmat_training_records
      WHERE org_id = ${orgId}
    ),
    per_employee AS (
      SELECT
        te.employee_id,
        COUNT(rm.module_code)::int AS required_total,
        COUNT(*) FILTER (
          WHERE hr.status = 'complete'
            AND (hr.next_due_date IS NULL OR hr.next_due_date >= NOW())
        )::int AS required_complete,
        COUNT(*) FILTER (
          WHERE hr.next_due_date IS NOT NULL
            AND hr.next_due_date < NOW()
        )::int AS overdue_required,
        COUNT(*) FILTER (
          WHERE hr.next_due_date IS NOT NULL
            AND hr.next_due_date >= NOW()
            AND hr.next_due_date <= NOW() + (90 * INTERVAL '1 day')
        )::int AS due_soon_required
      FROM tracked_employees te
      CROSS JOIN required_modules rm
      LEFT JOIN hazmat_training_records hr
        ON hr.org_id = ${orgId}
       AND hr.employee_id = te.employee_id
       AND hr.module_code = rm.module_code
      GROUP BY te.employee_id
    )
    SELECT
      COUNT(*)::int AS tracked_employees,
      COUNT(*) FILTER (
        WHERE required_total > 0
          AND required_complete = required_total
      )::int AS compliant_employees,
      COUNT(*) FILTER (
        WHERE overdue_required > 0
      )::int AS delinquent_employees,
      COUNT(*) FILTER (
        WHERE overdue_required = 0
          AND due_soon_required > 0
      )::int AS at_risk_employees
    FROM per_employee
  `;

  const recordSummary = recordSummaryRows[0] || {};
  const employeeSummary = employeeSummaryRows[0] || {};

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'hazmat-training.summary',
    metadata: {
      trackedEmployees: Number(recordSummary.tracked_employees || 0),
      totalRecords: Number(recordSummary.total_records || 0),
    },
  });

  return Response.json({
    org_id: orgId,
    generated_at: new Date().toISOString(),
    records: {
      total: Number(recordSummary.total_records || 0),
      complete: Number(recordSummary.complete_records || 0),
      at_risk: Number(recordSummary.at_risk_records || 0),
      delinquent: Number(recordSummary.delinquent_records || 0),
      missing_certificate: Number(recordSummary.missing_certificate_records || 0),
    },
    employees: {
      tracked: Number(employeeSummary.tracked_employees || 0),
      compliant: Number(employeeSummary.compliant_employees || 0),
      at_risk: Number(employeeSummary.at_risk_employees || 0),
      delinquent: Number(employeeSummary.delinquent_employees || 0),
    },
  });
}
