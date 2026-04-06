/**
 * Pipeline Dashboard - Real-time view of opportunity pipeline
 */

import { OpportunityService } from "../services/opportunity-service.js";
import { PipelineService } from "../services/pipeline-service.js";
import { Opportunity } from "../data/schemas.js";

export interface DashboardMetrics {
  activeOpportunities: number;
  pipelineValue: number;
  upcomingDeadlines: Opportunity[];
  statusDistribution: Record<Opportunity["status"], number>;
  setAsideDistribution: Record<string, number>;
  estimatedWinRate: number;
  averageBidValue: number;
}

export class PipelineDashboard {
  constructor(
    private opportunityService: OpportunityService,
    private pipelineService: PipelineService
  ) {}

  /**
   * Get comprehensive dashboard metrics
   */
  async getDashboard(): Promise<DashboardMetrics> {
    const [
      activeOpps,
      pipelineValue,
      upcomingDeadlines,
      statusCounts,
      allOpps,
      avgBidValue,
    ] = await Promise.all([
      this.opportunityService.getActiveOpportunities(),
      this.opportunityService.getPipelineValue(),
      this.opportunityService.getUpcomingDeadlines(7),
      this.opportunityService.countByStatus(),
      this.opportunityService.listOpportunities(),
      this.pipelineService.getAverageBidValue(),
    ]);

    // Calculate set-aside distribution
    const setAsideDistribution: Record<string, number> = {};
    for (const opp of allOpps) {
      setAsideDistribution[opp.set_aside_type] =
        (setAsideDistribution[opp.set_aside_type] || 0) + 1;
    }

    // Estimate win rate (bids submitted / opportunities identified)
    const bidsSubmitted = statusCounts.submitted || 0;
    const awarded = statusCounts.awarded || 0;
    const estimatedWinRate =
      bidsSubmitted > 0 ? awarded / bidsSubmitted : 0;

    return {
      activeOpportunities: activeOpps.length,
      pipelineValue,
      upcomingDeadlines,
      statusDistribution: statusCounts,
      setAsideDistribution,
      estimatedWinRate,
      averageBidValue: avgBidValue,
    };
  }

  /**
   * Get opportunities needing action
   */
  async getActionItems(): Promise<{
    readyForBidDecision: Opportunity[];
    pastDeadline: Opportunity[];
    upcomingDeadlines: Opportunity[];
  }> {
    const [activeOpps, pastDeadlines, upcomingDeadlines] = await Promise.all([
      this.opportunityService.getActiveOpportunities(),
      this.opportunityService.getExpiredOpportunities(),
      this.opportunityService.getUpcomingDeadlines(7),
    ]);

    // Ready for bid decision: in "identified" or "evaluating" status
    const readyForBidDecision = activeOpps.filter(
      (o) => o.status === "identified" || o.status === "evaluating"
    );

    return {
      readyForBidDecision,
      pastDeadline: pastDeadlines,
      upcomingDeadlines,
    };
  }

  /**
   * Get high-value opportunities
   */
  async getHighValueOpportunities(threshold: number = 100_000): Promise<Opportunity[]> {
    const opps = await this.opportunityService.listOpportunities({
      status: "bid",
    });
    return opps
      .filter((o) => (o.estimated_value || 0) >= threshold)
      .sort(
        (a, b) => (b.estimated_value || 0) - (a.estimated_value || 0)
      );
  }
}
