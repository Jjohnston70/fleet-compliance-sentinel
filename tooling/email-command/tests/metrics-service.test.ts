import { describe, it, expect, beforeEach } from 'vitest';
import { MetricsService } from '../src/services/metrics-service.js';
import { InMemoryRepository } from '../src/data/repository.js';
import { EmailMetrics } from '../src/data/schema.js';

describe('MetricsService', () => {
  let service: MetricsService;
  let repository: InMemoryRepository;

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new MetricsService(repository);
  });

  const createMetric = (overrides: Partial<EmailMetrics> = {}): Omit<EmailMetrics, 'id' | 'created_at'> => ({
    date: new Date(),
    period_type: 'daily',
    total_received: 50,
    total_sent: 10,
    avg_response_time_minutes: 120,
    unread_count: 5,
    thread_count: 20,
    top_senders: [],
    category_breakdown: {},
    ...overrides,
  });

  it('should record metrics', async () => {
    const metric = createMetric();
    const recorded = await service.recordMetrics(metric);

    expect(recorded.id).toBeDefined();
    expect(recorded.total_received).toBe(50);
  });

  it('should calculate trend direction', () => {
    const trend = service.calculateTrend(100, 50);

    expect(trend.current).toBe(100);
    expect(trend.previous).toBe(50);
    expect(trend.percentChange).toBe(100);
    expect(trend.direction).toBe('up');
  });

  it('should detect downward trend', () => {
    const trend = service.calculateTrend(30, 50);

    expect(trend.direction).toBe('down');
    expect(trend.percentChange).toBe(-40);
  });

  it('should mark small changes as stable', () => {
    const trend = service.calculateTrend(52, 50);

    expect(trend.direction).toBe('stable');
  });

  it('should aggregate metrics', async () => {
    const metrics = [
      createMetric({ total_received: 100, total_sent: 20, avg_response_time_minutes: 120 }),
      createMetric({ total_received: 150, total_sent: 30, avg_response_time_minutes: 140 }),
      createMetric({ total_received: 200, total_sent: 40, avg_response_time_minutes: 160 }),
    ];

    const aggregate = service.aggregateMetrics(
      metrics as EmailMetrics[]
    );

    expect(aggregate.total_received).toBe(450);
    expect(aggregate.total_sent).toBe(90);
    expect(aggregate.avg_response_time_minutes).toBe(140);
  });

  it('should aggregate category breakdowns', async () => {
    const metrics = [
      createMetric({
        category_breakdown: { work: { count: 60, pct: 60 }, personal: { count: 40, pct: 40 } },
      }),
      createMetric({
        category_breakdown: { work: { count: 80, pct: 80 }, personal: { count: 20, pct: 20 } },
      }),
    ];

    const aggregate = service.aggregateMetrics(metrics as EmailMetrics[]);

    expect(aggregate.category_breakdown?.work?.count).toBe(140);
    expect(aggregate.category_breakdown?.personal?.count).toBe(60);
  });

  it('should analyze response time trend', async () => {
    const metrics = [
      await service.recordMetrics(
        createMetric({ avg_response_time_minutes: 100 })
      ),
      await service.recordMetrics(
        createMetric({ avg_response_time_minutes: 110 })
      ),
      await service.recordMetrics(
        createMetric({ avg_response_time_minutes: 120 })
      ),
    ];

    const trend = service.analyzeResponseTimeTrend(metrics);

    expect(trend.percentChange).toBeGreaterThan(0);
    expect(trend.direction).toBe('up');
  });

  it('should analyze volume trend', async () => {
    const metrics = [
      await service.recordMetrics(createMetric({ total_received: 50 })),
      await service.recordMetrics(createMetric({ total_received: 60 })),
      await service.recordMetrics(createMetric({ total_received: 75 })),
    ];

    const trend = service.analyzeVolumeTrend(metrics);

    expect(trend.direction).toBe('up');
  });
});
