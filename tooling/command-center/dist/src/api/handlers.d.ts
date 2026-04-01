/**
 * API Handlers
 * REST-style handlers for all registry operations
 */
import { type ToolAclFilter } from '../services/discovery-service.js';
/**
 * List all registered modules
 */
export declare function handleListModules(input?: {
    acl?: ToolAclFilter;
}): Promise<{
    success: boolean;
    data: {
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
    }[];
}>;
/**
 * Get a specific module
 */
export declare function handleGetModule(moduleId: string): Promise<{
    success: boolean;
    error: string;
    data?: undefined;
} | {
    success: boolean;
    data: {
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
    };
    error?: undefined;
}>;
/**
 * List all tools across all modules
 */
export declare function handleListAllTools(): Promise<{
    success: boolean;
    meta: {
        cap: number;
        returned: number;
        query: string | null;
        intent: string | null;
    };
    data: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
        qualifiedName: string;
        moduleId: string;
    }[];
}>;
export declare function handleListAllToolsFiltered(input: {
    moduleId?: string;
    classification?: string;
    query?: string;
    intent?: string;
    maxTools?: number;
    acl?: ToolAclFilter;
}): Promise<{
    success: boolean;
    meta: {
        cap: number;
        returned: number;
        query: string | null;
        intent: string | null;
    };
    data: {
        name: string;
        description: string;
        parameters: {
            type: "object";
            properties: Record<string, any>;
            required?: string[] | undefined;
        };
        qualifiedName: string;
        moduleId: string;
    }[];
}>;
/**
 * Search for tools
 */
export declare function handleSearchTools(query: string, filters?: {
    moduleId?: string;
    classification?: string;
    maxTools?: number;
    acl?: ToolAclFilter;
}): Promise<{
    success: boolean;
    meta: {
        cap: number;
        returned: number;
        query: string;
    };
    data: import("../services/search-service.js").SearchResult[];
}>;
/**
 * Get tool schema
 */
export declare function handleGetToolSchema(qualifiedName: string): Promise<{
    success: boolean;
    error: string | undefined;
    data?: undefined;
} | {
    success: boolean;
    data: {
        qualifiedName: string;
        moduleId: string | undefined;
        tool: {
            name: string;
            description: string;
            parameters: {
                type: "object";
                properties: Record<string, any>;
                required?: string[] | undefined;
            };
        } | undefined;
    };
    error?: undefined;
}>;
/**
 * Route and execute a tool call
 */
export declare function handleRouteToolCall(qualifiedName: string, params: Record<string, any>, acl?: ToolAclFilter): Promise<{
    success: boolean;
    error: string | undefined;
    details?: undefined;
    data?: undefined;
} | {
    success: boolean;
    error: string;
    details: string[] | undefined;
    data?: undefined;
} | {
    success: boolean;
    data: {
        qualifiedName: string;
        moduleId: string | undefined;
        invocationId: string;
        message: string;
    };
    error?: undefined;
    details?: undefined;
}>;
/**
 * Get system health
 */
export declare function handleGetSystemHealth(): Promise<{
    success: boolean;
    data: import("../services/health-service.js").HealthReport;
}>;
/**
 * Get module detail
 */
export declare function handleGetModuleDetail(moduleId: string): Promise<{
    success: boolean;
    error: string;
    data?: undefined;
} | {
    success: boolean;
    data: {
        module: {
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
        };
        usage: {
            invocations: number;
            errorRate: number;
        };
        tools: {
            name: string;
            description: string;
            parameters: {
                type: "object";
                properties: Record<string, any>;
                required?: string[] | undefined;
            };
        }[];
    };
    error?: undefined;
}>;
/**
 * Get classifications
 */
export declare function handleGetClassifications(): Promise<{
    success: boolean;
    data: {
        classification: import("../data/schema.js").RegisteredModule["classification"];
        count: number;
    }[];
}>;
/**
 * Get system dashboard
 */
export declare function handleGetSystemDashboard(): Promise<{
    success: boolean;
    data: import("../reporting/system-dashboard.js").DashboardData;
}>;
/**
 * Get tool usage stats
 */
export declare function handleGetToolUsageStats(): Promise<{
    success: boolean;
    data: import("../reporting/tool-usage-report.js").UsageReportData;
}>;
/**
 * Trigger discovery
 */
export declare function handleTriggerDiscovery(): Promise<{
    success: boolean;
    data: import("../services/discovery-service.js").DiscoveryResult;
}>;
//# sourceMappingURL=handlers.d.ts.map