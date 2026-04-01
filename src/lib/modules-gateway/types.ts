export type ModuleRuntime = 'python' | 'node';

export type ModuleRunStatus = 'queued' | 'running' | 'success' | 'fail';

export type ModuleValidationIssueCode =
  | 'unknown_field'
  | 'required'
  | 'type'
  | 'enum'
  | 'min'
  | 'max'
  | 'coercion'
  | 'output_type'
  | 'output_required';

export interface ModuleValidationIssue {
  path: string;
  code: ModuleValidationIssueCode;
  message: string;
  expected?: string;
  received?: unknown;
  coerced?: boolean;
}

export type ModuleGatewayAclScopeType = 'module' | 'action' | 'tool';

export type ModuleGatewayAclPermission = 'view' | 'execute';

export interface ModuleGatewayAclRule {
  orgId: string;
  userId: string;
  scopeType: ModuleGatewayAclScopeType;
  scopeKey: string;
  canView: boolean;
  canExecute: boolean;
  updatedAt: string;
}

export interface ModuleGatewayAclDecision {
  allowed: boolean;
  permission: ModuleGatewayAclPermission;
  scopeType?: ModuleGatewayAclScopeType;
  scopeKey?: string;
  principal?: string;
}

export type ModuleRunErrorCode =
  | 'VALIDATION_ERROR'
  | 'PERMISSION_DENIED'
  | 'MODULE_NOT_FOUND'
  | 'ACTION_NOT_ALLOWED'
  | 'TENANT_ISOLATION_VIOLATION'
  | 'MISSING_ENV'
  | 'SANITIZATION_ERROR'
  | 'RATE_LIMITED'
  | 'RETRY_EXHAUSTED'
  | 'BUDGET_EXCEEDED'
  | 'EXEC_TIMEOUT'
  | 'EXEC_FAILED'
  | 'INTERNAL_ERROR';

export type ModuleRunErrorClass =
  | 'validation'
  | 'authorization'
  | 'isolation'
  | 'sandbox'
  | 'throttle'
  | 'retry'
  | 'budget'
  | 'execution'
  | 'system';

export interface ModuleRunErrorPolicy {
  class: ModuleRunErrorClass;
  retryable: boolean;
  defaultHttpStatus: number;
}

export const MODULE_RUN_ERROR_TAXONOMY: Readonly<Record<ModuleRunErrorCode, ModuleRunErrorPolicy>> = {
  VALIDATION_ERROR: { class: 'validation', retryable: false, defaultHttpStatus: 400 },
  PERMISSION_DENIED: { class: 'authorization', retryable: false, defaultHttpStatus: 403 },
  MODULE_NOT_FOUND: { class: 'validation', retryable: false, defaultHttpStatus: 404 },
  ACTION_NOT_ALLOWED: { class: 'validation', retryable: false, defaultHttpStatus: 400 },
  TENANT_ISOLATION_VIOLATION: { class: 'isolation', retryable: false, defaultHttpStatus: 403 },
  MISSING_ENV: { class: 'system', retryable: false, defaultHttpStatus: 500 },
  SANITIZATION_ERROR: { class: 'sandbox', retryable: false, defaultHttpStatus: 400 },
  RATE_LIMITED: { class: 'throttle', retryable: true, defaultHttpStatus: 429 },
  RETRY_EXHAUSTED: { class: 'retry', retryable: false, defaultHttpStatus: 503 },
  BUDGET_EXCEEDED: { class: 'budget', retryable: false, defaultHttpStatus: 429 },
  EXEC_TIMEOUT: { class: 'execution', retryable: true, defaultHttpStatus: 504 },
  EXEC_FAILED: { class: 'execution', retryable: true, defaultHttpStatus: 502 },
  INTERNAL_ERROR: { class: 'system', retryable: true, defaultHttpStatus: 500 },
};

export interface ModuleRunError {
  code: ModuleRunErrorCode;
  message: string;
  details?: string[];
  fieldErrors?: ModuleValidationIssue[];
}

export type ModuleGatewaySandboxEventType =
  | 'rate_limit'
  | 'concurrency_limit'
  | 'sanitization'
  | 'timeout';

export interface ModuleActionSandboxPolicy {
  rateLimitPerWindow?: number;
  rateLimitWindowSeconds?: number;
  maxConcurrentRuns?: number;
  enforcePathSanitization?: boolean;
}

export interface ModuleActionArgSpec {
  type: 'string' | 'number' | 'boolean' | 'object';
  description?: string;
  required?: boolean;
  enum?: Array<string | number | boolean>;
  default?: string | number | boolean | Record<string, unknown>;
  min?: number;
  max?: number;
}

export interface ModuleActionArgsSchema {
  type: 'object';
  properties: Record<string, ModuleActionArgSpec>;
  required?: string[];
}

export type ModuleRunArgs = Record<string, unknown>;

