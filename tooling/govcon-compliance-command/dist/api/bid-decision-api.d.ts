/**
 * Bid Decision API handlers
 */
import { BidDecisionService, BidScoreInput } from "../services/bid-decision-service.js";
import { BidDecision } from "../data/schemas.js";
export interface BidDecisionAPI {
    runBidDecision(opportunityId: string, scores: BidScoreInput, decidedBy?: string): Promise<BidDecision>;
    getBidDecision(opportunityId: string): Promise<BidDecision | null>;
    listBidDecisions(): Promise<BidDecision[]>;
    getWinRate(days?: number): Promise<number>;
}
export declare function createBidDecisionAPI(service: BidDecisionService): BidDecisionAPI;
//# sourceMappingURL=bid-decision-api.d.ts.map