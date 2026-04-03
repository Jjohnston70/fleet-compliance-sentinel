import { describe, it, expect, beforeEach } from 'vitest';
import { AnomalyDetector } from '../src/services/anomaly-detector.js';
import { EmailMetrics } from '../src/data/schema.js';

describe('AnomalyDetector', () => {
  let detector: AnomalyDetector;

  beforeEach(() => {
    detector = new AnomalyDetector(2.0);
  });

  it('should return no anomalies for insufficient data', () => {
    const metrics: EmailMetrics = {
      id: '1',
      date: new Date(),
      period_type: 'daily',
      total_received: 50,
      total_sent: 10,
      avg_response_time_minutes: 120,
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    };

    const result = detector.detectAnomalies([metrics], []);
    expect(result.hasAnomalies).toBe(false);
    expect(result.anomalies).toHaveLength(0);
  });

  it('should detect volume spike anomalies', () => {
    const baselineMetrics = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      date: new Date(Date.now() - (10 - i) * 86400000),
      period_type: 'daily' as const,
      total_received: 50,
      total_sent: 10,
      avg_response_time_minutes: 120,
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    }));

    const spikeMetric: EmailMetrics = {
      id: '11',
      date: new Date(),
      period_type: 'daily',
      total_received: 500, // 10x spike
      total_sent: 10,
      avg_response_time_minutes: 120,
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    };

    const result = detector.detectAnomalies([spikeMetric], baselineMetrics);
    expect(result.hasAnomalies).toBe(true);
    expect(result.anomalies.length).toBeGreaterThan(0);

    const volumeAnomaly = result.anomalies.find((a) => a.metric === 'total_received');
    expect(volumeAnomaly).toBeDefined();
    expect(volumeAnomaly?.actual).toBe(500);
  });

  it('should detect response time anomalies', () => {
    const baselineMetrics = Array.from({ length: 5 }, (_, i) => ({
      id: `${i}`,
      date: new Date(Date.now() - (5 - i) * 86400000),
      period_type: 'daily' as const,
      total_received: 50,
      total_sent: 10,
      avg_response_time_minutes: 120,
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    }));

    const slowMetric: EmailMetrics = {
      id: '6',
      date: new Date(),
      period_type: 'daily',
      total_received: 50,
      total_sent: 10,
      avg_response_time_minutes: 600, // 5x slower
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    };

    const result = detector.detectAnomalies([slowMetric], baselineMetrics);
    expect(result.hasAnomalies).toBe(true);

    const responseAnomaly = result.anomalies.find((a) => a.metric === 'avg_response_time_minutes');
    expect(responseAnomaly).toBeDefined();
  });

  it('should not flag normal variations as anomalies', () => {
    // Values that are all very close to each other — no z-score > 2 possible
    const totals = [50, 50, 51, 49, 50];
    const respTimes = [120, 120, 121, 119, 120];
    const metrics = totals.map((t, i) => ({
      id: `${i}`,
      date: new Date(Date.now() - (5 - i) * 86400000),
      period_type: 'daily' as const,
      total_received: t,
      total_sent: 10,
      avg_response_time_minutes: respTimes[i],
      unread_count: 5,
      thread_count: 20,
      top_senders: [],
      category_breakdown: {},
      created_at: new Date(),
    }));

    const result = detector.detectAnomalies([metrics[metrics.length - 1]], metrics.slice(0, -1));
    expect(result.hasAnomalies).toBe(false);
  });
});
