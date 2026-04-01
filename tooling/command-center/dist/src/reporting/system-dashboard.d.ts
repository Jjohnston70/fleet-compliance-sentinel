/**
 * System Dashboard
 * Aggregate system-wide metrics: modules, tools, classifications, status
 */
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
export declare class SystemDashboardGenerator {
    generate(): DashboardData;
}
export declare const systemDashboard: SystemDashboardGenerator;
//# sourceMappingURL=system-dashboard.d.ts.map