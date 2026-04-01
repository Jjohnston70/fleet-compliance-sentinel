import path from 'node:path';
import { existsSync } from 'node:fs';
import type {
  ModuleActionDefinition,
  ModuleActionArgsSchema,
  ModuleCatalogEntry,
  ModuleDefinition,
  ModuleRunArgs,
} from '@/lib/modules-gateway/types';

const PYTHON_EXECUTABLE = process.env.MODULE_GATEWAY_PYTHON_BIN || 'python';
const NPM_EXECUTABLE = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const TOOLING_ROOT = path.join(process.cwd(), 'tooling');
const DEFAULT_ACTION_TIMEOUT_MS = 300_000;

const EMPTY_ARGS_SCHEMA: ModuleActionArgsSchema = {
  type: 'object',
  properties: {},
  required: [],
};

function toolingPath(moduleName: string): string {
  return path.join(TOOLING_ROOT, moduleName);
}

function pythonAction(
  actionId: string,
  description: string,
  commandPreview: string[],
  buildArgs: (args: ModuleRunArgs) => string[],
  argsSchema?: ModuleActionArgsSchema,
  defaultTimeoutMs?: number,
): ModuleActionDefinition {
  return {
    actionId,
    description,
    argsSchema,
    defaultTimeoutMs,
    commandPreview,
    buildCommand: (args) => ({
      executable: PYTHON_EXECUTABLE,
      args: buildArgs(args),
    }),
  };
}

function nodeAction(
  actionId: string,
  description: string,
  commandPreview: string[],
  npmScript: string,
  defaultTimeoutMs?: number,
): ModuleActionDefinition {
  return {
    actionId,
    description,
    argsSchema: EMPTY_ARGS_SCHEMA,
    defaultTimeoutMs,
    commandPreview,
    buildCommand: () => ({
      executable: NPM_EXECUTABLE,
      args: ['run', npmScript],
    }),
  };
}

const MODULE_REGISTRY: ModuleDefinition[] = [
  {
    moduleId: 'ML-EIA-PETROLEUM-INTEL',
    displayName: 'ML-EIA-PETROLEUM-INTEL',
    runtime: 'python',
    workingDirectory: toolingPath('ML-EIA-PETROLEUM-INTEL'),
    actions: [
      pythonAction(
        'tests',
        'Run module pytest suite',
        ['python', '-m', 'pytest', 'tests', '-q'],
        () => ['-m', 'pytest', 'tests', '-q'],
        EMPTY_ARGS_SCHEMA,
        180_000,
      ),
      pythonAction(
        'pipeline.product',
        'Run petroleum forecast pipeline for one product',
        ['python', 'run_pipeline.py', '--product', '<product>', '--horizon', '<30|60|90>'],
        (args) => [
          'run_pipeline.py',
          '--product',
          String(args.product),
          '--horizon',
          String(args.horizon),
        ],
        {
          type: 'object',
          properties: {
            product: {
              type: 'string',
              description: 'Petroleum product alias',
              enum: ['crude', 'diesel', 'gasoline', 'heating_oil'],
            },
            horizon: {
              type: 'number',
              description: 'Forecast horizon in days',
              enum: [30, 60, 90],
              default: 30,
            },
          },
          required: ['product'],
        },
        600_000,
      ),
      pythonAction(
        'export.skip_docx',
        'Export API payloads and Penny context without DOCX generation',
        ['python', 'export_reports.py', '--skip-docx'],
        () => ['export_reports.py', '--skip-docx'],
        EMPTY_ARGS_SCHEMA,
        300_000,
      ),
    ],
  },
  {
    moduleId: 'ML-SIGNAL-STACK-TNCC',
    displayName: 'ML-SIGNAL-STACK-TNCC',
    runtime: 'python',
    workingDirectory: toolingPath('ML-SIGNAL-STACK-TNCC'),
    actions: [
      pythonAction(
        'pipeline.source',
        'Run SignalStack pipeline for a selected source',
        ['python', 'run_pipeline.py', '--source', '<source>', '--skip-search?'],
        (args) => {
          const commandArgs = ['run_pipeline.py', '--source', String(args.source)];
          if (Boolean(args.skipSearch)) {
            commandArgs.push('--skip-search');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['sales', 'ops_pulse', 'cash_flow_compass', 'pipeline_pulse', 'team_tempo', 'all'],
              description: 'SignalStack source name',
            },
            skipSearch: {
              type: 'boolean',
              default: true,
              description: 'Skip SARIMA grid search and use saved manual params',
            },
          },
          required: ['source'],
        },
        900_000,
      ),
      pythonAction(
        'export.csv',
        'Export source workbook data to CSV',
        ['python', 'export_to_csv.py', '--source', '<source|all>', '--skip-root-fix?'],
        (args) => {
          const source = typeof args.source === 'string' ? args.source : 'all';
          const commandArgs = ['export_to_csv.py', '--source', source];
          if (Boolean(args.skipRootFix)) {
            commandArgs.push('--skip-root-fix');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['sales', 'ops_pulse', 'cash_flow_compass', 'pipeline_pulse', 'team_tempo', 'all'],
              default: 'all',
              description: 'Workbook export target source',
            },
            skipRootFix: {
              type: 'boolean',
              default: false,
              description: 'Skip workbook integrity normalization pass',
            },
          },
        },
        180_000,
      ),
    ],
  },
  {
    moduleId: 'MOD-PAPERSTACK-PP',
    displayName: 'MOD-PAPERSTACK-PP',
    runtime: 'python',
    workingDirectory: toolingPath('MOD-PAPERSTACK-PP'),
    actions: [
      pythonAction(
        'tools.list',
        'List available PaperStack tools and readiness',
        ['python', 'paperstack.py', 'list'],
        () => ['paperstack.py', 'list'],
        EMPTY_ARGS_SCHEMA,
        60_000,
      ),
      pythonAction(
        'tools.check',
        'Run dependency diagnostics for PaperStack',
        ['python', 'paperstack.py', 'check'],
        () => ['paperstack.py', 'check'],
        EMPTY_ARGS_SCHEMA,
        120_000,
      ),
      pythonAction(
        'generate.pdf',
        'Generate the default Pipeline flyer PDF',
        ['python', 'paperstack.py', 'generate', 'pdf'],
        () => ['paperstack.py', 'generate', 'pdf'],
        EMPTY_ARGS_SCHEMA,
        120_000,
      ),
      pythonAction(
        'generate.docx',
        'Generate the default Pipeline flyer DOCX',
        ['python', 'paperstack.py', 'generate', 'docx'],
        () => ['paperstack.py', 'generate', 'docx'],
        EMPTY_ARGS_SCHEMA,
        120_000,
      ),
    ],
  },
  {
    moduleId: 'command-center',
    displayName: 'command-center',
    runtime: 'node',
    workingDirectory: toolingPath('command-center'),
    actions: [
      nodeAction(
        'tests',
        'Run command-center Vitest suite',
        [NPM_EXECUTABLE, 'run', 'test'],
        'test',
        180_000,
      ),
      nodeAction(
        'build',
        'Compile command-center TypeScript',
        [NPM_EXECUTABLE, 'run', 'build'],
        'build',
        180_000,
      ),
    ],
  },
];

