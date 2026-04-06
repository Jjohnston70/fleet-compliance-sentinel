import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingIntakeTokenRecord,
  OnboardingOutboxEventRecord,
  OnboardingOutboxStatus,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
  OnboardingStepStatus,
  OnboardingStepRecord,
  OnboardingTaskRecord,
} from '@/lib/onboarding/types';

function normalizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function normalizeOptionalText(value: unknown, maxLength = 255): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function normalizeStatus(value: unknown): string {
  if (typeof value !== 'string') return 'active';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return 'active';
  return trimmed.slice(0, 64);
}

function parseObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseBool(value: unknown): boolean {
  return value === true || value === 'true' || value === 1 || value === '1';
}

function mapEmployeeRow(row: Record<string, unknown>): OnboardingEmployeeProfile {
  return {
    id: String(row.id ?? ''),
    orgId: String(row.org_id ?? ''),
    externalEmployeeId: normalizeOptionalText(row.external_employee_id),
    clerkUserId: normalizeOptionalText(row.clerk_user_id),
    firstName: String(row.first_name ?? ''),
    lastName: String(row.last_name ?? ''),
    workEmail: normalizeOptionalText(row.work_email),
    department: normalizeOptionalText(row.department),
    jobTitle: normalizeOptionalText(row.job_title),
    hireDate: normalizeIsoDate(row.hire_date),
    status: normalizeStatus(row.status),
    isDriver: parseBool(row.is_driver),
    hazmatRequired: parseBool(row.hazmat_required),
    hazmatEndorsement: normalizeOptionalText(row.hazmat_endorsement),
    cdlClass: normalizeOptionalText(row.cdl_class),
    cdlExpiration: normalizeIsoDate(row.cdl_expiration),
    medicalExpiration: normalizeIsoDate(row.medical_expiration),
    metadata: parseObject(row.metadata),
    createdBy: normalizeOptionalText(row.created_by),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapRunRow(row: Record<string, unknown>): OnboardingRunRecord {
  return {
    id: String(row.id ?? ''),
    orgId: String(row.org_id ?? ''),
    employeeProfileId: String(row.employee_profile_id ?? ''),
    status: String(row.status ?? 'queued') as OnboardingRunRecord['status'],
    source: String(row.source ?? ''),
    initiatedBy: normalizeOptionalText(row.initiated_by),
    startedAt: row.started_at ? String(row.started_at) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    errorSummary: normalizeOptionalText(row.error_summary, 2_000),
    idempotencyKey: normalizeOptionalText(row.idempotency_key),
    metadata: parseObject(row.metadata),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapStepRow(row: Record<string, unknown>): OnboardingStepRecord {
  return {
    id: String(row.id ?? ''),
    runId: String(row.run_id ?? ''),
    stepKey: String(row.step_key ?? ''),
    status: String(row.status ?? 'queued') as OnboardingStepRecord['status'],
    attemptCount: Number(row.attempt_count ?? 0),
    startedAt: row.started_at ? String(row.started_at) : null,
    completedAt: row.completed_at ? String(row.completed_at) : null,
    errorMessage: normalizeOptionalText(row.error_message, 2_000),
    output: parseObject(row.output),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapTaskRow(row: Record<string, unknown>): OnboardingTaskRecord {
  return {
    id: String(row.id ?? ''),
    orgId: String(row.org_id ?? ''),
    runId: String(row.run_id ?? ''),
    employeeProfileId: String(row.employee_profile_id ?? ''),
    taskKey: String(row.task_key ?? ''),
    title: String(row.title ?? ''),
    dueDate: normalizeIsoDate(row.due_date),
    status: String(row.status ?? 'pending'),
    externalTaskId: normalizeOptionalText(row.external_task_id),
    syncAttemptCount: Number(row.sync_attempt_count ?? 0),
    syncLastError: normalizeOptionalText(row.sync_last_error, 2_000),
    metadata: parseObject(row.metadata),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

function mapOutboxRow(row: Record<string, unknown>): OnboardingOutboxEventRecord {
  return {
    id: String(row.id ?? ''),
    orgId: String(row.org_id ?? ''),
    runId: row.run_id ? String(row.run_id) : null,
    eventType: String(row.event_type ?? ''),
    payload: parseObject(row.payload),
    status: String(row.status ?? 'pending') as OnboardingOutboxStatus,
    attemptCount: Number(row.attempt_count ?? 0),
    nextAttemptAt: String(row.next_attempt_at ?? ''),
    lastError: normalizeOptionalText(row.last_error, 2_000),
    dedupeKey: normalizeOptionalText(row.dedupe_key),
    createdAt: String(row.created_at ?? ''),
    processedAt: row.processed_at ? String(row.processed_at) : null,
  };
}

function mapIntakeTokenRow(row: Record<string, unknown>): OnboardingIntakeTokenRecord {
  return {
    id: String(row.id ?? ''),
    orgId: String(row.org_id ?? ''),
    employeeProfileId: row.employee_profile_id ? String(row.employee_profile_id) : null,
    tokenHash: String(row.token_hash ?? ''),
    status: String(row.status ?? 'issued') as OnboardingIntakeTokenRecord['status'],
    expiresAt: String(row.expires_at ?? ''),
    issuedBy: String(row.issued_by ?? ''),
    consumedAt: row.consumed_at ? String(row.consumed_at) : null,
    inviteAfterIntake: parseBool(row.invite_after_intake),
    inviteOverrideAllowed: parseBool(row.invite_override_allowed),
    intakeEmail: normalizeOptionalText(row.intake_email, 320),
    metadata: parseObject(row.metadata),
    createdAt: String(row.created_at ?? ''),
    updatedAt: String(row.updated_at ?? ''),
  };
}

export async function ensureOnboardingTables(): Promise<void> {
  await ensureOrgScopingTables();
  const sql = getSQL();
  await sql`
    CREATE TABLE IF NOT EXISTS employee_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      external_employee_id TEXT,
      clerk_user_id TEXT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      work_email TEXT,
      department TEXT,
      job_title TEXT,
      hire_date DATE,
      status TEXT NOT NULL DEFAULT 'active',
      is_driver BOOLEAN NOT NULL DEFAULT FALSE,
      hazmat_required BOOLEAN NOT NULL DEFAULT FALSE,
      hazmat_endorsement TEXT,
      cdl_class TEXT,
      cdl_expiration DATE,
      medical_expiration DATE,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (org_id, external_employee_id),
      UNIQUE (org_id, clerk_user_id)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_employee_profiles_org ON employee_profiles(org_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_employee_profiles_org_driver_hazmat
    ON employee_profiles(org_id, is_driver, hazmat_required)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS employee_onboarding_runs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
      status TEXT NOT NULL DEFAULT 'queued',
      source TEXT NOT NULL,
      initiated_by TEXT,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      error_summary TEXT,
      idempotency_key TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    ALTER TABLE employee_onboarding_runs
    ADD COLUMN IF NOT EXISTS idempotency_key TEXT
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_runs_org_status
    ON employee_onboarding_runs(org_id, status, created_at DESC)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_runs_idempotency
    ON employee_onboarding_runs(org_id, employee_profile_id, source, idempotency_key)
    WHERE idempotency_key IS NOT NULL
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS employee_onboarding_steps (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
      step_key TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'queued',
      attempt_count INT NOT NULL DEFAULT 0,
      started_at TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      error_message TEXT,
      output JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (run_id, step_key)
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS onboarding_outbox_events (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      run_id UUID REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      attempt_count INT NOT NULL DEFAULT 0,
      next_attempt_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_error TEXT,
      dedupe_key TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    )
  `;
  await sql`
    ALTER TABLE onboarding_outbox_events
    ADD COLUMN IF NOT EXISTS dedupe_key TEXT
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_pending
    ON onboarding_outbox_events(status, next_attempt_at)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_outbox_org
    ON onboarding_outbox_events(org_id, created_at DESC)
  `;
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_onboarding_outbox_dedupe_active
    ON onboarding_outbox_events(dedupe_key)
    WHERE dedupe_key IS NOT NULL AND status IN ('pending', 'retrying')
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS onboarding_tasks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      run_id UUID NOT NULL REFERENCES employee_onboarding_runs(id) ON DELETE CASCADE,
      employee_profile_id UUID NOT NULL REFERENCES employee_profiles(id) ON DELETE CASCADE,
      task_key TEXT NOT NULL,
      title TEXT NOT NULL,
      due_date DATE,
      status TEXT NOT NULL DEFAULT 'pending',
      external_task_id TEXT,
      sync_attempt_count INT NOT NULL DEFAULT 0,
      sync_last_error TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (run_id, task_key)
    )
  `;
  await sql`
    ALTER TABLE onboarding_tasks
    ADD COLUMN IF NOT EXISTS sync_attempt_count INT NOT NULL DEFAULT 0
  `;
  await sql`
    ALTER TABLE onboarding_tasks
    ADD COLUMN IF NOT EXISTS sync_last_error TEXT
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_org
    ON onboarding_tasks(org_id, created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS onboarding_intake_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      org_id TEXT NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
      employee_profile_id UUID REFERENCES employee_profiles(id) ON DELETE SET NULL,
      token_hash TEXT NOT NULL UNIQUE,
      status TEXT NOT NULL DEFAULT 'issued',
      expires_at TIMESTAMPTZ NOT NULL,
      issued_by TEXT NOT NULL,
      consumed_at TIMESTAMPTZ,
      invite_after_intake BOOLEAN NOT NULL DEFAULT TRUE,
      invite_override_allowed BOOLEAN NOT NULL DEFAULT TRUE,
      intake_email TEXT,
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_intake_tokens_org
    ON onboarding_intake_tokens(org_id, created_at DESC)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_intake_tokens_status
    ON onboarding_intake_tokens(status, expires_at)
  `;
}

export async function insertOnboardingEvent(event: OnboardingEventEnvelope): Promise<void> {
  await ensureOnboardingTables();
  const sql = getSQL();
  await sql`
    INSERT INTO onboarding_outbox_events (
      org_id,
      run_id,
      event_type,
      payload,
      status,
      attempt_count,
      next_attempt_at
    ) VALUES (
      ${event.orgId},
      ${event.runId},
      ${event.eventType},
      ${JSON.stringify(event)}::jsonb,
      'pending',
      0,
      NOW()
    )
  `;
}

function sanitizeEmployeeInput(input: OnboardingEmployeeInput): OnboardingEmployeeInput {
  return {
    externalEmployeeId: normalizeOptionalText(input.externalEmployeeId, 128),
    clerkUserId: normalizeOptionalText(input.clerkUserId, 128),
    firstName: normalizeOptionalText(input.firstName, 160) || '',
    lastName: normalizeOptionalText(input.lastName, 160) || '',
    workEmail: normalizeOptionalText(input.workEmail, 320),
    department: normalizeOptionalText(input.department, 160),
    jobTitle: normalizeOptionalText(input.jobTitle, 160),
    hireDate: normalizeIsoDate(input.hireDate),
    status: normalizeStatus(input.status),
    isDriver: Boolean(input.isDriver),
    hazmatRequired: Boolean(input.hazmatRequired),
    hazmatEndorsement: normalizeOptionalText(input.hazmatEndorsement, 64),
    cdlClass: normalizeOptionalText(input.cdlClass, 8),
    cdlExpiration: normalizeIsoDate(input.cdlExpiration),
    medicalExpiration: normalizeIsoDate(input.medicalExpiration),
    metadata: parseObject(input.metadata),
  };
}

export async function createEmployeeProfile(input: {
  orgId: string;
  createdBy: string;
  employee: OnboardingEmployeeInput;
}): Promise<OnboardingEmployeeProfile> {
  await ensureOnboardingTables();
  const employee = sanitizeEmployeeInput(input.employee);
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO employee_profiles (
      org_id,
      external_employee_id,
      clerk_user_id,
      first_name,
      last_name,
      work_email,
      department,
      job_title,
      hire_date,
      status,
      is_driver,
      hazmat_required,
      hazmat_endorsement,
      cdl_class,
      cdl_expiration,
      medical_expiration,
      metadata,
      created_by
    ) VALUES (
      ${input.orgId},
      ${employee.externalEmployeeId ?? null},
      ${employee.clerkUserId ?? null},
      ${employee.firstName},
      ${employee.lastName},
      ${employee.workEmail ?? null},
      ${employee.department ?? null},
      ${employee.jobTitle ?? null},
      ${employee.hireDate ?? null},
      ${employee.status ?? 'active'},
      ${Boolean(employee.isDriver)},
      ${Boolean(employee.hazmatRequired)},
      ${employee.hazmatEndorsement ?? null},
      ${employee.cdlClass ?? null},
      ${employee.cdlExpiration ?? null},
      ${employee.medicalExpiration ?? null},
      ${JSON.stringify(employee.metadata ?? {})}::jsonb,
      ${input.createdBy}
    )
    RETURNING *
  `;
  return mapEmployeeRow(rows[0] as Record<string, unknown>);
}

export async function updateEmployeeProfile(input: {
  orgId: string;
  employeeProfileId: string;
  employee: OnboardingEmployeeInput;
}): Promise<OnboardingEmployeeProfile | null> {
  await ensureOnboardingTables();
  const employee = sanitizeEmployeeInput(input.employee);
  const sql = getSQL();
  const rows = await sql`
    UPDATE employee_profiles
    SET
      external_employee_id = ${employee.externalEmployeeId ?? null},
      clerk_user_id = ${employee.clerkUserId ?? null},
      first_name = ${employee.firstName},
      last_name = ${employee.lastName},
      work_email = ${employee.workEmail ?? null},
      department = ${employee.department ?? null},
      job_title = ${employee.jobTitle ?? null},
      hire_date = ${employee.hireDate ?? null},
      status = ${employee.status ?? 'active'},
      is_driver = ${Boolean(employee.isDriver)},
      hazmat_required = ${Boolean(employee.hazmatRequired)},
      hazmat_endorsement = ${employee.hazmatEndorsement ?? null},
      cdl_class = ${employee.cdlClass ?? null},
      cdl_expiration = ${employee.cdlExpiration ?? null},
      medical_expiration = ${employee.medicalExpiration ?? null},
      metadata = ${JSON.stringify(employee.metadata ?? {})}::jsonb,
      updated_at = NOW()
    WHERE id = ${input.employeeProfileId}::uuid
      AND org_id = ${input.orgId}
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapEmployeeRow(rows[0] as Record<string, unknown>);
}

export async function getEmployeeProfileById(input: {
  orgId: string;
  employeeProfileId: string;
}): Promise<OnboardingEmployeeProfile | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM employee_profiles
    WHERE org_id = ${input.orgId}
      AND id = ${input.employeeProfileId}::uuid
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapEmployeeRow(rows[0] as Record<string, unknown>);
}

export async function createRun(input: OnboardingRunCreateInput): Promise<OnboardingRunRecord> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO employee_onboarding_runs (
      org_id,
      employee_profile_id,
      status,
      source,
      initiated_by,
      started_at,
      idempotency_key,
      metadata
    ) VALUES (
      ${input.orgId},
      ${input.employeeProfileId}::uuid,
      'running',
      ${input.source},
      ${input.initiatedBy},
      NOW(),
      ${input.idempotencyKey ?? null},
      ${JSON.stringify(input.metadata ?? {})}::jsonb
    )
    ON CONFLICT (org_id, employee_profile_id, source, idempotency_key)
    WHERE idempotency_key IS NOT NULL
    DO UPDATE
      SET updated_at = NOW()
    RETURNING *
  `;
  return mapRunRow(rows[0] as Record<string, unknown>);
}

export async function listRuns(orgId: string, limit = 100): Promise<OnboardingRunRecord[]> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM employee_onboarding_runs
    WHERE org_id = ${orgId}
    ORDER BY created_at DESC
    LIMIT ${Math.max(1, Math.min(limit, 500))}
  `;
  return rows.map((row) => mapRunRow(row as Record<string, unknown>));
}

export async function getRun(orgId: string, runId: string): Promise<OnboardingRunRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM employee_onboarding_runs
    WHERE org_id = ${orgId}
      AND id = ${runId}::uuid
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapRunRow(rows[0] as Record<string, unknown>);
}

export async function listRunSteps(runId: string): Promise<OnboardingStepRecord[]> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM employee_onboarding_steps
    WHERE run_id = ${runId}::uuid
    ORDER BY created_at ASC, step_key ASC
  `;
  return rows.map((row) => mapStepRow(row as Record<string, unknown>));
}

export async function upsertStep(input: {
  runId: string;
  stepKey: string;
  status: OnboardingStepStatus;
  output: Record<string, unknown>;
  errorMessage?: string | null;
}): Promise<OnboardingStepRecord> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO employee_onboarding_steps (
      run_id,
      step_key,
      status,
      attempt_count,
      started_at,
      completed_at,
      error_message,
      output
    ) VALUES (
      ${input.runId}::uuid,
      ${input.stepKey},
      ${input.status},
      1,
      NOW(),
      CASE
        WHEN ${input.status} IN ('completed', 'failed', 'skipped')
          THEN NOW()
        ELSE NULL
      END,
      ${input.errorMessage ?? null},
      ${JSON.stringify(input.output)}::jsonb
    )
    ON CONFLICT (run_id, step_key)
    DO UPDATE SET
      status = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.status
        ELSE EXCLUDED.status
      END,
      attempt_count = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.attempt_count
        ELSE employee_onboarding_steps.attempt_count + 1
      END,
      started_at = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.started_at
        ELSE NOW()
      END,
      completed_at = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.completed_at
        WHEN EXCLUDED.status IN ('completed', 'failed', 'skipped')
          THEN NOW()
        ELSE NULL
      END,
      error_message = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.error_message
        ELSE EXCLUDED.error_message
      END,
      output = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.output
        ELSE EXCLUDED.output
      END,
      updated_at = NOW()
    RETURNING *
  `;
  return mapStepRow(rows[0] as Record<string, unknown>);
}

export async function upsertCompletedStep(input: {
  runId: string;
  stepKey: string;
  output: Record<string, unknown>;
}): Promise<OnboardingStepRecord> {
  return upsertStep({
    runId: input.runId,
    stepKey: input.stepKey,
    status: 'completed',
    output: input.output,
    errorMessage: null,
  });
}

export async function markRunCompleted(input: {
  orgId: string;
  runId: string;
  metadata?: Record<string, unknown>;
}): Promise<OnboardingRunRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE employee_onboarding_runs
    SET
      status = 'completed',
      completed_at = NOW(),
      error_summary = NULL,
      metadata = (COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(input.metadata ?? {})}::jsonb),
      updated_at = NOW()
    WHERE org_id = ${input.orgId}
      AND id = ${input.runId}::uuid
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapRunRow(rows[0] as Record<string, unknown>);
}

export async function getRunDetail(input: {
  orgId: string;
  runId: string;
}): Promise<OnboardingRunDetail | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const runRows = await sql`
    SELECT *
    FROM employee_onboarding_runs
    WHERE org_id = ${input.orgId}
      AND id = ${input.runId}::uuid
    LIMIT 1
  `;
  if (runRows.length === 0) return null;
  const run = mapRunRow(runRows[0] as Record<string, unknown>);

  const profileRows = await sql`
    SELECT *
    FROM employee_profiles
    WHERE org_id = ${input.orgId}
      AND id = ${run.employeeProfileId}::uuid
    LIMIT 1
  `;
  if (profileRows.length === 0) return null;
  const employeeProfile = mapEmployeeRow(profileRows[0] as Record<string, unknown>);
  const steps = await listRunSteps(run.id);
  return {
    run,
    employeeProfile,
    steps,
  };
}

export async function upsertFallbackTask(input: {
  orgId: string;
  runId: string;
  employeeProfileId: string;
  taskKey: string;
  title: string;
  dueDate?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<OnboardingTaskRecord> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO onboarding_tasks (
      org_id,
      run_id,
      employee_profile_id,
      task_key,
      title,
      due_date,
      status,
      metadata
    ) VALUES (
      ${input.orgId},
      ${input.runId}::uuid,
      ${input.employeeProfileId}::uuid,
      ${input.taskKey},
      ${input.title},
      ${normalizeIsoDate(input.dueDate) ?? null},
      'pending',
      ${JSON.stringify(input.metadata ?? {})}::jsonb
    )
    ON CONFLICT (run_id, task_key)
    DO UPDATE SET
      title = EXCLUDED.title,
      due_date = EXCLUDED.due_date,
      metadata = onboarding_tasks.metadata || EXCLUDED.metadata,
      updated_at = NOW()
    RETURNING *
  `;
  return mapTaskRow(rows[0] as Record<string, unknown>);
}

export async function updateOnboardingTaskExternalId(input: {
  orgId: string;
  taskId: string;
  externalTaskId: string;
}): Promise<OnboardingTaskRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_tasks
    SET
      external_task_id = ${input.externalTaskId},
      sync_last_error = NULL,
      updated_at = NOW()
    WHERE org_id = ${input.orgId}
      AND id = ${input.taskId}::uuid
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapTaskRow(rows[0] as Record<string, unknown>);
}

export async function markOnboardingTaskSyncFailure(input: {
  orgId: string;
  taskId: string;
  errorMessage: string;
}): Promise<OnboardingTaskRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_tasks
    SET
      sync_attempt_count = sync_attempt_count + 1,
      sync_last_error = ${input.errorMessage.slice(0, 2000)},
      updated_at = NOW()
    WHERE org_id = ${input.orgId}
      AND id = ${input.taskId}::uuid
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapTaskRow(rows[0] as Record<string, unknown>);
}

export async function listUnsyncedOnboardingTasks(input: {
  orgId?: string;
  limit?: number;
}): Promise<OnboardingTaskRecord[]> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const limit = Math.max(1, Math.min(input.limit ?? 100, 500));

  if (input.orgId) {
    const rows = await sql`
      SELECT *
      FROM onboarding_tasks
      WHERE org_id = ${input.orgId}
        AND external_task_id IS NULL
      ORDER BY created_at ASC
      LIMIT ${limit}
    `;
    return rows.map((row) => mapTaskRow(row as Record<string, unknown>));
  }

  const rows = await sql`
    SELECT *
    FROM onboarding_tasks
    WHERE external_task_id IS NULL
    ORDER BY created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((row) => mapTaskRow(row as Record<string, unknown>));
}

export async function enqueueOutboxEvent(input: {
  orgId: string;
  runId?: string | null;
  eventType: string;
  payload: Record<string, unknown>;
  dedupeKey?: string | null;
}): Promise<OnboardingOutboxEventRecord> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO onboarding_outbox_events (
      org_id,
      run_id,
      event_type,
      payload,
      status,
      attempt_count,
      next_attempt_at,
      dedupe_key
    ) VALUES (
      ${input.orgId},
      ${input.runId ?? null},
      ${input.eventType},
      ${JSON.stringify(input.payload)}::jsonb,
      'pending',
      0,
      NOW(),
      ${input.dedupeKey ?? null}
    )
    ON CONFLICT (dedupe_key)
    WHERE dedupe_key IS NOT NULL
    DO UPDATE SET
      payload = EXCLUDED.payload,
      run_id = EXCLUDED.run_id
    RETURNING *
  `;
  return mapOutboxRow(rows[0] as Record<string, unknown>);
}

export async function listDueOutboxEvents(input?: {
  eventTypes?: string[];
  limit?: number;
}): Promise<OnboardingOutboxEventRecord[]> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const limit = Math.max(1, Math.min(input?.limit ?? 100, 500));
  const eventTypes = Array.isArray(input?.eventTypes)
    ? input!.eventTypes.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
    : [];

  if (eventTypes.length > 0) {
    const rows = await sql`
      SELECT *
      FROM onboarding_outbox_events
      WHERE status IN ('pending', 'retrying')
        AND next_attempt_at <= NOW()
        AND event_type = ANY(${eventTypes}::text[])
      ORDER BY next_attempt_at ASC, created_at ASC
      LIMIT ${limit}
    `;
    return rows.map((row) => mapOutboxRow(row as Record<string, unknown>));
  }

  const rows = await sql`
    SELECT *
    FROM onboarding_outbox_events
    WHERE status IN ('pending', 'retrying')
      AND next_attempt_at <= NOW()
    ORDER BY next_attempt_at ASC, created_at ASC
    LIMIT ${limit}
  `;
  return rows.map((row) => mapOutboxRow(row as Record<string, unknown>));
}

export async function markOutboxEventProcessed(input: {
  eventId: string;
}): Promise<OnboardingOutboxEventRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_outbox_events
    SET
      status = 'processed',
      processed_at = NOW()
    WHERE id = ${input.eventId}::uuid
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapOutboxRow(rows[0] as Record<string, unknown>);
}

export async function markOutboxEventRetry(input: {
  eventId: string;
  nextAttemptAt: Date;
  terminal: boolean;
  errorMessage: string;
}): Promise<OnboardingOutboxEventRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_outbox_events
    SET
      status = CASE WHEN ${input.terminal} THEN 'failed' ELSE 'retrying' END,
      attempt_count = attempt_count + 1,
      next_attempt_at = ${input.nextAttemptAt.toISOString()},
      last_error = ${input.errorMessage.slice(0, 2000)},
      processed_at = CASE WHEN ${input.terminal} THEN NOW() ELSE NULL END
    WHERE id = ${input.eventId}::uuid
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapOutboxRow(rows[0] as Record<string, unknown>);
}

