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

export function createBidDecisionAPI(service: BidDecisionService): BidDecisionAPI {
  return {
    async runBidDecision(opportunityId, scores, decidedBy) {
      return service.runBidDecision(opportunityId, scores, decidedBy || "api");
    },
    async getBidDecision(opportunityId) { return service.getBidDecision(opportunityId); },
    async listBidDecisions() { return service.listBidDecisions(); },
    async getWinRate(days) { return service.getWinRate(days); },
  };
}
