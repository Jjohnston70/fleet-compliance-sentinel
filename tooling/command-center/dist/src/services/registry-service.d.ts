/**
 * Registry Service
 * Core module registration, deregistration, status updates, and metadata management
 */
import { RegisteredModule, ToolDefinition, ModuleHealth } from '../data/schema.js';
export declare class RegistryService {
    /**
     * Register a new module with its tools
     */
    registerModule(moduleId: string, displayName: string, version: string, description: string, classification: RegisteredModule['classification'], tools: ToolDefinition[], baseUrl?: string): RegisteredModule;
    /**
     * Deregister a module
     */
    deregisterModule(moduleId: string): void;
    /**
     * Get module info
     */
    getModule(moduleId: string): RegisteredModule | null;
    /**
     * List all registered modules
     */
    listModules(): RegisteredModule[];
    /**
     * Get modules by classification
     */
    getModulesByClassification(classification: RegisteredModule['classification']): RegisteredModule[];
    /**
     * Update module status
     */
    updateStatus(moduleId: string, status: RegisteredModule['status']): void;
    /**
     * Update module health
     */
    updateHealth(moduleId: string, health: ModuleHealth): void;
    /**
     * Get module statistics
     */
    getStats(): {
        totalModules: number;
        activeModules: number;
        inactiveModules: number;
        totalTools: number;
        classificationBreakdown: {
            [k: string]: number;
        };
    };
}
export declare const registryService: RegistryService;
//# sourceMappingURL=registry-service.d.ts.map