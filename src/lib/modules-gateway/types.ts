export type ModuleRuntime = 'python' | 'node';

export type ModuleRunStatus = 'queued' | 'running' | 'success' | 'fail';

export type ModuleRunErrorCode =
  | 'VALIDATION_ERROR'
  | 'MODULE_NOT_FOUND'
  | 'ACTION_NOT_ALLOWED'
  | 'MISSING_ENV'
  | 'EXEC_TIMEOUT'
  | 'EXEC_FAILED'
  | 'INTERNAL_ERROR';

export interface ModuleRunError {
  code: ModuleRunErrorCode;
  message: string;
  details?: string[];
}

export interface ModuleActionArgSpec {
  type: 'string' | 'number' | 'boolean';
  description?: string;
  required?: boolean;
  enum?: Array<string | number | boolean>;
  default?: string | number | boolean;
  min?: number;
  max?: number;
}

export interface ModuleActionArgsSchema {
  type: 'object';
  properties: Record<string, ModuleActionArgSpec>;
  required?: string[];
}

export type ModuleRunArgs = Record<string, unknown>;

export interface ResolvedModuleCommand {
  executable: string;
  args: string[];
}

export interface ModuleActionDefinition {
  actionId: string;
  description: string;
  argsSchema?: ModuleActionArgsSchema;
  defaultTimeoutMs?: number;
  commandPreview: string[];
  buildCommand: (args: ModuleRunArgs) => ResolvedModuleCommand;
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

export interface ModuleRunRecord {
  id: string;
  moduleId: string;
  actionId: string;
  status: ModuleRunStatus;
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
  exitCode: number | null;
  stdoutPreview: string;
  stderrPreview: string;
  stdoutTruncated: boolean;
  stderrTruncated: boolean;
  artifacts: ModuleRunArtifact[];
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

