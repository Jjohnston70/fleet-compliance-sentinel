import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { OnboardingIntakeError, OnboardingIntakeService } from '@/lib/onboarding/intake-service';
import { hashOpaqueToken, issueSignedIntakeToken } from '@/lib/onboarding/intake-token';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingIntakeTokenRecord,
  OnboardingRunDetail,
  OnboardingStepRecord,
} from '@/lib/onboarding/types';

function nowIso(now: Date): string {
  return now.toISOString();
}

class InMemoryIntakeRepo {
  private readonly tokens = new Map<string, OnboardingIntakeTokenRecord>();
  private readonly profiles = new Map<string, OnboardingEmployeeProfile>();
  private tokenSeq = 0;

  seedToken = (record: OnboardingIntakeTokenRecord): void => {
    this.tokens.set(record.tokenHash, record);
  };

  seedProfile = (profile: OnboardingEmployeeProfile): void => {
    this.profiles.set(`${profile.orgId}:${profile.id}`, profile);
  };

  createOnboardingIntakeToken = async (input: {
    orgId: string;
    employeeProfileId?: string | null;
    tokenHash: string;
    expiresAt: string;
    issuedBy: string;
    inviteAfterIntake: boolean;
    inviteOverrideAllowed: boolean;
    intakeEmail?: string | null;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingIntakeTokenRecord> => {
    this.tokenSeq += 1;
    const now = new Date().toISOString();
    const record: OnboardingIntakeTokenRecord = {
      id: `tok-${this.tokenSeq}`,
      orgId: input.orgId,
      employeeProfileId: input.employeeProfileId ?? null,
      tokenHash: input.tokenHash,
      status: 'issued',
      expiresAt: input.expiresAt,
      issuedBy: input.issuedBy,
      consumedAt: null,
      inviteAfterIntake: input.inviteAfterIntake,
      inviteOverrideAllowed: input.inviteOverrideAllowed,
      intakeEmail: input.intakeEmail ?? null,
      metadata: input.metadata || {},
      createdAt: now,
      updatedAt: now,
    };
    this.tokens.set(record.tokenHash, record);
    return record;
  };

  getOnboardingIntakeTokenByHash = async (input: {
    tokenHash: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    return this.tokens.get(input.tokenHash) ?? null;
  };

  claimOnboardingIntakeToken = async (input: {
    tokenHash: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing) return null;
    if (existing.status !== 'issued') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;
    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'processing',
      updatedAt: new Date().toISOString(),
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  releaseOnboardingIntakeToken = async (input: {
    tokenHash: string;
    errorMessage?: string;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing || existing.status !== 'processing') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;
    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'issued',
      metadata: {
        ...existing.metadata,
        lastError: input.errorMessage || '',
      },
      updatedAt: new Date().toISOString(),
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  consumeOnboardingIntakeToken = async (input: {
    tokenHash: string;
    metadata?: Record<string, unknown>;
  }): Promise<OnboardingIntakeTokenRecord | null> => {
    const existing = this.tokens.get(input.tokenHash);
    if (!existing || existing.status !== 'processing') return null;
    if (new Date(existing.expiresAt).getTime() <= Date.now()) return null;
    const consumedAt = new Date().toISOString();
    const next: OnboardingIntakeTokenRecord = {
      ...existing,
      status: 'consumed',
      consumedAt,
      metadata: {
        ...existing.metadata,
        ...(input.metadata || {}),
      },
      updatedAt: consumedAt,
    };
    this.tokens.set(input.tokenHash, next);
    return next;
  };

  getEmployeeProfileById = async (input: {
    orgId: string;
    employeeProfileId: string;
  }): Promise<OnboardingEmployeeProfile | null> => {
    return this.profiles.get(`${input.orgId}:${input.employeeProfileId}`) ?? null;
  };
}

function sampleEmployee(overrides: Partial<OnboardingEmployeeInput> = {}): OnboardingEmployeeInput {
  return {
    firstName: 'Alex',
    lastName: 'Operator',
    workEmail: 'alex@example.com',
    hireDate: '2026-04-05',
    isDriver: true,
    hazmatRequired: true,
    ...overrides,
  };
}

function sampleSteps(runId: string): OnboardingStepRecord[] {
  const now = new Date().toISOString();
  return [
    {
      id: randomUUID(),
      runId,
      stepKey: 'rules.evaluate',
      status: 'completed',
      attemptCount: 1,
      startedAt: now,
      completedAt: now,
      errorMessage: null,
      output: { deterministic: true },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function buildServiceHarness() {
  const repo = new InMemoryIntakeRepo();
  let now = new Date('2026-04-05T12:00:00.000Z');
  const inviteCalls: string[] = [];
  const createCalls: string[] = [];
  const updateCalls: string[] = [];

  const service = new OnboardingIntakeService({
    now: () => now,
    repo,
    getOrgModules: async () => ['onboarding', 'training'],
    sendOnboardingInvite: async (input) => {
      inviteCalls.push(input.emailAddress || '');
      return {
        status: 'completed',
        reason: 'sent',
        invitationId: 'inv-1',
      };
    },
    recordOrgAuditEvent: async () => {},
    onboardingService: {
      async createEmployeeAndStartRun(input): Promise<OnboardingRunDetail> {
        createCalls.push(input.context.orgId);
        const profileId = `emp-${createCalls.length}`;
        return {
          run: {
            id: `run-${createCalls.length}`,
            orgId: input.context.orgId,
            employeeProfileId: profileId,
            status: 'completed',
            source: 'intake.token',
            initiatedBy: input.context.userId,
            startedAt: nowIso(now),
            completedAt: nowIso(now),
            errorSummary: null,
            idempotencyKey: input.idempotencyKey || null,
            metadata: {},
            createdAt: nowIso(now),
            updatedAt: nowIso(now),
          },
          employeeProfile: {
            id: profileId,
            orgId: input.context.orgId,
            externalEmployeeId: null,
            clerkUserId: null,
            firstName: input.employee.firstName,
            lastName: input.employee.lastName,
            workEmail: input.employee.workEmail || null,
            department: input.employee.department || null,
            jobTitle: input.employee.jobTitle || null,
            hireDate: input.employee.hireDate || null,
            status: 'active',
            isDriver: Boolean(input.employee.isDriver),
            hazmatRequired: Boolean(input.employee.hazmatRequired),
            hazmatEndorsement: null,
            cdlClass: null,
            cdlExpiration: null,
            medicalExpiration: null,
            metadata: {},
            createdBy: input.context.userId,
            createdAt: nowIso(now),
            updatedAt: nowIso(now),
          },
          steps: sampleSteps(`run-${createCalls.length}`),
        };
      },
      async updateEmployeeAndStartRun(input): Promise<OnboardingRunDetail> {
        updateCalls.push(input.employeeProfileId);
        return {
          run: {
            id: 'run-update-1',
            orgId: input.context.orgId,
            employeeProfileId: input.employeeProfileId,
            status: 'completed',
            source: 'intake.token',
            initiatedBy: input.context.userId,
            startedAt: nowIso(now),
            completedAt: nowIso(now),
            errorSummary: null,
            idempotencyKey: input.idempotencyKey || null,
            metadata: {},
            createdAt: nowIso(now),
            updatedAt: nowIso(now),
          },
          employeeProfile: {
            id: input.employeeProfileId,
            orgId: input.context.orgId,
            externalEmployeeId: null,
            clerkUserId: null,
            firstName: input.employee.firstName,
            lastName: input.employee.lastName,
            workEmail: input.employee.workEmail || null,
            department: input.employee.department || null,
            jobTitle: input.employee.jobTitle || null,
            hireDate: input.employee.hireDate || null,
            status: 'active',
            isDriver: Boolean(input.employee.isDriver),
            hazmatRequired: Boolean(input.employee.hazmatRequired),
            hazmatEndorsement: null,
            cdlClass: null,
            cdlExpiration: null,
            medicalExpiration: null,
            metadata: {},
            createdBy: input.context.userId,
            createdAt: nowIso(now),
            updatedAt: nowIso(now),
          },
          steps: sampleSteps('run-update-1'),
        };
      },
    },
  });

  return {
    service,
    repo,
    inviteCalls,
    createCalls,
    updateCalls,
    setNow(next: Date) {
      now = next;
    },
  };
}

test('token cannot be reused after successful intake submission', async () => {
  const harness = buildServiceHarness();
  const issued = await harness.service.issueToken({
    orgId: 'org_a',
    userId: 'admin-1',
    inviteAfterIntake: true,
  });

  const first = await harness.service.submitWithToken({
    token: issued.token,
    employee: sampleEmployee(),
  });
  assert.equal(first.detail.run.status, 'completed');
  assert.equal(first.detail.steps.some((step) => step.stepKey === 'rules.evaluate'), true);
  assert.equal(harness.createCalls.length, 1);

  await assert.rejects(
    () =>
      harness.service.submitWithToken({
        token: issued.token,
        employee: sampleEmployee(),
      }),
    (error: unknown) =>
      error instanceof OnboardingIntakeError
      && error.status === 409
      && error.message.includes('already used'),
  );
});

test('expired intake tokens are rejected', async () => {
  const harness = buildServiceHarness();
  const tokenId = 't-expired';
  const token = issueSignedIntakeToken({
    tokenId,
    orgId: 'org_a',
    now: new Date('2026-04-05T00:00:00.000Z'),
    expiresAt: new Date('2026-04-05T01:00:00.000Z'),
  });
  const tokenHash = hashOpaqueToken(token);
  harness.repo.seedToken({
    id: 'tok-expired',
    orgId: 'org_a',
    employeeProfileId: null,
    tokenHash,
    status: 'issued',
    expiresAt: '2026-04-05T01:00:00.000Z',
    issuedBy: 'admin-1',
    consumedAt: null,
    inviteAfterIntake: true,
    inviteOverrideAllowed: true,
    intakeEmail: null,
    metadata: { tokenId },
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
  });
  harness.setNow(new Date('2026-04-05T02:00:00.000Z'));

  await assert.rejects(
    () => harness.service.lookupByToken(token),
    (error: unknown) =>
      error instanceof OnboardingIntakeError
      && error.status === 404
      && error.message.includes('expired'),
  );
});

test('cross-org token misuse is rejected', async () => {
  const harness = buildServiceHarness();
  const tokenId = 't-mismatch';
  const token = issueSignedIntakeToken({
    tokenId,
    orgId: 'org_a',
    now: new Date('2026-04-05T00:00:00.000Z'),
    expiresAt: new Date('2026-04-06T00:00:00.000Z'),
  });
  const tokenHash = hashOpaqueToken(token);
  harness.repo.seedToken({
    id: 'tok-mismatch',
    orgId: 'org_b',
    employeeProfileId: null,
    tokenHash,
    status: 'issued',
    expiresAt: '2026-04-06T00:00:00.000Z',
    issuedBy: 'admin-1',
    consumedAt: null,
    inviteAfterIntake: true,
    inviteOverrideAllowed: true,
    intakeEmail: null,
    metadata: { tokenId },
    createdAt: '2026-04-05T00:00:00.000Z',
    updatedAt: '2026-04-05T00:00:00.000Z',
  });

  await assert.rejects(
    () => harness.service.lookupByToken(token),
    (error: unknown) =>
      error instanceof OnboardingIntakeError
      && error.status === 403
      && error.message.includes('binding mismatch'),
  );
});

test('delayed invite policy controls invite dispatch', async () => {
  const harness = buildServiceHarness();
  const noInvite = await harness.service.issueToken({
    orgId: 'org_a',
    userId: 'admin-1',
    inviteAfterIntake: false,
  });

  const noInviteResult = await harness.service.submitWithToken({
    token: noInvite.token,
    employee: sampleEmployee({ workEmail: 'no-invite@example.com' }),
  });
  assert.equal(noInviteResult.inviteResult, null);
  assert.equal(harness.inviteCalls.length, 0);

  const doInvite = await harness.service.issueToken({
    orgId: 'org_a',
    userId: 'admin-1',
    inviteAfterIntake: true,
  });
  const inviteResult = await harness.service.submitWithToken({
    token: doInvite.token,
    employee: sampleEmployee({ workEmail: 'invite@example.com' }),
  });
  assert.equal(inviteResult.inviteResult?.status, 'completed');
  assert.equal(harness.inviteCalls.length, 1);
  assert.equal(harness.inviteCalls[0], 'invite@example.com');
});
