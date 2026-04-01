/**
 * Command Center Meta-Tools
 * LLM-facing tools for discovering and routing to other modules
 */

import { discoveryService } from './services/discovery-service.js';
import {
  handleListModules,
  handleListAllToolsFiltered,
  handleSearchTools,
  handleGetToolSchema,
  handleRouteToolCall,
  handleGetSystemHealth,
  handleGetModuleDetail,
  handleGetClassifications,
  handleGetSystemDashboard,
  handleGetToolUsageStats,
  handleTriggerDiscovery,
} from './api/handlers.js';

/**
 * Tool definition for LLM
 */
export interface Tool {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, any>;
    required?: string[];
  };
}

/**
 * Tool handler function
 */
export type ToolHandlerType = (params: Record<string, any>) => Promise<any>;

/**
 * Meta-tools that the LLM can use to navigate the TNDS ecosystem
 */
export const COMMAND_CENTER_TOOLS: Tool[] = [
  {
    name: 'discover_modules',
    description:
      'List all registered TNDS command modules with their status, classification, and tool counts. Returns module metadata including display name, version, description, and current health status.',
    inputSchema: {
      type: 'object',
      properties: {
        acl: {
          type: 'object',
          description: 'Optional ACL filter payload with allowedModuleIds/allowedQualifiedNames',
        },
      },
    },
  },
  {
    name: 'discover_tools',
    description:
      'List all available tools across all TNDS command modules. Optionally filter by module ID or classification (Operations, Finance, Intelligence, Planning, Infrastructure, Logistics). Returns qualified tool names (module.tool_name) with descriptions.',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: {
          type: 'string',
          description: 'Optional: Filter tools by specific module ID (e.g., realty-command)',
        },
        classification: {
          type: 'string',
          description:
            'Optional: Filter by classification (Operations, Finance, Intelligence, Planning, Infrastructure, Logistics)',
        },
        query: {
          type: 'string',
          description: 'Optional: user request query for relevance ranking and tool selection',
        },
        intent: {
          type: 'string',
          description: 'Optional: short task intent used to rank the most relevant tools',
        },
        maxTools: {
          type: 'number',
          description: 'Optional cap for returned tools (1-15, default 12)',
        },
        acl: {
          type: 'object',
          description: 'Optional ACL filter payload with allowedModuleIds/allowedQualifiedNames',
        },
      },
    },
  },
  {
    name: 'search_tools',
    description:
      'Search for tools by keyword across all TNDS modules. Returns ranked results based on tool name and description match. Supports filtering by module and classification.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search keyword (e.g., property, sales, compliance)',
        },
        moduleId: {
          type: 'string',
          description: 'Optional: Filter to specific module',
        },
        classification: {
          type: 'string',
          description: 'Optional: Filter to classification',
        },
        maxTools: {
          type: 'number',
          description: 'Optional cap for returned results (1-15, default 12)',
        },
        acl: {
          type: 'object',
          description: 'Optional ACL filter payload with allowedModuleIds/allowedQualifiedNames',
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_tool_schema',
    description:
      'Get the complete parameter schema for a specific tool. Provides detailed information about what parameters the tool accepts and their types. Use the qualified name: module.tool_name.',
    inputSchema: {
      type: 'object',
      properties: {
        qualifiedName: {
          type: 'string',
          description: 'Fully-qualified tool name (e.g., realty-command.add_property)',
        },
      },
      required: ['qualifiedName'],
    },
  },
  {
    name: 'route_tool_call',
    description:
      'Execute a tool by its qualified name (module.tool_name) with provided parameters. Routes the call to the appropriate module and executes it. Returns execution status and invocation ID.',
    inputSchema: {
      type: 'object',
      properties: {
        qualifiedName: {
          type: 'string',
          description: 'Fully-qualified tool name (e.g., realty-command.add_property)',
        },
        parameters: {
          type: 'object',
          description: 'Tool parameters as key-value pairs',
        },
        acl: {
          type: 'object',
          description: 'Optional ACL filter payload with allowedModuleIds/allowedQualifiedNames',
        },
      },
      required: ['qualifiedName', 'parameters'],
    },
  },
  {
    name: 'get_system_status',
    description:
      'Get comprehensive health check across all TNDS modules. Returns system status (healthy, degraded, critical) and detailed health metrics for each module.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_module_detail',
    description:
      'Get detailed information about a specific TNDS module including all its tools, health status, and usage statistics.',
    inputSchema: {
      type: 'object',
      properties: {
        moduleId: {
          type: 'string',
          description: 'Module ID (e.g., realty-command)',
        },
      },
      required: ['moduleId'],
    },
  },
  {
    name: 'get_classifications',
    description:
      'List all TNDS module classifications and how many modules belong to each classification.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_system_dashboard',
    description:
      'Get system-wide dashboard with aggregate metrics: total modules, tools, classifications, and system health summary.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_tool_usage_stats',
    description:
      'Get tool usage statistics including most invoked tools, average response times, and error rates per module.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

/**
 * Tool handlers map
 */
export const toolHandlers: Record<string, ToolHandlerType> = {
  discover_modules: async (params) => {
    return handleListModules({
      acl: discoveryService.parseAclFilter(params.acl),
    });
  },

  discover_tools: async (params) => {
    return handleListAllToolsFiltered({
      moduleId: params.moduleId,
      classification: params.classification,
      query: params.query,
      intent: params.intent,
      maxTools: params.maxTools,
      acl: discoveryService.parseAclFilter(params.acl),
    });
  },

  search_tools: async (params) => {
    return handleSearchTools(params.query, {
      moduleId: params.moduleId,
      classification: params.classification,
      maxTools: params.maxTools,
      acl: discoveryService.parseAclFilter(params.acl),
    });
  },

  get_tool_schema: async (params) => {
    return handleGetToolSchema(params.qualifiedName);
  },

  route_tool_call: async (params) => {
    return handleRouteToolCall(
      params.qualifiedName,
      params.parameters || {},
      discoveryService.parseAclFilter(params.acl),
    );
  },

  get_system_status: async () => {
    return handleGetSystemHealth();
  },

  get_module_detail: async (params) => {
    return handleGetModuleDetail(params.moduleId);
  },

  get_classifications: async () => {
    return handleGetClassifications();
  },

  get_system_dashboard: async () => {
    return handleGetSystemDashboard();
  },

  get_tool_usage_stats: async () => {
    return handleGetToolUsageStats();
  },
};

/**
 * Initialize the Command Center
 * Register all manifest modules via discovery
 */
export async function initializeCommandCenter(): Promise<void> {
  await discoveryService.discoverModules();
}

export type ToolHandler = ToolHandlerType;
