import { Repository } from '../data/repository.js';
import { EmailDigest, Anomaly, Insight } from '../data/schema.js';
import { TemplateEngine } from '../services/template-engine.js';
import { AnomalyDetector } from '../services/anomaly-detector.js';

export interface GenerateDigestRequest {
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'alert' | 'custom';
  total_emails_analyzed: number;
  urgent_count: number;
  categories: Record<string, { count: number; pct: number }>;
  insights?: Insight[];
  anomalies?: Anomaly[];
}

export class DigestHandlers {
  constructor(private repository: Repository) {}

  async generateDigest(req: GenerateDigestRequest): Promise<EmailDigest> {
    const templateEngine = new TemplateEngine();

    let html = '';
    switch (req.report_type) {
      case 'daily':
        html = templateEngine.generateDailyDigest({
          id: '',
          report_type: 'daily',
          date: new Date(),
          total_emails_analyzed: req.total_emails_analyzed,
          urgent_count: req.urgent_count,
          categories: req.categories,
          insights: req.insights ?? [],
          anomalies: req.anomalies ?? [],
          generated_html: '',
          generated_at: new Date(),
        });
        break;
      case 'weekly':
        html = templateEngine.generateWeeklySummary({
          id: '',
          report_type: 'weekly',
          date: new Date(),
          total_emails_analyzed: req.total_emails_analyzed,
          urgent_count: req.urgent_count,
          categories: req.categories,
          insights: req.insights ?? [],
          anomalies: req.anomalies ?? [],
          generated_html: '',
          generated_at: new Date(),
        });
        break;
      case 'monthly':
        html = templateEngine.generateMonthlyReport({
          id: '',
          report_type: 'monthly',
          date: new Date(),
          total_emails_analyzed: req.total_emails_analyzed,
          urgent_count: req.urgent_count,
          categories: req.categories,
          insights: req.insights ?? [],
          anomalies: req.anomalies ?? [],
          generated_html: '',
          generated_at: new Date(),
        });
        break;
      case 'alert':
        html = templateEngine.generateAnomalyAlert({
          id: '',
          report_type: 'alert',
          date: new Date(),
          total_emails_analyzed: req.total_emails_analyzed,
          urgent_count: req.urgent_count,
          categories: req.categories,
          insights: req.insights ?? [],
          anomalies: req.anomalies ?? [],
          generated_html: '',
          generated_at: new Date(),
        });
        break;
      default:
        html = templateEngine.generateDailyDigest({
          id: '',
          report_type: req.report_type as any,
          date: new Date(),
          total_emails_analyzed: req.total_emails_analyzed,
          urgent_count: req.urgent_count,
          categories: req.categories,
          insights: req.insights ?? [],
          anomalies: req.anomalies ?? [],
          generated_html: '',
          generated_at: new Date(),
        });
    }

    const digest = await this.repository.createDigest({
      report_type: req.report_type,
      date: new Date(),
      total_emails_analyzed: req.total_emails_analyzed,
      urgent_count: req.urgent_count,
      categories: req.categories,
      insights: req.insights ?? [],
      anomalies: req.anomalies ?? [],
      generated_html: html,
      generated_at: new Date(),
    });

    return digest;
  }

  async getDigest(id: string): Promise<EmailDigest | null> {
    return this.repository.getDigest(id);
  }

  async listDigests(limit?: number): Promise<EmailDigest[]> {
    return this.repository.listDigests(limit);
  }
}
