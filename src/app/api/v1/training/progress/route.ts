import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { getTrainingModuleMetadata } from '@/lib/training-module-metadata';
import { checkTrainingSchema, trainingSchemaNotReadyResponse } from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrg(request));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const assignmentId = searchParams.get('assignment_id');

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  let rows;
  if (assignmentId) {
    rows = await sql`
      SELECT ta.id as assignment_id, ta.status as assignment_status,
             ta.completion_percentage, ta.deadline, ta.assigned_at,
             ta.completed_at,
             tp.id as plan_id, tp.plan_name, tp.modules as plan_modules,
             tp.passing_score_override,
             pr.module_code, pr.status as module_status,
             pr.deck_started_at, pr.deck_completed_at,
             pr.time_spent_seconds, pr.assessment_score,
             pr.assessment_passed, pr.assessment_completed_at,
             pr.attempts_count, pr.certificate_url
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      LEFT JOIN training_progress pr ON pr.assignment_id = ta.id
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${userId}
        AND ta.id = ${assignmentId}
      ORDER BY pr.module_code
    `;
  } else {
    rows = await sql`
      SELECT ta.id as assignment_id, ta.status as assignment_status,
             ta.completion_percentage, ta.deadline, ta.assigned_at,
             ta.completed_at,
             tp.id as plan_id, tp.plan_name, tp.modules as plan_modules,
             tp.passing_score_override,
             pr.module_code, pr.status as module_status,
             pr.deck_started_at, pr.deck_completed_at,
             pr.time_spent_seconds, pr.assessment_score,
             pr.assessment_passed, pr.assessment_completed_at,
             pr.attempts_count, pr.certificate_url
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      LEFT JOIN training_progress pr ON pr.assignment_id = ta.id
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${userId}
      ORDER BY ta.assigned_at DESC, pr.module_code
    `;
  }

  // Group progress rows by assignment
  const assignmentMap = new Map<string, {
    assignment_id: string;
    assignment_status: string;
    completion_percentage: number;
    deadline: string | null;
    assigned_at: string;
    completed_at: string | null;
    plan_id: string;
    plan_name: string;
    passing_score_override: number | null;
    modules: Array<{
      module_code: string;
      status: string;
      deck_started_at: string | null;
      deck_completed_at: string | null;
      time_spent_seconds: number | null;
      assessment_score: number | null;
      assessment_passed: boolean | null;
      assessment_completed_at: string | null;
      attempts_count: number | null;
      certificate_url: string | null;
    }>;
  }>();

  for (const row of rows) {
    if (!assignmentMap.has(row.assignment_id)) {
      assignmentMap.set(row.assignment_id, {
        assignment_id: row.assignment_id,
        assignment_status: row.assignment_status,
        completion_percentage: row.completion_percentage,
        deadline: row.deadline,
        assigned_at: row.assigned_at,
        completed_at: row.completed_at,
        plan_id: row.plan_id,
        plan_name: row.plan_name,
        passing_score_override: row.passing_score_override,
        modules: [],
      });
    }

    if (row.module_code) {
      assignmentMap.get(row.assignment_id)!.modules.push({
        module_code: row.module_code,
        status: row.module_status,
        deck_started_at: row.deck_started_at,
        deck_completed_at: row.deck_completed_at,
        time_spent_seconds: row.time_spent_seconds,
        assessment_score: row.assessment_score,
        assessment_passed: row.assessment_passed,
        assessment_completed_at: row.assessment_completed_at,
        attempts_count: row.attempts_count,
        certificate_url: row.certificate_url,
      });
    }
  }

  const progress = Array.from(assignmentMap.values());
  const mapModuleStatus = (status: string): 'not_started' | 'viewing' | 'passed' | 'failed' => {
    if (status === 'assessment_passed') return 'passed';
    if (status === 'assessment_failed') return 'failed';
    if (status === 'viewing' || status === 'deck_complete') return 'viewing';
    return 'not_started';
  };

  const assignments = progress.map((assignment) => ({
    id: assignment.assignment_id,
    plan_name: assignment.plan_name,
    status: assignment.assignment_status as 'assigned' | 'in_progress' | 'complete' | 'overdue',
    completion_pct: Number(assignment.completion_percentage ?? 0),
    deadline: assignment.deadline,
    modules: assignment.modules.map((module) => {
      const meta = getTrainingModuleMetadata(module.module_code);
      return {
        module_code: module.module_code,
        title: meta.title,
        status: mapModuleStatus(module.status),
        certificate_url: module.certificate_url,
      };
    }),
  }));

  auditLog({
    action: 'data.read' as const,
    userId,
    orgId,
    resourceType: 'training.progress',
    metadata: { assignmentCount: progress.length, ...(assignmentId ? { assignmentId } : {}) },
  });

  return Response.json({ progress, assignments });
}
