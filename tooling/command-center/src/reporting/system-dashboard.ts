/**
 * System Dashboard
 * Aggregate system-wide metrics: modules, tools, classifications, status
 */

import { registryService } from '../services/registry-service.js';
import { searchService } from '../services/search-service.js';
import { healthService } from '../services/health-service.js';

export interface DashboardData {
  timestamp: number;
  modules: {
    total: number;
    active: number;
    inactive: number;
    byClassification: Record<string, number>;
  };
  tools: {
    total: number;
    byModule: Record<string, number>;
  };
  health: {
    systemStatus: 'healthy' | 'degraded' | 'critical';
    moduleHealthSummary: {
      healthy: number;
      degraded: number;
      error: number;
      offline: number;
    };
  };
}

export class SystemDashboardGenerator {
  generate(): DashboardData {
    const stats = registryService.getStats();
    const health = healthService.getCurrentHealthReport();

    const modules = registryService.listModules();
    const toolsByModule: Record<string, number> = {};
    modules.forEach((m) => {
      toolsByModule[m.id] = m.toolCount;
    });

    return {
      timestamp: Date.now(),
      modules: {
        total: stats.totalModules,
        active: stats.activeModules,
        inactive: stats.inactiveModules,
        byClassification: stats.classificationBreakdown as Record<string, number>,
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
