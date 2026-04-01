/**
 * Router Service
 * Tool routing: given a tool name, find owning module and route the call
 */
import { ToolDefinition } from '../data/schema.js';
export interface RouteResult {
    success: boolean;
    moduleId?: string;
    tool?: ToolDefinition;
    error?: string;
}
export interface RouterValidationIssue {
    path: string;
    code: 'required' | 'type' | 'coercion';
    message: string;
    expected?: string;
    received?: unknown;
    coerced?: boolean;
}
export interface RouterValidationResult {
    valid: boolean;
    errors?: string[];
    fieldErrors?: RouterValidationIssue[];
    normalizedParams?: Record<string, any>;
}
export declare class RouterService {
    /**
     * Route a tool call by fully-qualified name (module.tool_name)
     */
    routeByQualifiedName(qualifiedName: string): RouteResult;
    /**
     * Route a tool call by unqualified name
     * If ambiguous, require qualified name
     */
    routeByName(toolName: string): RouteResult;
    /**
     * Route with flexible naming: try qualified first, then unqualified
     */
    route(toolName: string): RouteResult;
    /**
     * Validate tool parameters against schema
     */
    validateParameters(tool: ToolDefinition, params: Record<string, any>): RouterValidationResult;
}
export declare const routerService: RouterService;
//# sourceMappingURL=router-service.d.ts.map