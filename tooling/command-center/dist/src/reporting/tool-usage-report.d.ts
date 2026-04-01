/**
 * Tool Usage Report
 * Track tool invocations: most used, response times, error rates
 */
export interface ToolUsageStats {
    qualifiedName: string;
    invocationCount: number;
    successCount: number;
    errorCount: number;
    timeoutCount: number;
    averageResponseTimeMs: number;
    errorRate: number;
}
export interface UsageReportData {
    timestamp: number;
    totalInvocations: number;
    byTool: ToolUsageStats[];
    byModule: Record<string, {
        invocations: number;
        errorRate: number;
    }>;
}
export declare class ToolUsageReportGenerator {
    generate(limit?: number): UsageReportData;
}
export declare const toolUsageReport: ToolUsageReportGenerator;
//# sourceMappingURL=tool-usage-report.d.ts.map