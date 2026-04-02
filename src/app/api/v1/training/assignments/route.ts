import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';

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
  const employeeId = searchParams.get('employee_id');

  const sql = getSQL();

  let assignments;
  if (employeeId) {
    assignments = await sql`
      SELECT ta.id, ta.employee_id, ta.plan_id, ta.assigned_by,
             ta.assigned_at AS assigned_date, ta.deadline, ta.status,
             ta.completed_at, ta.completion_percentage AS completion_pct,
             tp.plan_name,
             cert.module_code AS certificate_module_code,
             cert.certificate_url
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      LEFT JOIN LATERAL (
        SELECT module_code, certificate_url
        FROM training_progress
        WHERE assignment_id = ta.id
          AND certificate_url IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 1
      ) cert ON TRUE
      WHERE ta.org_id = ${orgId}
        AND ta.employee_id = ${employeeId}
      ORDER BY ta.assigned_at DESC
    `;
  } else {
    assignments = await sql`
      SELECT ta.id, ta.employee_id, ta.plan_id, ta.assigned_by,
             ta.assigned_at AS assigned_date, ta.deadline, ta.status,
             ta.completed_at, ta.completion_percentage AS completion_pct,
             tp.plan_name,
             cert.module_code AS certificate_module_code,
             cert.certificate_url
      FROM training_assignments ta
      JOIN training_plans tp ON tp.id = ta.plan_id
      LEFT JOIN LATERAL (
        SELECT module_code, certificate_url
        FROM training_progress
        WHERE assignment_id = ta.id
          AND certificate_url IS NOT NULL
        ORDER BY updated_at DESC
        LIMIT 1
      ) cert ON TRUE
      WHERE ta.org_id = ${orgId}
      ORDER BY ta.assigned_at DESC
    `;
  }

  auditLog({
    action: 'data.read' as const,
    userId,
    orgId,
    resourceType: 'training.assignments',
    metadata: { count: assignments.length, ...(employeeId ? { employeeId } : {}) },
  });

  return Response.json({ assignments });
}

export async function POST(request: Request) {
  let userId: string;
  let orgId: string;
  try {
    ({ userId, orgId } = await requireFleetComplianceOrgWithRole(request, 'admin'));
  } catch (error: unknown) {
    const authResponse = fleetComplianceAuthErrorResponse(error);
    if (authResponse) return authResponse;
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: {
    employee_id?: string;
    plan_id?: string;
    deadline?: string;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.employee_id || typeof body.employee_id !== 'string') {
    return Response.json({ error: 'employee_id is required' }, { status: 422 });
  }
  if (!body.plan_id || typeof body.plan_id !== 'string') {
    return Response.json({ error: 'plan_id is required' }, { status: 422 });
  }

  const sql = getSQL();

  // Look up the plan to get modules and deadline_days
  const plans = await sql`
    SELECT id, modules, deadline_days
    FROM training_plans
    WHERE id = ${body.plan_id}
      AND org_id = ${orgId}
  `;

  if (plans.length === 0) {
    return Response.json({ error: 'Training plan not found' }, { status: 404 });
  }

  const plan = plans[0];
  const modules: string[] = plan.modules;

  // Calculate deadline
  let deadline: string | null = null;
  if (body.deadline) {
    deadline = body.deadline;
  } else if (plan.deadline_days) {
    const d = new Date();
    d.setDate(d.getDate() + plan.deadline_days);
    deadline = d.toISOString();
  }

  // Insert assignment with ON CONFLICT DO NOTHING
  const result = await sql`
    INSERT INTO training_assignments (
      org_id, employee_id, plan_id, assigned_by, deadline, status
    ) VALUES (
      ${orgId},
      ${body.employee_id},
      ${body.plan_id},
      ${userId},
      ${deadline},
      'assigned'
    )
    ON CONFLICT (org_id, employee_id, plan_id) DO NOTHING
    RETURNING id, employee_id, plan_id, assigned_by,
              assigned_at, deadline, status, completion_percentage
  `;

  if (result.length === 0) {
    return Response.json({ error: 'Assignment already exists' }, { status: 409 });
  }

  const assignment = result[0];

  // Create training_progress rows for each module
  for (const moduleCode of modules) {
    await sql`
      INSERT INTO training_progress (
        assignment_id, module_code, status
      ) VALUES (
        ${assignment.id},
        ${moduleCode},
        'not_started'
      )
      ON CONFLICT (assignment_id, module_code) DO NOTHING
    `;
  }

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.assignments',
    metadata: {
      assignmentId: assignment.id,
      employeeId: body.employee_id,
      planId: body.plan_id,
      moduleCount: modules.length,
    },
  });

  return Response.json({ assignment }, { status: 201 });
}
