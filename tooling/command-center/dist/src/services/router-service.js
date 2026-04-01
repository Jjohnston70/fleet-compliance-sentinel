/**
 * Router Service
 * Tool routing: given a tool name, find owning module and route the call
 */
import { registry } from '../data/in-memory-registry.js';
export class RouterService {
    /**
     * Route a tool call by fully-qualified name (module.tool_name)
     */
    routeByQualifiedName(qualifiedName) {
        const result = registry.findTool(qualifiedName);
        if (!result) {
            return {
                success: false,
                error: `Tool not found: ${qualifiedName}`,
            };
        }
        return {
            success: true,
            moduleId: result.moduleId,
            tool: result.tool,
        };
    }
    /**
     * Route a tool call by unqualified name
     * If ambiguous, require qualified name
     */
    routeByName(toolName) {
        const results = registry.findToolsByName(toolName);
        if (results.length === 0) {
            return {
                success: false,
                error: `Tool not found: ${toolName}`,
            };
        }
        if (results.length > 1) {
            const modules = results.map((r) => r.moduleId).join(', ');
            return {
                success: false,
                error: `Ambiguous tool name "${toolName}" found in modules: ${modules}. Use qualified name "module.${toolName}"`,
            };
        }
        return {
            success: true,
            moduleId: results[0].moduleId,
            tool: results[0].tool,
        };
    }
    /**
     * Route with flexible naming: try qualified first, then unqualified
     */
    route(toolName) {
        // Try qualified first
        if (toolName.includes('.')) {
            return this.routeByQualifiedName(toolName);
        }
        // Fall back to unqualified
        return this.routeByName(toolName);
    }
    /**
     * Validate tool parameters against schema
     */
    validateParameters(tool, params) {
        const errors = [];
        const required = tool.parameters.required || [];
        // Check required fields
        required.forEach((field) => {
            if (!(field in params)) {
                errors.push(`Missing required parameter: ${field}`);
            }
        });
        // Basic type checking
        Object.entries(tool.parameters.properties).forEach(([key, schema]) => {
            if (key in params && schema.type) {
                const paramType = typeof params[key];
                if (schema.type === 'string' && paramType !== 'string') {
                    errors.push(`Parameter ${key} must be string, got ${paramType}`);
                }
                else if (schema.type === 'number' && paramType !== 'number') {
                    errors.push(`Parameter ${key} must be number, got ${paramType}`);
                }
                else if (schema.type === 'boolean' && paramType !== 'boolean') {
                    errors.push(`Parameter ${key} must be boolean, got ${paramType}`);
                }
                else if (schema.type === 'array' && !Array.isArray(params[key])) {
                    errors.push(`Parameter ${key} must be array, got ${paramType}`);
                }
            }
        });
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined,
        };
    }
}
export const routerService = new RouterService();
//# sourceMappingURL=router-service.js.map