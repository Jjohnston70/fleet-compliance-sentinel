import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  computeNextDueDate,
  normalizeIsoDateInput,
  toIsoDateOnly,
} from '@/lib/hazmat-training';
import {
  checkTrainingSchema,
  TRAINING_COMPLIANCE_TABLES,
  trainingSchemaNotReadyResponse,
} from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type UpdateBody = {
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

function hasAnyUpdateKey(body: UpdateBody): boolean {
  const keys: Array<keyof UpdateBody> = [
    'module_title',
    'module_category',
    'status',
    'credit_pathway',
    'completion_date',
    'training_window_start',
    'training_window_end',
    'recurrence_cycle_years',
    'next_due_date',
    'certificate_url',
    'notes',
  ];
  return keys.some((key) => Object.prototype.hasOwnProperty.call(body, key));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> },
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

  const { recordId } = await params;
  const normalizedRecordId = recordId.trim();
  if (!normalizedRecordId) {
    return Response.json({ error: 'record_id is required' }, { status: 400 });
  }

  let body: UpdateBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }
  if (!hasAnyUpdateKey(body)) {
    return Response.json({ error: 'No updatable fields provided' }, { status: 422 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const existingRows = await sql`
    SELECT
      id,
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
      notes
    FROM hazmat_training_records
    WHERE id = ${normalizedRecordId}
      AND org_id = ${orgId}
    LIMIT 1
  `;
  if (existingRows.length === 0) {
    return Response.json({ error: 'Record not found' }, { status: 404 });
  }
  const existing = existingRows[0];

  const status = Object.prototype.hasOwnProperty.call(body, 'status')
    ? String(body.status || '').trim().toLowerCase()
    : String(existing.status || 'not_started');
  if (!['not_started', 'in_progress', 'complete', 'delinquent'].includes(status)) {
    return Response.json({ error: 'status must be one of not_started|in_progress|complete|delinquent' }, { status: 422 });
  }

  const recurrenceCycleYears = Object.prototype.hasOwnProperty.call(body, 'recurrence_cycle_years')
    ? Number(body.recurrence_cycle_years || 0)
    : Number(existing.recurrence_cycle_years || 3);
  if (!Number.isFinite(recurrenceCycleYears) || recurrenceCycleYears <= 0) {
    return Response.json({ error: 'recurrence_cycle_years must be a positive number' }, { status: 422 });
  }

  const completionDate = Object.prototype.hasOwnProperty.call(body, 'completion_date')
    ? normalizeIsoDateInput(body.completion_date)
    : normalizeIsoDateInput(existing.completion_date);
  const explicitNextDue = Object.prototype.hasOwnProperty.call(body, 'next_due_date')
    ? normalizeIsoDateInput(body.next_due_date)
    : null;
  const nextDueDate = explicitNextDue
    ?? (completionDate ? computeNextDueDate(completionDate, recurrenceCycleYears) : null);
  const trainingWindowStart = Object.prototype.hasOwnProperty.call(body, 'training_window_start')
    ? normalizeIsoDateInput(body.training_window_start)
    : normalizeIsoDateInput(existing.training_window_start);
  const trainingWindowEnd = Object.prototype.hasOwnProperty.call(body, 'training_window_end')
    ? normalizeIsoDateInput(body.training_window_end)
    : normalizeIsoDateInput(existing.training_window_end);
  const certificateUrl = Object.prototype.hasOwnProperty.call(body, 'certificate_url')
    ? (body.certificate_url ? String(body.certificate_url).trim() : null)
    : (existing.certificate_url ? String(existing.certificate_url) : null);

  const updatedRows = await sql`
    UPDATE hazmat_training_records
    SET
      module_title = ${Object.prototype.hasOwnProperty.call(body, 'module_title') ? String(body.module_title || '') : String(existing.module_title || '')},
      module_category = ${Object.prototype.hasOwnProperty.call(body, 'module_category') ? String(body.module_category || '') : String(existing.module_category || '')},
      status = ${status},
      credit_pathway = ${Object.prototype.hasOwnProperty.call(body, 'credit_pathway')
        ? (body.credit_pathway ? String(body.credit_pathway) : null)
        : (existing.credit_pathway ? String(existing.credit_pathway) : null)},
      completion_date = ${completionDate},
      training_window_start = ${trainingWindowStart},
      training_window_end = ${trainingWindowEnd},
      recurrence_cycle_years = ${recurrenceCycleYears},
      next_due_date = ${nextDueDate},
      certificate_url = ${certificateUrl},
      certificate_uploaded_at = CASE
        WHEN ${certificateUrl} IS NULL THEN NULL
        ELSE certificate_uploaded_at
      END,
      notes = ${Object.prototype.hasOwnProperty.call(body, 'notes') ? body.notes : existing.notes},
      updated_at = NOW()
    WHERE id = ${normalizedRecordId}
      AND org_id = ${orgId}
    RETURNING id, employee_id, module_code, module_title, module_category, status,
      credit_pathway, completion_date, next_due_date, certificate_url
  `;

  const updated = updatedRows[0];
  auditLog({
    action: 'data.write',
    userId,
    orgId,
    resourceType: 'hazmat-training.record',
    metadata: {
      recordId: normalizedRecordId,
      moduleCode: String(updated.module_code || ''),
      employeeId: String(updated.employee_id || ''),
    },
  });

  return Response.json({
    record: {
      id: String(updated.id),
      employee_id: String(updated.employee_id),
      module_code: String(updated.module_code),
      module_title: String(updated.module_title),
      module_category: String(updated.module_category),
      status: String(updated.status),
      credit_pathway: updated.credit_pathway ? String(updated.credit_pathway) : null,
      completion_date: toIsoDateOnly(updated.completion_date),
      next_due_date: toIsoDateOnly(updated.next_due_date),
      certificate_url: updated.certificate_url ? String(updated.certificate_url) : null,
    },
  });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ recordId: string }> },
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

  const { recordId } = await params;
  const normalizedRecordId = recordId.trim();
  if (!normalizedRecordId) {
    return Response.json({ error: 'record_id is required' }, { status: 400 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_COMPLIANCE_TABLES, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const existingRows = await sql`
    SELECT id, employee_id, module_code, notes
    FROM hazmat_training_records
    WHERE id = ${normalizedRecordId}
      AND org_id = ${orgId}
    LIMIT 1
  `;
  if (existingRows.length === 0) {
    return Response.json({ error: 'Record not found' }, { status: 404 });
  }

  const existing = existingRows[0];
  const deleteNote = `[soft-delete ${new Date().toISOString()} by ${userId}]`;
  const mergedNotes = existing.notes
    ? `${String(existing.notes)}\n${deleteNote}`
    : deleteNote;

  await sql`
    UPDATE hazmat_training_records
    SET
      status = 'not_started',
      credit_pathway = NULL,
      completion_date = NULL,
      next_due_date = NULL,
      certificate_url = NULL,
      certificate_uploaded_at = NULL,
      notes = ${mergedNotes},
      updated_at = NOW()
    WHERE id = ${normalizedRecordId}
      AND org_id = ${orgId}
  `;

  auditLog({
    action: 'data.delete',
    userId,
    orgId,
    resourceType: 'hazmat-training.record',
    metadata: {
      recordId: normalizedRecordId,
      employeeId: String(existing.employee_id || ''),
      moduleCode: String(existing.module_code || ''),
      mode: 'soft-delete',
    },
    severity: 'warn',
  });

  return Response.json({
    ok: true,
    record_id: normalizedRecordId,
    deleted_at: new Date().toISOString(),
    mode: 'soft-delete',
  });
}
