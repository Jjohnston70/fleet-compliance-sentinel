import { Repository } from '../data/repository.js';
import { EmailMetrics } from '../data/schema.js';
import { MetricsService } from '../services/metrics-service.js';

export interface RecordMetricsRequest {
  date?: Date;
  period_type: 'daily' | 'weekly' | 'monthly';
  total_received: number;
  total_sent: number;
  avg_response_time_minutes: number;
  unread_count: number;
  thread_count: number;
  top_senders: Array<{ email: string; count: number }>;
  category_breakdown: Record<string, { count: number; pct: number }>;
}

export class MetricsHandlers {
  private metricsService: MetricsService;

  constructor(private repository: Repository) {
    this.metricsService = new MetricsService(repository);
  }

  async recordEmailMetrics(req: RecordMetricsRequest): Promise<EmailMetrics> {
    return this.metricsService.recordMetrics({
      date: req.date ?? new Date(),
      period_type: req.period_type,
      total_received: req.total_received,
      total_sent: req.total_sent,
      avg_response_time_minutes: req.avg_response_time_minutes,
      unread_count: req.unread_count,
      thread_count: req.thread_count,
      top_senders: req.top_senders,
      category_breakdown: req.category_breakdown,
      created_at: req.date ?? new Date(),
    });
  }

  async getEmailMetrics(id: string): Promise<EmailMetrics | null> {
    return this.metricsService.getMetricsById(id);
  }

  async getMetricsByDateRange(startDate: Date, endDate: Date): Promise<EmailMetrics[]> {
    return this.metricsService.getMetricsByDateRange(startDate, endDate);
  }

  async getLatestMetrics(periodType: 'daily' | 'weekly' | 'monthly', count?: number): Promise<EmailMetrics[]> {
    return this.metricsService.getLatestMetrics(periodType, count ?? 10);
  }
}
