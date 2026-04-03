import { EmailMetrics, EmailMetricsSchema } from '../data/schema.js';
import { Repository } from '../data/repository.js';

export interface TrendData {
  current: number;
  previous: number;
  percentChange: number;
  direction: 'up' | 'down' | 'stable';
}

export class MetricsService {
  constructor(private repository: Repository) {}

  async recordMetrics(metrics: Omit<EmailMetrics, 'id' | 'created_at'> & { created_at?: Date }): Promise<EmailMetrics> {
    return this.repository.createMetrics(metrics);
  }

  async getMetricsById(id: string): Promise<EmailMetrics | null> {
    return this.repository.getMetrics(id);
  }

  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<EmailMetrics[]> {
    return this.repository.listMetricsByDate(startDate, endDate);
  }

  async getLatestMetrics(periodType: 'daily' | 'weekly' | 'monthly', count: number = 10): Promise<EmailMetrics[]> {
    return this.repository.listMetricsByPeriod(periodType, count);
  }

  /**
   * Calculate period-over-period trends
   */
  calculateTrend(current: number, previous: number): TrendData {
    let percentChange = 0;
    if (previous !== 0) {
      percentChange = Math.round(((current - previous) / previous) * 100);
    }

    const direction: 'up' | 'down' | 'stable' = percentChange > 5 ? 'up' : percentChange < -5 ? 'down' : 'stable';

    return {
      current,
      previous,
      percentChange,
      direction,
    };
  }

  /**
   * Aggregate metrics across a date range
   */
  aggregateMetrics(metrics: EmailMetrics[]): Partial<EmailMetrics> {
    if (metrics.length === 0) {
      return {};
    }

    const totalReceived = metrics.reduce((sum, m) => sum + m.total_received, 0);
    const totalSent = metrics.reduce((sum, m) => sum + m.total_sent, 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / metrics.length;
    const unreadCount = metrics[metrics.length - 1]?.unread_count ?? 0;
    const threadCount = metrics.reduce((sum, m) => sum + m.thread_count, 0);

    // Aggregate category breakdown
    const categoryMap = new Map<string, { count: number; total: number }>();
    metrics.forEach((m) => {
      Object.entries(m.category_breakdown).forEach(([cat, data]) => {
        const existing = categoryMap.get(cat) ?? { count: 0, total: 0 };
        existing.count += data.count;
        existing.total += 1;
        categoryMap.set(cat, existing);
      });
    });

    const aggregatedCategories: Record<string, { count: number; pct: number }> = {};
    const totalCategoryCount = Array.from(categoryMap.values()).reduce((sum, v) => sum + v.count, 0);

    categoryMap.forEach((value, key) => {
      aggregatedCategories[key] = {
        count: value.count,
        pct: totalCategoryCount > 0 ? Math.round((value.count / totalCategoryCount) * 1000) / 10 : 0,
      };
    });

    // Get top senders across all metrics
    const senderMap = new Map<string, number>();
    metrics.forEach((m) => {
      m.top_senders.forEach((sender) => {
        senderMap.set(sender.email, (senderMap.get(sender.email) ?? 0) + sender.count);
      });
    });

    const topSenders = Array.from(senderMap.entries())
      .map(([email, count]) => ({ email, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      total_received: totalReceived,
      total_sent: totalSent,
      avg_response_time_minutes: Math.round(avgResponseTime * 10) / 10,
      unread_count: unreadCount,
      thread_count: threadCount,
      category_breakdown: aggregatedCategories,
      top_senders: topSenders,
    };
  }

  /**
   * Calculate average response time trend
   */
  analyzeResponseTimeTrend(metrics: EmailMetrics[]): TrendData {
    if (metrics.length < 2) {
      return { current: 0, previous: 0, percentChange: 0, direction: 'stable' };
    }

    const sortedByDate = [...metrics].sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    const midpoint = Math.floor(sortedByDate.length / 2);

    const previousPeriod = sortedByDate.slice(0, midpoint);
    const currentPeriod = sortedByDate.slice(midpoint);

    const previousAvg = previousPeriod.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / previousPeriod.length;
    const currentAvg = currentPeriod.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / currentPeriod.length;

    return this.calculateTrend(currentAvg, previousAvg);
  }

  /**
   * Calculate volume trend
   */
  analyzeVolumeTrend(metrics: EmailMetrics[]): TrendData {
    if (metrics.length < 2) {
      return { current: 0, previous: 0, percentChange: 0, direction: 'stable' };
    }

    const sortedByDate = [...metrics].sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    const midpoint = Math.floor(sortedByDate.length / 2);

    const previousPeriod = sortedByDate.slice(0, midpoint);
    const currentPeriod = sortedByDate.slice(midpoint);

    const previousTotal = previousPeriod.reduce((sum, m) => sum + m.total_received, 0);
    const currentTotal = currentPeriod.reduce((sum, m) => sum + m.total_received, 0);

    return this.calculateTrend(currentTotal, previousTotal);
  }
}
