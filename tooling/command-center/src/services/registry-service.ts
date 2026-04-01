/**
 * Registry Service
 * Core module registration, deregistration, status updates, and metadata management
 */

import { RegisteredModule, ToolDefinition, ModuleHealth } from '../data/schema.js';
import { registry } from '../data/in-memory-registry.js';

export class RegistryService {
  /**
   * Register a new module with its tools
   */
  registerModule(
    moduleId: string,
    displayName: string,
    version: string,
    description: string,
    classification: RegisteredModule['classification'],
    tools: ToolDefinition[],
    baseUrl?: string,
  ): RegisteredModule {
    const module: RegisteredModule = {
      id: moduleId,
      displayName,
      version,
      description,
      classification,
      status: 'active',
      toolCount: tools.length,
      tools,
      health: {
        status: 'healthy',
        lastCheck: Date.now(),
      },
      baseUrl,
      registeredAt: Date.now(),
      updatedAt: Date.now(),
    };

    registry.registerModule(module);
    return module;
  }

  /**
   * Deregister a module
   */
  deregisterModule(moduleId: string): void {
    registry.deregisterModule(moduleId);
  }

  /**
   * Get module info
   */
  getModule(moduleId: string): RegisteredModule | null {
    return registry.getModule(moduleId);
  }

  /**
   * List all registered modules
   */
  listModules(): RegisteredModule[] {
    return registry.listModules();
  }

  /**
   * Get modules by classification
   */
  getModulesByClassification(
    classification: RegisteredModule['classification'],
  ): RegisteredModule[] {
    return this.listModules().filter((m) => m.classification === classification);
  }

  /**
   * Update module status
   */
  updateStatus(moduleId: string, status: RegisteredModule['status']): void {
    registry.updateModuleStatus(moduleId, status);
  }

  /**
   * Update module health
   */
  updateHealth(moduleId: string, health: ModuleHealth): void {
    registry.updateModuleHealth(moduleId, health);
  }

  /**
   * Get module statistics
   */
  getStats() {
    const modules = this.listModules();
    const classifications = new Map<string, number>();
    let totalTools = 0;
    let activeCount = 0;
    let inactiveCount = 0;

    modules.forEach((m) => {
      totalTools += m.toolCount;
      if (m.status === 'active') activeCount++;
      else inactiveCount++;
      classifications.set(
        m.classification,
        (classifications.get(m.classification) || 0) + 1,
      );
    });

    return {
      totalModules: modules.length,
      activeModules: activeCount,
      inactiveModules: inactiveCount,
      totalTools,
      classificationBreakdown: Object.fromEntries(classifications),
    };
  }
}

export const registryService = new RegistryService();
