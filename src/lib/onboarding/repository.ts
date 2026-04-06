import { ensureOrgScopingTables, getSQL } from '@/lib/fleet-compliance-db';
import type {
  OnboardingEmployeeInput,
  OnboardingEmployeeProfile,
  OnboardingEventEnvelope,
  OnboardingRunCreateInput,
  OnboardingRunDetail,
  OnboardingRunRecord,
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
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    )
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
      metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (run_id, task_key)
    )
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_onboarding_tasks_org
    ON onboarding_tasks(org_id, created_at DESC)
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

export async function upsertCompletedStep(input: {
  runId: string;
  stepKey: string;
  output: Record<string, unknown>;
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
      output
    ) VALUES (
      ${input.runId}::uuid,
      ${input.stepKey},
      'completed',
      1,
      NOW(),
      NOW(),
      ${JSON.stringify(input.output)}::jsonb
    )
    ON CONFLICT (run_id, step_key)
    DO UPDATE SET
      status = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.status
        ELSE 'completed'
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
        ELSE NOW()
      END,
      error_message = CASE
        WHEN employee_onboarding_steps.status = 'completed'
          THEN employee_onboarding_steps.error_message
        ELSE NULL
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
