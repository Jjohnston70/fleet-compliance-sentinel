import { DispatchAPIHandlers } from './api/handlers';
import { InMemoryRepository } from './data/repository';

export type ToolResult = string | Record<string, unknown>;
export type ToolArgs = Record<string, unknown>;

export type DispatchToolName =
  | 'create_dispatch_request'
  | 'assign_driver'
  | 'reassign_driver'
  | 'get_dispatch_status'
  | 'list_active_dispatches'
  | 'get_driver_availability'
  | 'update_driver_status'
  | 'get_dispatch_metrics'
  | 'check_sla_status'
  | 'find_nearest_driver'
  | 'get_zone_status';

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, Record<string, unknown>>;
  required: string[];
}

export interface ToolDefinition {
  name: DispatchToolName;
  description: string;
  input_schema: ToolInputSchema;
}

export interface ToolHandler {
  name: DispatchToolName;
  description: string;
  handler: (args: ToolArgs) => Promise<ToolResult>;
}

const EMPTY_SCHEMA: ToolInputSchema = {
  type: 'object',
  properties: {},
  required: [],
};

export const DISPATCH_COMMAND_TOOLS: ToolDefinition[] = [
  {
    name: 'create_dispatch_request',
    description: 'Create a new HVAC dispatch request',
    input_schema: {
      type: 'object',
      properties: {
        client_name: { type: 'string', description: 'Client name' },
        client_phone: { type: 'string', description: 'Client phone number' },
        address: { type: 'string', description: 'Service address' },
        city: { type: 'string', description: 'City' },
        state: { type: 'string', description: 'State' },
        zip: { type: 'string', description: 'ZIP code' },
        zone_id: { type: 'string', description: 'Zone ID' },
        priority: {
          type: 'string',
          enum: ['emergency', 'urgent', 'standard', 'scheduled'],
          description: 'Dispatch priority',
        },
        issue_type: {
          type: 'string',
          enum: ['no_heat', 'no_ac', 'leak', 'electrical', 'maintenance', 'inspection'],
          description: 'Issue classification',
        },
        description: { type: 'string', description: 'Issue description' },
      },
      required: [
        'client_name',
        'client_phone',
        'address',
        'city',
        'state',
        'zip',
        'zone_id',
        'priority',
        'issue_type',
        'description',
      ],
    },
  },
  {
    name: 'assign_driver',
    description: 'Assign a driver to a dispatch request',
    input_schema: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Dispatch request ID' },
        driver_id: { type: 'string', description: 'Driver ID' },
        truck_id: { type: 'string', description: 'Optional truck ID' },
      },
      required: ['request_id', 'driver_id'],
    },
  },
  {
    name: 'reassign_driver',
    description: 'Reassign a dispatch request to a different driver',
    input_schema: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Dispatch request ID' },
        driver_id: { type: 'string', description: 'New driver ID' },
      },
      required: ['request_id', 'driver_id'],
    },
  },
  {
    name: 'get_dispatch_status',
    description: 'Get status of a dispatch request',
    input_schema: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Dispatch request ID' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'list_active_dispatches',
    description: 'List all active dispatch requests',
    input_schema: EMPTY_SCHEMA,
  },
  {
    name: 'get_driver_availability',
    description: 'Check if a driver is available for dispatch',
    input_schema: {
      type: 'object',
      properties: {
        driver_id: { type: 'string', description: 'Driver ID' },
      },
      required: ['driver_id'],
    },
  },
  {
    name: 'update_driver_status',
    description: 'Update driver status (available, en_route, on_site, off_duty, on_break)',
    input_schema: {
      type: 'object',
      properties: {
        driver_id: { type: 'string', description: 'Driver ID' },
        status: {
          type: 'string',
          enum: ['available', 'en_route', 'on_site', 'off_duty', 'on_break'],
          description: 'New driver status',
        },
      },
      required: ['driver_id', 'status'],
    },
  },
  {
    name: 'get_dispatch_metrics',
    description: 'Get current dispatch metrics and statistics',
    input_schema: EMPTY_SCHEMA,
  },
  {
    name: 'check_sla_status',
    description: 'Check SLA status of a dispatch request',
    input_schema: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Dispatch request ID' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'find_nearest_driver',
    description: 'Find nearest available driver for a request',
    input_schema: {
      type: 'object',
      properties: {
        request_id: { type: 'string', description: 'Dispatch request ID' },
      },
      required: ['request_id'],
    },
  },
  {
    name: 'get_zone_status',
    description: 'Get status of drivers and requests in a zone',
    input_schema: {
      type: 'object',
      properties: {
        zone_id: { type: 'string', description: 'Zone ID' },
      },
      required: ['zone_id'],
    },
  },
];

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function formatResult(result: unknown): string {
  return JSON.stringify(result, null, 2);
}

