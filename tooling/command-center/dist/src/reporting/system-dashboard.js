/**
 * System Dashboard
 * Aggregate system-wide metrics: modules, tools, classifications, status
 */
import { registryService } from '../services/registry-service.js';
import { healthService } from '../services/health-service.js';
export class SystemDashboardGenerator {
    generate() {
        const stats = registryService.getStats();
        const health = healthService.getCurrentHealthReport();
        const modules = registryService.listModules();
        const toolsByModule = {};
        modules.forEach((m) => {
            toolsByModule[m.id] = m.toolCount;
        });
        return {
            timestamp: Date.now(),
            modules: {
                total: stats.totalModules,
                active: stats.activeModules,
                inactive: stats.inactiveModules,
                byClassification: stats.classificationBreakdown,
            },
            tools: {
                total: stats.totalTools,
                byModule: toolsByModule,
            },
            health: {
                systemStatus: health.systemStatus,
                moduleHealthSummary: health.summary,
            },
        };
    }
}
export const systemDashboard = new SystemDashboardGenerator();
//# sourceMappingURL=system-dashboard.js.map