import { fleetComplianceAuthErrorResponse, requireFleetComplianceOrg, requireFleetComplianceOrgWithRole } from '@/lib/fleet-compliance-auth';
import { auditLog } from '@/lib/audit-logger';
import { getSQL } from '@/lib/fleet-compliance-db';
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

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const plans = await sql`
    SELECT id, plan_name, description, modules,
           passing_score_override, deadline_days, is_required,
           jsonb_array_length(modules) as module_count,
           created_at, updated_at
    FROM training_plans
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
  `;

  auditLog({
    action: 'data.read' as const,
    userId,
    orgId,
    resourceType: 'training.plans',
    metadata: { count: plans.length },
  });

  return Response.json({ plans });
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
    plan_name?: string;
    description?: string;
    modules?: string[];
    passing_score_override?: number;
    deadline_days?: number;
    is_required?: boolean;
  };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.plan_name || typeof body.plan_name !== 'string') {
    return Response.json({ error: 'plan_name is required' }, { status: 422 });
  }
  if (!Array.isArray(body.modules) || body.modules.length === 0) {
    return Response.json({ error: 'modules must be a non-empty array' }, { status: 422 });
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(undefined, sql);
  if (!schemaCheck.ok) return trainingSchemaNotReadyResponse(schemaCheck);

  const result = await sql`
    INSERT INTO training_plans (
      org_id, plan_name, description, modules,
      passing_score_override, deadline_days, is_required
    ) VALUES (
      ${orgId},
      ${body.plan_name},
      ${body.description ?? null},
      ${JSON.stringify(body.modules)}::jsonb,
      ${body.passing_score_override ?? null},
      ${body.deadline_days ?? null},
      ${body.is_required ?? false}
    )
    RETURNING id, plan_name, description, modules,
              passing_score_override, deadline_days, is_required,
              created_at, updated_at
  `;

  auditLog({
    action: 'data.write' as const,
    userId,
    orgId,
    resourceType: 'training.plans',
    metadata: {
      planId: result[0].id,
      planName: body.plan_name,
      moduleCount: body.modules.length,
    },
  });

  return Response.json({ plan: result[0] }, { status: 201 });
}
