import { InMemoryRepository } from './data/repository';
export type ToolResult = string | Record<string, any>;
export interface ToolHandler {
    name: string;
    description: string;
    handler: (args: Record<string, any>) => Promise<ToolResult>;
}
/**
 * Create LLM tool handlers for dispatch-command.
 */
export declare function createDispatchTools(repository: InMemoryRepository): ToolHandler[];
/**
 * Create tool definition for LLM model.
 */
export declare function createToolDefinition(handler: ToolHandler): Record<string, any>;
//# sourceMappingURL=tools.d.ts.map