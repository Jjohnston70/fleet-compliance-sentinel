export const ONBOARDING_RUN_STATUSES = [
  'queued',
  'running',
  'completed',
  'partial',
  'failed',
  'canceled',
] as const;

export type OnboardingRunStatus = (typeof ONBOARDING_RUN_STATUSES)[number];

export const ONBOARDING_STEP_STATUSES = [
  'queued',
  'running',
  'completed',
  'failed',
  'skipped',
] as const;

export type OnboardingStepStatus = (typeof ONBOARDING_STEP_STATUSES)[number];

export interface OnboardingEmployeeInput {
  externalEmployeeId?: string | null;
  clerkUserId?: string | null;
  firstName: string;
  lastName: string;
  workEmail?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  hireDate?: string | null;
  status?: string | null;
  isDriver?: boolean;
  hazmatRequired?: boolean;
  hazmatEndorsement?: string | null;
  cdlClass?: string | null;
  cdlExpiration?: string | null;
  medicalExpiration?: string | null;
  metadata?: Record<string, unknown>;
}

export interface OnboardingEmployeeProfile {
  id: string;
  orgId: string;
  externalEmployeeId: string | null;
  clerkUserId: string | null;
  firstName: string;
  lastName: string;
  workEmail: string | null;
  department: string | null;
  jobTitle: string | null;
  hireDate: string | null;
  status: string;
  isDriver: boolean;
  hazmatRequired: boolean;
  hazmatEndorsement: string | null;
  cdlClass: string | null;
  cdlExpiration: string | null;
  medicalExpiration: string | null;
  metadata: Record<string, unknown>;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingRunRecord {
  id: string;
  orgId: string;
  employeeProfileId: string;
  status: OnboardingRunStatus;
  source: string;
  initiatedBy: string | null;
  startedAt: string | null;
  completedAt: string | null;
  errorSummary: string | null;
  idempotencyKey: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingStepRecord {
  id: string;
  runId: string;
  stepKey: string;
  status: OnboardingStepStatus;
  attemptCount: number;
  startedAt: string | null;
  completedAt: string | null;
  errorMessage: string | null;
  output: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingTaskRecord {
  id: string;
  orgId: string;
  runId: string;
  employeeProfileId: string;
  taskKey: string;
  title: string;
  dueDate: string | null;
  status: string;
  externalTaskId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface OnboardingRunDetail {
  run: OnboardingRunRecord;
  employeeProfile: OnboardingEmployeeProfile;
  steps: OnboardingStepRecord[];
}

export interface OnboardingMutationContext {
  orgId: string;
  userId: string;
}

export interface OnboardingRunCreateInput {
  orgId: string;
  employeeProfileId: string;
  source: string;
  initiatedBy: string;
  idempotencyKey?: string | null;
  metadata?: Record<string, unknown>;
}

export interface OnboardingEventEnvelope {
  eventId: string;
  eventType: string;
  orgId: string;
  runId: string | null;
  actorUserId: string;
  occurredAt: string;
  payload: Record<string, unknown>;
}
