/**
 * Health Monitor Hook
 * Periodic health checks on all registered modules
 */
export declare class HealthMonitor {
    private intervalId;
    /**
     * Start periodic health checks
     */
    start(intervalMs?: number): void;
    /**
     * Stop health checks
     */
    stop(): void;
    /**
     * Run health check immediately
     */
    checkNow(): Promise<void>;
}
export declare const healthMonitor: HealthMonitor;
//# sourceMappingURL=health-monitor.d.ts.map