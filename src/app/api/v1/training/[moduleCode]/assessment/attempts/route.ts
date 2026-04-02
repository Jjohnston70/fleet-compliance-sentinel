import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { getSQL } from '@/lib/fleet-compliance-db';
import {
  loadTrainingAssessment,
  sanitizeTrainingAssessmentForClient,
} from '@/lib/training-assessment';
import { checkTrainingSchema, trainingSchemaNotReadyResponse } from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
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

  const assessment = await loadTrainingAssessment(moduleCode);
  if (!assessment) {
    return Response.json({ error: 'Assessment not found' }, { status: 404 });
  }

  // Load attempt history from DB
  let attempts: any[] = [];
  try {
    const sql = getSQL();
    const schemaCheck = await checkTrainingSchema(undefined, sql);
    if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);
    const rows = await sql`
      SELECT tp.attempts_count, tp.assessment_score, tp.assessment_passed,
             tp.assessment_completed_at, tp.status
      FROM training_progress tp
      JOIN training_assignments ta ON ta.id = tp.assignment_id
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${userId}
        AND tp.module_code = ${moduleCode}
      ORDER BY tp.updated_at DESC
      LIMIT 10
    `;
    attempts = rows;
  } catch {
    // Keep history optional in this route to avoid blocking assessment load.
  }

  return Response.json({
    assessment: sanitizeTrainingAssessmentForClient(assessment),
    attempts,
  });
}
