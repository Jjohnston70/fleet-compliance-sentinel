import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';

export interface TrainingRuleDecision {
  shouldAssignTraining: boolean;
  reason:
    | 'driver_hazmat_required'
    | 'not_driver'
    | 'hazmat_not_required'
    | 'missing_hire_date';
  deadlineDate: string | null;
}

export interface SuspenseRuleDecision {
  shouldSeed: boolean;
  reason:
    | 'training_assignment_expected'
    | 'training_not_required';
}

export interface OnboardingRulesDecision {
  training: TrainingRuleDecision;
  suspense: SuspenseRuleDecision;
}

function addDays(dateText: string, days: number): string | null {
  const parsed = new Date(`${dateText}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

export function evaluateOnboardingRules(employee: OnboardingEmployeeProfile): OnboardingRulesDecision {
  if (!employee.isDriver) {
    return {
      training: {
        shouldAssignTraining: false,
        reason: 'not_driver',
        deadlineDate: null,
      },
      suspense: {
        shouldSeed: false,
        reason: 'training_not_required',
      },
    };
  }

  if (!employee.hazmatRequired) {
    return {
      training: {
        shouldAssignTraining: false,
        reason: 'hazmat_not_required',
        deadlineDate: null,
      },
      suspense: {
        shouldSeed: false,
        reason: 'training_not_required',
      },
    };
  }

  if (!employee.hireDate) {
    return {
      training: {
        shouldAssignTraining: false,
        reason: 'missing_hire_date',
        deadlineDate: null,
      },
      suspense: {
        shouldSeed: false,
        reason: 'training_not_required',
      },
    };
  }

  return {
    training: {
      shouldAssignTraining: true,
      reason: 'driver_hazmat_required',
      deadlineDate: addDays(employee.hireDate, 90),
    },
    suspense: {
      shouldSeed: true,
      reason: 'training_assignment_expected',
    },
  };
}
