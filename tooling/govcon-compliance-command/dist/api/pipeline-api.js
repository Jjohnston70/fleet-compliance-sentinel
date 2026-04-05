/**
 * Pipeline API handlers
 */
export function createPipelineAPI(service) {
    return {
        async getPipelineSummary() { return service.getPipelineSummary(); },
        async getWinLossAnalysis(days) { return service.getWinLossAnalysis(days); },
        async getAverageBidValue() { return service.getAverageBidValue(); },
    };
}
//# sourceMappingURL=pipeline-api.js.map