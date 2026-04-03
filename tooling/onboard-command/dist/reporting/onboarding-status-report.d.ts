import { Repository } from '../data/repository.js';
import { OnboardingStatus } from '../data/schema.js';
export interface OnboardingStatusReport {
    totalRequests: number;
    byStatus: Record<OnboardingStatus, number>;
    averageCompletionTime: number;
    queueCompletionRate: number;
    activeRequests: number;
    failedRequests: number;
    partialRequests: number;
    completedRequests: number;
}
export declare class StatusReportGenerator {
    private repo;
    constructor(repo: Repository);
    generate(): Promise<OnboardingStatusReport>;
}
//# sourceMappingURL=onboarding-status-report.d.ts.map