export async function createOnboardingIntakeToken(input: {
  orgId: string;
  employeeProfileId?: string | null;
  tokenHash: string;
  expiresAt: string;
  issuedBy: string;
  inviteAfterIntake: boolean;
  inviteOverrideAllowed: boolean;
  intakeEmail?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<OnboardingIntakeTokenRecord> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    INSERT INTO onboarding_intake_tokens (
      org_id,
      employee_profile_id,
      token_hash,
      status,
      expires_at,
      issued_by,
      invite_after_intake,
      invite_override_allowed,
      intake_email,
      metadata
    ) VALUES (
      ${input.orgId},
      ${input.employeeProfileId ?? null},
      ${input.tokenHash},
      'issued',
      ${input.expiresAt},
      ${input.issuedBy},
      ${input.inviteAfterIntake},
      ${input.inviteOverrideAllowed},
      ${normalizeOptionalText(input.intakeEmail, 320)},
      ${JSON.stringify(input.metadata ?? {})}::jsonb
    )
    RETURNING *
  `;
  return mapIntakeTokenRow(rows[0] as Record<string, unknown>);
}

export async function getOnboardingIntakeTokenByHash(input: {
  tokenHash: string;
}): Promise<OnboardingIntakeTokenRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    SELECT *
    FROM onboarding_intake_tokens
    WHERE token_hash = ${input.tokenHash}
    LIMIT 1
  `;
  if (rows.length === 0) return null;
  return mapIntakeTokenRow(rows[0] as Record<string, unknown>);
}

export async function claimOnboardingIntakeToken(input: {
  tokenHash: string;
}): Promise<OnboardingIntakeTokenRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_intake_tokens
    SET
      status = 'processing',
      updated_at = NOW()
    WHERE token_hash = ${input.tokenHash}
      AND status = 'issued'
      AND expires_at > NOW()
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapIntakeTokenRow(rows[0] as Record<string, unknown>);
}

