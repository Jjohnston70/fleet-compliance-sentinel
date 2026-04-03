/**
 * Service Breakdown Report - Revenue Analysis by Service Type
 */
import { CONFIG } from '../config';
export class ServiceBreakdownReport {
    repository;
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Generate service breakdown report
     */
    async generateReport() {
        const proposals = await this.repository.listProposals();
        // Initialize metrics by service type
        const metricsMap = new Map();
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
            if (!metrics)
                return;
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
        const totalByService = Array.from(metricsMap.values()).sort((a, b) => b.totalValue - a.totalValue);
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
    async getTopServices(limit = 5) {
        const report = await this.generateReport();
        return report.totalByService.slice(0, limit);
    }
    /**
     * Get best performing services (by conversion rate)
     */
    async getTopPerformingServices(limit = 5) {
        const report = await this.generateReport();
        return report.totalByService
            .filter(s => s.proposalCount >= 3) // Require minimum 3 proposals for reliability
            .sort((a, b) => b.conversionRate - a.conversionRate)
            .slice(0, limit);
    }
    /**
     * Get proposals by service type
     */
    async getProposalsByService(serviceType) {
        const proposals = await this.repository.listProposals();
        return proposals.filter(p => p.serviceType === serviceType);
    }
    /**
     * Get average proposal value by service type
     */
    async getAverageValueByService() {
        const report = await this.generateReport();
        const avgMap = new Map();
        report.totalByService.forEach(metrics => {
            avgMap.set(metrics.serviceType, metrics.averageValue);
        });
        return avgMap;
    }
}
