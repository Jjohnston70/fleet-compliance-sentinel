/**
 * Bid Decision API handlers
 */
export function createBidDecisionAPI(service) {
    return {
        async runBidDecision(opportunityId, scores, decidedBy) {
            return service.runBidDecision(opportunityId, scores, decidedBy || "api");
        },
        async getBidDecision(opportunityId) { return service.getBidDecision(opportunityId); },
        async listBidDecisions() { return service.listBidDecisions(); },
        async getWinRate(days) { return service.getWinRate(days); },
    };
}
//# sourceMappingURL=bid-decision-api.js.map