/**
 * Command Center Meta-Tools
 * LLM-facing tools for discovering and routing to other modules
 */
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
export declare const COMMAND_CENTER_TOOLS: Tool[];
/**
 * Tool handlers map
 */
export declare const toolHandlers: Record<string, ToolHandlerType>;
/**
 * Initialize the Command Center
 * Register all manifest modules via discovery
 */
export declare function initializeCommandCenter(): Promise<void>;
export type ToolHandler = ToolHandlerType;
//# sourceMappingURL=tools.d.ts.map