/**
 * Bid Decision Service - Weighted scoring engine for bid/no-bid decisions
 */
import { BidDecision } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";
export interface BidScoreInput {
    technicalFit: number;
    setAsideMatch: number;
    competitionLevel: number;
    contractValue: number;
    timelineFeasibility: number;
    relationship: number;
    strategicValue: number;
}
export interface BidScoringWeights {
    technicalFit: number;
    setAsideMatch: number;
    competitionLevel: number;
    contractValue: number;
    timelineFeasibility: number;
    relationship: number;
    strategicValue: number;
}
export declare class BidDecisionService {
    private repo;
    private weights;
    constructor(repo: InMemoryRepository);
    private scoreContractValue;
    runBidDecision(opportunityId: string, input: BidScoreInput, decidedBy?: string): Promise<BidDecision>;
    getBidDecision(opportunityId: string): Promise<BidDecision | null>;
    listBidDecisions(): Promise<BidDecision[]>;
    getWinRate(days?: number): Promise<number>;
}
//# sourceMappingURL=bid-decision-service.d.ts.map