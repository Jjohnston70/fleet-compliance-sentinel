/**
 * API Handlers
 * REST-style handlers for all registry operations
 */

import { registryService } from '../services/registry-service.js';
import { routerService } from '../services/router-service.js';
import { searchService } from '../services/search-service.js';
import { healthService } from '../services/health-service.js';
import { discoveryService } from '../services/discovery-service.js';
import { systemDashboard } from '../reporting/system-dashboard.js';
import { toolUsageReport } from '../reporting/tool-usage-report.js';
import { registry } from '../data/in-memory-registry.js';

const DEFAULT_TOOL_SELECTION_CAP = 12;
const MAX_TOOL_SELECTION_CAP = 15;

function clampToolSelectionCap(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value)) return DEFAULT_TOOL_SELECTION_CAP;
  return Math.max(1, Math.min(MAX_TOOL_SELECTION_CAP, Math.floor(value)));
}

/**
 * List all registered modules
 */
export async function handleListModules() {
  return {
    success: true,
    data: registryService.listModules(),
  };
}

/**
 * Get a specific module
 */
export async function handleGetModule(moduleId: string) {
  const module = registryService.getModule(moduleId);
  if (!module) {
    return {
      success: false,
      error: `Module not found: ${moduleId}`,
    };
  }
  return {
    success: true,
    data: module,
  };
}

/**
 * List all tools across all modules
 */
export async function handleListAllTools() {
  return handleListAllToolsFiltered({});
}

export async function handleListAllToolsFiltered(input: {
  moduleId?: string;
  classification?: string;
  query?: string;
  intent?: string;
  maxTools?: number;
}) {
  const cap = clampToolSelectionCap(input.maxTools);
  const selected = searchService.selectRelevantTools({
    query: input.query,
    intent: input.intent,
    maxTools: cap,
    filters: {
      moduleId: input.moduleId,
      classification: input.classification as any,
    },
  });

  const byQualifiedName = new Map(
    registry.listAllTools().map((entry) => [`${entry.moduleId}.${entry.tool.name}`, entry]),
  );
  const tools = selected
    .map((item) => byQualifiedName.get(item.qualifiedName))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return {
    success: true,
    meta: {
      cap,
      returned: tools.length,
      query: input.query || null,
      intent: input.intent || null,
    },
    data: tools.map((t) => ({
      qualifiedName: `${t.moduleId}.${t.tool.name}`,
      moduleId: t.moduleId,
      ...t.tool,
    })),
  };
}

/**
 * Search for tools
 */
export async function handleSearchTools(
  query: string,
  filters?: { moduleId?: string; classification?: string; maxTools?: number },
) {
  const cap = clampToolSelectionCap(filters?.maxTools);
  const results = searchService.search(query, {
    moduleId: filters?.moduleId,
    classification: filters?.classification as any,
  });
  return {
    success: true,
    meta: {
      cap,
      returned: Math.min(results.length, cap),
      query,
    },
    data: results.slice(0, cap),
  };
}

/**
 * Get tool schema
 */
export async function handleGetToolSchema(qualifiedName: string) {
  const result = routerService.routeByQualifiedName(qualifiedName);
  if (!result.success) {
    return {
      success: false,
      error: result.error,
    };
  }
  return {
    success: true,
    data: {
      qualifiedName,
      moduleId: result.moduleId,
      tool: result.tool,
    },
  };
}

/**
 * Route and execute a tool call
 */
export async function handleRouteToolCall(
  qualifiedName: string,
  params: Record<string, any>,
) {
  const route = routerService.route(qualifiedName);
  if (!route.success) {
    return {
      success: false,
      error: route.error,
    };
  }

  const tool = route.tool!;

  // Validate parameters
  const validation = routerService.validateParameters(tool, params);
  if (!validation.valid) {
    return {
      success: false,
      error: 'Parameter validation failed',
      details: validation.errors,
    };
  }

  // Record invocation
  const invocationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();

  registry.recordInvocation({
    id: invocationId,
    toolId: `${route.moduleId}.${tool.name}`,
    moduleId: route.moduleId!,
    input: params,
    status: 'success',
    durationMs: Date.now() - startTime,
    invokedAt: startTime,
  });

  return {
    success: true,
    data: {
      qualifiedName,
      moduleId: route.moduleId,
      invocationId,
      message: 'Tool call routed successfully (execution delegated to module)',
    },
  };
}

/**
 * Get system health
 */
export async function handleGetSystemHealth() {
  const report = await healthService.checkAllModules();
  return {
    success: true,
    data: report,
  };
}

/**
 * Get module detail
 */
export async function handleGetModuleDetail(moduleId: string) {
  const module = registryService.getModule(moduleId);
  if (!module) {
    return {
      success: false,
      error: `Module not found: ${moduleId}`,
    };
  }

  const usageReport = toolUsageReport.generate();
  const moduleUsage = usageReport.byModule[moduleId] || {
    invocations: 0,
    errorRate: 0,
  };

  return {
    success: true,
    data: {
      module,
      usage: moduleUsage,
      tools: module.tools,
    },
  };
}

/**
 * Get classifications
 */
export async function handleGetClassifications() {
  const classifications = searchService.getClassifications();
  return {
    success: true,
    data: classifications,
  };
}

/**
 * Get system dashboard
 */
export async function handleGetSystemDashboard() {
  const dashboard = systemDashboard.generate();
  return {
    success: true,
    data: dashboard,
  };
}

/**
 * Get tool usage stats
 */
export async function handleGetToolUsageStats() {
  const report = toolUsageReport.generate();
  return {
    success: true,
    data: report,
  };
}

/**
 * Trigger discovery
 */
export async function handleTriggerDiscovery() {
  const result = await discoveryService.discoverModules();
  return {
    success: true,
    data: result,
  };
}
