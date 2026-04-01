/**
 * Data schema definitions for Command Center
 */
import { z } from 'zod';
export declare const ParameterSchemaZ: z.ZodObject<{
    type: z.ZodLiteral<"object">;
    properties: z.ZodRecord<z.ZodString, z.ZodAny>;
    required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
}, "strip", z.ZodTypeAny, {
    type: "object";
    properties: Record<string, any>;
    required?: string[] | undefined;
}, {
    type: "object";
    properties: Record<string, any>;
    required?: string[] | undefined;
}>;
export type ParameterSchema = z.infer<typeof ParameterSchemaZ>;
export declare const ToolDefinitionZ: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    parameters: z.ZodObject<{
        type: z.ZodLiteral<"object">;
        properties: z.ZodRecord<z.ZodString, z.ZodAny>;
        required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
    }, {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
    };
}, {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, any>;
        required?: string[] | undefined;
    };
}>;
export type ToolDefinition = z.infer<typeof ToolDefinitionZ>;
export declare const ModuleHealthZ: z.ZodObject<{
    status: z.ZodEnum<["healthy", "degraded", "error", "offline"]>;
    lastCheck: z.ZodNumber;
    responseTimeMs: z.ZodOptional<z.ZodNumber>;
    error: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "healthy" | "degraded" | "error" | "offline";
    lastCheck: number;
    error?: string | undefined;
    responseTimeMs?: number | undefined;
}, {
    status: "healthy" | "degraded" | "error" | "offline";
    lastCheck: number;
    error?: string | undefined;
    responseTimeMs?: number | undefined;
}>;
export type ModuleHealth = z.infer<typeof ModuleHealthZ>;
export declare const RegisteredModuleZ: z.ZodObject<{
    id: z.ZodString;
    displayName: z.ZodString;
    version: z.ZodString;
    description: z.ZodString;
    classification: z.ZodEnum<["Operations", "Finance", "Intelligence", "Planning", "Infrastructure", "Logistics"]>;
    status: z.ZodEnum<["active", "inactive", "error", "maintenance"]>;
    toolCount: z.ZodNumber;
    tools: z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        description: z.ZodString;
        parameters: z.ZodObject<{
            type: z.ZodLiteral<"object">;
            properties: z.ZodRecord<z.ZodString, z.ZodAny>;
            required: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        }, "strip", z.ZodTypeAny, {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        }, {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
    }, {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
    }>, "many">;
    health: z.ZodObject<{
        status: z.ZodEnum<["healthy", "degraded", "error", "offline"]>;
        lastCheck: z.ZodNumber;
        responseTimeMs: z.ZodOptional<z.ZodNumber>;
        error: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        status: "healthy" | "degraded" | "error" | "offline";
        lastCheck: number;
        error?: string | undefined;
        responseTimeMs?: number | undefined;
    }, {
        status: "healthy" | "degraded" | "error" | "offline";
        lastCheck: number;
        error?: string | undefined;
        responseTimeMs?: number | undefined;
    }>;
    baseUrl: z.ZodOptional<z.ZodString>;
    registeredAt: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    status: "error" | "active" | "inactive" | "maintenance";
    description: string;
    id: string;
    displayName: string;
    version: string;
    classification: "Operations" | "Finance" | "Intelligence" | "Planning" | "Infrastructure" | "Logistics";
    toolCount: number;
    tools: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
    }[];
    health: {
        status: "healthy" | "degraded" | "error" | "offline";
        lastCheck: number;
        error?: string | undefined;
        responseTimeMs?: number | undefined;
    };
    registeredAt: number;
    updatedAt: number;
    baseUrl?: string | undefined;
}, {
    status: "error" | "active" | "inactive" | "maintenance";
    description: string;
    id: string;
    displayName: string;
    version: string;
    classification: "Operations" | "Finance" | "Intelligence" | "Planning" | "Infrastructure" | "Logistics";
    toolCount: number;
    tools: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
    }[];
    health: {
        status: "healthy" | "degraded" | "error" | "offline";
        lastCheck: number;
        error?: string | undefined;
        responseTimeMs?: number | undefined;
    };
    registeredAt: number;
    updatedAt: number;
    baseUrl?: string | undefined;
}>;
export type RegisteredModule = z.infer<typeof RegisteredModuleZ>;
export declare const ToolInvocationZ: z.ZodObject<{
    id: z.ZodString;
    toolId: z.ZodString;
    moduleId: z.ZodString;
    input: z.ZodRecord<z.ZodString, z.ZodAny>;
    output: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    status: z.ZodEnum<["success", "error", "timeout"]>;
    durationMs: z.ZodNumber;
    invokedAt: z.ZodNumber;
    errorMessage: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "error" | "success" | "timeout";
    id: string;
    toolId: string;
    moduleId: string;
    input: Record<string, any>;
    durationMs: number;
    invokedAt: number;
    output?: Record<string, any> | undefined;
    errorMessage?: string | undefined;
}, {
    status: "error" | "success" | "timeout";
    id: string;
    toolId: string;
    moduleId: string;
    input: Record<string, any>;
    durationMs: number;
    invokedAt: number;
    output?: Record<string, any> | undefined;
    errorMessage?: string | undefined;
}>;
export type ToolInvocation = z.infer<typeof ToolInvocationZ>;
export declare const SystemConfigZ: z.ZodObject<{
    id: z.ZodString;
    modulesPath: z.ZodString;
    autoDiscoveryEnabled: z.ZodBoolean;
    healthCheckIntervalMs: z.ZodNumber;
    defaultTimeoutMs: z.ZodNumber;
    updatedAt: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    id: string;
    updatedAt: number;
    modulesPath: string;
    autoDiscoveryEnabled: boolean;
    healthCheckIntervalMs: number;
    defaultTimeoutMs: number;
}, {
    id: string;
    updatedAt: number;
    modulesPath: string;
    autoDiscoveryEnabled: boolean;
    healthCheckIntervalMs: number;
    defaultTimeoutMs: number;
}>;
export type SystemConfig = z.infer<typeof SystemConfigZ>;
//# sourceMappingURL=schema.d.ts.map