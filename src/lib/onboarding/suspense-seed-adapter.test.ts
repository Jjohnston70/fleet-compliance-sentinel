import test from 'node:test';
import assert from 'node:assert/strict';
import { seedSuspenseFromTraining } from '@/lib/onboarding/adapters/suspense-seed-adapter';
import type { OnboardingEmployeeProfile } from '@/lib/onboarding/types';

function makeEmployee(overrides: Partial<OnboardingEmployeeProfile> = {}): OnboardingEmployeeProfile {
  return {
    id: 'emp-profile-1',
    orgId: 'org_test',
    externalEmployeeId: 'emp-100',
    clerkUserId: null,
    firstName: 'Test',
    lastName: 'User',
    workEmail: 'test@example.com',
    department: null,
    jobTitle: null,
    hireDate: '2026-01-01',
    status: 'active',
    isDriver: true,
    hazmatRequired: true,
    hazmatEndorsement: null,
    cdlClass: null,
    cdlExpiration: null,
    medicalExpiration: null,
    metadata: {},
    createdBy: 'user_test',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

test('suspense seeding skips when no training assignment deadline rows exist', async () => {
  const result = await seedSuspenseFromTraining(
    {
      orgId: 'org_test',
      employee: makeEmployee(),
    },
    {
      getTrainingAssignmentCount: async () => 0,
      loadOrgSuspenseItems: async () => [],
    },
  );

  assert.equal(result.status, 'skipped');
  assert.equal(result.reason, 'training_not_assigned');
  assert.equal(result.linkedAssignmentCount, 0);
});

test('suspense seeding fails validation when assignments exist but suspense pipeline has no matching items', async () => {
  const result = await seedSuspenseFromTraining(
    {
      orgId: 'org_test',
      employee: makeEmployee(),
    },
    {
      getTrainingAssignmentCount: async () => 1,
      loadOrgSuspenseItems: async () => [
        { sourceType: 'training_assignment', sourceId: 'other-employee:TNDS-HZ-000' },
      ],
    },
  );

  assert.equal(result.status, 'failed');
  assert.equal(result.reason, 'pipeline_validation_failed');
  assert.equal(result.linkedAssignmentCount, 1);
  assert.equal(result.suspenseItemCount, 0);
});

test('suspense seeding completes when assignments exist and suspense pipeline has matching training items', async () => {
  const result = await seedSuspenseFromTraining(
    {
      orgId: 'org_test',
      employee: makeEmployee({ externalEmployeeId: 'emp-200' }),
    },
    {
      getTrainingAssignmentCount: async () => 2,
      loadOrgSuspenseItems: async () => [
        { sourceType: 'training_assignment', sourceId: 'emp-200:TNDS-HZ-000' },
        { sourceType: 'training_assignment', sourceId: 'emp-200:TNDS-HZ-001' },
      ],
    },
  );

  assert.equal(result.status, 'completed');
  assert.equal(result.reason, 'seeded');
  assert.equal(result.linkedAssignmentCount, 2);
  assert.equal(result.suspenseItemCount, 2);
});
