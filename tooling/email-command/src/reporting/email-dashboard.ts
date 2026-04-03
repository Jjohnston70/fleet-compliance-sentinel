import { EmailMetrics, TopSender } from '../data/schema.js';

export interface DashboardMetrics {
  total_analyzed: number;
  avg_response_time: number;
  unread_count: number;
  thread_count: number;
  top_senders: TopSender[];
  category_breakdown: Record<string, { count: number; pct: number }>;
  period: string;
}

export class EmailDashboard {
  /**
   * Generate summary metrics for email dashboard
   */
  generateSummary(metrics: EmailMetrics[]): DashboardMetrics {
    if (metrics.length === 0) {
      return {
        total_analyzed: 0,
        avg_response_time: 0,
        unread_count: 0,
        thread_count: 0,
        top_senders: [],
        category_breakdown: {},
        period: 'No data',
      };
    }

    const current = metrics[metrics.length - 1];

    return {
      total_analyzed: current.total_received,
      avg_response_time: Math.round(current.avg_response_time_minutes * 10) / 10,
      unread_count: current.unread_count,
      thread_count: current.thread_count,
      top_senders: current.top_senders,
      category_breakdown: current.category_breakdown,
      period: `${current.date.toLocaleDateString()} (${current.period_type})`,
    };
  }

  /**
   * Format metrics for display
   */
  formatForDisplay(metrics: DashboardMetrics): string {
    const responseHours = Math.round((metrics.avg_response_time / 60) * 10) / 10;

    let output = `Email Dashboard Summary\n`;
    output += `Period: ${metrics.period}\n`;
    output += `\nKey Metrics:\n`;
    output += `  Total Emails: ${metrics.total_analyzed}\n`;
    output += `  Avg Response Time: ${responseHours} hours\n`;
    output += `  Unread: ${metrics.unread_count}\n`;
    output += `  Threads: ${metrics.thread_count}\n`;

    if (metrics.top_senders.length > 0) {
      output += `\nTop Senders:\n`;
      metrics.top_senders.forEach((sender, idx) => {
        output += `  ${idx + 1}. ${sender.email}: ${sender.count} messages\n`;
      });
    }

    if (Object.keys(metrics.category_breakdown).length > 0) {
      output += `\nCategory Breakdown:\n`;
      Object.entries(metrics.category_breakdown).forEach(([cat, data]) => {
        output += `  ${cat}: ${data.count} (${data.pct.toFixed(1)}%)\n`;
      });
    }

    return output;
  }
}
