/**
 * In-memory registry for modules, tools, and invocations
 * Repository pattern - no external database
 */

import { RegisteredModule, ToolDefinition, ToolInvocation, SystemConfig, ModuleHealth } from './schema.js';

export class InMemoryRegistry {
  private modules: Map<string, RegisteredModule> = new Map();
  private toolIndex: Map<string, string> = new Map(); // fully-qualified name -> module id
  private invocations: Map<string, ToolInvocation> = new Map();
  private config: SystemConfig | null = null;

  // Register a module
  registerModule(module: RegisteredModule): void {
    if (this.modules.has(module.id)) {
      throw new Error(`Module ${module.id} already registered`);
    }
    this.modules.set(module.id, module);
    this.indexTools(module.id, module.tools);
  }

  // Deregister a module
  deregisterModule(moduleId: string): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }
    this.modules.delete(moduleId);
    // Remove from tool index
    module.tools.forEach((tool) => {
      const key = `${moduleId}.${tool.name}`;
      this.toolIndex.delete(key);
    });
  }

  // Get a module
  getModule(moduleId: string): RegisteredModule | null {
    return this.modules.get(moduleId) || null;
  }

  // List all modules
  listModules(): RegisteredModule[] {
    return Array.from(this.modules.values());
  }

  // Update module status
  updateModuleStatus(moduleId: string, status: RegisteredModule['status']): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }
    module.status = status;
    module.updatedAt = Date.now();
  }

  // Update module health
  updateModuleHealth(moduleId: string, health: ModuleHealth): void {
    const module = this.modules.get(moduleId);
    if (!module) {
      throw new Error(`Module ${moduleId} not found`);
    }
    module.health = health;
    module.updatedAt = Date.now();
  }

  // Find tool by fully-qualified name
  findTool(qualifiedName: string): { moduleId: string; tool: ToolDefinition } | null {
    const moduleId = this.toolIndex.get(qualifiedName);
    if (!moduleId) return null;
    const module = this.modules.get(moduleId);
    if (!module) return null;
    const tool = module.tools.find((t) => `${moduleId}.${t.name}` === qualifiedName);
    return tool ? { moduleId, tool } : null;
  }

  // Find tool by name (may return multiple if ambiguous)
  findToolsByName(toolName: string): Array<{ moduleId: string; tool: ToolDefinition }> {
    const results: Array<{ moduleId: string; tool: ToolDefinition }> = [];
    this.modules.forEach((module) => {
      const tool = module.tools.find((t) => t.name === toolName);
      if (tool) {
        results.push({ moduleId: module.id, tool });
      }
    });
    return results;
  }

  // List all tools
  listAllTools(): Array<{ moduleId: string; tool: ToolDefinition }> {
    const results: Array<{ moduleId: string; tool: ToolDefinition }> = [];
    this.modules.forEach((module) => {
      module.tools.forEach((tool) => {
        results.push({ moduleId: module.id, tool });
      });
    });
    return results;
  }

  // Record a tool invocation
  recordInvocation(invocation: ToolInvocation): void {
    this.invocations.set(invocation.id, invocation);
  }

  // Get invocation history
  getInvocationHistory(toolId?: string, limit: number = 100): ToolInvocation[] {
    let history = Array.from(this.invocations.values());
    if (toolId) {
      history = history.filter((inv) => inv.toolId === toolId);
    }
    return history.sort((a, b) => b.invokedAt - a.invokedAt).slice(0, limit);
  }

  // Get system config
  getConfig(): SystemConfig | null {
    return this.config;
  }

  // Set system config
  setConfig(config: SystemConfig): void {
    this.config = config;
  }

  // Clear all data (for testing)
  clear(): void {
    this.modules.clear();
    this.toolIndex.clear();
    this.invocations.clear();
    this.config = null;
  }

  // Private helper
  private indexTools(moduleId: string, tools: ToolDefinition[]): void {
    tools.forEach((tool) => {
      const key = `${moduleId}.${tool.name}`;
      this.toolIndex.set(key, moduleId);
    });
  }
}

// Singleton instance
export const registry = new InMemoryRegistry();
