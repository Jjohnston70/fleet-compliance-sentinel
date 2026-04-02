import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { checkTrainingSchema, trainingSchemaNotReadyResponse } from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface DeckCompleteBody {
  time_spent_seconds?: number;
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ moduleCode: string }> },
) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { moduleCode } = await params;
  if (!/^TNDS-HZ-\d{3}[a-d]?$/.test(moduleCode)) {
    return Response.json({ error: 'Invalid module code' }, { status: 400 });
  }

  let body: DeckCompleteBody = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const timeSpentSeconds = Number.isFinite(body.time_spent_seconds)
    ? Math.max(0, Math.round(Number(body.time_spent_seconds)))
    : null;

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const assignmentRows = await sql`
    SELECT ta.id AS assignment_id, pr.id AS progress_id
    FROM training_assignments ta
    JOIN training_plans tp ON tp.id = ta.plan_id
    LEFT JOIN training_progress pr
      ON pr.assignment_id = ta.id
      AND pr.module_code = ${moduleCode}
    WHERE ta.org_id = ${orgId}
      AND ta.employee_id = ${userId}
      AND tp.modules::jsonb ? ${moduleCode}
    ORDER BY ta.assigned_at DESC
    LIMIT 1
  `;

  if (assignmentRows.length === 0) {
    return Response.json(
      { error: 'Training module is not assigned to this user in the current organization' },
      { status: 403 },
    );
  }

  const assignment = assignmentRows[0];
  if (!assignment.progress_id) {
    return Response.json(
      { error: 'Training progress row missing for assigned module' },
      { status: 409 },
    );
  }

  const assignmentId = String(assignment.assignment_id);
  const updatedRows = await sql`
    UPDATE training_progress
    SET status = CASE
          WHEN status IN ('assessment_passed', 'assessment_failed') THEN status
          ELSE 'deck_complete'
        END,
        deck_started_at = COALESCE(deck_started_at, NOW()),
        deck_completed_at = NOW(),
        time_spent_seconds = CASE
          WHEN ${timeSpentSeconds}::int IS NULL THEN COALESCE(time_spent_seconds, 0)
          ELSE GREATEST(COALESCE(time_spent_seconds, 0), ${timeSpentSeconds}::int)
        END,
        updated_at = NOW()
    WHERE assignment_id = ${assignmentId}
      AND module_code = ${moduleCode}
    RETURNING id, status, deck_started_at, deck_completed_at, time_spent_seconds
  `;

  if (updatedRows.length === 0) {
    return Response.json(
      { error: 'Training progress row missing for assigned module' },
      { status: 409 },
    );
  }

  auditLog({
    action: 'data.write',
    userId,
    orgId,
    resourceType: 'training.deck.complete',
    metadata: {
      moduleCode,
      assignmentId,
      ...(timeSpentSeconds === null ? {} : { timeSpentSeconds }),
    },
  });

  return Response.json({
    ok: true,
    progress: updatedRows[0],
  });
}
