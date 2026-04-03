import { EmailMetrics, Anomaly } from '../data/schema.js';

export interface AnomalyDetectionResult {
  anomalies: Anomaly[];
  hasAnomalies: boolean;
}

export class AnomalyDetector {
  constructor(private zScoreThreshold: number = 2.0) {}

  /**
   * Detect statistical anomalies in email metrics using z-score analysis.
   * Z-score = (value - mean) / stddev
   * Flag as anomaly if |z-score| > threshold
   */
  detectAnomalies(metrics: EmailMetrics[], metricsWindow: EmailMetrics[]): AnomalyDetectionResult {
    const anomalies: Anomaly[] = [];

    if (metricsWindow.length < 2) {
      return { anomalies, hasAnomalies: false };
    }

    const current = metrics[metrics.length - 1];
    if (!current) {
      return { anomalies, hasAnomalies: false };
    }

    // Analyze volume anomalies
    const volumeAnomalies = this.analyzeVolume(current, metricsWindow);
    anomalies.push(...volumeAnomalies);

    // Analyze response time anomalies
    const responseAnomalies = this.analyzeResponseTime(current, metricsWindow);
    anomalies.push(...responseAnomalies);

    // Analyze sender pattern anomalies
    const senderAnomalies = this.analyzeSenderPatterns(current, metricsWindow);
    anomalies.push(...senderAnomalies);

    return {
      anomalies,
      hasAnomalies: anomalies.length > 0,
    };
  }

  private analyzeVolume(current: EmailMetrics, metricsWindow: EmailMetrics[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Analyze total_received
    const receivedStats = this.calculateStats(metricsWindow.map((m) => m.total_received));
    const receivedZScore = (current.total_received - receivedStats.mean) / receivedStats.stddev;
    if (Math.abs(receivedZScore) > this.zScoreThreshold) {
      anomalies.push({
        metric: 'total_received',
        expected: receivedStats.mean,
        actual: current.total_received,
        deviation_pct: Math.round(((current.total_received - receivedStats.mean) / receivedStats.mean) * 100),
      });
    }

    // Analyze total_sent
    const sentStats = this.calculateStats(metricsWindow.map((m) => m.total_sent));
    const sentZScore = (current.total_sent - sentStats.mean) / sentStats.stddev;
    if (Math.abs(sentZScore) > this.zScoreThreshold) {
      anomalies.push({
        metric: 'total_sent',
        expected: sentStats.mean,
        actual: current.total_sent,
        deviation_pct: Math.round(((current.total_sent - sentStats.mean) / sentStats.mean) * 100),
      });
    }

    return anomalies;
  }

  private analyzeResponseTime(current: EmailMetrics, metricsWindow: EmailMetrics[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    const responseStats = this.calculateStats(metricsWindow.map((m) => m.avg_response_time_minutes));
    const responseZScore =
      (current.avg_response_time_minutes - responseStats.mean) / responseStats.stddev;

    if (Math.abs(responseZScore) > this.zScoreThreshold) {
      anomalies.push({
        metric: 'avg_response_time_minutes',
        expected: Math.round(responseStats.mean * 10) / 10,
        actual: Math.round(current.avg_response_time_minutes * 10) / 10,
        deviation_pct: Math.round(
          ((current.avg_response_time_minutes - responseStats.mean) / responseStats.mean) * 100
        ),
      });
    }

    return anomalies;
  }

  private analyzeSenderPatterns(current: EmailMetrics, metricsWindow: EmailMetrics[]): Anomaly[] {
    const anomalies: Anomaly[] = [];

    // Look for top senders and check if volume from top sender is unusual
    if (current.top_senders.length > 0) {
      const topSender = current.top_senders[0];

      // Get historical top sender counts for comparison
      const historicalTopCounts = metricsWindow
        .map((m) => m.top_senders[0]?.count ?? 0)
        .filter((c) => c > 0);

      if (historicalTopCounts.length >= 1) {
        const topSenderStats = this.calculateStats(historicalTopCounts);
        const topSenderZScore = (topSender.count - topSenderStats.mean) / topSenderStats.stddev;

        if (Math.abs(topSenderZScore) > this.zScoreThreshold) {
          anomalies.push({
            metric: `top_sender_count_${topSender.email}`,
            expected: Math.round(topSenderStats.mean),
            actual: topSender.count,
            deviation_pct: Math.round(((topSender.count - topSenderStats.mean) / topSenderStats.mean) * 100),
          });
        }
      }
    }

    return anomalies;
  }

  private calculateStats(values: number[]): { mean: number; stddev: number } {
    if (values.length === 0) {
      return { mean: 0, stddev: 0 };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);

    return { mean, stddev: stddev === 0 ? 1 : stddev };
  }
}
