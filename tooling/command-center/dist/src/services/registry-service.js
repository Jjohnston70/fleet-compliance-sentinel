/**
 * Registry Service
 * Core module registration, deregistration, status updates, and metadata management
 */
import { registry } from '../data/in-memory-registry.js';
export class RegistryService {
    /**
     * Register a new module with its tools
     */
    registerModule(moduleId, displayName, version, description, classification, tools, baseUrl) {
        const module = {
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
    deregisterModule(moduleId) {
        registry.deregisterModule(moduleId);
    }
    /**
     * Get module info
     */
    getModule(moduleId) {
        return registry.getModule(moduleId);
    }
    /**
     * List all registered modules
     */
    listModules() {
        return registry.listModules();
    }
    /**
     * Get modules by classification
     */
    getModulesByClassification(classification) {
        return this.listModules().filter((m) => m.classification === classification);
    }
    /**
     * Update module status
     */
    updateStatus(moduleId, status) {
        registry.updateModuleStatus(moduleId, status);
    }
    /**
     * Update module health
     */
    updateHealth(moduleId, health) {
        registry.updateModuleHealth(moduleId, health);
    }
    /**
     * Get module statistics
     */
    getStats() {
        const modules = this.listModules();
        const classifications = new Map();
        let totalTools = 0;
        let activeCount = 0;
        let inactiveCount = 0;
        modules.forEach((m) => {
            totalTools += m.toolCount;
            if (m.status === 'active')
                activeCount++;
            else
                inactiveCount++;
            classifications.set(m.classification, (classifications.get(m.classification) || 0) + 1);
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
//# sourceMappingURL=registry-service.js.map