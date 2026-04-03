/**
 * SLA threshold definitions
 */
export interface SLAThreshold {
    priority: string;
    minutesToDeadline: number;
    warningThresholdPercent: number;
    criticalThresholdPercent: number;
}
export declare const SLA_THRESHOLDS: SLAThreshold[];
export declare function getSLAThreshold(priority: string): SLAThreshold;
export declare function calculateSLADeadline(priority: string, createdAt: Date): Date;
//# sourceMappingURL=sla-thresholds.d.ts.map