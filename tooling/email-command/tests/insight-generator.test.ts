import { describe, it, expect } from 'vitest';
import { InsightGenerator } from '../src/services/insight-generator.js';
import { EmailMetrics } from '../src/data/schema.js';

describe('InsightGenerator', () => {
  const generator = new InsightGenerator();

  const createMetric = (overrides: Partial<EmailMetrics> = {}): EmailMetrics => ({
    id: '1',
    date: new Date(),
    period_type: 'daily',
    total_received: 50,
    total_sent: 10,
    avg_response_time_minutes: 120,
    unread_count: 5,
    thread_count: 20,
    top_senders: [{ email: 'test@example.com', count: 10 }],
    category_breakdown: { work: { count: 30, pct: 60 }, personal: { count: 20, pct: 40 } },
    created_at: new Date(),
    ...overrides,
  });

  it('should generate insights from email metrics', () => {
    const metrics = [createMetric()];
    const insights = generator.generateInsights(metrics);

    expect(insights.length).toBeGreaterThan(0);
    expect(insights[0]).toHaveProperty('description');
    expect(insights[0]).toHaveProperty('severity');
  });

  it('should flag high unread count as warning', () => {
    const metrics = [createMetric({ unread_count: 150 })];
    const insights = generator.generateInsights(metrics);

    const unreadInsight = insights.find((i) => i.description.includes('unread'));
    expect(unreadInsight?.severity).toBe('warning');
  });

  it('should generate response time insights', () => {
    const metrics = [createMetric({ avg_response_time_minutes: 360 })];
    const insights = generator.generateInsights(metrics);

    const responseInsight = insights.find((i) => i.description.includes('response time'));
    expect(responseInsight).toBeDefined();
  });

  it('should generate top sender insights', () => {
    const metrics = [
      createMetric({
        top_senders: [{ email: 'important@example.com', count: 25 }],
      }),
    ];
    const insights = generator.generateInsights(metrics);

    const senderInsight = insights.find((i) => i.description.includes('sender'));
    expect(senderInsight).toBeDefined();
    expect(senderInsight?.description).toMatch(/Important|important/);
  });

  it('should return empty array for empty metrics', () => {
    const insights = generator.generateInsights([]);
    expect(insights).toHaveLength(0);
  });

  it('should detect volume changes', () => {
    const previousMetric = createMetric({ total_received: 100 });
    const currentMetric = createMetric({ total_received: 50 });
    const insights = generator.generateInsights([previousMetric, currentMetric]);

    const volumeInsight = insights.find((i) => i.description.includes('decreased'));
    expect(volumeInsight).toBeDefined();
  });

  it('should generate comparison insights', () => {
    const previousMetrics = [
      createMetric({ total_received: 100, avg_response_time_minutes: 200 }),
      createMetric({ total_received: 95, avg_response_time_minutes: 210 }),
    ];
    const currentMetrics = [
      createMetric({ total_received: 50, avg_response_time_minutes: 100 }),
      createMetric({ total_received: 55, avg_response_time_minutes: 110 }),
    ];

    const insights = generator.generateComparisonInsights(previousMetrics, currentMetrics);
    expect(insights.length).toBeGreaterThan(0);
  });
});
