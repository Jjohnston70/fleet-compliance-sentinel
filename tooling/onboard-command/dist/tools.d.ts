export type ToolHandler = (args: Record<string, any>) => Promise<any>;
export interface Tool {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}
export declare const TOOLS: Tool[];
export declare const toolHandlers: Record<string, ToolHandler>;
export declare function executeTool(toolName: string, args: Record<string, any>): Promise<any>;
//# sourceMappingURL=tools.d.ts.map