export async function releaseOnboardingIntakeToken(input: {
  tokenHash: string;
  errorMessage?: string;
}): Promise<OnboardingIntakeTokenRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_intake_tokens
    SET
      status = 'issued',
      metadata = (COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify({
        lastError: normalizeOptionalText(input.errorMessage, 1000),
        releasedAt: new Date().toISOString(),
      })}::jsonb),
      updated_at = NOW()
    WHERE token_hash = ${input.tokenHash}
      AND status = 'processing'
      AND expires_at > NOW()
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapIntakeTokenRow(rows[0] as Record<string, unknown>);
}

export async function consumeOnboardingIntakeToken(input: {
  tokenHash: string;
  metadata?: Record<string, unknown>;
}): Promise<OnboardingIntakeTokenRecord | null> {
  await ensureOnboardingTables();
  const sql = getSQL();
  const rows = await sql`
    UPDATE onboarding_intake_tokens
    SET
      status = 'consumed',
      consumed_at = NOW(),
      metadata = (COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(input.metadata ?? {})}::jsonb),
      updated_at = NOW()
    WHERE token_hash = ${input.tokenHash}
      AND status = 'processing'
      AND expires_at > NOW()
    RETURNING *
  `;
  if (rows.length === 0) return null;
  return mapIntakeTokenRow(rows[0] as Record<string, unknown>);
}
