/**
 * Health Service
 * Health checking: verify modules can be loaded, track status, aggregate health
 */
import { registryService } from './registry-service.js';
export class HealthService {
    /**
     * Check health of a single module
     * In production, would make actual health check calls
     */
    async checkModuleHealth(moduleId) {
        try {
            const start = Date.now();
            const module = registryService.getModule(moduleId);
            if (!module) {
                return {
                    status: 'error',
                    lastCheck: Date.now(),
                    error: 'Module not found',
                };
            }
            // Simulate health check (in production: HTTP health endpoint)
            // For now: if module exists and is active, mark as healthy
            const responseTimeMs = Date.now() - start;
            return {
                status: module.status === 'active' ? 'healthy' : 'offline',
                lastCheck: Date.now(),
                responseTimeMs,
            };
        }
        catch (error) {
            return {
                status: 'error',
                lastCheck: Date.now(),
                error: error instanceof Error ? error.message : String(error),
            };
        }
    }
    /**
     * Check health of all modules
     */
    async checkAllModules() {
        const modules = registryService.listModules();
        const healthResults = [];
        for (const module of modules) {
            const health = await this.checkModuleHealth(module.id);
            registryService.updateHealth(module.id, health);
            healthResults.push({
                id: module.id,
                ...health,
            });
        }
        // Aggregate summary
        const summary = {
            total: healthResults.length,
            healthy: healthResults.filter((h) => h.status === 'healthy').length,
            degraded: healthResults.filter((h) => h.status === 'degraded').length,
            error: healthResults.filter((h) => h.status === 'error').length,
            offline: healthResults.filter((h) => h.status === 'offline').length,
        };
        // System status
        let systemStatus = 'healthy';
        if (summary.error > 0 || summary.offline > 0) {
            systemStatus = 'critical';
        }
        else if (summary.degraded > 0) {
            systemStatus = 'degraded';
        }
        return {
            timestamp: Date.now(),
            systemStatus,
            modules: healthResults,
            summary,
        };
    }
    /**
     * Get current health report (from last check)
     */
    getCurrentHealthReport() {
        const modules = registryService.listModules();
        const summary = {
            total: modules.length,
            healthy: modules.filter((m) => m.health.status === 'healthy').length,
            degraded: modules.filter((m) => m.health.status === 'degraded').length,
            error: modules.filter((m) => m.health.status === 'error').length,
            offline: modules.filter((m) => m.health.status === 'offline').length,
        };
        let systemStatus = 'healthy';
        if (summary.error > 0 || summary.offline > 0) {
            systemStatus = 'critical';
        }
        else if (summary.degraded > 0) {
            systemStatus = 'degraded';
        }
        return {
            timestamp: Date.now(),
            systemStatus,
            modules: modules.map((m) => ({
                id: m.id,
                ...m.health,
            })),
            summary,
        };
    }
}
export const healthService = new HealthService();
//# sourceMappingURL=health-service.js.map