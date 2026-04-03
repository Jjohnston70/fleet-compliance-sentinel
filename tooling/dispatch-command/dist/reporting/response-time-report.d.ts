import { InMemoryRepository } from '../data/repository';
export interface ResponseTimeStats {
    zone: string;
    priority: string;
    avgResponseTimeMinutes: number;
    minResponseTimeMinutes: number;
    maxResponseTimeMinutes: number;
    medianResponseTimeMinutes: number;
    requestCount: number;
}
export interface SLAComplianceReport {
    totalRequests: number;
    completedRequests: number;
    breachedRequests: number;
    complianceRate: number;
    breachRate: number;
}
/**
 * ResponseTimeReport analyzes response times and SLA compliance.
 */
export declare class ResponseTimeReport {
    private dispatchService;
    constructor(repository: InMemoryRepository);
    /**
     * Calculate response time statistics by zone and priority.
     */
    getResponseTimeStats(): Promise<ResponseTimeStats[]>;
    /**
     * Calculate overall SLA compliance rate.
     */
    getSLAComplianceReport(): Promise<SLAComplianceReport>;
    /**
     * Get average response time by zone.
     */
    getResponseTimeByZone(): Promise<Map<string, number>>;
}
//# sourceMappingURL=response-time-report.d.ts.map