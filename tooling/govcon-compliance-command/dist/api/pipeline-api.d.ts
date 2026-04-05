/**
 * Pipeline API handlers
 */
import { PipelineService } from "../services/pipeline-service.js";
import { Opportunity, BidDecision } from "../data/schemas.js";
export interface PipelineAPI {
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
export declare function createPipelineAPI(service: PipelineService): PipelineAPI;
//# sourceMappingURL=pipeline-api.d.ts.map