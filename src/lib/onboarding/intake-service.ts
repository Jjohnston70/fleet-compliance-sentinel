import { randomUUID } from 'node:crypto';
import { recordOrgAuditEvent } from '@/lib/org-audit';
import { getOrgModules } from '@/lib/modules';
import { sendOnboardingInvite, type OnboardingInviteResult } from '@/lib/onboarding/adapters/invite-adapter';
import { createOnboardingService, OnboardingServiceError } from '@/lib/onboarding/service';
import { emitOnboardingMetric } from '@/lib/onboarding/observability';
import {
  claimOnboardingIntakeToken,
  consumeOnboardingIntakeToken,
  createOnboardingIntakeToken,
  getEmployeeProfileById,
  getOnboardingIntakeTokenByHash,
  releaseOnboardingIntakeToken,
} from '@/lib/onboarding/repository';
import {
  hashOpaqueToken,
  issueSignedIntakeToken,
  IntakeTokenError,
  type IntakeTokenClaims,
  verifySignedIntakeToken,
} from '@/lib/onboarding/intake-token';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingMutationContext,
  OnboardingRunDetail,
} from '@/lib/onboarding/types';

export class OnboardingIntakeError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'OnboardingIntakeError';
    this.status = status;
  }
}

function resolveExpiresAt(hours: number, now: Date): Date {
  const safeHours = Number.isFinite(hours) ? Math.max(1, Math.min(Math.floor(hours), 24 * 30)) : 72;
  return new Date(now.getTime() + safeHours * 60 * 60 * 1000);
}

function resolveInviteRedirectUrl(): string | null {
  const explicit = process.env.ONBOARDING_INVITE_REDIRECT_URL?.trim();
  if (explicit) return explicit;
  const appBase = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appBase) return null;
  return `${appBase.replace(/\/+$/, '')}/sign-up`;
}

function parseTokenMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

interface OnboardingIntakeRepository {
  createOnboardingIntakeToken: typeof createOnboardingIntakeToken;
  getOnboardingIntakeTokenByHash: typeof getOnboardingIntakeTokenByHash;
  claimOnboardingIntakeToken: typeof claimOnboardingIntakeToken;
  releaseOnboardingIntakeToken: typeof releaseOnboardingIntakeToken;
  consumeOnboardingIntakeToken: typeof consumeOnboardingIntakeToken;
  getEmployeeProfileById: typeof getEmployeeProfileById;
}

interface OnboardingIntakeRunStarter {
  createEmployeeAndStartRun(input: {
    context: OnboardingMutationContext;
    employee: OnboardingEmployeeInput;
    idempotencyKey?: string | null;
  }): Promise<OnboardingRunDetail>;
  updateEmployeeAndStartRun(input: {
    context: OnboardingMutationContext;
    employeeProfileId: string;
    employee: OnboardingEmployeeInput;
    idempotencyKey?: string | null;
  }): Promise<OnboardingRunDetail>;
}

interface OnboardingIntakeDependencies {
  repo: OnboardingIntakeRepository;
  onboardingService: OnboardingIntakeRunStarter;
  getOrgModules: (orgId: string) => Promise<string[]>;
  sendOnboardingInvite: typeof sendOnboardingInvite;
  recordOrgAuditEvent: typeof recordOrgAuditEvent;
  issueSignedIntakeToken: typeof issueSignedIntakeToken;
  verifySignedIntakeToken: (token: string, now?: Date) => IntakeTokenClaims;
  hashOpaqueToken: typeof hashOpaqueToken;
  now: () => Date;
}

export interface OnboardingIntakeServiceOptions extends Partial<Omit<OnboardingIntakeDependencies, 'repo'>> {
  repo?: Partial<OnboardingIntakeRepository>;
}

const DEFAULT_REPOSITORY: OnboardingIntakeRepository = {
  createOnboardingIntakeToken,
  getOnboardingIntakeTokenByHash,
  claimOnboardingIntakeToken,
  releaseOnboardingIntakeToken,
  consumeOnboardingIntakeToken,
  getEmployeeProfileById,
};

