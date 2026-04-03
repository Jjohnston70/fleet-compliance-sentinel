import { Repository } from '../data/repository.js';
export interface AuditReportEntry {
    requestId?: string;
    action: string;
    actor: string;
    status: string;
    timestamp: Date;
    details: Record<string, any>;
}
export interface AuditReport {
    generatedAt: Date;
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    rollbackActions: number;
    entries: AuditReportEntry[];
}
export declare class AuditReportGenerator {
    private repo;
    constructor(repo: Repository);
    generate(requestId?: string, startDate?: Date, endDate?: Date): Promise<AuditReport>;
}
//# sourceMappingURL=audit-report.d.ts.map