import type { ModuleActionExecutionResult, ModuleRunArgs } from '@/lib/modules-gateway/types';

type CommandCenterHandler = (params: Record<string, unknown>) => Promise<unknown>;

interface CommandCenterToolsModule {
  toolHandlers: Record<string, CommandCenterHandler>;
  initializeCommandCenter: () => Promise<void>;
}

const ACTION_TO_TOOL: Record<string, string> = {
  'discover.modules': 'discover_modules',
  'discover.tools': 'discover_tools',
  'search.tools': 'search_tools',
  'schema.tool': 'get_tool_schema',
  'route.tool_call': 'route_tool_call',
  'status.system': 'get_system_status',
  'detail.module': 'get_module_detail',
  'classifications.list': 'get_classifications',
  'dashboard.system': 'get_system_dashboard',
  'usage.tools': 'get_tool_usage_stats',
};

let bridgeModulePromise: Promise<CommandCenterToolsModule> | null = null;
let initialized = false;

async function loadBridgeModule(): Promise<CommandCenterToolsModule> {
  if (!bridgeModulePromise) {
    // Keep this import path static so Next.js bundles command-center runtime with API routes.
    bridgeModulePromise = import('../../../tooling/command-center/dist/src/tools.js') as Promise<CommandCenterToolsModule>;
  }
  return bridgeModulePromise;
}

function asPlainObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {};
  }
  return value as Record<string, unknown>;
}

function normalizeDetails(value: unknown): string[] | undefined {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry));
  }
  if (typeof value === 'string' && value.length > 0) {
    return [value];
  }
  return undefined;
}

function normalizeBridgeResult(toolName: string, raw: unknown): ModuleActionExecutionResult {
  const result = asPlainObject(raw);
  const success = Boolean(result.success);
  const data = Object.prototype.hasOwnProperty.call(result, 'data') ? result.data : raw;
  const errorValue = result.error;
  const details = normalizeDetails(result.details);

  if (success) {
    return {
      ok: true,
      message: `command-center tool '${toolName}' succeeded`,
      data,
    };
  }

  return {
    ok: false,
    message: `command-center tool '${toolName}' failed`,
    stderr: typeof errorValue === 'string' ? errorValue : 'Unknown command-center bridge error',
    details,
    data,
  };
}

async function ensureInitialized(moduleRef: CommandCenterToolsModule): Promise<void> {
  if (initialized) return;
  await moduleRef.initializeCommandCenter();
  initialized = true;
}

async function applyDiscoverToolsFilters(
  moduleRef: CommandCenterToolsModule,
  rawResult: unknown,
  args: ModuleRunArgs,
): Promise<unknown> {
  const result = asPlainObject(rawResult);
  if (!result.success || !Array.isArray(result.data)) {
    return rawResult;
  }

  let filtered = [...result.data];
  const moduleFilter = typeof args.moduleId === 'string' ? args.moduleId : null;
  if (moduleFilter) {
    filtered = filtered.filter((entry) => asPlainObject(entry).moduleId === moduleFilter);
  }

  const classificationFilter = typeof args.classification === 'string' ? args.classification : null;
  if (classificationFilter) {
    const discoverModules = moduleRef.toolHandlers.discover_modules;
    if (discoverModules) {
      const moduleResult = asPlainObject(await discoverModules({}));
      if (moduleResult.success && Array.isArray(moduleResult.data)) {
        const classificationByModule = new Map<string, string>();
        for (const moduleEntry of moduleResult.data) {
          const item = asPlainObject(moduleEntry);
          const moduleId = typeof item.id === 'string' ? item.id : null;
          const classification = typeof item.classification === 'string' ? item.classification : null;
          if (moduleId && classification) {
            classificationByModule.set(moduleId, classification);
          }
        }
        filtered = filtered.filter((entry) => {
          const item = asPlainObject(entry);
          const moduleId = typeof item.moduleId === 'string' ? item.moduleId : null;
          if (!moduleId) return false;
          return classificationByModule.get(moduleId) === classificationFilter;
        });
      }
    }
  }

  return {
    ...result,
    data: filtered,
  };
}

export async function executeCommandCenterAction(
  actionId: string,
  args: ModuleRunArgs,
): Promise<ModuleActionExecutionResult> {
  try {
    const moduleRef = await loadBridgeModule();

    if (actionId === 'startup.initialize') {
      await moduleRef.initializeCommandCenter();
      initialized = true;
      return {
        ok: true,
        message: 'command-center discovery initialized',
        data: { initialized: true },
      };
    }

    await ensureInitialized(moduleRef);

    const toolName = ACTION_TO_TOOL[actionId];
    if (!toolName) {
      return {
        ok: false,
        message: `Unsupported command-center action '${actionId}'`,
      };
    }

    const handler = moduleRef.toolHandlers[toolName];
    if (!handler) {
      return {
        ok: false,
        message: `Handler not found for command-center tool '${toolName}'`,
      };
    }

    const inputArgs = asPlainObject(args);
    const rawResult = await handler(inputArgs);
    const processedResult =
      actionId === 'discover.tools'
        ? await applyDiscoverToolsFilters(moduleRef, rawResult, inputArgs)
        : rawResult;
    return normalizeBridgeResult(toolName, processedResult);
  } catch (error) {
    return {
      ok: false,
      message: 'command-center bridge execution failed',
      stderr: error instanceof Error ? error.message : String(error),
    };
  }
}
