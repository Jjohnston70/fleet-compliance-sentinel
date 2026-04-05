/**
 * LLM Tool Definitions for govcon-compliance-command
 * 20 tools covering pipeline, compliance docs, intake, maturity, and bid documents
 */
import { InMemoryRepository } from "./data/repository.js";
export interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: Record<string, any>;
        required: string[];
    };
}
export type ToolHandler = (input: any) => Promise<any>;
export declare const GOVCON_COMPLIANCE_TOOLS: ToolDefinition[];
export declare function createToolHandlers(repo: InMemoryRepository): Record<string, ToolHandler>;
//# sourceMappingURL=tools.d.ts.map