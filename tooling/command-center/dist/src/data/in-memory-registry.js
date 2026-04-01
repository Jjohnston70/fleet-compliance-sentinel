/**
 * In-memory registry for modules, tools, and invocations
 * Repository pattern - no external database
 */
export class InMemoryRegistry {
    modules = new Map();
    toolIndex = new Map(); // fully-qualified name -> module id
    invocations = new Map();
    config = null;
    // Register a module
    registerModule(module) {
        if (this.modules.has(module.id)) {
            throw new Error(`Module ${module.id} already registered`);
        }
        this.modules.set(module.id, module);
        this.indexTools(module.id, module.tools);
    }
    // Deregister a module
    deregisterModule(moduleId) {
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
    getModule(moduleId) {
        return this.modules.get(moduleId) || null;
    }
    // List all modules
    listModules() {
        return Array.from(this.modules.values());
    }
    // Update module status
    updateModuleStatus(moduleId, status) {
        const module = this.modules.get(moduleId);
        if (!module) {
            throw new Error(`Module ${moduleId} not found`);
        }
        module.status = status;
        module.updatedAt = Date.now();
    }
    // Update module health
    updateModuleHealth(moduleId, health) {
        const module = this.modules.get(moduleId);
        if (!module) {
            throw new Error(`Module ${moduleId} not found`);
        }
        module.health = health;
        module.updatedAt = Date.now();
    }
    // Find tool by fully-qualified name
    findTool(qualifiedName) {
        const moduleId = this.toolIndex.get(qualifiedName);
        if (!moduleId)
            return null;
        const module = this.modules.get(moduleId);
        if (!module)
            return null;
        const tool = module.tools.find((t) => `${moduleId}.${t.name}` === qualifiedName);
        return tool ? { moduleId, tool } : null;
    }
    // Find tool by name (may return multiple if ambiguous)
    findToolsByName(toolName) {
        const results = [];
        this.modules.forEach((module) => {
            const tool = module.tools.find((t) => t.name === toolName);
            if (tool) {
                results.push({ moduleId: module.id, tool });
            }
        });
        return results;
    }
    // List all tools
    listAllTools() {
        const results = [];
        this.modules.forEach((module) => {
            module.tools.forEach((tool) => {
                results.push({ moduleId: module.id, tool });
            });
        });
        return results;
    }
    // Record a tool invocation
    recordInvocation(invocation) {
        this.invocations.set(invocation.id, invocation);
    }
    // Get invocation history
    getInvocationHistory(toolId, limit = 100) {
        let history = Array.from(this.invocations.values());
        if (toolId) {
            history = history.filter((inv) => inv.toolId === toolId);
        }
        return history.sort((a, b) => b.invokedAt - a.invokedAt).slice(0, limit);
    }
    // Get system config
    getConfig() {
        return this.config;
    }
    // Set system config
    setConfig(config) {
        this.config = config;
    }
    // Clear all data (for testing)
    clear() {
        this.modules.clear();
        this.toolIndex.clear();
        this.invocations.clear();
        this.config = null;
    }
    // Private helper
    indexTools(moduleId, tools) {
        tools.forEach((tool) => {
            const key = `${moduleId}.${tool.name}`;
            this.toolIndex.set(key, moduleId);
        });
    }
}
// Singleton instance
export const registry = new InMemoryRegistry();
//# sourceMappingURL=in-memory-registry.js.map