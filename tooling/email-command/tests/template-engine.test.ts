import { describe, it, expect } from 'vitest';
import { TemplateEngine } from '../src/services/template-engine.js';
import { EmailDigest } from '../src/data/schema.js';

describe('TemplateEngine', () => {
  const engine = new TemplateEngine();

  const createDigest = (overrides: Partial<EmailDigest> = {}): EmailDigest => ({
    id: '1',
    report_type: 'daily',
    date: new Date(),
    total_emails_analyzed: 50,
    urgent_count: 5,
    categories: { work: { count: 30, pct: 60 }, personal: { count: 20, pct: 40 } },
    insights: [
      {
        type: 'info',
        description: 'Test insight',
        severity: 'info',
      },
    ],
    anomalies: [],
    generated_html: '',
    generated_at: new Date(),
    ...overrides,
  });

  it('should generate daily digest HTML', () => {
    const digest = createDigest();
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('Daily Email Digest');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('50'); // total emails
  });

  it('should include inline CSS', () => {
    const digest = createDigest();
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('style=');
    expect(html).not.toContain('<style>');
    expect(html).not.toContain('</style>');
  });

  it('should include summary stats', () => {
    const digest = createDigest({ total_emails_analyzed: 100, urgent_count: 10 });
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('100');
    expect(html).toContain('10');
    expect(html).toContain('Emails Analyzed');
    expect(html).toContain('Urgent Items');
  });

  it('should render category breakdown', () => {
    const digest = createDigest({
      categories: { work: { count: 30, pct: 60 }, personal: { count: 20, pct: 40 } },
    });
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('work');
    expect(html).toContain('personal');
    expect(html).toContain('60');
    expect(html).toContain('40');
  });

  it('should render insights', () => {
    const digest = createDigest({
      insights: [
        { type: 'info', description: 'Email volume increased', severity: 'info' },
        { type: 'warning', description: 'High response time', severity: 'warning' },
      ],
    });
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('Email volume increased');
    expect(html).toContain('High response time');
    expect(html).toContain('Key Insights');
  });

  it('should render anomalies section when present', () => {
    const digest = createDigest({
      anomalies: [
        { metric: 'total_received', expected: 50, actual: 200, deviation_pct: 300 },
      ],
    });
    const html = engine.generateDailyDigest(digest);

    expect(html).toContain('Anomalies Detected');
    expect(html).toContain('total_received');
  });

  it('should generate weekly summary', () => {
    const digest = createDigest({ report_type: 'weekly' });
    const html = engine.generateWeeklySummary(digest);

    expect(html).toContain('Weekly Summary');
  });

  it('should generate monthly report', () => {
    const digest = createDigest({ report_type: 'monthly' });
    const html = engine.generateMonthlyReport(digest);

    expect(html).toContain('Monthly Report');
  });

  it('should generate anomaly alert', () => {
    const digest = createDigest({
      report_type: 'alert',
      anomalies: [
        { metric: 'avg_response_time', expected: 120, actual: 600, deviation_pct: 400 },
      ],
    });
    const html = engine.generateAnomalyAlert(digest);

    expect(html).toContain('Anomaly Alert');
    expect(html).toContain('avg_response_time');
  });

  it('should use custom branding colors', () => {
    const customEngine = new TemplateEngine({
      primary_color: '#ff0000',
      secondary_color: '#00ff00',
      accent_color: '#0000ff',
    });

    const digest = createDigest();
    const html = customEngine.generateDailyDigest(digest);

    expect(html).toContain('#ff0000');
    expect(html).toContain('#0000ff');
  });
});
