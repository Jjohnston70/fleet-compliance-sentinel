/**
 * Pipeline Dashboard - Real-time view of opportunity pipeline
 */
export class PipelineDashboard {
    constructor(opportunityService, pipelineService) {
        this.opportunityService = opportunityService;
        this.pipelineService = pipelineService;
    }
    async getDashboard() {
        const [activeOpps, pipelineValue, upcomingDeadlines, statusCounts, allOpps, avgBidValue] = await Promise.all([
            this.opportunityService.getActiveOpportunities(),
            this.opportunityService.getPipelineValue(),
            this.opportunityService.getUpcomingDeadlines(7),
            this.opportunityService.countByStatus(),
            this.opportunityService.listOpportunities(),
            this.pipelineService.getAverageBidValue(),
        ]);
        const setAsideDistribution = {};
        for (const opp of allOpps) {
            setAsideDistribution[opp.set_aside_type] = (setAsideDistribution[opp.set_aside_type] || 0) + 1;
        }
        const bidsSubmitted = statusCounts.submitted || 0;
        const awarded = statusCounts.awarded || 0;
        const estimatedWinRate = bidsSubmitted > 0 ? awarded / bidsSubmitted : 0;
        return { activeOpportunities: activeOpps.length, pipelineValue, upcomingDeadlines, statusDistribution: statusCounts, setAsideDistribution, estimatedWinRate, averageBidValue: avgBidValue };
    }
    async getActionItems() {
        const [activeOpps, pastDeadlines, upcomingDeadlines] = await Promise.all([
            this.opportunityService.getActiveOpportunities(),
            this.opportunityService.getExpiredOpportunities(),
            this.opportunityService.getUpcomingDeadlines(7),
        ]);
        const readyForBidDecision = activeOpps.filter((o) => o.status === "identified" || o.status === "evaluating");
        return { readyForBidDecision, pastDeadline: pastDeadlines, upcomingDeadlines };
    }
    async getHighValueOpportunities(threshold = 100000) {
        const opps = await this.opportunityService.listOpportunities({ status: "bid" });
        return opps.filter((o) => (o.estimated_value || 0) >= threshold).sort((a, b) => (b.estimated_value || 0) - (a.estimated_value || 0));
    }
}
//# sourceMappingURL=pipeline-dashboard.js.map