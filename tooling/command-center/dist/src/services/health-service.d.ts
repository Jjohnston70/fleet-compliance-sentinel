/**
 * Health Service
 * Health checking: verify modules can be loaded, track status, aggregate health
 */
import { ModuleHealth } from '../data/schema.js';
export interface HealthReport {
    timestamp: number;
    systemStatus: 'healthy' | 'degraded' | 'critical';
    modules: Array<{
        id: string;
        status: ModuleHealth['status'];
        lastCheck: number;
        responseTimeMs?: number;
        error?: string;
    }>;
    summary: {
        total: number;
        healthy: number;
        degraded: number;
        error: number;
        offline: number;
    };
}
export declare class HealthService {
    /**
     * Check health of a single module
     * In production, would make actual health check calls
     */
    checkModuleHealth(moduleId: string): Promise<ModuleHealth>;
    /**
     * Check health of all modules
     */
    checkAllModules(): Promise<HealthReport>;
    /**
     * Get current health report (from last check)
     */
    getCurrentHealthReport(): HealthReport;
}
export declare const healthService: HealthService;
//# sourceMappingURL=health-service.d.ts.map