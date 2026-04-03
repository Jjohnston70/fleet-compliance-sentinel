/**
 * Pipeline Report - Proposal Pipeline Analysis
 */

import { Proposal, ProposalActivity } from '../data/firestore-schema';
import { ProposalStatus } from '../config';
import { InMemoryRepository } from '../data/in-memory-repository';

export interface PipelineMetrics {
  totalCount: number;
  totalValue: number;
  byStatus: Record<ProposalStatus, { count: number; value: number }>;
  conversionMetrics: {
    sentCount: number;
    acceptedCount: number;
    declinedCount: number;
    conversionRate: number; // accepted / sent
    acceptanceRate: number; // accepted / viewed
  };
  averageValue: number;
  daysToClose: {
    average: number;
    min: number;
    max: number;
  };
}

export class PipelineReport {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Generate pipeline report
   */
  async generateReport(): Promise<PipelineMetrics> {
    const proposals = await this.repository.listProposals();

    // Initialize metrics
    const metrics: PipelineMetrics = {
      totalCount: 0,
      totalValue: 0,
      byStatus: {
        draft: { count: 0, value: 0 },
        generated: { count: 0, value: 0 },
        sent: { count: 0, value: 0 },
        viewed: { count: 0, value: 0 },
        accepted: { count: 0, value: 0 },
        declined: { count: 0, value: 0 },
        expired: { count: 0, value: 0 },
      } as Record<ProposalStatus, { count: number; value: number }>,
      conversionMetrics: {
        sentCount: 0,
        acceptedCount: 0,
        declinedCount: 0,
        conversionRate: 0,
        acceptanceRate: 0,
      },
      averageValue: 0,
      daysToClose: {
        average: 0,
        min: 0,
        max: 0,
      },
    };

    // Calculate basic metrics
    proposals.forEach(p => {
      metrics.totalCount++;
      metrics.totalValue += p.totalValue;
      metrics.byStatus[p.status].count++;
      metrics.byStatus[p.status].value += p.totalValue;

      if (p.status === 'sent') metrics.conversionMetrics.sentCount++;
      if (p.status === 'accepted') metrics.conversionMetrics.acceptedCount++;
      if (p.status === 'declined') metrics.conversionMetrics.declinedCount++;
    });

    // Calculate conversion rate
    if (metrics.conversionMetrics.sentCount > 0) {
      metrics.conversionMetrics.conversionRate =
        metrics.conversionMetrics.acceptedCount / metrics.conversionMetrics.sentCount;
    }

    // Calculate acceptance rate
    const viewedCount = metrics.byStatus.viewed.count + metrics.conversionMetrics.acceptedCount;
    if (viewedCount > 0) {
      metrics.conversionMetrics.acceptanceRate =
        metrics.conversionMetrics.acceptedCount / viewedCount;
    }

    // Calculate average value
    if (metrics.totalCount > 0) {
      metrics.averageValue = metrics.totalValue / metrics.totalCount;
    }

    // Calculate days to close
    const closedProposals = proposals.filter(
      p => p.status === 'accepted' || p.status === 'declined'
    );

    if (closedProposals.length > 0) {
      const daysToCloseTimes = closedProposals
        .map(p => {
          if (p.respondedAt && p.sentAt) {
            return (p.respondedAt.getTime() - p.sentAt.getTime()) / (1000 * 60 * 60 * 24);
          }
          return 0;
        })
        .filter(days => days > 0);

      if (daysToCloseTimes.length > 0) {
        metrics.daysToClose.average =
          daysToCloseTimes.reduce((a, b) => a + b, 0) / daysToCloseTimes.length;
        metrics.daysToClose.min = Math.min(...daysToCloseTimes);
        metrics.daysToClose.max = Math.max(...daysToCloseTimes);
      }
    }

    return metrics;
  }

  /**
   * Get proposals by status
   */
  async getProposalsByStatus(status: ProposalStatus): Promise<Proposal[]> {
    const proposals = await this.repository.listProposals();
    return proposals.filter(p => p.status === status);
  }

  /**
   * Get proposals expiring soon
   */
  async getExpiringProposals(daysFromNow: number = 7): Promise<Proposal[]> {
    const proposals = await this.repository.listProposals();
    const now = new Date();
    const futureDate = new Date(now.getTime() + daysFromNow * 24 * 60 * 60 * 1000);

    return proposals.filter(
      p =>
        (p.status === 'sent' || p.status === 'viewed') &&
        p.validUntil > now &&
        p.validUntil <= futureDate
    );
  }

  /**
   * Get high-value proposals (threshold-based)
   */
  async getHighValueProposals(threshold: number = 50000): Promise<Proposal[]> {
    const proposals = await this.repository.listProposals();
    return proposals
      .filter(p => p.totalValue >= threshold && (p.status === 'sent' || p.status === 'viewed'))
      .sort((a, b) => b.totalValue - a.totalValue);
  }
}
