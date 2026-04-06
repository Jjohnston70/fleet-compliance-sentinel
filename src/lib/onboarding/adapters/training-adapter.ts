import { getSQL } from '@/lib/fleet-compliance-db';
import { getOrgModules } from '@/lib/modules';
import { checkTrainingSchema, TRAINING_CORE_TABLES } from '@/lib/training-schema';
import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';

export interface TrainingAssignmentResult {
  status: 'completed' | 'skipped' | 'failed';
  reason:
    | 'assigned'
    | 'not_required'
    | 'module_disabled'
    | 'schema_not_ready'
    | 'plan_not_found'
    | 'missing_employee_identifier'
    | 'invalid_deadline'
    | 'error';
  assignmentId?: string;
  planId?: string;
  planName?: string;
  moduleCount?: number;
  employeeIdentifier?: string;
  deadlineDate?: string;
  message?: string;
}

function parseModules(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
  }
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0);
      }
    } catch {
      return [];
    }
  }
  return [];
}

function toIsoTimestamp(dateText: string): string | null {
  const parsed = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function resolveEmployeeIdentifier(employee: OnboardingEmployeeProfile): string | null {
  if (employee.clerkUserId?.trim()) return employee.clerkUserId.trim();
  if (employee.externalEmployeeId?.trim()) return employee.externalEmployeeId.trim();
  if (employee.id.trim()) return employee.id.trim();
  return null;
}

export async function assignHazmatTrainingIfRequired(input: {
  orgId: string;
  initiatedBy: string;
  employee: OnboardingEmployeeProfile;
  deadlineDate: string;
}): Promise<TrainingAssignmentResult> {
  const enabledModules = await getOrgModules(input.orgId);
  if (!enabledModules.includes('training')) {
    return {
      status: 'skipped',
      reason: 'module_disabled',
      message: "Module 'training' is disabled for this organization",
    };
  }

  const sql = getSQL();
  const schemaCheck = await checkTrainingSchema(TRAINING_CORE_TABLES, sql);
  if (!schemaCheck.ok) {
    return {
      status: 'skipped',
      reason: 'schema_not_ready',
      message: `Missing training tables: ${schemaCheck.missingTables.join(', ')}`,
    };
  }

  const employeeIdentifier = resolveEmployeeIdentifier(input.employee);
  if (!employeeIdentifier) {
    return {
      status: 'skipped',
      reason: 'missing_employee_identifier',
      message: 'No employee identifier available for training assignment',
    };
  }

  const deadlineIso = toIsoTimestamp(input.deadlineDate);
  if (!deadlineIso) {
    return {
      status: 'failed',
      reason: 'invalid_deadline',
      message: 'Derived training deadline is invalid',
    };
  }

  try {
    const preferredPlanRows = await sql`
      SELECT id, plan_name, modules
      FROM training_plans
      WHERE org_id = ${input.orgId}
        AND LOWER(plan_name) = LOWER('PHMSA Hazmat Required Training')
      LIMIT 1
    `;
    const fallbackPlanRows = preferredPlanRows.length > 0
      ? preferredPlanRows
      : await sql`
        SELECT id, plan_name, modules
        FROM training_plans
        WHERE org_id = 'org_default'
          AND LOWER(plan_name) = LOWER('PHMSA Hazmat Required Training')
        LIMIT 1
      `;

    const planRow = fallbackPlanRows[0] as Record<string, unknown> | undefined;
    if (!planRow) {
      return {
        status: 'skipped',
        reason: 'plan_not_found',
        message: 'PHMSA Hazmat Required Training plan not found',
      };
    }

    const planId = String(planRow.id ?? '');
    const planName = String(planRow.plan_name ?? '');
    const modules = parseModules(planRow.modules);

    const assignmentRows = await sql`
      INSERT INTO training_assignments (
        org_id,
        employee_id,
        plan_id,
        assigned_by,
        assigned_at,
        deadline,
        status,
        completion_percentage
      ) VALUES (
        ${input.orgId},
        ${employeeIdentifier},
        ${planId}::uuid,
        ${input.initiatedBy},
        NOW(),
        ${deadlineIso},
        'assigned',
        0
      )
      ON CONFLICT (org_id, employee_id, plan_id)
      DO UPDATE SET
        deadline = COALESCE(training_assignments.deadline, EXCLUDED.deadline)
      RETURNING id
    `;
    const assignmentId = String(assignmentRows[0]?.id ?? '');

    for (const moduleCode of modules) {
      await sql`
        INSERT INTO training_progress (
          assignment_id,
          module_code,
          status
        ) VALUES (
          ${assignmentId}::uuid,
          ${moduleCode},
          'not_started'
        )
        ON CONFLICT (assignment_id, module_code)
        DO NOTHING
      `;
    }

    return {
      status: 'completed',
      reason: 'assigned',
      assignmentId,
      planId,
      planName,
      moduleCount: modules.length,
      employeeIdentifier,
      deadlineDate: input.deadlineDate,
    };
  } catch (error: unknown) {
    return {
      status: 'failed',
      reason: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
