import { IRepository } from '../data/repository';
export interface RevenueMetrics {
    byPlanTier: Record<string, number>;
    bySource: {
        courses: number;
        workshops: number;
        consultations: number;
    };
    totalRevenue: number;
    totalStudents: number;
    averageRevenuPerStudent: number;
}
export declare class RevenueReport {
    private repo;
    constructor(repo: IRepository);
    getRevenueMetrics(): Promise<RevenueMetrics>;
    private getMonthlyRate;
}
//# sourceMappingURL=revenue-report.d.ts.map