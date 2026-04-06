import test from 'node:test';
import assert from 'node:assert/strict';
import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';
import { evaluateOnboardingRules } from '@/lib/onboarding/rules-engine';

function baseProfile(overrides: Partial<OnboardingEmployeeProfile> = {}): OnboardingEmployeeProfile {
  return {
    id: 'emp_1',
    orgId: 'org_1',
    externalEmployeeId: 'e-1',
    clerkUserId: null,
    firstName: 'Jane',
    lastName: 'Driver',
    workEmail: 'jane@example.com',
    department: null,
    jobTitle: null,
    hireDate: '2026-04-01',
    status: 'active',
    isDriver: true,
    hazmatRequired: true,
    hazmatEndorsement: null,
    cdlClass: 'A',
    cdlExpiration: null,
    medicalExpiration: null,
    metadata: {},
    createdBy: 'user_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

test('rule engine assigns training for driver + hazmat with 90-day deadline', () => {
  const decision = evaluateOnboardingRules(baseProfile());
  assert.equal(decision.training.shouldAssignTraining, true);
  assert.equal(decision.training.reason, 'driver_hazmat_required');
  assert.equal(decision.training.deadlineDate, '2026-06-30');
});

test('rule engine skips non-driver profiles', () => {
  const decision = evaluateOnboardingRules(baseProfile({ isDriver: false }));
  assert.equal(decision.training.shouldAssignTraining, false);
  assert.equal(decision.training.reason, 'not_driver');
});

test('rule engine skips when hire date is missing', () => {
  const decision = evaluateOnboardingRules(baseProfile({ hireDate: null }));
  assert.equal(decision.training.shouldAssignTraining, false);
  assert.equal(decision.training.reason, 'missing_hire_date');
});
