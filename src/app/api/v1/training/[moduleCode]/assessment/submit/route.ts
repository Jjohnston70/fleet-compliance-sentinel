import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubmitBody {
  answers: Record<string, string>;
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
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

  let body: SubmitBody;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (
    typeof body.score !== 'number' ||
    typeof body.total !== 'number' ||
    typeof body.percentage !== 'number' ||
    typeof body.passed !== 'boolean'
  ) {
    return Response.json({ error: 'Missing required fields' }, { status: 422 });
  }

  // Persist assessment result to training_progress
  try {
    const sql = getSQL();

    // Find or create assignment + progress row
    // First check if an assignment exists for this user/module
    const assignments = await sql`
      SELECT ta.id as assignment_id
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${userId}
        AND tp.modules::jsonb ? ${moduleCode}
      LIMIT 1
    `;

    if (assignments.length > 0) {
      const assignmentId = assignments[0].assignment_id;

      // Upsert progress
      await sql`
        INSERT INTO training_progress (
          assignment_id, module_code, status, assessment_score,
          assessment_passed, assessment_completed_at, attempts_count
        ) VALUES (
          ${assignmentId}, ${moduleCode},
          ${body.passed ? 'assessment_passed' : 'assessment_failed'},
          ${body.percentage}, ${body.passed}, NOW(), 1
        )
        ON CONFLICT (assignment_id, module_code)
        DO UPDATE SET
          status = ${body.passed ? 'assessment_passed' : 'assessment_failed'},
          assessment_score = ${body.percentage},
          assessment_passed = ${body.passed},
          assessment_completed_at = NOW(),
          attempts_count = training_progress.attempts_count + 1,
          updated_at = NOW()
      `;

      // Update assignment completion percentage
      const progressRows = await sql`
        SELECT COUNT(*) FILTER (WHERE assessment_passed = true) as passed,
               COUNT(*) as total
        FROM training_progress
        WHERE assignment_id = ${assignmentId}
      `;

      if (progressRows.length > 0) {
        const pct = progressRows[0].total > 0
          ? Math.round((progressRows[0].passed / progressRows[0].total) * 100)
          : 0;

        const allPassed = progressRows[0].passed === progressRows[0].total;

        await sql`
          UPDATE training_assignments
          SET completion_percentage = ${pct},
              status = ${allPassed ? 'complete' : 'in_progress'},
              completed_at = ${allPassed ? new Date().toISOString() : null},
              updated_at = NOW()
          WHERE id = ${assignmentId}
        `;
      }
    }
  } catch (err) {
    // Log but don't fail the response — assessment result is still valid
    console.error('Failed to persist assessment result:', err);
  }

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.assessment',
    metadata: {
      moduleCode,
      score: body.score,
      total: body.total,
      percentage: body.percentage,
      passed: body.passed,
    },
  });

  return Response.json({
    status: body.passed ? 'passed' : 'failed',
    score: body.score,
    total: body.total,
    percentage: body.percentage,
    moduleCode,
  }, { status: 201 });
}
