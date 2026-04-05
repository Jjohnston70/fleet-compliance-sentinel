import { InMemoryRepository } from '../data/repository';
import { DispatchService } from '../services/dispatch-service';

export interface ResponseTimeStats {
  zone: string;
  priority: string;
  avgResponseTimeMinutes: number;
  minResponseTimeMinutes: number;
  maxResponseTimeMinutes: number;
  medianResponseTimeMinutes: number;
  requestCount: number;
}

export interface SLAComplianceReport {
  totalRequests: number;
  completedRequests: number;
  breachedRequests: number;
  complianceRate: number;
  breachRate: number;
}

interface GroupedResponseTimeEntry {
  zone: string;
  priority: string;
  responseTime: number;
}

/**
 * ResponseTimeReport analyzes response times and SLA compliance.
 */
export class ResponseTimeReport {
  private dispatchService: DispatchService;

  constructor(repository: InMemoryRepository) {
    this.dispatchService = new DispatchService(repository);
  }

  /**
   * Calculate response time statistics by zone and priority.
   */
  async getResponseTimeStats(): Promise<ResponseTimeStats[]> {
    const requests = await this.dispatchService.listDispatchRequests();
    const stats: ResponseTimeStats[] = [];

    // Group by zone and priority
    const grouped = new Map<string, GroupedResponseTimeEntry[]>();

    for (const request of requests) {
      if (!request.actual_arrival || !request.created_at) continue;

      const key = `${request.zone_id}-${request.priority}`;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }

      const responseTimeMinutes = Math.floor(
        (request.actual_arrival.getTime() - request.created_at.getTime()) / 1000 / 60
      );

      grouped.get(key)!.push({
        zone: request.zone_id,
        priority: request.priority,
        responseTime: responseTimeMinutes,
      });
    }

    // Calculate stats for each group
    for (const [, entries] of grouped) {
      if (entries.length === 0) continue;

      const times = entries.map((e) => e.responseTime).sort((a, b) => a - b);
      const zone = entries[0].zone;
      const priority = entries[0].priority;

      stats.push({
        zone,
        priority,
        avgResponseTimeMinutes: Math.round(times.reduce((a, b) => a + b) / times.length),
        minResponseTimeMinutes: times[0],
        maxResponseTimeMinutes: times[times.length - 1],
        medianResponseTimeMinutes: times[Math.floor(times.length / 2)],
        requestCount: times.length,
      });
    }

    return stats;
  }

  /**
   * Calculate overall SLA compliance rate.
   */
  async getSLAComplianceReport(): Promise<SLAComplianceReport> {
    const requests = await this.dispatchService.listDispatchRequests();
    const completed = requests.filter((r) => r.status === 'completed');

    let breachedCount = 0;
    for (const request of completed) {
      if (request.completed_at && request.sla_deadline) {
        if (request.completed_at > request.sla_deadline) {
          breachedCount++;
        }
      }
    }

    const complianceRate =
      completed.length > 0 ? ((completed.length - breachedCount) / completed.length) * 100 : 100;

    return {
      totalRequests: requests.length,
      completedRequests: completed.length,
      breachedRequests: breachedCount,
      complianceRate: Math.round(complianceRate),
      breachRate: Math.round(100 - complianceRate),
    };
  }

  /**
   * Get average response time by zone.
   */
  async getResponseTimeByZone(): Promise<Map<string, number>> {
    const stats = await this.getResponseTimeStats();
    const zoneMap = new Map<string, number[]>();

    for (const stat of stats) {
      if (!zoneMap.has(stat.zone)) {
        zoneMap.set(stat.zone, []);
      }
      zoneMap.get(stat.zone)!.push(stat.avgResponseTimeMinutes);
    }

    const result = new Map<string, number>();
    for (const [zone, times] of zoneMap) {
      const avg = Math.round(times.reduce((a, b) => a + b) / times.length);
      result.set(zone, avg);
    }

    return result;
  }
}
