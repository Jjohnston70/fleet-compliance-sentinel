import { InMemoryRepository } from './data/repository';
export type ToolResult = string | Record<string, unknown>;
export type ToolArgs = Record<string, unknown>;
export type DispatchToolName = 'create_dispatch_request' | 'assign_driver' | 'reassign_driver' | 'get_dispatch_status' | 'list_active_dispatches' | 'get_driver_availability' | 'update_driver_status' | 'get_dispatch_metrics' | 'check_sla_status' | 'find_nearest_driver' | 'get_zone_status';
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
export declare const DISPATCH_COMMAND_TOOLS: ToolDefinition[];
export declare function createDispatchToolHandlers(repository: InMemoryRepository): Record<DispatchToolName, (args: ToolArgs) => Promise<ToolResult>>;
/**
 * Create LLM tool handlers for dispatch-command.
 * Kept for backwards compatibility with prior module usage.
 */
export declare function createDispatchTools(repository: InMemoryRepository): ToolHandler[];
/**
 * Create a model-friendly tool definition object from a handler.
 */
export declare function createToolDefinition(handler: ToolHandler): Record<string, unknown>;
//# sourceMappingURL=tools.d.ts.map