/**
 * Win-Loss Report - Analysis of won, lost, and skipped opportunities
 */
import { PipelineService } from "../services/pipeline-service.js";
export interface WinLossReport {
    totalBidsSubmitted: number;
    totalWins: number;
    totalLosses: number;
    totalNoBids: number;
    winRate: number;
    totalWonValue: number;
    totalBidValue: number;
    averageWinValue: number;
    winsByAgency: Record<string, {
        wins: number;
        losses: number;
    }>;
    winsByNAICS: Record<string, {
        wins: number;
        losses: number;
    }>;
    periodAnalysis: {
        period: string;
        wins: number;
        losses: number;
        winRate: number;
    }[];
}
export declare class WinLossReportGenerator {
    private pipelineService;
    constructor(pipelineService: PipelineService);
    generateReport(days?: number): Promise<WinLossReport>;
    analyzeLossReasons(days?: number): Promise<{
        commonPatterns: string[];
        byAgency: Record<string, number>;
        bySetAside: Record<string, number>;
    }>;
}
//# sourceMappingURL=win-loss-report.d.ts.map