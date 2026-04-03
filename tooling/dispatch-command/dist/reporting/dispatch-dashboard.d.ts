import { InMemoryRepository } from '../data/repository';
export interface DashboardMetrics {
    activeRequests: {
        pending: number;
        dispatched: number;
        en_route: number;
        on_site: number;
    };
    driverUtilization: {
        available: number;
        en_route: number;
        on_site: number;
        off_duty: number;
    };
    zoneHeatmap: Array<{
        zoneId: string;
        zoneName: string;
        activeRequestCount: number;
        avgResponseTimeMinutes: number;
    }>;
    completedToday: number;
    cancelledToday: number;
}
/**
 * DispatchDashboard provides real-time dispatch metrics.
 */
export declare class DispatchDashboard {
    private repository;
    private dispatchService;
    private driverService;
    constructor(repository: InMemoryRepository);
    /**
     * Get current dashboard metrics.
     */
    getDashboardMetrics(): Promise<DashboardMetrics>;
}
//# sourceMappingURL=dispatch-dashboard.d.ts.map