export function getModuleRegistry(): ModuleDefinition[] {
  return MODULE_REGISTRY;
}

export function getModuleDefinition(moduleId: string): ModuleDefinition | undefined {
  return MODULE_REGISTRY.find((moduleDef) => moduleDef.moduleId === moduleId);
}

export function getModuleAction(moduleId: string, actionId: string): ModuleActionDefinition | undefined {
  const moduleDef = getModuleDefinition(moduleId);
  if (!moduleDef) return undefined;
  return moduleDef.actions.find((action) => action.actionId === actionId);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function validateActionArgs(
  action: ModuleActionDefinition,
  rawArgs: unknown,
): { valid: true; normalizedArgs: ModuleRunArgs } | { valid: false; errors: string[] } {
  const args = isPlainObject(rawArgs) ? rawArgs : {};
  const schema = action.argsSchema || EMPTY_ARGS_SCHEMA;
  const normalized: ModuleRunArgs = {};
  const errors: string[] = [];
  const properties = schema.properties || {};
  const requiredSet = new Set(schema.required || []);

  for (const key of Object.keys(args)) {
    if (!properties[key]) {
      errors.push(`args.${key} is not allowed`);
    }
  }

  for (const [key, spec] of Object.entries(properties)) {
    const required = spec.required || requiredSet.has(key);
    const hasValue = Object.prototype.hasOwnProperty.call(args, key);
    const value = hasValue ? args[key] : undefined;

    if (value === undefined || value === null) {
      if (spec.default !== undefined) {
        normalized[key] = spec.default;
        continue;
      }
      if (required) {
        errors.push(`args.${key} is required`);
      }
      continue;
    }

    if (spec.type === 'string') {
      if (typeof value !== 'string') {
        errors.push(`args.${key} must be a string`);
        continue;
      }
    } else if (spec.type === 'number') {
      if (typeof value !== 'number' || Number.isNaN(value)) {
        errors.push(`args.${key} must be a number`);
        continue;
      }
      if (spec.min !== undefined && value < spec.min) {
        errors.push(`args.${key} must be >= ${spec.min}`);
      }
      if (spec.max !== undefined && value > spec.max) {
        errors.push(`args.${key} must be <= ${spec.max}`);
      }
    } else if (spec.type === 'boolean') {
      if (typeof value !== 'boolean') {
        errors.push(`args.${key} must be a boolean`);
        continue;
      }
    }

    if (spec.enum && !spec.enum.includes(value as string | number | boolean)) {
      errors.push(`args.${key} must be one of: ${spec.enum.join(', ')}`);
      continue;
    }

    normalized[key] = value;
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, normalizedArgs: normalized };
}

export function moduleDirectoryExists(moduleDef: ModuleDefinition): boolean {
  return existsSync(moduleDef.workingDirectory);
}

export function getCatalog(): ModuleCatalogEntry[] {
  return MODULE_REGISTRY.map((moduleDef) => ({
    moduleId: moduleDef.moduleId,
    displayName: moduleDef.displayName,
    runtime: moduleDef.runtime,
    actions: moduleDef.actions.map((action) => ({
      actionId: action.actionId,
      description: action.description,
      argsSchema: action.argsSchema || EMPTY_ARGS_SCHEMA,
      timeoutMs: action.defaultTimeoutMs || DEFAULT_ACTION_TIMEOUT_MS,
      commandPreview: action.commandPreview,
    })),
  }));
}

export const moduleGatewayLimits = {
  defaultTimeoutMs: DEFAULT_ACTION_TIMEOUT_MS,
  maxTimeoutMs: 900_000,
  outputPreviewChars: 4_000,
  outputCaptureChars: 20_000,
};

