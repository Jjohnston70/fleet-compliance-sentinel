import path from 'node:path';
import { existsSync } from 'node:fs';
import { executeCommandCenterAction } from '@/lib/modules-gateway/command-center-bridge';
import type {
  ModuleActionExecutionResult,
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
const EIA_PRODUCTS = ['crude', 'diesel', 'gasoline', 'heating_oil'];
const EIA_INGEST_SOURCES = [
  'spot_prices',
  'futures',
  'colorado_retail',
  'rocky_mountain_retail',
  'residential_standard_errors',
  'fountain_opis_prices',
  'client_average_inventory',
  'weather_colorado_springs',
  'traffic_cdot',
];
const SIGNAL_SOURCES = ['sales', 'ops_pulse', 'cash_flow_compass', 'pipeline_pulse', 'team_tempo'];
const SIGNAL_SOURCE_OPTIONS = [...SIGNAL_SOURCES, 'all'];
const PAPERSTACK_GENERATE_FORMATS = ['pdf', 'docx'];
const PAPERSTACK_REVERSE_MODES = ['js', 'python', 'pdf', 'python_pdf'];
const PAPERSTACK_SCAN_DPI_VALUES = [200, 300, 400];
const PAPERSTACK_INVOICE_EXPORT_FORMATS = ['fleet', 'original'];
const COMMAND_CENTER_CLASSIFICATIONS = [
  'Operations',
  'Finance',
  'Intelligence',
  'Planning',
  'Infrastructure',
  'Logistics',
];

const EMPTY_ARGS_SCHEMA: ModuleActionArgsSchema = {
  type: 'object',
  properties: {},
  required: [],
};

function toolingPath(moduleName: string): string {
  return path.join(TOOLING_ROOT, moduleName);
}

const PAPERSTACK_ROOT = toolingPath('MOD-PAPERSTACK-PP');

function isPathWithinRoot(rootPath: string, targetPath: string): boolean {
  const relative = path.relative(rootPath, targetPath);
  return relative === '' || (!relative.startsWith('..') && !path.isAbsolute(relative));
}

function relativeToPaperstackRoot(absolutePath: string): string {
  const relativePath = path.relative(PAPERSTACK_ROOT, absolutePath);
  return relativePath === '' ? '.' : relativePath;
}

function resolvePaperstackPathArg(
  rawValue: unknown,
  options: { label: string; allowMissing?: boolean; extensions?: string[]; baseDir?: string },
): string {
  if (typeof rawValue !== 'string' || rawValue.trim().length === 0) {
    throw new Error(`${options.label} must be a non-empty string path`);
  }

  const trimmed = rawValue.trim();
  if (trimmed.includes('\0')) {
    throw new Error(`${options.label} contains invalid path characters`);
  }

  const baseDir = options.baseDir ?? PAPERSTACK_ROOT;
  const absolutePath = path.isAbsolute(trimmed) ? path.resolve(trimmed) : path.resolve(baseDir, trimmed);
  if (!isPathWithinRoot(PAPERSTACK_ROOT, absolutePath)) {
    throw new Error(`${options.label} must stay within the MOD-PAPERSTACK-PP module directory`);
  }

  const allowedExtensions = options.extensions || [];
  if (allowedExtensions.length > 0) {
    const extension = path.extname(absolutePath).toLowerCase();
    if (!allowedExtensions.includes(extension)) {
      throw new Error(`${options.label} must use one of: ${allowedExtensions.join(', ')}`);
    }
  }

  if (!options.allowMissing && !existsSync(absolutePath)) {
    throw new Error(`${options.label} not found: ${relativeToPaperstackRoot(absolutePath)}`);
  }

  return relativeToPaperstackRoot(absolutePath);
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

function bridgeAction(
  actionId: string,
  description: string,
  argsSchema: ModuleActionArgsSchema,
  defaultTimeoutMs = 60_000,
): ModuleActionDefinition {
  return {
    actionId,
    description,
    argsSchema,
    defaultTimeoutMs,
    commandPreview: ['internal', 'command-center', actionId],
    execute: async (args): Promise<ModuleActionExecutionResult> => executeCommandCenterAction(actionId, args),
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
          '--train-years',
          String(args.trainYears),
        ],
        {
          type: 'object',
          properties: {
            product: {
              type: 'string',
              description: 'Petroleum product alias',
              enum: EIA_PRODUCTS,
            },
            horizon: {
              type: 'number',
              description: 'Forecast horizon in days',
              enum: [30, 60, 90],
              default: 30,
            },
            trainYears: {
              type: 'number',
              description: 'Rolling training window in years',
              min: 1,
              max: 20,
              default: 10,
            },
          },
          required: ['product'],
        },
        600_000,
      ),
      pythonAction(
        'ingest.all',
        'Run ingest for all configured petroleum data sources',
        ['python', 'run_ingest.py', '--all', '--api-update?', '--force-api?'],
        (args) => {
          const commandArgs = ['run_ingest.py', '--all'];
          if (Boolean(args.apiUpdate)) {
            commandArgs.push('--api-update');
          }
          if (Boolean(args.forceApi)) {
            commandArgs.push('--force-api');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            apiUpdate: {
              type: 'boolean',
              default: false,
              description: 'Fetch latest EIA API data before ingest output write',
            },
            forceApi: {
              type: 'boolean',
              default: false,
              description: 'Bypass API cache when apiUpdate is enabled',
            },
          },
        },
        300_000,
      ),
      pythonAction(
        'ingest.source',
        'Run ingest for one configured petroleum data source',
        ['python', 'run_ingest.py', '--source', '<source>', '--api-update?', '--force-api?'],
        (args) => {
          const commandArgs = ['run_ingest.py', '--source', String(args.source)];
          if (Boolean(args.apiUpdate)) {
            commandArgs.push('--api-update');
          }
          if (Boolean(args.forceApi)) {
            commandArgs.push('--force-api');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: EIA_INGEST_SOURCES,
              description: 'Configured ingest source id from ML-EIA',
            },
            apiUpdate: {
              type: 'boolean',
              default: false,
              description: 'Fetch latest EIA API data before source ingest',
            },
            forceApi: {
              type: 'boolean',
              default: false,
              description: 'Bypass API cache when apiUpdate is enabled',
            },
          },
          required: ['source'],
        },
        300_000,
      ),
      pythonAction(
        'ingest.api_update',
        'Fetch latest EIA API series and merge into processed outputs',
        ['python', 'run_ingest.py', '--api-update', '--force-api?'],
        (args) => {
          const commandArgs = ['run_ingest.py', '--api-update'];
          if (Boolean(args.forceApi)) {
            commandArgs.push('--force-api');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            forceApi: {
              type: 'boolean',
              default: false,
              description: 'Bypass API cache and force live fetch',
            },
          },
        },
        300_000,
      ),
      pythonAction(
        'pipeline.all',
        'Run petroleum pipeline for all default products',
        ['python', 'run_pipeline.py', '--all', '--horizon?', '--train-years?'],
        (args) => {
          const commandArgs = ['run_pipeline.py', '--all'];
          if (typeof args.horizon === 'number') {
            commandArgs.push('--horizon', String(args.horizon));
          }
          commandArgs.push('--train-years', String(args.trainYears));
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            horizon: {
              type: 'number',
              enum: [30, 60, 90],
              description: 'Optional single horizon to apply to all products',
            },
            trainYears: {
              type: 'number',
              description: 'Rolling training window in years',
              min: 1,
              max: 20,
              default: 10,
            },
          },
        },
        900_000,
      ),
      pythonAction(
        'export.report',
        'Generate executive DOCX report and API payload exports',
        ['python', 'export_reports.py', '--format', 'docx', '--period', '<period>'],
        (args) => ['export_reports.py', '--format', 'docx', '--period', String(args.period)],
        {
          type: 'object',
          properties: {
            period: {
              type: 'string',
              description: 'Report period label injected into report title',
              default: 'monthly',
            },
          },
        },
        300_000,
      ),
      pythonAction(
        'export.skip_docx',
        'Export API payloads and Penny context without DOCX generation',
        ['python', 'export_reports.py', '--skip-docx'],
        () => ['export_reports.py', '--skip-docx'],
        EMPTY_ARGS_SCHEMA,
        300_000,
      ),
      pythonAction(
        'export.json_only',
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
              enum: SIGNAL_SOURCE_OPTIONS,
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
        'pipeline.all',
        'Run SignalStack pipeline across all sources',
        ['python', 'run_pipeline.py', '--source', 'all', '--skip-search?'],
        (args) => {
          const commandArgs = ['run_pipeline.py', '--source', 'all'];
          if (Boolean(args.skipSearch)) {
            commandArgs.push('--skip-search');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            skipSearch: {
              type: 'boolean',
              default: true,
              description: 'Skip SARIMA grid search and use saved manual params',
            },
          },
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
              enum: SIGNAL_SOURCE_OPTIONS,
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
      pythonAction(
        'export.csv_all',
        'Export all SignalStack workbook data to CSV',
        ['python', 'export_to_csv.py', '--source', 'all', '--skip-root-fix?'],
        (args) => {
          const commandArgs = ['export_to_csv.py', '--source', 'all'];
          if (Boolean(args.skipRootFix)) {
            commandArgs.push('--skip-root-fix');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            skipRootFix: {
              type: 'boolean',
              default: false,
              description: 'Skip workbook integrity normalization pass',
            },
          },
        },
        180_000,
      ),
      pythonAction(
        'export.csv_source',
        'Export one SignalStack workbook source to CSV',
        ['python', 'export_to_csv.py', '--source', '<source>', '--skip-root-fix?'],
        (args) => {
          const commandArgs = ['export_to_csv.py', '--source', String(args.source)];
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
              enum: SIGNAL_SOURCES,
              description: 'Workbook export target source',
            },
            skipRootFix: {
              type: 'boolean',
              default: false,
              description: 'Skip workbook integrity normalization pass',
            },
          },
          required: ['source'],
        },
        180_000,
      ),
      pythonAction(
        'report.generate',
        'Generate SignalStack DOCX report from latest pipeline outputs',
        ['python', 'generate_report.py', '--source?', '<source>', '--out?', '<out>'],
        (args) => {
          const source = typeof args.source === 'string' ? args.source : 'all';
          const commandArgs = ['generate_report.py'];
          if (source !== 'all') {
            commandArgs.push('--source', source);
          }
          if (typeof args.out === 'string' && args.out.trim().length > 0) {
            commandArgs.push('--out', args.out.trim());
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: SIGNAL_SOURCE_OPTIONS,
              default: 'all',
              description: 'Signal source subset for report generation',
            },
            out: {
              type: 'string',
              description: 'Optional output path for the generated DOCX report',
            },
          },
        },
        300_000,
      ),
      pythonAction(
        'package.output',
        'Package SignalStack report artifacts into delivery ZIP',
        ['python', 'package_output.py', '--source?', '<source>', '--no-code?', '--out-dir?', '<outDir>'],
        (args) => {
          const source = typeof args.source === 'string' ? args.source : 'all';
          const commandArgs = ['package_output.py'];
          if (source !== 'all') {
            commandArgs.push('--source', source);
          }
          if (Boolean(args.noCode)) {
            commandArgs.push('--no-code');
          }
          if (typeof args.outDir === 'string' && args.outDir.trim().length > 0) {
            commandArgs.push('--out-dir', args.outDir.trim());
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: SIGNAL_SOURCE_OPTIONS,
              default: 'all',
              description: 'Signal source subset for packaged chart outputs',
            },
            noCode: {
              type: 'boolean',
              default: false,
              description: 'Omit code folder from packaged ZIP artifact',
            },
            outDir: {
              type: 'string',
              description: 'Optional output directory for ZIP artifact',
            },
          },
        },
        300_000,
      ),
      pythonAction(
        'workflow.delivery',
        'Run full SignalStack operator workflow (export -> pipeline -> report -> package)',
        [
          'python',
          'run_delivery.py',
          '--source',
          '<source|all>',
          '--skip-search?',
          '--skip-root-fix?',
          '--no-code?',
          '--out-dir?',
          '<outDir>',
        ],
        (args) => {
          const source = typeof args.source === 'string' ? args.source : 'all';
          const commandArgs = ['run_delivery.py', '--source', source];
          if (Boolean(args.skipSearch)) {
            commandArgs.push('--skip-search');
          }
          if (Boolean(args.skipRootFix)) {
            commandArgs.push('--skip-root-fix');
          }
          if (Boolean(args.noCode)) {
            commandArgs.push('--no-code');
          }
          if (typeof args.outDir === 'string' && args.outDir.trim().length > 0) {
            commandArgs.push('--out-dir', args.outDir.trim());
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: SIGNAL_SOURCE_OPTIONS,
              default: 'all',
              description: 'Signal source to process through full delivery workflow',
            },
            skipSearch: {
              type: 'boolean',
              default: true,
              description: 'Skip SARIMA grid search and use saved manual params',
            },
            skipRootFix: {
              type: 'boolean',
              default: false,
              description: 'Skip workbook normalization before CSV export',
            },
            noCode: {
              type: 'boolean',
              default: false,
              description: 'Omit code folder from packaged ZIP artifact',
            },
            outDir: {
              type: 'string',
              description: 'Optional output directory for delivery ZIP/HTML artifacts',
            },
          },
        },
        900_000,
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
        'list',
        'List available PaperStack tools and readiness',
        ['python', 'paperstack.py', 'list'],
        () => ['paperstack.py', 'list'],
        EMPTY_ARGS_SCHEMA,
        60_000,
      ),
      pythonAction(
        'check',
        'Run dependency diagnostics for PaperStack',
        ['python', 'paperstack.py', 'check'],
        () => ['paperstack.py', 'check'],
        EMPTY_ARGS_SCHEMA,
        120_000,
      ),
      pythonAction(
        'generate',
        'Generate the default PaperStack marketing flyer (PDF or DOCX)',
        ['python', 'paperstack.py', 'generate', '<pdf|docx>'],
        (args) => ['paperstack.py', 'generate', String(args.format)],
        {
          type: 'object',
          properties: {
            format: {
              type: 'string',
              enum: PAPERSTACK_GENERATE_FORMATS,
              description: 'Generator output format',
            },
          },
          required: ['format'],
        },
        120_000,
      ),
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
      pythonAction(
        'invoice.extract',
        'Extract one vendor invoice PDF and export JSON + XLSX',
        ['python', 'scripts/invoice_gateway.py', 'single', '--input', '<invoice.pdf>', '--format', '<fleet|original>'],
        (args) => {
          const inputPath = resolvePaperstackPathArg(args.inputPath, {
            label: 'args.inputPath',
            extensions: ['.pdf'],
          });
          const commandArgs = [
            'scripts/invoice_gateway.py',
            'single',
            '--input',
            inputPath,
            '--format',
            String(args.format),
          ];

          if (typeof args.orgId === 'string' && args.orgId.trim().length > 0) {
            commandArgs.push('--org-id', args.orgId.trim());
          }
          if (typeof args.operator === 'string' && args.operator.trim().length > 0) {
            commandArgs.push('--operator', args.operator.trim());
          }
          if (typeof args.jsonOut === 'string' && args.jsonOut.trim().length > 0) {
            commandArgs.push(
              '--json-out',
              resolvePaperstackPathArg(args.jsonOut, {
                label: 'args.jsonOut',
                allowMissing: true,
                extensions: ['.json'],
              }),
            );
          }
          if (typeof args.xlsxOut === 'string' && args.xlsxOut.trim().length > 0) {
            commandArgs.push(
              '--xlsx-out',
              resolvePaperstackPathArg(args.xlsxOut, {
                label: 'args.xlsxOut',
                allowMissing: true,
                extensions: ['.xlsx'],
              }),
            );
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to one invoice PDF within MOD-PAPERSTACK-PP',
            },
            format: {
              type: 'string',
              enum: PAPERSTACK_INVOICE_EXPORT_FORMATS,
              default: 'fleet',
              description: 'Export schema format for XLSX output',
            },
            orgId: {
              type: 'string',
              description: 'Optional organization id tag for extracted records',
            },
            operator: {
              type: 'string',
              default: 'module-gateway',
              description: 'Operator identifier used by invoice extraction logs',
            },
            jsonOut: {
              type: 'string',
              description: 'Optional output JSON path within MOD-PAPERSTACK-PP',
            },
            xlsxOut: {
              type: 'string',
              description: 'Optional output XLSX path within MOD-PAPERSTACK-PP',
            },
          },
          required: ['inputPath'],
        },
        300_000,
      ),
      pythonAction(
        'invoice.extract_batch',
        'Extract all invoice PDFs in a folder and export JSON + XLSX',
        ['python', 'scripts/invoice_gateway.py', 'batch', '--input-dir', '<invoices/>', '--format', '<fleet|original>'],
        (args) => {
          const inputDir = resolvePaperstackPathArg(args.inputDir, {
            label: 'args.inputDir',
          });
          const commandArgs = [
            'scripts/invoice_gateway.py',
            'batch',
            '--input-dir',
            inputDir,
            '--format',
            String(args.format),
          ];

          if (typeof args.pattern === 'string' && args.pattern.trim().length > 0) {
            commandArgs.push('--pattern', args.pattern.trim());
          }
          if (typeof args.orgId === 'string' && args.orgId.trim().length > 0) {
            commandArgs.push('--org-id', args.orgId.trim());
          }
          if (typeof args.operator === 'string' && args.operator.trim().length > 0) {
            commandArgs.push('--operator', args.operator.trim());
          }
          if (typeof args.jsonOut === 'string' && args.jsonOut.trim().length > 0) {
            commandArgs.push(
              '--json-out',
              resolvePaperstackPathArg(args.jsonOut, {
                label: 'args.jsonOut',
                allowMissing: true,
                extensions: ['.json'],
              }),
            );
          }
          if (typeof args.xlsxOut === 'string' && args.xlsxOut.trim().length > 0) {
            commandArgs.push(
              '--xlsx-out',
              resolvePaperstackPathArg(args.xlsxOut, {
                label: 'args.xlsxOut',
                allowMissing: true,
                extensions: ['.xlsx'],
              }),
            );
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            inputDir: {
              type: 'string',
              description: 'Directory containing invoice PDFs within MOD-PAPERSTACK-PP',
            },
            pattern: {
              type: 'string',
              default: '*.pdf',
              description: 'Glob pattern used to select PDFs inside inputDir',
            },
            format: {
              type: 'string',
              enum: PAPERSTACK_INVOICE_EXPORT_FORMATS,
              default: 'fleet',
              description: 'Export schema format for XLSX output',
            },
            orgId: {
              type: 'string',
              description: 'Optional organization id tag for extracted records',
            },
            operator: {
              type: 'string',
              default: 'module-gateway',
              description: 'Operator identifier used by invoice extraction logs',
            },
            jsonOut: {
              type: 'string',
              description: 'Optional output JSON path within MOD-PAPERSTACK-PP',
            },
            xlsxOut: {
              type: 'string',
              description: 'Optional output XLSX path within MOD-PAPERSTACK-PP',
            },
          },
          required: ['inputDir'],
        },
        600_000,
      ),
      pythonAction(
        'convert',
        'Convert Markdown file to styled HTML',
        ['python', 'paperstack.py', 'convert', '<input.md>', '<output.html?>', '--dark?'],
        (args) => {
          const inputPath = resolvePaperstackPathArg(args.inputPath, {
            label: 'args.inputPath',
            extensions: ['.md'],
          });
          const commandArgs = ['paperstack.py', 'convert', inputPath];

          if (typeof args.outputPath === 'string' && args.outputPath.trim().length > 0) {
            commandArgs.push(
              resolvePaperstackPathArg(args.outputPath, {
                label: 'args.outputPath',
                allowMissing: true,
                extensions: ['.html'],
              }),
            );
          }

          if (Boolean(args.dark)) {
            commandArgs.push('--dark');
          }

          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to input Markdown file within MOD-PAPERSTACK-PP',
            },
            outputPath: {
              type: 'string',
              description: 'Optional output HTML path within MOD-PAPERSTACK-PP',
            },
            dark: {
              type: 'boolean',
              default: false,
              description: 'Enable dark GitHub-style output theme',
            },
          },
          required: ['inputPath'],
        },
        120_000,
      ),
      pythonAction(
        'reverse',
        'Reverse engineer DOCX into generator code',
        ['python', 'paperstack.py', 'reverse', '<input.docx>', '--python|--pdf?', '--output?'],
        (args) => {
          const inputPath = resolvePaperstackPathArg(args.inputPath, {
            label: 'args.inputPath',
            extensions: ['.docx'],
          });
          const mode = String(args.mode);
          const commandArgs = ['paperstack.py', 'reverse', inputPath];

          if (mode === 'python') {
            commandArgs.push('--python');
          } else if (mode === 'pdf') {
            commandArgs.push('--pdf');
          } else if (mode === 'python_pdf') {
            commandArgs.push('--python', '--pdf');
          }

          if (typeof args.outputPath === 'string' && args.outputPath.trim().length > 0) {
            commandArgs.push(
              '--output',
              resolvePaperstackPathArg(args.outputPath, {
                label: 'args.outputPath',
                allowMissing: true,
              }),
            );
          }

          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to input DOCX file within MOD-PAPERSTACK-PP',
            },
            mode: {
              type: 'string',
              enum: PAPERSTACK_REVERSE_MODES,
              default: 'js',
              description: 'Reverse output mode (js, python, pdf, python_pdf)',
            },
            outputPath: {
              type: 'string',
              description: 'Optional custom output file path within MOD-PAPERSTACK-PP',
            },
          },
          required: ['inputPath'],
        },
        180_000,
      ),
      pythonAction(
        'inspect',
        'Launch PDF inspector for text-based PDFs',
        ['python', 'paperstack.py', 'inspect', '<input.pdf>', '--port', '<port>'],
        (args) => {
          const inputPath = resolvePaperstackPathArg(args.inputPath, {
            label: 'args.inputPath',
            extensions: ['.pdf'],
          });
          return ['paperstack.py', 'inspect', inputPath, '--port', String(args.port)];
        },
        {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to input PDF file within MOD-PAPERSTACK-PP',
            },
            port: {
              type: 'number',
              min: 1,
              max: 65535,
              default: 5000,
              description: 'Local inspector web server port',
            },
          },
          required: ['inputPath'],
        },
        900_000,
      ),
      pythonAction(
        'scan',
        'Launch OCR scan inspector for scanned PDFs',
        ['python', 'paperstack.py', 'scan', '<input.pdf>', '--port', '<port>', '--dpi', '<200|300|400>', '--force-ocr?'],
        (args) => {
          const inputPath = resolvePaperstackPathArg(args.inputPath, {
            label: 'args.inputPath',
            extensions: ['.pdf'],
          });
          const commandArgs = [
            'paperstack.py',
            'scan',
            inputPath,
            '--port',
            String(args.port),
            '--dpi',
            String(args.dpi),
          ];
          if (Boolean(args.forceOcr)) {
            commandArgs.push('--force-ocr');
          }
          return commandArgs;
        },
        {
          type: 'object',
          properties: {
            inputPath: {
              type: 'string',
              description: 'Path to input PDF file within MOD-PAPERSTACK-PP',
            },
            port: {
              type: 'number',
              min: 1,
              max: 65535,
              default: 5000,
              description: 'Local inspector web server port',
            },
            dpi: {
              type: 'number',
              enum: PAPERSTACK_SCAN_DPI_VALUES,
              default: 300,
              description: 'OCR DPI quality setting',
            },
            forceOcr: {
              type: 'boolean',
              default: false,
              description: 'Force OCR mode even when PDF text layer is available',
            },
          },
          required: ['inputPath'],
        },
        900_000,
      ),
    ],
  },
  {
    moduleId: 'command-center',
    displayName: 'command-center',
    runtime: 'node',
    workingDirectory: toolingPath('command-center'),
    actions: [
      bridgeAction(
        'startup.initialize',
        'Initialize command-center discovery registry from module manifest',
        EMPTY_ARGS_SCHEMA,
        120_000,
      ),
      bridgeAction(
        'discover.modules',
        'Discover and list registered modules with status and metadata',
        {
          type: 'object',
          properties: {
            acl: {
              type: 'object',
              description: 'Internal ACL filter payload with allowedModuleIds/allowedQualifiedNames',
              default: {},
            },
          },
        },
      ),
      bridgeAction(
        'discover.tools',
        'List discoverable tools across command-center registered modules',
        {
          type: 'object',
          properties: {
            moduleId: {
              type: 'string',
              description: 'Optional module filter (e.g., realty-command)',
            },
            classification: {
              type: 'string',
              enum: COMMAND_CENTER_CLASSIFICATIONS,
              description: 'Optional classification filter',
            },
            query: {
              type: 'string',
              description: 'Optional user query used for relevance-scored tool selection',
            },
            intent: {
              type: 'string',
              description: 'Optional short task intent used for relevance-scored tool selection',
            },
            maxTools: {
              type: 'number',
              min: 1,
              max: 15,
              default: 12,
              description: 'Maximum number of tools to return (cap 15)',
            },
            acl: {
              type: 'object',
              description: 'Internal ACL filter payload with allowedModuleIds/allowedQualifiedNames',
              default: {},
            },
          },
        },
      ),
      bridgeAction(
        'search.tools',
        'Search command-center tools by keyword and optional filters',
        {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search keyword for tool name/description',
            },
            moduleId: {
              type: 'string',
              description: 'Optional module filter',
            },
            classification: {
              type: 'string',
              enum: COMMAND_CENTER_CLASSIFICATIONS,
              description: 'Optional classification filter',
            },
            maxTools: {
              type: 'number',
              min: 1,
              max: 15,
              default: 12,
              description: 'Maximum number of results to return (cap 15)',
            },
            acl: {
              type: 'object',
              description: 'Internal ACL filter payload with allowedModuleIds/allowedQualifiedNames',
              default: {},
            },
          },
          required: ['query'],
        },
      ),
      bridgeAction(
        'schema.tool',
        'Get parameter schema/details for a qualified tool name',
        {
          type: 'object',
          properties: {
            qualifiedName: {
              type: 'string',
              description: 'Fully-qualified tool name: module.tool_name',
            },
          },
          required: ['qualifiedName'],
        },
      ),
      bridgeAction(
        'route.tool_call',
        'Bridge and route a qualified tool call through command-center',
        {
          type: 'object',
          properties: {
            qualifiedName: {
              type: 'string',
              description: 'Fully-qualified tool name: module.tool_name',
            },
            parameters: {
              type: 'object',
              description: 'Tool parameters object forwarded to command-center router',
              default: {},
            },
            acl: {
              type: 'object',
              description: 'Internal ACL filter payload with allowedModuleIds/allowedQualifiedNames',
              default: {},
            },
          },
          required: ['qualifiedName'],
        },
      ),
      bridgeAction(
        'status.system',
        'Get system health summary from command-center',
        EMPTY_ARGS_SCHEMA,
      ),
      bridgeAction(
        'detail.module',
        'Get module-level detail from command-center registry',
        {
          type: 'object',
          properties: {
            moduleId: {
              type: 'string',
              description: 'Module ID',
            },
          },
          required: ['moduleId'],
        },
      ),
      bridgeAction(
        'classifications.list',
        'List command-center module classifications',
        EMPTY_ARGS_SCHEMA,
      ),
      bridgeAction(
        'dashboard.system',
        'Get command-center aggregate dashboard metrics',
        EMPTY_ARGS_SCHEMA,
      ),
      bridgeAction(
        'usage.tools',
        'Get command-center tool usage statistics',
        EMPTY_ARGS_SCHEMA,
      ),
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

function cloneDefaultValue(value: string | number | boolean | Record<string, unknown>): unknown {
  if (isPlainObject(value)) {
    return { ...value };
  }
  return value;
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
        normalized[key] = cloneDefaultValue(spec.default);
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
    } else if (spec.type === 'object') {
      if (!isPlainObject(value)) {
        errors.push(`args.${key} must be an object`);
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