const DEFAULT_DEPENDENCIES: OnboardingIntakeDependencies = {
  repo: DEFAULT_REPOSITORY,
  onboardingService: createOnboardingService(),
  getOrgModules,
  sendOnboardingInvite,
  recordOrgAuditEvent,
  issueSignedIntakeToken,
  verifySignedIntakeToken,
  hashOpaqueToken,
  now: () => new Date(),
};

export interface IntakeTokenIssueResult {
  token: string;
  intakeUrl: string;
  expiresAt: string;
  employeeProfile: OnboardingEmployeeProfile | null;
}

export interface IntakeTokenLookupResult {
  orgId: string;
  employeeProfile: OnboardingEmployeeProfile | null;
  inviteAfterIntake: boolean;
  intakeEmail: string | null;
  expiresAt: string;
  status: string;
}

export interface IntakeSubmissionResult {
  detail: OnboardingRunDetail;
  inviteResult: OnboardingInviteResult | null;
}

export class OnboardingIntakeService {
  private readonly deps: OnboardingIntakeDependencies;

  constructor(options: OnboardingIntakeServiceOptions = {}) {
    const repoOverrides = options.repo;
    this.deps = {
      ...DEFAULT_DEPENDENCIES,
      ...options,
      repo: {
        createOnboardingIntakeToken:
          repoOverrides?.createOnboardingIntakeToken ?? DEFAULT_REPOSITORY.createOnboardingIntakeToken,
        getOnboardingIntakeTokenByHash:
          repoOverrides?.getOnboardingIntakeTokenByHash ?? DEFAULT_REPOSITORY.getOnboardingIntakeTokenByHash,
        claimOnboardingIntakeToken:
          repoOverrides?.claimOnboardingIntakeToken ?? DEFAULT_REPOSITORY.claimOnboardingIntakeToken,
        releaseOnboardingIntakeToken:
          repoOverrides?.releaseOnboardingIntakeToken ?? DEFAULT_REPOSITORY.releaseOnboardingIntakeToken,
        consumeOnboardingIntakeToken:
          repoOverrides?.consumeOnboardingIntakeToken ?? DEFAULT_REPOSITORY.consumeOnboardingIntakeToken,
        getEmployeeProfileById:
          repoOverrides?.getEmployeeProfileById ?? DEFAULT_REPOSITORY.getEmployeeProfileById,
      },
    };
  }

  private async assertOnboardingModuleEnabled(orgId: string): Promise<void> {
    const enabledModules = await this.deps.getOrgModules(orgId);
    if (!enabledModules.includes('onboarding')) {
      throw new OnboardingIntakeError(403, "Module 'onboarding' is disabled for this organization");
    }
  }

