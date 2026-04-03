import { DispatchRequest } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
export interface SLAStatus {
    requestId: string;
    priority: string;
    deadline: Date;
    now: Date;
    timeRemaining: number;
    percentComplete: number;
    status: 'healthy' | 'warning' | 'critical' | 'breached';
}
/**
 * SLAService monitors and tracks SLA compliance.
 */
export declare class SLAService {
    private repository;
    constructor(repository: InMemoryRepository);
    /**
     * Calculate time remaining until SLA deadline (in minutes).
     */
    private calculateTimeRemaining;
    /**
     * Calculate percent of SLA time consumed.
     */
    private calculatePercentComplete;
    /**
     * Get SLA status for a request.
     */
    getSLAStatus(request: DispatchRequest, now?: Date): SLAStatus;
    /**
     * Check all active requests for SLA breaches and update tracking.
     */
    checkAllSLAStatus(now?: Date): Promise<SLAStatus[]>;
    /**
     * Get all requests with SLA warnings.
     */
    getWarningRequests(now?: Date): Promise<SLAStatus[]>;
    /**
     * Get all breached requests.
     */
    getBreachedRequests(now?: Date): Promise<SLAStatus[]>;
}
//# sourceMappingURL=sla-service.d.ts.map