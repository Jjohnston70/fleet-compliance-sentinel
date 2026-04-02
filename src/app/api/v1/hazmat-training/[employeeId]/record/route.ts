import { clerkClient } from '@clerk/nextjs/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  computeNextDueDate,
  isValidHazmatModuleCode,
  normalizeIsoDateInput,
  normalizeModuleCode,
  resolveModuleFallback,
  toIsoDateOnly,
} from '@/lib/hazmat-training';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RecordBody = {
  module_code?: string;
  module_title?: string;
  module_category?: string;
  status?: string;
  credit_pathway?: string | null;
  completion_date?: string | null;
  training_window_start?: string | null;
  training_window_end?: string | null;
  recurrence_cycle_years?: number;
  next_due_date?: string | null;
  certificate_url?: string | null;
  notes?: string | null;
};

async function employeeIsOrgMember(orgId: string, employeeId: string): Promise<boolean> {
  const client = await clerkClient();
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    userId: [employeeId],
    limit: 1,
  });
  return Array.isArray(memberships?.data) && memberships.data.length > 0;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ employeeId: string }> },
) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
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

  let isOrgMember = false;
  try {
    isOrgMember = await employeeIsOrgMember(orgId, employeeId);
  } catch {
    return Response.json({ error: 'Unable to validate employee membership' }, { status: 503 });
  }
  if (!isOrgMember) {
    return Response.json(
      { error: 'employee_id must be a valid Clerk user ID in this organization' },
      { status: 422 },
    );
  }

  let body: RecordBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const moduleCode = normalizeModuleCode(body.module_code || '');
  if (!moduleCode || !isValidHazmatModuleCode(moduleCode)) {
    return Response.json({ error: 'module_code is required and must be valid' }, { status: 422 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const refRows = await sql`
    SELECT module_title, module_category, recurrence_cycle_years
    FROM hazmat_training_modules
    WHERE module_code = ${moduleCode}
    LIMIT 1
  `;
  const ref = refRows[0];
  const fallback = resolveModuleFallback(moduleCode);
  const recurrenceCycleYears = Number(
    body.recurrence_cycle_years
      ?? ref?.recurrence_cycle_years
      ?? fallback.recurrenceCycleYears
      ?? 3,
  );
  const completionDate = normalizeIsoDateInput(body.completion_date);
  const nextDueDate = normalizeIsoDateInput(body.next_due_date)
    || (completionDate ? computeNextDueDate(completionDate, recurrenceCycleYears) : null);
  const status = String(body.status || (completionDate ? 'complete' : 'in_progress')).trim().toLowerCase();
  if (!['not_started', 'in_progress', 'complete', 'delinquent'].includes(status)) {
    return Response.json({ error: 'status must be one of not_started|in_progress|complete|delinquent' }, { status: 422 });
  }
  const moduleTitle = String(body.module_title || ref?.module_title || fallback.title).trim();
  const moduleCategory = String(body.module_category || ref?.module_category || fallback.moduleCategory).trim().toLowerCase();
  const trainingWindowStart = normalizeIsoDateInput(body.training_window_start);
  const trainingWindowEnd = normalizeIsoDateInput(body.training_window_end);
  const certificateUrl = body.certificate_url ? String(body.certificate_url).trim() : null;
  const notes = body.notes ? String(body.notes) : null;
  const creditPathway = body.credit_pathway ? String(body.credit_pathway).trim() : null;

  const rows = await sql`
    INSERT INTO hazmat_training_records (
      org_id,
      employee_id,
      module_code,
      module_title,
      module_category,
      status,
      credit_pathway,
      completion_date,
      training_window_start,
      training_window_end,
      recurrence_cycle_years,
      next_due_date,
      certificate_url,
      certificate_uploaded_at,
      notes,
      created_by,
      updated_at
    ) VALUES (
      ${orgId},
      ${employeeId},
      ${moduleCode},
      ${moduleTitle},
      ${moduleCategory},
      ${status},
      ${creditPathway},
      ${completionDate},
      ${trainingWindowStart},
      ${trainingWindowEnd},
      ${recurrenceCycleYears},
      ${nextDueDate},
      ${certificateUrl},
      ${certificateUrl ? new Date().toISOString() : null},
      ${notes},
      ${userId},
      NOW()
    )
    ON CONFLICT (org_id, employee_id, module_code)
    DO UPDATE SET
      module_title = EXCLUDED.module_title,
      module_category = EXCLUDED.module_category,
      status = EXCLUDED.status,
      credit_pathway = EXCLUDED.credit_pathway,
      completion_date = EXCLUDED.completion_date,
      training_window_start = EXCLUDED.training_window_start,
      training_window_end = EXCLUDED.training_window_end,
      recurrence_cycle_years = EXCLUDED.recurrence_cycle_years,
      next_due_date = EXCLUDED.next_due_date,
      certificate_url = EXCLUDED.certificate_url,
      certificate_uploaded_at = CASE
        WHEN EXCLUDED.certificate_url IS NULL THEN NULL
        ELSE NOW()
      END,
      notes = EXCLUDED.notes,
      updated_at = NOW()
    RETURNING id, employee_id, module_code, module_title, module_category,
      status, credit_pathway, completion_date, next_due_date, certificate_url
  `;

  auditLog({
    action: 'data.write',
    userId,
    orgId,
    resourceType: 'hazmat-training.record',
    metadata: {
      employeeId,
      moduleCode,
      status,
    },
  });

  const record = rows[0];
  return Response.json({
    record: {
      id: String(record.id),
      employee_id: String(record.employee_id),
      module_code: String(record.module_code),
      module_title: String(record.module_title),
      module_category: String(record.module_category),
      status: String(record.status),
      credit_pathway: record.credit_pathway ? String(record.credit_pathway) : null,
      completion_date: toIsoDateOnly(record.completion_date),
      next_due_date: toIsoDateOnly(record.next_due_date),
      certificate_url: record.certificate_url ? String(record.certificate_url) : null,
    },
  }, { status: 201 });
}
