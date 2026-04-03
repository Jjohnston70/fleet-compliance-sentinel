import { InMemoryRepository } from './data/repository';
import { DispatchAPIHandlers } from './api/handlers';

export type ToolResult = string | Record<string, any>;

export interface ToolHandler {
  name: string;
  description: string;
  handler: (args: Record<string, any>) => Promise<ToolResult>;
}

/**
 * Create LLM tool handlers for dispatch-command.
 */
export function createDispatchTools(repository: InMemoryRepository): ToolHandler[] {
  const handlers = new DispatchAPIHandlers(repository);

  return [
    {
      name: 'create_dispatch_request',
      description: 'Create a new HVAC dispatch request',
      handler: async (args) => {
        const result = await handlers.createDispatchRequest({
          client_name: args.client_name,
          client_phone: args.client_phone,
          address: args.address,
          city: args.city,
          state: args.state,
          zip: args.zip,
          zone_id: args.zone_id,
          priority: args.priority,
          issue_type: args.issue_type,
          description: args.description,
        });
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'get_dispatch_status',
      description: 'Get status of a dispatch request',
      handler: async (args) => {
        const result = await handlers.getDispatchRequest(args.request_id);
        return result ? JSON.stringify(result, null, 2) : 'Request not found';
      },
    },

    {
      name: 'list_active_dispatches',
      description: 'List all active dispatch requests',
      handler: async () => {
        const result = await handlers.listDispatchRequests();
        const active = result.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
        return JSON.stringify(active, null, 2);
      },
    },

    {
      name: 'assign_driver',
      description: 'Assign a driver to a dispatch request',
      handler: async (args) => {
        const result = await handlers.assignDriver(args.request_id, args.driver_id, args.truck_id);
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'get_driver_availability',
      description: 'Check if a driver is available for dispatch',
      handler: async (args) => {
        const result = await handlers.getDriverAvailability(args.driver_id);
        return result ? JSON.stringify(result, null, 2) : 'Driver not found';
      },
    },

    {
      name: 'update_driver_status',
      description: 'Update driver status (available, en_route, on_site, off_duty, on_break)',
      handler: async (args) => {
        const result = await handlers.updateDriverStatus(args.driver_id, args.status);
        return result ? JSON.stringify(result, null, 2) : 'Driver not found';
      },
    },

    {
      name: 'get_dispatch_metrics',
      description: 'Get current dispatch metrics and statistics',
      handler: async () => {
        const result = await handlers.getDispatchMetrics();
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'check_sla_status',
      description: 'Check SLA status of a dispatch request',
      handler: async (args) => {
        const result = await handlers.checkSLAStatus(args.request_id);
        return result ? JSON.stringify(result, null, 2) : 'Request not found';
      },
    },

    {
      name: 'find_nearest_driver',
      description: 'Find nearest available driver for a request',
      handler: async (args) => {
        const result = await handlers.findNearestDriver(args.request_id);
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'get_zone_status',
      description: 'Get status of drivers and requests in a zone',
      handler: async (args) => {
        const result = await handlers.getZoneStatus(args.zone_id);
        return result ? JSON.stringify(result, null, 2) : 'Zone not found';
      },
    },
  ];
}

/**
 * Create tool definition for LLM model.
 */
export function createToolDefinition(handler: ToolHandler): Record<string, any> {
  const paramSchema: Record<string, any> = {
    type: 'object',
    properties: {},
    required: [],
  };

  // Parse handler name to infer parameters
  switch (handler.name) {
    case 'create_dispatch_request':
      paramSchema.properties = {
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
        },
        issue_type: {
          type: 'string',
          enum: ['no_heat', 'no_ac', 'leak', 'electrical', 'maintenance', 'inspection'],
        },
        description: { type: 'string', description: 'Issue description' },
      };
      paramSchema.required = [
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
      ];
      break;

    case 'assign_driver':
      paramSchema.properties = {
        request_id: { type: 'string', description: 'Dispatch request ID' },
        driver_id: { type: 'string', description: 'Driver ID' },
        truck_id: { type: 'string', description: 'Truck ID (optional)' },
      };
      paramSchema.required = ['request_id', 'driver_id'];
      break;

    case 'get_dispatch_status':
    case 'check_sla_status':
    case 'find_nearest_driver':
      paramSchema.properties = {
        request_id: { type: 'string', description: 'Dispatch request ID' },
      };
      paramSchema.required = ['request_id'];
      break;

    case 'get_driver_availability':
    case 'update_driver_status':
      paramSchema.properties = {
        driver_id: { type: 'string', description: 'Driver ID' },
        status: {
          type: 'string',
          enum: ['available', 'en_route', 'on_site', 'off_duty', 'on_break'],
          description: 'New driver status',
        },
      };
      paramSchema.required = ['driver_id'];
      if (handler.name === 'update_driver_status') {
        paramSchema.required.push('status');
      }
      break;

    case 'get_zone_status':
      paramSchema.properties = {
        zone_id: { type: 'string', description: 'Zone ID' },
      };
      paramSchema.required = ['zone_id'];
      break;
  }

  return {
    name: handler.name,
    description: handler.description,
    input_schema: paramSchema,
  };
}
