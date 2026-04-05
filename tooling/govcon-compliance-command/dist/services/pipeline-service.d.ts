/**
 * Pipeline Service - Aggregate metrics and dashboards
 */
import { PipelineMetrics, Opportunity, BidDecision } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export declare class PipelineService {
    private repo;
    constructor(repo: InMemoryRepository);
    recordPeriodMetrics(period: "monthly" | "quarterly" | "annual", date: Date, metrics: Partial<PipelineMetrics>): Promise<PipelineMetrics>;
    getMonthlyMetrics(year: number, month: number): Promise<PipelineMetrics | null>;
    calculateLiveMetrics(): Promise<{
        opportunities_identified: number;
        bids_submitted: number;
        wins: number;
        losses: number;
        no_bids: number;
        total_bid_value: number;
        total_won_value: number;
        win_rate: number;
        avg_bid_value: number;
    }>;
    getPipelineSummary(): Promise<any>;
    getWinLossAnalysis(days?: number): Promise<{
        wins: Array<{
            opportunity: Opportunity;
            decision?: BidDecision;
            value: number;
        }>;
        losses: Array<{
            opportunity: Opportunity;
            decision?: BidDecision;
            value: number;
        }>;
        noBids: Array<{
            opportunity: Opportunity;
            value: number;
        }>;
    }>;
    getAverageBidValue(): Promise<number>;
}
//# sourceMappingURL=pipeline-service.d.ts.map