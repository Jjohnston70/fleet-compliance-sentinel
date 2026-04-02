import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getOrganizationName, getSQL } from '@/lib/fleet-compliance-db';
import { toCsv, toSimplePdf } from '@/lib/training-report-export';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ReportType = 'org_completion' | 'employee_transcript' | 'audit_package' | 'hours';
type ReportFormat = 'json' | 'csv' | 'pdf';
const DOT_CERTIFICATION_STATEMENT = 'Employee has been trained and tested per 49 CFR 172.704(a).';
const DOT_TRAINER_NAME = process.env.FLEET_COMPLIANCE_TRAINER_NAME || 'True North Data Strategies';
const DOT_TRAINER_ADDRESS = process.env.FLEET_COMPLIANCE_TRAINER_ADDRESS || 'Trainer address not configured';

function toIsoDate(value: unknown): string {
  if (!value) return '';
  const raw = String(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
}

function ensureReportType(value: string | null): ReportType {
  if (value === 'employee_transcript') return value;
  if (value === 'audit_package') return value;
  if (value === 'hours') return value;
  return 'org_completion';
}

function ensureFormat(value: string | null): ReportFormat {
  if (value === 'csv') return value;
  if (value === 'pdf') return value;
  return 'json';
}

function buildPdfTruncationNotice(shown: number, total: number): string | null {
  if (total <= shown) return null;
  return `NOTICE: Showing ${shown} of ${total} rows. Use CSV export for complete data.`;
}

function buildTrainingMaterialsDescription(input: {
  moduleTitle: string;
  cfrReference: string;
  phmsaEquivalent: string;
}): string {
  const title = input.moduleTitle || 'Hazmat training module';
  const cfrReference = input.cfrReference || '49 CFR 172 Subpart H';
  const phmsaEquivalent = input.phmsaEquivalent || 'PHMSA-equivalent module';
  return `${title}; CFR scope ${cfrReference}; ${phmsaEquivalent}`;
}

export async function GET(request: Request) {
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

  const { searchParams } = new URL(request.url);
  const reportType = ensureReportType(searchParams.get('type'));
  const format = ensureFormat(searchParams.get('format'));
  const requestedEmployeeId = (searchParams.get('employee_id') || '').trim();
  const employeeId = requestedEmployeeId || userId;

  if (role !== 'admin') {
    if (reportType !== 'employee_transcript') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (requestedEmployeeId && requestedEmployeeId !== userId) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);
  const orgName = await getOrganizationName(orgId) || orgId;
  const exportDate = new Date().toISOString().slice(0, 10);

  if (reportType === 'org_completion') {
    const rows = await sql`
      SELECT
        hr.employee_id,
        COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
        hr.module_code,
        hr.module_title,
        hr.status,
        hr.credit_pathway,
        hr.completion_date,
        hr.next_due_date,
        hr.certificate_url,
        score.assessment_score
      FROM hazmat_training_records hr
      LEFT JOIN LATERAL (
        SELECT tp.assessment_score
        FROM training_progress tp
        JOIN training_assignments ta ON ta.id = tp.assignment_id
        WHERE ta.org_id = ${orgId}
          AND ta.employee_id = hr.employee_id
          AND tp.module_code = hr.module_code
          AND tp.assessment_score IS NOT NULL
        ORDER BY tp.updated_at DESC
        LIMIT 1
      ) score ON TRUE
      WHERE hr.org_id = ${orgId}
      ORDER BY hr.employee_id, hr.module_code
    `;
    const normalized = rows.map((row) => ({
      employee_id: String(row.employee_id || ''),
      employee_name: String(row.employee_name || ''),
      module_code: String(row.module_code || ''),
      module_title: String(row.module_title || ''),
      status: String(row.status || ''),
      credit_pathway: String(row.credit_pathway || ''),
      completion_date: toIsoDate(row.completion_date),
      next_due_date: toIsoDate(row.next_due_date),
      assessment_score: row.assessment_score === null || row.assessment_score === undefined ? '' : Number(row.assessment_score),
      certificate_status: row.certificate_url ? 'available' : 'missing',
    }));

    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'training.reports.org_completion',
      metadata: { format, rows: normalized.length },
    });

    if (format === 'csv') {
      const headers = [
        'employee_id', 'employee_name', 'module_code', 'module_title', 'status',
        'credit_pathway', 'completion_date', 'next_due_date', 'assessment_score', 'certificate_status',
      ];
      const csv = toCsv(headers, normalized);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="training_org_completion_${exportDate}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      const visibleRows = normalized.slice(0, 32);
      const truncationNotice = buildPdfTruncationNotice(visibleRows.length, normalized.length);
      const lines = [
        `Organization: ${orgName}`,
        `Report Date: ${exportDate}`,
        `Rows: ${normalized.length}`,
        ...(truncationNotice ? [truncationNotice] : []),
        ...visibleRows.map((row) =>
          `${row.employee_name} | ${row.module_code} | ${row.status} | due ${row.next_due_date || 'n/a'} | cert ${row.certificate_status}`
        ),
      ];
      const pdf = toSimplePdf('Training Compliance Report', lines);
      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="training_org_completion_${exportDate}.pdf"`,
        },
      });
    }

    return Response.json({
      report_type: reportType,
      generated_at: new Date().toISOString(),
      org_name: orgName,
      rows: normalized,
    });
  }

  if (reportType === 'employee_transcript') {
    const rows = await sql`
      SELECT
        hr.employee_id,
        COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
        hr.module_code,
        hr.module_title,
        hr.status,
        hr.credit_pathway,
        hr.completion_date,
        hr.next_due_date,
        hr.certificate_url,
        tp.attempts_count,
        tp.time_spent_seconds,
        tp.assessment_score
      FROM hazmat_training_records hr
      LEFT JOIN LATERAL (
        SELECT
          progress.attempts_count,
          progress.time_spent_seconds,
          progress.assessment_score
        FROM training_progress progress
        JOIN training_assignments ta ON ta.id = progress.assignment_id
        WHERE ta.org_id = ${orgId}
          AND ta.employee_id = hr.employee_id
          AND progress.module_code = hr.module_code
        ORDER BY progress.updated_at DESC
        LIMIT 1
      ) tp ON TRUE
      WHERE hr.org_id = ${orgId}
        AND hr.employee_id = ${employeeId}
      ORDER BY hr.module_code
    `;
    const normalized = rows.map((row) => ({
      employee_id: String(row.employee_id || ''),
      employee_name: String(row.employee_name || ''),
      module_code: String(row.module_code || ''),
      module_title: String(row.module_title || ''),
      status: String(row.status || ''),
      credit_pathway: String(row.credit_pathway || ''),
      completion_date: toIsoDate(row.completion_date),
      next_due_date: toIsoDate(row.next_due_date),
      assessment_score: row.assessment_score === null || row.assessment_score === undefined ? '' : Number(row.assessment_score),
      attempts_count: row.attempts_count === null || row.attempts_count === undefined ? '' : Number(row.attempts_count),
      time_spent_seconds: row.time_spent_seconds === null || row.time_spent_seconds === undefined ? '' : Number(row.time_spent_seconds),
      certificate_status: row.certificate_url ? 'available' : 'missing',
    }));

    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'training.reports.employee_transcript',
      metadata: { format, employeeId, rows: normalized.length },
    });

    if (format === 'csv') {
      const headers = [
        'employee_id', 'employee_name', 'module_code', 'module_title', 'status',
        'credit_pathway', 'completion_date', 'next_due_date', 'assessment_score',
        'attempts_count', 'time_spent_seconds', 'certificate_status',
      ];
      const csv = toCsv(headers, normalized);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="training_transcript_${employeeId}_${exportDate}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      const employeeName = normalized[0]?.employee_name || employeeId;
      const visibleRows = normalized.slice(0, 32);
      const truncationNotice = buildPdfTruncationNotice(visibleRows.length, normalized.length);
      const lines = [
        `Organization: ${orgName}`,
        `Employee: ${employeeName} (${employeeId})`,
        `Report Date: ${exportDate}`,
        ...(truncationNotice ? [truncationNotice] : []),
        ...visibleRows.map((row) =>
          `${row.module_code} | ${row.status} | score ${row.assessment_score || 'n/a'} | due ${row.next_due_date || 'n/a'}`
        ),
      ];
      const pdf = toSimplePdf('Training Employee Transcript', lines);
      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="training_transcript_${employeeId}_${exportDate}.pdf"`,
        },
      });
    }

    return Response.json({
      report_type: reportType,
      generated_at: new Date().toISOString(),
      employee_id: employeeId,
      rows: normalized,
    });
  }

  if (reportType === 'hours') {
    const rows = await sql`
      SELECT
        ta.employee_id,
        COUNT(*)::int AS module_rows,
        COUNT(*) FILTER (WHERE COALESCE(tp.assessment_passed, FALSE) = TRUE)::int AS modules_passed,
        COALESCE(SUM(COALESCE(tp.time_spent_seconds, 0)), 0)::int AS time_spent_seconds
      FROM training_assignments ta
      JOIN training_progress tp ON tp.assignment_id = ta.id
      WHERE ta.org_id = ${orgId}
      GROUP BY ta.employee_id
      ORDER BY ta.employee_id
    `;
    const normalized = rows.map((row) => ({
      employee_id: String(row.employee_id || ''),
      module_rows: Number(row.module_rows || 0),
      modules_passed: Number(row.modules_passed || 0),
      time_spent_seconds: Number(row.time_spent_seconds || 0),
      training_hours: Number((Number(row.time_spent_seconds || 0) / 3600).toFixed(2)),
    }));

    auditLog({
      action: 'data.read',
      userId,
      orgId,
      resourceType: 'training.reports.hours',
      metadata: { format, rows: normalized.length },
    });

    if (format === 'csv') {
      const headers = ['employee_id', 'module_rows', 'modules_passed', 'time_spent_seconds', 'training_hours'];
      const csv = toCsv(headers, normalized);
      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="training_hours_${exportDate}.csv"`,
        },
      });
    }

    if (format === 'pdf') {
      const visibleRows = normalized.slice(0, 34);
      const truncationNotice = buildPdfTruncationNotice(visibleRows.length, normalized.length);
      const lines = [
        `Organization: ${orgName}`,
        `Report Date: ${exportDate}`,
        ...(truncationNotice ? [truncationNotice] : []),
        ...visibleRows.map((row) =>
          `${row.employee_id} | modules ${row.modules_passed}/${row.module_rows} | ${row.training_hours} hours`
        ),
      ];
      const pdf = toSimplePdf('Training Hours Report', lines);
      return new Response(new Uint8Array(pdf), {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="training_hours_${exportDate}.pdf"`,
        },
      });
    }

    return Response.json({
      report_type: reportType,
      generated_at: new Date().toISOString(),
      rows: normalized,
    });
  }

  const completionRows = await sql`
    SELECT
      hr.employee_id,
      COALESCE(hr.employee_name, hr.employee_id) AS employee_name,
      hr.module_code,
      hr.module_title,
      hr.status,
      hr.credit_pathway,
      hr.completion_date,
      hr.next_due_date,
      hr.certificate_url,
      hm.cfr_reference,
      hm.phmsa_equivalent
    FROM hazmat_training_records hr
    LEFT JOIN hazmat_training_modules hm
      ON hm.module_code = hr.module_code
    WHERE hr.org_id = ${orgId}
    ORDER BY hr.employee_id, hr.module_code
  `;
  const overdue = completionRows.filter((row) => {
    const due = toIsoDate(row.next_due_date);
    return due && due < exportDate;
  });
  const missingCertificates = completionRows.filter((row) => !row.certificate_url);

  const auditRows = completionRows.map((row) => ({
    employee_id: String(row.employee_id || ''),
    employee_name: String(row.employee_name || ''),
    module_code: String(row.module_code || ''),
    module_title: String(row.module_title || ''),
    status: String(row.status || ''),
    credit_pathway: String(row.credit_pathway || ''),
    completion_date: toIsoDate(row.completion_date),
    next_due_date: toIsoDate(row.next_due_date),
    cfr_reference: String(row.cfr_reference || ''),
    phmsa_equivalent: String(row.phmsa_equivalent || ''),
    training_materials_description: buildTrainingMaterialsDescription({
      moduleTitle: String(row.module_title || ''),
      cfrReference: String(row.cfr_reference || ''),
      phmsaEquivalent: String(row.phmsa_equivalent || ''),
    }),
    trainer_name: DOT_TRAINER_NAME,
    trainer_address: DOT_TRAINER_ADDRESS,
    certification_statement: DOT_CERTIFICATION_STATEMENT,
    certificate_status: row.certificate_url ? 'available' : 'missing',
  }));

  auditLog({
    action: 'data.read',
    userId,
    orgId,
    resourceType: 'training.reports.audit_package',
    metadata: { format, rows: auditRows.length },
  });

  if (format === 'csv') {
    const headers = [
      'employee_id',
      'employee_name',
      'module_code',
      'module_title',
      'status',
      'credit_pathway',
      'completion_date',
      'next_due_date',
      'cfr_reference',
      'phmsa_equivalent',
      'training_materials_description',
      'trainer_name',
      'trainer_address',
      'certification_statement',
      'certificate_status',
    ];
    const csv = toCsv(headers, auditRows);
    return new Response(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="training_audit_package_${exportDate}.csv"`,
      },
    });
  }

  if (format === 'pdf') {
    const visibleRows = auditRows.slice(0, 30);
    const truncationNotice = buildPdfTruncationNotice(visibleRows.length, auditRows.length);
    const lines = [
      `Organization: ${orgName}`,
      `Report Date: ${exportDate}`,
      `Total Records: ${auditRows.length}`,
      `Overdue Items: ${overdue.length}`,
      `Missing Certificates: ${missingCertificates.length}`,
      `Trainer of Record: ${DOT_TRAINER_NAME} | ${DOT_TRAINER_ADDRESS}`,
      `Certification: ${DOT_CERTIFICATION_STATEMENT}`,
      ...(truncationNotice ? [truncationNotice] : []),
      ...visibleRows.map((row) =>
        `${row.employee_name} | ${row.module_code} | ${row.status} | completed ${row.completion_date || 'n/a'} | due ${row.next_due_date || 'n/a'} | cert ${row.certificate_status}`
      ),
    ];
    const pdf = toSimplePdf('DOT Audit Training Package', lines);
    return new Response(new Uint8Array(pdf), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="training_audit_package_${exportDate}.pdf"`,
      },
    });
  }

  return Response.json({
    report_type: reportType,
    generated_at: new Date().toISOString(),
    summary: {
      total_records: auditRows.length,
      overdue_items: overdue.length,
      missing_certificates: missingCertificates.length,
    },
    rows: auditRows,
  });
}
