import { Repository } from './data/repository.js';
import { DigestHandlers } from './api/digest-handlers.js';
import { MetricsHandlers } from './api/metrics-handlers.js';
import { ActionItemHandlers } from './api/action-item-handlers.js';
import { ConfigHandlers } from './api/config-handlers.js';
import { AnomalyDetector } from './services/anomaly-detector.js';
import { InsightGenerator } from './services/insight-generator.js';

export type ToolName =
  | 'generate_digest'
  | 'get_email_metrics'
  | 'extract_action_items'
  | 'detect_anomalies'
  | 'get_sender_analysis'
  | 'list_action_items'
  | 'update_action_item'
  | 'get_digest_config';

export interface ToolInput {
  [key: string]: any;
}

export type ToolHandler = (input: ToolInput) => Promise<any>;

export interface Tool {
  name: ToolName;
  description: string;
  input_schema: {
    type: 'object';
    properties: Record<string, any>;
    required: string[];
  };
}

export const TOOLS: Tool[] = [
  {
    name: 'generate_digest',
    description: 'Generate an email digest report (daily, weekly, monthly, quarterly, alert, or custom)',
    input_schema: {
      type: 'object',
      properties: {
        report_type: {
          type: 'string',
          enum: ['daily', 'weekly', 'monthly', 'quarterly', 'alert', 'custom'],
        },
        total_emails_analyzed: { type: 'number' },
        urgent_count: { type: 'number' },
        insights: { type: 'array' },
        anomalies: { type: 'array' },
      },
      required: ['report_type', 'total_emails_analyzed', 'urgent_count'],
    },
  },
  {
    name: 'get_email_metrics',
    description: 'Retrieve email metrics by ID or date range',
    input_schema: {
      type: 'object',
      properties: {
        metric_id: { type: 'string' },
        start_date: { type: 'string' },
        end_date: { type: 'string' },
        period_type: { type: 'string', enum: ['daily', 'weekly', 'monthly'] },
      },
      required: [],
    },
  },
  {
    name: 'extract_action_items',
    description: 'Extract action items from digest data',
    input_schema: {
      type: 'object',
      properties: {
        digest_id: { type: 'string' },
      },
      required: ['digest_id'],
    },
  },
  {
    name: 'detect_anomalies',
    description: 'Detect statistical anomalies in email metrics',
    input_schema: {
      type: 'object',
      properties: {
        metrics_window_size: { type: 'number' },
        z_score_threshold: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'get_sender_analysis',
    description: 'Analyze sender patterns and top senders',
    input_schema: {
      type: 'object',
      properties: {
        limit: { type: 'number' },
      },
      required: [],
    },
  },
  {
    name: 'list_action_items',
    description: 'List action items with optional status filter',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['pending', 'completed', 'dismissed'] },
      },
      required: [],
    },
  },
  {
    name: 'update_action_item',
    description: 'Update status or priority of an action item',
    input_schema: {
      type: 'object',
      properties: {
        action_item_id: { type: 'string' },
        status: { type: 'string', enum: ['pending', 'completed', 'dismissed'] },
        priority: { type: 'string', enum: ['critical', 'high', 'medium', 'low'] },
      },
      required: ['action_item_id'],
    },
  },
  {
    name: 'get_digest_config',
    description: 'Get or update digest configuration for a user',
    input_schema: {
      type: 'object',
      properties: {
        user_email: { type: 'string' },
      },
      required: ['user_email'],
    },
  },
];

export function createToolHandlers(repository: Repository): Record<ToolName, ToolHandler> {
  const digestHandlers = new DigestHandlers(repository);
  const metricsHandlers = new MetricsHandlers(repository);
  const actionItemHandlers = new ActionItemHandlers(repository);
  const configHandlers = new ConfigHandlers(repository);
  const anomalyDetector = new AnomalyDetector();
  const insightGenerator = new InsightGenerator();

  const handlers: Record<ToolName, ToolHandler> = {
    generate_digest: async (input) => {
      return digestHandlers.generateDigest({
        report_type: input.report_type,
        total_emails_analyzed: input.total_emails_analyzed,
        urgent_count: input.urgent_count,
        categories: input.categories ?? {},
        insights: input.insights,
        anomalies: input.anomalies,
      });
    },

    get_email_metrics: async (input) => {
      if (input.metric_id) {
        return metricsHandlers.getEmailMetrics(input.metric_id);
      }
      if (input.start_date && input.end_date) {
        return metricsHandlers.getMetricsByDateRange(new Date(input.start_date), new Date(input.end_date));
      }
      if (input.period_type) {
        return metricsHandlers.getLatestMetrics(input.period_type, input.limit ?? 10);
      }
      throw new Error('Must provide metric_id, date range, or period_type');
    },

    extract_action_items: async (input) => {
      // This would extract from digest data in production
      return actionItemHandlers.listActionItems();
    },

    detect_anomalies: async (input) => {
      // This would detect anomalies in metrics in production
      return { anomalies: [], hasAnomalies: false };
    },

    get_sender_analysis: async (input) => {
      const metrics = await metricsHandlers.getLatestMetrics('daily', input.limit ?? 10);
      const senderMap = new Map<string, number>();
      metrics.forEach((m) => {
        m.top_senders.forEach((sender) => {
          senderMap.set(sender.email, (senderMap.get(sender.email) ?? 0) + sender.count);
        });
      });
      return Array.from(senderMap.entries())
        .map(([email, count]) => ({ email, count }))
        .sort((a, b) => b.count - a.count);
    },

    list_action_items: async (input) => {
      return actionItemHandlers.listActionItems(input.status);
    },

    update_action_item: async (input) => {
      return actionItemHandlers.updateActionItem(input.action_item_id, {
        status: input.status,
        priority: input.priority,
      });
    },

    get_digest_config: async (input) => {
      return configHandlers.getDigestConfig(input.user_email);
    },
  };

  return handlers;
}
