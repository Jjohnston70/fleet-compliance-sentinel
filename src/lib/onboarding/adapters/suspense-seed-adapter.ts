import { getSQL } from '@/lib/fleet-compliance-db';
import { loadFleetComplianceData } from '@/lib/fleet-compliance-data';
import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';

export interface SuspenseSeedResult {
  status: 'completed' | 'skipped' | 'failed';
  reason:
    | 'seeded'
    | 'training_not_assigned'
    | 'missing_employee_identifier'
    | 'pipeline_validation_failed'
    | 'error';
  linkedAssignmentCount?: number;
  suspenseItemCount?: number;
  message?: string;
}

interface SuspenseSeedDependencies {
  getTrainingAssignmentCount(input: { orgId: string; employeeIdentifier: string }): Promise<number>;
  loadOrgSuspenseItems(orgId: string): Promise<Array<{ sourceType: string; sourceId: string }>>;
}

function resolveEmployeeIdentifier(employee: OnboardingEmployeeProfile): string | null {
  if (employee.clerkUserId?.trim()) return employee.clerkUserId.trim();
  if (employee.externalEmployeeId?.trim()) return employee.externalEmployeeId.trim();
  if (employee.id.trim()) return employee.id.trim();
  return null;
}

async function getTrainingAssignmentCount(input: {
  orgId: string;
  employeeIdentifier: string;
}): Promise<number> {
  const sql = getSQL();
  const rows = await sql`
    SELECT COUNT(*)::int AS assignment_count
    FROM training_assignments
    WHERE org_id = ${input.orgId}
      AND employee_id = ${input.employeeIdentifier}
      AND deadline IS NOT NULL
  `;
  return Number(rows[0]?.assignment_count ?? 0);
}

async function loadOrgSuspenseItems(orgId: string): Promise<Array<{ sourceType: string; sourceId: string }>> {
  const data = await loadFleetComplianceData(orgId);
  return data.suspense.map((item) => ({
    sourceType: item.sourceType,
    sourceId: item.sourceId,
  }));
}

const DEFAULT_DEPENDENCIES: SuspenseSeedDependencies = {
  getTrainingAssignmentCount,
  loadOrgSuspenseItems,
};

export async function seedSuspenseFromTraining(input: {
  orgId: string;
  employee: OnboardingEmployeeProfile;
}, deps: SuspenseSeedDependencies = DEFAULT_DEPENDENCIES): Promise<SuspenseSeedResult> {
  const employeeIdentifier = resolveEmployeeIdentifier(input.employee);
  if (!employeeIdentifier) {
    return {
      status: 'skipped',
      reason: 'missing_employee_identifier',
      message: 'No employee identifier available for suspense seeding check',
    };
  }

  try {
    const assignmentCount = await deps.getTrainingAssignmentCount({
      orgId: input.orgId,
      employeeIdentifier,
    });
    if (assignmentCount <= 0) {
      return {
        status: 'skipped',
        reason: 'training_not_assigned',
        linkedAssignmentCount: 0,
      };
    }

    const suspenseItems = await deps.loadOrgSuspenseItems(input.orgId);
    const matchingSuspenseItems = suspenseItems.filter((item) =>
      item.sourceType === 'training_assignment'
      && item.sourceId.startsWith(`${employeeIdentifier}:`));

    if (matchingSuspenseItems.length === 0) {
      return {
        status: 'failed',
        reason: 'pipeline_validation_failed',
        linkedAssignmentCount: assignmentCount,
        suspenseItemCount: 0,
        message: 'Training assignment exists but suspense pipeline did not produce training-based suspense items',
      };
    }

    return {
      status: 'completed',
      reason: 'seeded',
      linkedAssignmentCount: assignmentCount,
      suspenseItemCount: matchingSuspenseItems.length,
    };
  } catch (error: unknown) {
    return {
      status: 'failed',
      reason: 'error',
      message: error instanceof Error ? error.message : String(error),
    };
  }
}
