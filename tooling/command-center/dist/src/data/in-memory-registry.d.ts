/**
 * In-memory registry for modules, tools, and invocations
 * Repository pattern - no external database
 */
import { RegisteredModule, ToolDefinition, ToolInvocation, SystemConfig, ModuleHealth } from './schema.js';
export declare class InMemoryRegistry {
    private modules;
    private toolIndex;
    private invocations;
    private config;
    registerModule(module: RegisteredModule): void;
    deregisterModule(moduleId: string): void;
    getModule(moduleId: string): RegisteredModule | null;
    listModules(): RegisteredModule[];
    updateModuleStatus(moduleId: string, status: RegisteredModule['status']): void;
    updateModuleHealth(moduleId: string, health: ModuleHealth): void;
    findTool(qualifiedName: string): {
        moduleId: string;
        tool: ToolDefinition;
    } | null;
    findToolsByName(toolName: string): Array<{
        moduleId: string;
        tool: ToolDefinition;
    }>;
    listAllTools(): Array<{
        moduleId: string;
        tool: ToolDefinition;
    }>;
    recordInvocation(invocation: ToolInvocation): void;
    getInvocationHistory(toolId?: string, limit?: number): ToolInvocation[];
    getConfig(): SystemConfig | null;
    setConfig(config: SystemConfig): void;
    clear(): void;
    private indexTools;
}
export declare const registry: InMemoryRegistry;
//# sourceMappingURL=in-memory-registry.d.ts.map