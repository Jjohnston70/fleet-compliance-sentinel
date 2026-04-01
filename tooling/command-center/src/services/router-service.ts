/**
 * Router Service
 * Tool routing: given a tool name, find owning module and route the call
 */

import { registry } from '../data/in-memory-registry.js';
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

export class RouterService {
  /**
   * Route a tool call by fully-qualified name (module.tool_name)
   */
  routeByQualifiedName(qualifiedName: string): RouteResult {
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
  routeByName(toolName: string): RouteResult {
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
  route(toolName: string): RouteResult {
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
  validateParameters(tool: ToolDefinition, params: Record<string, any>): RouterValidationResult {
    const fieldErrors: RouterValidationIssue[] = [];
    const normalizedParams: Record<string, any> = {};
    const required = tool.parameters.required || [];
    const sourceParams = params || {};

    // Check required fields
    required.forEach((field) => {
      if (!(field in sourceParams)) {
        fieldErrors.push({
          path: `parameters.${field}`,
          code: 'required',
          message: `Missing required parameter: ${field}`,
        });
      }
    });

    const coerceBoolean = (value: unknown): boolean | undefined => {
      if (typeof value === 'boolean') return value;
      if (typeof value !== 'string') return undefined;
      const canonical = value.trim().toLowerCase();
      if (['true', '1', 'yes', 'y', 'on'].includes(canonical)) return true;
      if (['false', '0', 'no', 'n', 'off'].includes(canonical)) return false;
      return undefined;
    };

    const coerceNumber = (value: unknown): number | undefined => {
      if (typeof value === 'number' && !Number.isNaN(value)) return value;
      if (typeof value !== 'string') return undefined;
      const trimmed = value.trim();
      if (!/^-?\d+(\.\d+)?$/.test(trimmed)) return undefined;
      return Number(trimmed);
    };

    // Type checking with safe coercion for number/boolean
    Object.entries(tool.parameters.properties).forEach(([key, schema]: [string, any]) => {
      if (key in sourceParams && schema.type) {
        const rawValue = sourceParams[key];
        const paramType = typeof rawValue;
        let resolvedValue = rawValue;
        let coerced = false;

        if (schema.type === 'number') {
          const maybe = coerceNumber(rawValue);
          if (maybe === undefined) {
            fieldErrors.push({
              path: `parameters.${key}`,
              code: 'coercion',
              message: `Parameter ${key} could not be coerced to number`,
              expected: 'number',
              received: rawValue,
            });
            return;
          }
          resolvedValue = maybe;
          coerced = paramType !== 'number';
        }

        if (schema.type === 'boolean') {
          const maybe = coerceBoolean(rawValue);
          if (maybe === undefined) {
            fieldErrors.push({
              path: `parameters.${key}`,
              code: 'coercion',
              message: `Parameter ${key} could not be coerced to boolean`,
              expected: 'boolean',
              received: rawValue,
            });
            return;
          }
          resolvedValue = maybe;
          coerced = paramType !== 'boolean';
        }

        if (schema.type === 'string' && typeof resolvedValue !== 'string') {
          fieldErrors.push({
            path: `parameters.${key}`,
            code: 'type',
            message: `Parameter ${key} must be string, got ${typeof resolvedValue}`,
            expected: 'string',
            received: resolvedValue,
          });
          return;
        }
        if (schema.type === 'number' && typeof resolvedValue !== 'number') {
          fieldErrors.push({
            path: `parameters.${key}`,
            code: 'type',
            message: `Parameter ${key} must be number, got ${typeof resolvedValue}`,
            expected: 'number',
            received: resolvedValue,
          });
          return;
        }
        if (schema.type === 'boolean' && typeof resolvedValue !== 'boolean') {
          fieldErrors.push({
            path: `parameters.${key}`,
            code: 'type',
            message: `Parameter ${key} must be boolean, got ${typeof resolvedValue}`,
            expected: 'boolean',
            received: resolvedValue,
          });
          return;
        }
        if (schema.type === 'array' && !Array.isArray(resolvedValue)) {
          fieldErrors.push({
            path: `parameters.${key}`,
            code: 'type',
            message: `Parameter ${key} must be array, got ${typeof resolvedValue}`,
            expected: 'array',
            received: resolvedValue,
          });
          return;
        }

        if (coerced) {
          fieldErrors.push({
            path: `parameters.${key}`,
            code: 'coercion',
            message: `Parameter ${key} coerced to ${schema.type}`,
            expected: schema.type,
            received: rawValue,
            coerced: true,
          });
        }

        normalizedParams[key] = resolvedValue;
      } else if (key in sourceParams) {
        normalizedParams[key] = sourceParams[key];
      }
    });

    for (const [key, value] of Object.entries(sourceParams)) {
      if (!(key in normalizedParams)) {
        normalizedParams[key] = value;
      }
    }

    return {
      valid: fieldErrors.filter((issue) => !issue.coerced).length === 0,
      errors: fieldErrors
        .filter((issue) => !issue.coerced)
        .map((issue) => issue.message),
      fieldErrors,
      normalizedParams,
    };
  }
}

export const routerService = new RouterService();
