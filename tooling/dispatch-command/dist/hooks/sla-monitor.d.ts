import { InMemoryRepository } from '../data/repository';
export interface SLAAlert {
    type: 'warning' | 'critical' | 'breached';
    requestId: string;
    message: string;
    timeRemaining: number;
}
/**
 * SLAMonitor continuously checks SLA deadlines and flags warnings/breaches.
 * Typically run as an interval/cron job.
 */
export declare class SLAMonitor {
    private slaService;
    constructor(_repository: InMemoryRepository);
    /**
     * Check all active requests for SLA violations.
     * Returns list of alerts that need attention.
     */
    checkSLAViolations(now?: Date): Promise<SLAAlert[]>;
    /**
     * Get critical/breached alerts only.
     */
    getCriticalAlerts(now?: Date): Promise<SLAAlert[]>;
}
//# sourceMappingURL=sla-monitor.d.ts.map