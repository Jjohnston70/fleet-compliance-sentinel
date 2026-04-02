import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { dueWindowDays, toIsoDateOnly } from '@/lib/hazmat-training';
import { toCsv, toSimplePdf } from '@/lib/training-report-export';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function normalizeDateFilter(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orgId: string }> },
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

  const { orgId: orgIdFromPath } = await params;
  if (orgIdFromPath.trim() !== orgId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const format = (searchParams.get('format') || 'json').trim().toLowerCase();
  const employeeId = (searchParams.get('employee_id') || '').trim();
  const moduleCode = (searchParams.get('module_code') || '').trim().toUpperCase();
  const status = (searchParams.get('status') || '').trim().toLowerCase();
  const creditPathway = (searchParams.get('credit_pathway') || '').trim();
  const startDate = normalizeDateFilter(searchParams.get('start_date') || '');
  const endDate = normalizeDateFilter(searchParams.get('end_date') || '');

  if (role !== 'admin' && employeeId && employeeId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  const effectiveEmployeeId = role === 'admin' ? (employeeId || null) : userId;

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const rows = await sql`
    SELECT
      hr.id,
      hr.employee_id,
      COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
      hr.module_code,
      hr.module_title,
      hr.module_category,
      hr.status,
      hr.credit_pathway,
      hr.completion_date,
      hr.next_due_date,
      hr.certificate_url,
      hm.cfr_reference,
      hm.phmsa_equivalent
    FROM hazmat_training_records hr
    LEFT JOIN hazmat_training_modules hm ON hm.module_code = hr.module_code
    WHERE hr.org_id = ${orgId}
      AND (${effectiveEmployeeId}::text IS NULL OR hr.employee_id = ${effectiveEmployeeId})
      AND (${moduleCode || null}::text IS NULL OR UPPER(hr.module_code) = ${moduleCode || null})
      AND (${status || null}::text IS NULL OR LOWER(hr.status) = ${status || null})
      AND (${creditPathway || null}::text IS NULL OR hr.credit_pathway = ${creditPathway || null})
      AND (${startDate || null}::text IS NULL OR hr.completion_date >= ${startDate || null}::timestamptz)
      AND (${endDate || null}::text IS NULL OR hr.completion_date < (${endDate || null}::date + INTERVAL '1 day'))
    ORDER BY hr.next_due_date NULLS LAST, hr.employee_id, hr.module_code
    LIMIT 2000
  `;

  const reportRows = rows.map((row) => ({
    id: String(row.id),
    employee_id: String(row.employee_id || ''),
    employee_name: String(row.employee_name || ''),
    module_code: String(row.module_code || ''),
    module_title: String(row.module_title || ''),
    module_category: String(row.module_category || ''),
    cfr_reference: row.cfr_reference ? String(row.cfr_reference) : null,
    phmsa_equivalent: row.phmsa_equivalent ? String(row.phmsa_equivalent) : null,
    status: String(row.status || ''),
    credit_pathway: row.credit_pathway ? String(row.credit_pathway) : null,
    completion_date: toIsoDateOnly(row.completion_date),
    next_due_date: toIsoDateOnly(row.next_due_date),
    days_until_due: dueWindowDays(row.next_due_date),
    certificate_status: row.certificate_url ? 'available' : 'missing',
    certificate_url: row.certificate_url ? String(row.certificate_url) : null,
  }));

  const summary = {
    total_rows: reportRows.length,
    complete: reportRows.filter((row) => row.status === 'complete').length,
    delinquent: reportRows.filter((row) => row.days_until_due !== null && row.days_until_due < 0).length,
    at_risk: reportRows.filter((row) => row.days_until_due !== null && row.days_until_due >= 0 && row.days_until_due <= 90).length,
    missing_certificates: reportRows.filter((row) => row.certificate_status === 'missing').length,
  };

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'hazmat-training.report',
    metadata: {
      role,
      rows: reportRows.length,
      format,
      ...(effectiveEmployeeId ? { filteredEmployeeId: effectiveEmployeeId } : {}),
      ...(moduleCode ? { moduleCode } : {}),
      ...(status ? { status } : {}),
      ...(creditPathway ? { creditPathway } : {}),
    },
  });

  if (format === 'csv') {
    const headers = [
      'employee_id',
      'employee_name',
      'module_code',
      'module_title',
      'module_category',
      'cfr_reference',
      'phmsa_equivalent',
      'status',
      'credit_pathway',
      'completion_date',
      'next_due_date',
      'days_until_due',
      'certificate_status',
      'certificate_url',
    ];
    const csv = toCsv(headers, reportRows);
    const datePart = new Date().toISOString().slice(0, 10);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hazmat_training_report_${datePart}.csv"`,
      },
    });
  }

  if (format === 'pdf') {
    const datePart = new Date().toISOString().slice(0, 10);
    const visibleRows = reportRows.slice(0, 30);
    const notice = reportRows.length > visibleRows.length
      ? `NOTICE: Showing ${visibleRows.length} of ${reportRows.length} rows. Use CSV export for complete data.`
      : null;
    const lines = [
      `Organization: ${orgId}`,
      `Generated: ${new Date().toISOString()}`,
      `Rows: ${reportRows.length}`,
      `Complete: ${summary.complete} | At Risk: ${summary.at_risk} | Delinquent: ${summary.delinquent}`,
      ...(notice ? [notice] : []),
      ...visibleRows.map((row) => (
        `${row.employee_name} | ${row.module_code} | ${row.status} | due ${row.next_due_date || 'n/a'} | cert ${row.certificate_status}`
      )),
    ];
    const pdf = toSimplePdf('Hazmat Training Report', lines);
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="hazmat_training_report_${datePart}.pdf"`,
      },
    });
  }

  return Response.json({
    org_id: orgId,
    generated_at: new Date().toISOString(),
    filters: {
      employee_id: effectiveEmployeeId,
      module_code: moduleCode || null,
      status: status || null,
      credit_pathway: creditPathway || null,
      start_date: startDate || null,
      end_date: endDate || null,
    },
    summary,
    rows: reportRows,
  });
}
