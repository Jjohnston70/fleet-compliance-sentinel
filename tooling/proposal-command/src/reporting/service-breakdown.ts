/**
 * Service Breakdown Report - Revenue Analysis by Service Type
 */

import { Proposal, ServiceType } from '../data/firestore-schema';
import { CONFIG } from '../config';
import { InMemoryRepository } from '../data/in-memory-repository';

export interface ServiceMetrics {
  serviceType: ServiceType;
  proposalCount: number;
  acceptedCount: number;
  totalValue: number;
  acceptedValue: number;
  averageValue: number;
  conversionRate: number;
}

export interface ServiceBreakdown {
  totalByService: ServiceMetrics[];
  allServicesTotal: {
    count: number;
    value: number;
    acceptedValue: number;
  };
}

export class ServiceBreakdownReport {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Generate service breakdown report
   */
  async generateReport(): Promise<ServiceBreakdown> {
    const proposals = await this.repository.listProposals();

    // Initialize metrics by service type
    const metricsMap = new Map<ServiceType, ServiceMetrics>();
    CONFIG.SERVICE_TYPES.forEach(serviceType => {
      metricsMap.set(serviceType, {
        serviceType,
        proposalCount: 0,
        acceptedCount: 0,
        totalValue: 0,
        acceptedValue: 0,
        averageValue: 0,
        conversionRate: 0,
      });
    });

    // Calculate metrics
    proposals.forEach(p => {
      const metrics = metricsMap.get(p.serviceType);
      if (!metrics) return;

      metrics.proposalCount++;
      metrics.totalValue += p.totalValue;

      if (p.status === 'accepted') {
        metrics.acceptedCount++;
        metrics.acceptedValue += p.totalValue;
      }
    });

    // Calculate derived metrics
    metricsMap.forEach(metrics => {
      if (metrics.proposalCount > 0) {
        metrics.averageValue = metrics.totalValue / metrics.proposalCount;
      }

      if (metrics.proposalCount > 0) {
        metrics.conversionRate = metrics.acceptedCount / metrics.proposalCount;
      }
    });

    // Convert to array and sort by total value
    const totalByService = Array.from(metricsMap.values()).sort(
      (a, b) => b.totalValue - a.totalValue
    );

    // Calculate totals
    const allServicesTotal = {
      count: totalByService.reduce((sum, s) => sum + s.proposalCount, 0),
      value: totalByService.reduce((sum, s) => sum + s.totalValue, 0),
      acceptedValue: totalByService.reduce((sum, s) => sum + s.acceptedValue, 0),
    };

    return {
      totalByService,
      allServicesTotal,
    };
  }

  /**
   * Get top services by value
   */
  async getTopServices(limit: number = 5): Promise<ServiceMetrics[]> {
    const report = await this.generateReport();
    return report.totalByService.slice(0, limit);
  }

  /**
   * Get best performing services (by conversion rate)
   */
  async getTopPerformingServices(limit: number = 5): Promise<ServiceMetrics[]> {
    const report = await this.generateReport();
    return report.totalByService
      .filter(s => s.proposalCount >= 3) // Require minimum 3 proposals for reliability
      .sort((a, b) => b.conversionRate - a.conversionRate)
      .slice(0, limit);
  }

  /**
   * Get proposals by service type
   */
  async getProposalsByService(serviceType: ServiceType): Promise<Proposal[]> {
    const proposals = await this.repository.listProposals();
    return proposals.filter(p => p.serviceType === serviceType);
  }

  /**
   * Get average proposal value by service type
   */
  async getAverageValueByService(): Promise<Map<ServiceType, number>> {
    const report = await this.generateReport();
    const avgMap = new Map<ServiceType, number>();

    report.totalByService.forEach(metrics => {
      avgMap.set(metrics.serviceType, metrics.averageValue);
    });

    return avgMap;
  }
}