export interface ModuleCallEnvelope {
  requestId: string;
  orgId: string;
  userId: string;
  qualifiedName: string;
  args: ModuleRunArgs;
  attempt: number;
  status: ModuleRunStatus;
  errorCode?: ModuleRunErrorCode;
}

export interface ResolvedModuleCommand {
  executable: string;
  args: string[];
}

export interface ModuleActionExecutionResult {
  ok: boolean;
  message: string;
  errorCode?: ModuleRunErrorCode;
  stderr?: string;
  details?: string[];
  data?: unknown;
  artifacts?: ModuleRunArtifact[];
}

export interface ModuleActionDefinition {
  actionId: string;
  description: string;
  argsSchema?: ModuleActionArgsSchema;
  outputSchema?: ModuleActionArgsSchema;
  sandbox?: ModuleActionSandboxPolicy;
  defaultTimeoutMs?: number;
  commandPreview: string[];
  buildCommand?: (args: ModuleRunArgs) => ResolvedModuleCommand;
  execute?: (args: ModuleRunArgs) => Promise<ModuleActionExecutionResult> | ModuleActionExecutionResult;
}

export interface ModuleDefinition {
  moduleId: string;
  displayName: string;
  runtime: ModuleRuntime;
  workingDirectory: string;
  actions: ModuleActionDefinition[];
}

export interface ModuleCatalogAction {
  actionId: string;
  description: string;
  argsSchema: ModuleActionArgsSchema;
  timeoutMs: number;
  commandPreview: string[];
}

export interface ModuleCatalogEntry {
  moduleId: string;
  displayName: string;
  runtime: ModuleRuntime;
  actions: ModuleCatalogAction[];
}

export interface ModuleRunRequest {
  moduleId: string;
  actionId: string;
  args: ModuleRunArgs;
  correlationId?: string;
  timeoutMs?: number;
  dryRun?: boolean;
}

export interface ModuleRunArtifact {
  kind: 'file';
  path: string;
  sizeBytes: number;
  modifiedAt: string;
}

export interface ModuleRunAttempt {
  attempt: number;
  startedAt: string;
  endedAt: string;
  durationMs: number;
  status: ModuleRunStatus;
  errorCode?: ModuleRunErrorCode;
  errorMessage?: string;
}

export interface ModuleRunEscalation {
  escalatedAt: string;
  reason: 'retry_exhausted';
  attempts: number;
  lastErrorCode?: ModuleRunErrorCode;
  lastErrorMessage?: string;
}

export interface ModuleRunRecord {
  id: string;
  moduleId: string;
  actionId: string;
  status: ModuleRunStatus;
  orgId: string;
  args: ModuleRunArgs;
  requestedBy: string;
  correlationId?: string;
  timeoutMs: number;
  dryRun: boolean;
  command: string[];
  cwd: string;
  createdAt: string;
  startedAt: string | null;
  endedAt: string | null;
  durationMs: number | null;
  attemptCount: number;
  maxAttempts: number;
  retryHistory: ModuleRunAttempt[];
  exitCode: number | null;
  stdoutPreview: string;
  stderrPreview: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  artifacts: ModuleRunArtifact[];
  result?: unknown;
  escalation?: ModuleRunEscalation | null;
  error?: ModuleRunError;
}

export interface ModuleRunResult {
  ok: true;
  run: ModuleRunRecord;
}

export interface ModuleRunFailure {
  ok: false;
  error: ModuleRunError;
  httpStatus: number;
}

export type ModuleRunStartResult = ModuleRunResult | ModuleRunFailure;

export type AiUsageFeature =
  | 'penny.query'
  | 'module.gateway'
  | 'command-center';

export interface AiUsageCostRecord {
  requestId: string;
  orgId: string;
  userId: string;
  feature: AiUsageFeature;
  provider: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  metadata?: Record<string, unknown> | null;
}

export type AiBudgetAlertLevel = 'warning' | 'critical';

export interface AiBudgetAlertRecord {
  orgId: string;
  level: AiBudgetAlertLevel;
  periodStart: string;
  periodEnd: string;
  spendUsd: number;
  thresholdUsd: number;
}

export type ModuleInvocationAuditEventType =
  | 'run_submitted'
  | 'attempt_completed'
  | 'run_escalated'
  | 'remote_dispatch';

export interface ModuleInvocationAuditRecord {
  id: number;
  runId: string;
  eventType: ModuleInvocationAuditEventType;
  requestId: string;
  orgId: string;
  userId: string;
  moduleId: string;
  actionId: string;
  qualifiedName: string;
  status: ModuleRunStatus;
  attempt: number;
  maxAttempts: number;
  correlationId?: string | null;
  timeoutMs: number;
  dryRun: boolean;
  durationMs?: number | null;
  errorCode?: ModuleRunErrorCode | null;
  errorMessage?: string | null;
  argsRedacted: Record<string, unknown> | null;
  resultRedacted: Record<string, unknown> | null;
  detailsRedacted: Record<string, unknown> | null;
  createdAt: string;
}

