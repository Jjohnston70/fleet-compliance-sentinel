import { Insight, EmailMetrics, TopSender } from '../data/schema.js';

export class InsightGenerator {
  /**
   * Generate human-readable insights from email metrics
   */
  generateInsights(metrics: EmailMetrics[]): Insight[] {
    const insights: Insight[] = [];

    if (metrics.length === 0) return insights;

    const current = metrics[metrics.length - 1];

    // Volume insights
    if (metrics.length >= 2) {
      const previous = metrics[metrics.length - 2];
      const volumeChange = ((current.total_received - previous.total_received) / previous.total_received) * 100;

      if (Math.abs(volumeChange) > 20) {
        const direction = volumeChange > 0 ? 'increased' : 'decreased';
        insights.push({
          type: 'info',
          description: `Email volume ${direction} ${Math.abs(volumeChange).toFixed(0)}% ${volumeChange > 0 ? '↑' : '↓'}`,
          severity: volumeChange > 50 ? 'warning' : 'info',
        });
      }
    }

    // Response time insights
    if (current.avg_response_time_minutes > 0) {
      const hours = Math.round((current.avg_response_time_minutes / 60) * 10) / 10;
      if (current.avg_response_time_minutes > 240) {
        // > 4 hours
        insights.push({
          type: 'warning',
          description: `Average response time is ${hours} hours (${current.avg_response_time_minutes.toFixed(0)} minutes)`,
          severity: 'warning',
        });
      } else {
        insights.push({
          type: 'info',
          description: `Average response time is ${hours} hours`,
          severity: 'info',
        });
      }
    }

    // Unread count insights
    if (current.unread_count > 100) {
      insights.push({
        type: 'warning',
        description: `High unread count: ${current.unread_count} messages`,
        severity: 'warning',
      });
    } else if (current.unread_count > 50) {
      insights.push({
        type: 'info',
        description: `${current.unread_count} unread messages`,
        severity: 'info',
      });
    }

    // Top sender insights
    if (current.top_senders.length > 0) {
      const topSender = current.top_senders[0];
      insights.push({
        type: 'info',
        description: `Most active sender: ${this.formatSenderName(topSender.email)} with ${topSender.count} messages`,
        severity: 'info',
      });
    }

    // Category insights
    const topCategory = this.getTopCategory(current);
    if (topCategory) {
      insights.push({
        type: 'info',
        description: `Top category: ${topCategory.name} (${topCategory.pct.toFixed(1)}% of emails)`,
        severity: 'info',
      });
    }

    // Threading insights
    if (current.thread_count > 0 && current.total_received > 0) {
      const avgThreadLength = current.total_received / current.thread_count;
      if (avgThreadLength > 5) {
        insights.push({
          type: 'info',
          description: `Average thread length is ${avgThreadLength.toFixed(1)} messages`,
          severity: 'info',
        });
      }
    }

    return insights;
  }

  /**
   * Generate insights comparing two time periods
   */
  generateComparisonInsights(previousMetrics: EmailMetrics[], currentMetrics: EmailMetrics[]): Insight[] {
    const insights: Insight[] = [];

    if (previousMetrics.length === 0 || currentMetrics.length === 0) return insights;

    const previousAvg = this.averageMetrics(previousMetrics);
    const currentAvg = this.averageMetrics(currentMetrics);

    // Volume comparison
    const volumeChange =
      previousAvg.total_received > 0
        ? ((currentAvg.total_received - previousAvg.total_received) / previousAvg.total_received) * 100
        : 0;

    if (Math.abs(volumeChange) > 10) {
      const direction = volumeChange > 0 ? 'increased' : 'decreased';
      const severity = Math.abs(volumeChange) > 50 ? 'critical' : Math.abs(volumeChange) > 25 ? 'warning' : 'info';
      insights.push({
        type: 'info',
        description: `Email volume ${direction} ${Math.abs(volumeChange).toFixed(0)}% compared to previous period`,
        severity,
      });
    }

    // Response time improvement
    const responseImprovement =
      previousAvg.avg_response_time_minutes > 0
        ? previousAvg.avg_response_time_minutes - currentAvg.avg_response_time_minutes
        : 0;

    if (Math.abs(responseImprovement) > 15) {
      const direction = responseImprovement > 0 ? 'improved' : 'declined';
      const percentChange = Math.round((responseImprovement / previousAvg.avg_response_time_minutes) * 100);
      insights.push({
        type: 'info',
        description: `Response time ${direction} by ${Math.abs(percentChange)}% (${Math.abs(responseImprovement).toFixed(0)} minutes)`,
        severity: responseImprovement > 0 ? 'info' : 'warning',
      });
    }

    return insights;
  }

  private averageMetrics(metrics: EmailMetrics[]): EmailMetrics {
    if (metrics.length === 0) {
      throw new Error('Cannot average empty metrics array');
    }

    const avg: Partial<EmailMetrics> = {
      total_received: metrics.reduce((sum, m) => sum + m.total_received, 0) / metrics.length,
      total_sent: metrics.reduce((sum, m) => sum + m.total_sent, 0) / metrics.length,
      avg_response_time_minutes: metrics.reduce((sum, m) => sum + m.avg_response_time_minutes, 0) / metrics.length,
      unread_count: Math.round(metrics.reduce((sum, m) => sum + m.unread_count, 0) / metrics.length),
      thread_count: Math.round(metrics.reduce((sum, m) => sum + m.thread_count, 0) / metrics.length),
    };

    return avg as EmailMetrics;
  }

  private getTopCategory(metrics: EmailMetrics): { name: string; pct: number } | null {
    const entries = Object.entries(metrics.category_breakdown);
    if (entries.length === 0) return null;

    const sorted = entries.sort((a, b) => b[1].count - a[1].count);
    const [name, data] = sorted[0];

    return { name, pct: data.pct };
  }

  private formatSenderName(email: string): string {
    const [localPart] = email.split('@');
    const name = localPart || email;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
}
