import { IRepository } from './data/repository';
export interface ToolDefinition {
    name: string;
    description: string;
    input_schema: {
        type: string;
        properties: Record<string, any>;
        required: string[];
    };
}
export interface ToolInput {
    [key: string]: any;
}
export type ToolHandler = (input: ToolInput) => Promise<any>;
export declare function createToolDefinitions(): ToolDefinition[];
export declare function createToolHandlers(repo: IRepository): Record<string, ToolHandler>;
export declare const TRAINING_COMMAND_TOOLS: ToolDefinition[];
//# sourceMappingURL=tools.d.ts.map