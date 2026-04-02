import { clerkClient } from '@clerk/nextjs/server';
import {
  fleetComplianceAuthErrorResponse,
  requireFleetComplianceOrgContext,
  requireFleetComplianceOrgWithRole,
} from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
import { checkTrainingSchema, trainingSchemaNotReadyResponse } from '@/lib/training-schema';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function employeeIsOrgMember(orgId: string, employeeId: string): Promise<boolean> {
  const client = await clerkClient();
  const memberships = await client.organizations.getOrganizationMembershipList({
    organizationId: orgId,
    userId: [employeeId],
    limit: 1,
  });
  return Array.isArray(memberships?.data) && memberships.data.length > 0;
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
  const requestedEmployeeId = (searchParams.get('employee_id') || '').trim();
  const effectiveEmployeeId = role === 'admin'
    ? (requestedEmployeeId || null)
    : userId;

  if (role !== 'admin' && requestedEmployeeId && requestedEmployeeId !== userId) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  let assignments;
  if (effectiveEmployeeId) {
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
        AND ta.employee_id = ${effectiveEmployeeId}
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
    metadata: {
      count: assignments.length,
      role,
      ...(effectiveEmployeeId ? { employeeId: effectiveEmployeeId } : {}),
    },
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
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const employeeId = body.employee_id.trim();
  if (!employeeId) {
    return Response.json({ error: 'employee_id is required' }, { status: 422 });
  }

  let isOrgMember = false;
  try {
    isOrgMember = await employeeIsOrgMember(orgId, employeeId);
  } catch (error: unknown) {
    console.error('[training] failed to validate org membership for assignment', {
      orgId,
      employeeId,
      message: error instanceof Error ? error.message : String(error),
    });
    return Response.json(
      { error: 'Unable to validate employee membership. Please try again.' },
      { status: 503 },
    );
  }
  if (!isOrgMember) {
    return Response.json(
      { error: 'employee_id must be a valid Clerk user ID in this organization' },
      { status: 422 },
    );
  }

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

  const insertRows = await sql`
    WITH inserted_assignment AS (
      INSERT INTO training_assignments (
        org_id, employee_id, plan_id, assigned_by, deadline, status
      ) VALUES (
        ${orgId},
        ${employeeId},
        ${body.plan_id},
        ${userId},
        ${deadline},
        'assigned'
      )
      ON CONFLICT (org_id, employee_id, plan_id) DO NOTHING
      RETURNING id, employee_id, plan_id, assigned_by,
                assigned_at, deadline, status, completion_percentage
    ),
    module_rows AS (
      SELECT
        inserted_assignment.id AS assignment_id,
        jsonb_array_elements_text(${JSON.stringify(modules)}::jsonb) AS module_code
      FROM inserted_assignment
    ),
    inserted_progress AS (
      INSERT INTO training_progress (
        assignment_id, module_code, status
      )
      SELECT
        module_rows.assignment_id,
        module_rows.module_code,
        'not_started'
      FROM module_rows
      ON CONFLICT (assignment_id, module_code) DO NOTHING
      RETURNING assignment_id
    )
    SELECT * FROM inserted_assignment
  `;

  if (insertRows.length === 0) {
    return Response.json({ error: 'Assignment already exists' }, { status: 409 });
  }

  const assignment = insertRows[0];

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.assignments',
    metadata: {
      assignmentId: assignment.id,
      employeeId,
      planId: body.plan_id,
      moduleCount: modules.length,
    },
  });

  return Response.json({ assignment }, { status: 201 });
}