export function createDispatchToolHandlers(
  repository: InMemoryRepository
): Record<DispatchToolName, (args: ToolArgs) => Promise<ToolResult>> {
  const handlers = new DispatchAPIHandlers(repository);

  return {
    create_dispatch_request: async (args) => {
      const result = await handlers.createDispatchRequest({
        client_name: asString(args.client_name) ?? '',
        client_phone: asString(args.client_phone) ?? '',
        address: asString(args.address) ?? '',
        city: asString(args.city) ?? '',
        state: asString(args.state) ?? '',
        zip: asString(args.zip) ?? '',
        zone_id: asString(args.zone_id) ?? '',
        priority: asString(args.priority) as
          | 'emergency'
          | 'urgent'
          | 'standard'
          | 'scheduled'
          | undefined,
        issue_type: asString(args.issue_type) as
          | 'no_heat'
          | 'no_ac'
          | 'leak'
          | 'electrical'
          | 'maintenance'
          | 'inspection'
          | undefined,
        description: asString(args.description) ?? '',
      });
      return formatResult(result);
    },

    assign_driver: async (args) => {
      const requestId = asString(args.request_id);
      const driverId = asString(args.driver_id);
      const truckId = asString(args.truck_id);
      const result = await handlers.assignDriver(requestId ?? '', driverId ?? '', truckId);
      return formatResult(result);
    },

    reassign_driver: async (args) => {
      const requestId = asString(args.request_id);
      const driverId = asString(args.driver_id);
      const result = await handlers.reassignDriver(requestId ?? '', driverId ?? '');
      return formatResult(result);
    },

    get_dispatch_status: async (args) => {
      const requestId = asString(args.request_id);
      const result = await handlers.getDispatchRequest(requestId ?? '');
      return result ? formatResult(result) : 'Request not found';
    },

    list_active_dispatches: async () => {
      const result = await handlers.listDispatchRequests();
      const active = result.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
      return formatResult(active);
    },

    get_driver_availability: async (args) => {
      const driverId = asString(args.driver_id);
      const result = await handlers.getDriverAvailability(driverId ?? '');
      return result ? formatResult(result) : 'Driver not found';
    },

    update_driver_status: async (args) => {
      const driverId = asString(args.driver_id);
      const status = asString(args.status);
      const result = await handlers.updateDriverStatus(driverId ?? '', status ?? '');
      return result ? formatResult(result) : 'Driver not found or invalid status';
    },

    get_dispatch_metrics: async () => {
      const result = await handlers.getDispatchMetrics();
      return formatResult(result);
    },

    check_sla_status: async (args) => {
      const requestId = asString(args.request_id);
      const result = await handlers.checkSLAStatus(requestId ?? '');
      return result ? formatResult(result) : 'Request not found';
    },

    find_nearest_driver: async (args) => {
      const requestId = asString(args.request_id);
      const result = await handlers.findNearestDriver(requestId ?? '');
      return formatResult(result);
    },

    get_zone_status: async (args) => {
      const zoneId = asString(args.zone_id);
      const result = await handlers.getZoneStatus(zoneId ?? '');
      return result ? formatResult(result) : 'Zone not found';
    },
  };
}

/**
 * Create LLM tool handlers for dispatch-command.
 * Kept for backwards compatibility with prior module usage.
 */
export function createDispatchTools(repository: InMemoryRepository): ToolHandler[] {
  const handlers = createDispatchToolHandlers(repository);

  return DISPATCH_COMMAND_TOOLS.map((tool) => ({
    name: tool.name,
    description: tool.description,
    handler: handlers[tool.name],
  }));
}

/**
 * Create a model-friendly tool definition object from a handler.
 */
export function createToolDefinition(handler: ToolHandler): Record<string, unknown> {
  const definition = DISPATCH_COMMAND_TOOLS.find((tool) => tool.name === handler.name);
  const inputSchema = definition?.input_schema ?? EMPTY_SCHEMA;

  return {
    name: handler.name,
    description: handler.description,
    input_schema: inputSchema,
  };
}
