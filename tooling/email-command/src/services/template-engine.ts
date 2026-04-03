import { EmailDigest, DigestConfig, Insight, Anomaly } from '../data/schema.js';
import { DEFAULT_CONFIG } from '../config/index.js';

export class TemplateEngine {
  private branding = DEFAULT_CONFIG.branding;

  constructor(branding?: typeof DEFAULT_CONFIG.branding) {
    if (branding) this.branding = branding;
  }

  generateDailyDigest(digest: EmailDigest, config?: DigestConfig): string {
    const bgColor = '#f8f9fa';
    const textColor = '#333333';
    const accentColor = this.branding.accent_color;
    const primaryColor = this.branding.primary_color;

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Email Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: ${bgColor};">
  <table role="presentation" width="100%" style="background-color: ${bgColor};">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" width="600" style="margin: 0 auto; background-color: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr style="background: linear-gradient(135deg, ${primaryColor} 0%, ${accentColor} 100%);">
            <td style="padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 600;">Daily Email Digest</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; opacity: 0.9;">${this.formatDate(digest.date)}</p>
            </td>
          </tr>

          <!-- Summary Stats -->
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #e9ecef;">
              <h2 style="margin: 0 0 20px 0; color: ${textColor}; font-size: 18px;">Summary</h2>
              <table role="presentation" width="100%">
                <tr>
                  <td style="padding: 12px; text-align: center; border-right: 1px solid #e9ecef;">
                    <div style="font-size: 24px; font-weight: 600; color: ${primaryColor};">${digest.total_emails_analyzed}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Emails Analyzed</div>
                  </td>
                  <td style="padding: 12px; text-align: center; border-right: 1px solid #e9ecef;">
                    <div style="font-size: 24px; font-weight: 600; color: ${accentColor};">${digest.urgent_count}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Urgent Items</div>
                  </td>
                  <td style="padding: 12px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 600; color: ${primaryColor};">${Object.keys(digest.categories).length}</div>
                    <div style="font-size: 12px; color: #666; margin-top: 4px;">Categories</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Categories Breakdown -->
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #e9ecef;">
              <h2 style="margin: 0 0 20px 0; color: ${textColor}; font-size: 18px;">Email Categories</h2>
              ${this.renderCategories(digest.categories)}
            </td>
          </tr>

          <!-- Insights -->
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #e9ecef;">
              <h2 style="margin: 0 0 20px 0; color: ${textColor}; font-size: 18px;">Key Insights</h2>
              ${this.renderInsights(digest.insights)}
            </td>
          </tr>

          <!-- Anomalies -->
          ${digest.anomalies.length > 0 ? `
          <tr>
            <td style="padding: 30px; border-bottom: 1px solid #e9ecef;">
              <h2 style="margin: 0 0 20px 0; color: ${textColor}; font-size: 18px;">Anomalies Detected</h2>
              ${this.renderAnomalies(digest.anomalies)}
            </td>
          </tr>
          ` : ''}

          <!-- Footer -->
          <tr>
            <td style="padding: 20px; text-align: center; color: #999; font-size: 12px; border-top: 1px solid #e9ecef;">
              <p style="margin: 0;">Generated on ${this.formatDateTime(digest.generated_at)}</p>
              <p style="margin: 8px 0 0 0;">Email Intelligence Center - True North Data Strategies</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  generateWeeklySummary(digest: EmailDigest, config?: DigestConfig): string {
    return this.generateDailyDigest(digest, config).replace('Daily Email Digest', 'Weekly Summary');
  }

  generateMonthlyReport(digest: EmailDigest, config?: DigestConfig): string {
    return this.generateDailyDigest(digest, config).replace('Daily Email Digest', 'Monthly Report');
  }

  generateAnomalyAlert(digest: EmailDigest, config?: DigestConfig): string {
    const primaryColor = this.branding.primary_color;
    const accentColor = this.branding.accent_color;
    const bgColor = '#fff5f5';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Anomaly Alert</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: ${bgColor};">
  <table role="presentation" width="100%">
    <tr>
      <td style="padding: 20px;">
        <table role="presentation" width="600" style="margin: 0 auto; background-color: white; border-radius: 8px; border-left: 4px solid ${accentColor};">
          <tr style="background-color: #fff5f5;">
            <td style="padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: ${accentColor}; font-size: 24px;">🚨 Anomaly Alert</h1>
              <p style="margin: 8px 0 0 0; color: #666;">${this.formatDate(digest.date)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 30px;">
              <p style="margin: 0 0 20px 0; color: #333;">We detected ${digest.anomalies.length} unusual pattern(s) in your email activity:</p>
              ${this.renderAnomalies(digest.anomalies)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `.trim();
  }

  private renderCategories(categories: Record<string, { count: number; pct: number }>): string {
    const entries = Object.entries(categories);
    if (entries.length === 0) {
      return '<p style="color: #999;">No data available</p>';
    }

    const primaryColor = this.branding.primary_color;
    return entries
      .map(
        ([name, data]) => `
      <div style="margin-bottom: 16px;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span style="color: #333; font-weight: 500;">${name}</span>
          <span style="color: #666;">${data.count} (${data.pct.toFixed(1)}%)</span>
        </div>
        <div style="background-color: #e9ecef; border-radius: 4px; height: 8px; overflow: hidden;">
          <div style="background-color: ${primaryColor}; height: 100%; width: ${data.pct}%;"></div>
        </div>
      </div>
      `
      )
      .join('');
  }

  private renderInsights(insights: Insight[]): string {
    if (insights.length === 0) {
      return '<p style="color: #999;">No insights available</p>';
    }

    return insights
      .map((insight) => {
        const color = this.getSeverityColor(insight.severity);
        return `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #f8f9fa; border-left: 3px solid ${color}; border-radius: 4px;">
        <p style="margin: 0; color: #333; font-weight: 500;">${insight.description}</p>
      </div>
      `;
      })
      .join('');
  }

  private renderAnomalies(anomalies: Anomaly[]): string {
    if (anomalies.length === 0) {
      return '<p style="color: #999;">No anomalies detected</p>';
    }

    return anomalies
      .map((anomaly) => {
        const directionIcon = anomaly.deviation_pct > 0 ? '↑' : '↓';
        const color = Math.abs(anomaly.deviation_pct) > 50 ? '#ff6b6b' : '#ffa940';
        return `
      <div style="margin-bottom: 12px; padding: 12px; background-color: #f8f9fa; border-radius: 4px;">
        <div style="color: #333; font-weight: 500;">${anomaly.metric}</div>
        <div style="color: #666; font-size: 13px; margin-top: 4px;">
          Expected: ${anomaly.expected.toFixed(1)} | Actual: ${anomaly.actual.toFixed(1)}
          <span style="color: ${color}; font-weight: 600; margin-left: 8px;">${directionIcon} ${anomaly.deviation_pct > 0 ? '+' : ''}${anomaly.deviation_pct}%</span>
        </div>
      </div>
      `;
      })
      .join('');
  }

  private getSeverityColor(severity: string): string {
    switch (severity) {
      case 'critical':
        return '#ff6b6b';
      case 'warning':
        return '#ffa940';
      case 'info':
      default:
        return '#0077cc';
    }
  }

  private formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }
}
