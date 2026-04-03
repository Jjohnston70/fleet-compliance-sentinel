import { EmailMetrics } from '../data/schema.js';

export interface TrendMetric {
  name: string;
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  direction_icon: string;
}

export interface TrendReportData {
  period: string;
  trends: TrendMetric[];
  summary: string;
}

export class TrendReport {
  /**
   * Generate period-over-period trend report
   */
  generateTrendReport(metrics: EmailMetrics[]): TrendReportData {
    if (metrics.length < 2) {
      return {
        period: 'Insufficient data',
        trends: [],
        summary: 'Need at least 2 data points to generate trend report',
      };
    }

    const sorted = [...metrics].sort((a, b) => a.created_at.getTime() - b.created_at.getTime());
    const midpoint = Math.floor(sorted.length / 2);

    const previousPeriod = sorted.slice(0, midpoint);
    const currentPeriod = sorted.slice(midpoint);

    const previousMetrics = this.aggregateMetrics(previousPeriod);
    const currentMetrics = this.aggregateMetrics(currentPeriod);

    const trends: TrendMetric[] = [
      this.createTrendMetric('Email Volume', currentMetrics.total_received ?? 0, previousMetrics.total_received ?? 0),
      this.createTrendMetric('Emails Sent', currentMetrics.total_sent ?? 0, previousMetrics.total_sent ?? 0),
      this.createTrendMetric('Response Time (min)', currentMetrics.avg_response_time_minutes ?? 0, previousMetrics.avg_response_time_minutes ?? 0),
      this.createTrendMetric('Unread Count', currentMetrics.unread_count ?? 0, previousMetrics.unread_count ?? 0),
      this.createTrendMetric('Thread Count', currentMetrics.thread_count ?? 0, previousMetrics.thread_count ?? 0),
    ];

    const upTrends = trends.filter((t) => t.trend === 'up').length;
    const downTrends = trends.filter((t) => t.trend === 'down').length;

    let summary = `Analyzing ${metrics.length} data points: `;
    if (upTrends > downTrends) {
      summary += `Overall metrics trending up (${upTrends} increases, ${downTrends} decreases)`;
    } else if (downTrends > upTrends) {
      summary += `Overall metrics trending down (${downTrends} decreases, ${upTrends} increases)`;
    } else {
      summary += `Mixed trends (${upTrends} increases, ${downTrends} decreases)`;
    }

    return {
      period: `${previousPeriod[0]?.date.toLocaleDateString() ?? 'unknown'} - ${currentPeriod[currentPeriod.length - 1]?.date.toLocaleDateString() ?? 'today'}`,
      trends,
      summary,
    };
  }

  private createTrendMetric(name: string, current: number, previous: number): TrendMetric {
    const change = current - previous;
    const changePercent = previous !== 0 ? Math.round((change / previous) * 100) : 0;
    const trend: 'up' | 'down' | 'stable' = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';
    const direction_icon = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

    return {
      name,
      current: Math.round(current * 10) / 10,
      previous: Math.round(previous * 10) / 10,
      change: Math.round(change * 10) / 10,
      changePercent,
      trend,
      direction_icon,
    };
  }

  private aggregateMetrics(metrics: EmailMetrics[]): Partial<EmailMetrics> {
    if (metrics.length === 0) {
      return {
        total_received: 0,
        total_sent: 0,
        avg_response_time_minutes: 0,
        unread_count: 0,
        thread_count: 0,
      };
    }

    return {
      total_received: metrics.reduce((sum, m) => sum + m.total_received, 0),
      total_sent: metrics.reduce((sum, m) => sum + m.total_sent, 0),
      avg_response_time_minutes: metrics.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / metrics.length,
      unread_count: Math.round(metrics.reduce((sum, m) => sum + m.unread_count, 0) / metrics.length),
      thread_count: metrics.reduce((sum, m) => sum + m.thread_count, 0),
    };
  }
}