  async issueToken(input: {
    orgId: string;
    userId: string;
    employeeProfileId?: string | null;
    intakeEmail?: string | null;
    expiresInHours?: number;
    inviteAfterIntake?: boolean;
    inviteOverrideAllowed?: boolean;
    metadata?: Record<string, unknown>;
  }): Promise<IntakeTokenIssueResult> {
    await this.assertOnboardingModuleEnabled(input.orgId);

    const employeeProfileId = input.employeeProfileId?.trim() || null;
    const profile = employeeProfileId
      ? await this.deps.repo.getEmployeeProfileById({
        orgId: input.orgId,
        employeeProfileId,
      })
      : null;

    if (employeeProfileId && !profile) {
      throw new OnboardingIntakeError(404, 'Employee profile not found for this organization');
    }

    const now = this.deps.now();
    const expiresAt = resolveExpiresAt(input.expiresInHours ?? 72, now);
    const tokenId = randomUUID();
    const token = this.deps.issueSignedIntakeToken({
      tokenId,
      orgId: input.orgId,
      expiresAt,
      now,
    });
    const tokenHash = this.deps.hashOpaqueToken(token);

    await this.deps.repo.createOnboardingIntakeToken({
      orgId: input.orgId,
      employeeProfileId,
      tokenHash,
      expiresAt: expiresAt.toISOString(),
      issuedBy: input.userId,
      inviteAfterIntake: input.inviteAfterIntake ?? true,
      inviteOverrideAllowed: input.inviteOverrideAllowed ?? true,
      intakeEmail: input.intakeEmail ?? null,
      metadata: {
        ...(input.metadata || {}),
        tokenId,
      },
    });
    emitOnboardingMetric({
      name: 'onboarding.intake.token.issued',
      value: 1,
      orgId: input.orgId,
      tags: {
        inviteAfterIntake: input.inviteAfterIntake ?? true,
        inviteOverrideAllowed: input.inviteOverrideAllowed ?? true,
      },
    });

    await this.deps.recordOrgAuditEvent({
      orgId: input.orgId,
      eventType: 'employee.intake.token.issued',
      actorUserId: input.userId,
      actorType: 'user',
      metadata: {
        employeeProfileId: employeeProfileId || null,
        inviteAfterIntake: input.inviteAfterIntake ?? true,
        inviteOverrideAllowed: input.inviteOverrideAllowed ?? true,
        expiresAt: expiresAt.toISOString(),
      },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || '';
    const intakeUrl = appUrl
      ? `${appUrl.replace(/\/+$/, '')}/fleet-compliance/onboarding/intake/${token}`
      : `/fleet-compliance/onboarding/intake/${token}`;

    return {
      token,
      intakeUrl,
      expiresAt: expiresAt.toISOString(),
      employeeProfile: profile,
    };
  }

  async lookupByToken(token: string): Promise<IntakeTokenLookupResult> {
    let claims: IntakeTokenClaims;
    try {
      claims = this.deps.verifySignedIntakeToken(token, this.deps.now());
    } catch (error: unknown) {
      if (error instanceof IntakeTokenError) {
        throw new OnboardingIntakeError(404, 'Invalid or expired intake token');
      }
      throw error;
    }

    const tokenHash = this.deps.hashOpaqueToken(token);
    const record = await this.deps.repo.getOnboardingIntakeTokenByHash({ tokenHash });
    if (!record) {
      throw new OnboardingIntakeError(404, 'Invalid or expired intake token');
    }

    const metadata = parseTokenMetadata(record.metadata);
    const metadataTokenId = typeof metadata.tokenId === 'string' ? metadata.tokenId : '';
    if (record.orgId !== claims.orgId || metadataTokenId !== claims.tid) {
      throw new OnboardingIntakeError(403, 'Token org binding mismatch');
    }
    await this.assertOnboardingModuleEnabled(record.orgId);

    if (record.status === 'consumed' || record.status === 'revoked') {
      throw new OnboardingIntakeError(409, 'Token has already been used');
    }
    if (new Date(record.expiresAt).getTime() <= Date.now()) {
      throw new OnboardingIntakeError(404, 'Invalid or expired intake token');
    }

    const profile = record.employeeProfileId
      ? await this.deps.repo.getEmployeeProfileById({
        orgId: record.orgId,
        employeeProfileId: record.employeeProfileId,
      })
      : null;

    return {
      orgId: record.orgId,
      employeeProfile: profile,
      inviteAfterIntake: record.inviteAfterIntake,
      intakeEmail: record.intakeEmail,
      expiresAt: record.expiresAt,
      status: record.status,
    };
  }

  async submitWithToken(input: {
    token: string;
    employee: OnboardingEmployeeInput;
  }): Promise<IntakeSubmissionResult> {
    let claims: IntakeTokenClaims;
    try {
      claims = this.deps.verifySignedIntakeToken(input.token, this.deps.now());
    } catch (error: unknown) {
      if (error instanceof IntakeTokenError) {
        throw new OnboardingIntakeError(404, 'Invalid or expired intake token');
      }
      throw error;
    }
    const tokenHash = this.deps.hashOpaqueToken(input.token);

    const claimed = await this.deps.repo.claimOnboardingIntakeToken({ tokenHash });
    if (!claimed) {
      throw new OnboardingIntakeError(409, 'Token is invalid, expired, or already used');
    }

    const metadata = parseTokenMetadata(claimed.metadata);
    const metadataTokenId = typeof metadata.tokenId === 'string' ? metadata.tokenId : '';
    if (claimed.orgId !== claims.orgId || metadataTokenId !== claims.tid) {
      await this.deps.repo.releaseOnboardingIntakeToken({
        tokenHash,
        errorMessage: 'Token org binding mismatch',
      });
      throw new OnboardingIntakeError(403, 'Token org binding mismatch');
    }
    await this.assertOnboardingModuleEnabled(claimed.orgId);

    const context = {
      orgId: claimed.orgId,
      userId: `token:${claims.tid}`,
    };

    try {
      const detail = claimed.employeeProfileId
        ? await this.deps.onboardingService.updateEmployeeAndStartRun({
          context,
          employeeProfileId: claimed.employeeProfileId,
          employee: input.employee,
          idempotencyKey: `intake:${claims.tid}`,
        })
        : await this.deps.onboardingService.createEmployeeAndStartRun({
          context,
          employee: input.employee,
          idempotencyKey: `intake:${claims.tid}`,
        });

      const consumed = await this.deps.repo.consumeOnboardingIntakeToken({
        tokenHash,
        metadata: {
          runId: detail.run.id,
          employeeProfileId: detail.employeeProfile.id,
          consumedAt: this.deps.now().toISOString(),
        },
      });
      if (!consumed) {
        throw new OnboardingIntakeError(409, 'Unable to consume intake token');
      }

      let inviteResult: OnboardingInviteResult | null = null;
      if (consumed.inviteAfterIntake) {
        inviteResult = await this.deps.sendOnboardingInvite({
          emailAddress: detail.employeeProfile.workEmail || consumed.intakeEmail,
          redirectUrl: resolveInviteRedirectUrl(),
          publicMetadata: {
            orgId: claimed.orgId,
            employeeProfileId: detail.employeeProfile.id,
            onboardingRunId: detail.run.id,
          },
        });
      }

      await this.deps.recordOrgAuditEvent({
        orgId: claimed.orgId,
        eventType: 'employee.intake.submitted',
        actorUserId: context.userId,
        actorType: 'system',
        metadata: {
          runId: detail.run.id,
          employeeProfileId: detail.employeeProfile.id,
          invited: inviteResult?.status === 'completed',
          inviteReason: inviteResult?.reason || null,
        },
      });

      if (inviteResult?.status === 'completed') {
        await this.deps.recordOrgAuditEvent({
          orgId: claimed.orgId,
          eventType: 'employee.profile.invited',
          actorUserId: context.userId,
          actorType: 'system',
          metadata: {
            employeeProfileId: detail.employeeProfile.id,
            invitationId: inviteResult.invitationId || null,
            source: 'intake.auto',
          },
        });
      }
      emitOnboardingMetric({
        name: 'onboarding.intake.submitted',
        value: 1,
        orgId: claimed.orgId,
        runId: detail.run.id,
        tags: {
          invited: inviteResult?.status === 'completed',
        },
      });

      return {
        detail,
        inviteResult,
      };
    } catch (error: unknown) {
      await this.deps.repo.releaseOnboardingIntakeToken({
        tokenHash,
        errorMessage: error instanceof Error ? error.message : String(error),
      });
      if (error instanceof OnboardingServiceError) {
        throw new OnboardingIntakeError(error.status, error.message);
      }
      throw error;
    }
  }
}

export const onboardingIntakeService = new OnboardingIntakeService();
