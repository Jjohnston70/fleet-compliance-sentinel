/**
 * Pipeline Service - Aggregate metrics and dashboards
 */

import { PipelineMetrics, Opportunity, BidDecision } from "../data/schemas.js";
import { InMemoryRepository } from "../data/repository.js";

export class PipelineService {
  constructor(private repo: InMemoryRepository) {}

  async recordPeriodMetrics(
    period: "monthly" | "quarterly" | "annual",
    date: Date,
    metrics: Partial<PipelineMetrics>
  ): Promise<PipelineMetrics> {
    return this.repo.createPipelineMetrics({
      period,
      date,
      opportunities_identified: metrics.opportunities_identified || 0,
      bids_submitted: metrics.bids_submitted || 0,
      wins: metrics.wins || 0,
      losses: metrics.losses || 0,
      no_bids: metrics.no_bids || 0,
      total_bid_value: metrics.total_bid_value || 0,
      total_won_value: metrics.total_won_value || 0,
      win_rate: metrics.win_rate || 0,
      avg_bid_value: metrics.avg_bid_value || 0,
    });
  }

  async getMonthlyMetrics(year: number, month: number): Promise<PipelineMetrics | null> {
    const metrics = await this.repo.getPipelineMetricsByPeriod("monthly");
    return (
      metrics.find(
        (m) =>
          m.date.getFullYear() === year && m.date.getMonth() === month - 1
      ) || null
    );
  }

  async calculateLiveMetrics(): Promise<{
    opportunities_identified: number;
    bids_submitted: number;
    wins: number;
    losses: number;
    no_bids: number;
    total_bid_value: number;
    total_won_value: number;
    win_rate: number;
    avg_bid_value: number;
  }> {
    const opps = await this.repo.listOpportunities();

    const opportunities_identified = opps.length;
    const bids_submitted = opps.filter((o) => o.status === "submitted").length;
    const wins = opps.filter((o) => o.status === "awarded").length;
    const losses = opps.filter((o) => o.status === "lost").length;
    const no_bids = opps.filter((o) => o.status === "no_bid").length;

    const bidOpps = opps.filter(
      (o) => o.status === "bid" || o.status === "submitted"
    );
    const total_bid_value = bidOpps.reduce(
      (sum, o) => sum + (o.estimated_value || 0),
      0
    );
    const won_opps = opps.filter((o) => o.status === "awarded");
    const total_won_value = won_opps.reduce(
      (sum, o) => sum + (o.estimated_value || 0),
      0
    );

    const win_rate = bids_submitted > 0 ? wins / bids_submitted : 0;
    const avg_bid_value = bidOpps.length > 0 ? total_bid_value / bidOpps.length : 0;

    return {
      opportunities_identified,
      bids_submitted,
      wins,
      losses,
      no_bids,
      total_bid_value,
      total_won_value,
      win_rate,
      avg_bid_value,
    };
  }

  async getPipelineSummary(): Promise<any> {
    const metrics = await this.calculateLiveMetrics();
    const opps = await this.repo.listOpportunities();

    const statusCounts: Record<string, number> = {};
    for (const opp of opps) {
      statusCounts[opp.status] = (statusCounts[opp.status] || 0) + 1;
    }

    const setAsideCounts: Record<string, number> = {};
    for (const opp of opps) {
      setAsideCounts[opp.set_aside_type] =
        (setAsideCounts[opp.set_aside_type] || 0) + 1;
    }

    return {
      metrics,
      statusCounts,
      setAsideCounts,
      pipelineValue: opps
        .filter((o) => o.status !== "lost" && o.status !== "no_bid")
        .reduce((sum, o) => sum + (o.estimated_value || 0), 0),
    };
  }

  async getWinLossAnalysis(days: number = 180): Promise<{
    wins: Array<{ opportunity: Opportunity; decision?: BidDecision; value: number }>;
    losses: Array<{ opportunity: Opportunity; decision?: BidDecision; value: number }>;
    noBids: Array<{ opportunity: Opportunity; value: number }>;
  }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const opps = (await this.repo.listOpportunities()).filter(
      (o) => o.updated_at >= cutoffDate
    );
    const decisions = await this.repo.listBidDecisions();

    const wins = [];
    const losses = [];
    const noBids = [];

    for (const opp of opps) {
      const decision = decisions.find((d) => d.opportunity_id === opp.id);

      if (opp.status === "awarded") {
        wins.push({ opportunity: opp, decision, value: opp.estimated_value || 0 });
      } else if (opp.status === "lost") {
        losses.push({ opportunity: opp, decision, value: opp.estimated_value || 0 });
      } else if (opp.status === "no_bid") {
        noBids.push({ opportunity: opp, value: opp.estimated_value || 0 });
      }
    }

    return { wins, losses, noBids };
  }

  async getAverageBidValue(): Promise<number> {
    const opps = await this.repo.listOpportunities();
    const bidOpps = opps.filter(
      (o) => o.status === "bid" || o.status === "submitted" || o.status === "awarded"
    );

    if (bidOpps.length === 0) return 0;

    const total = bidOpps.reduce((sum, o) => sum + (o.estimated_value || 0), 0);
    return total / bidOpps.length;
  }
}
