// Export schema and types
export * from './data/schema.js';
export * from './data/repository.js';

// Export services
export { AnomalyDetector } from './services/anomaly-detector.js';
export { TemplateEngine } from './services/template-engine.js';
export { MetricsService } from './services/metrics-service.js';
export { InsightGenerator } from './services/insight-generator.js';
export { ActionItemExtractor } from './services/action-item-extractor.js';
export { DistributionManager } from './services/distribution-manager.js';

// Export API handlers
export { DigestHandlers } from './api/digest-handlers.js';
export { MetricsHandlers } from './api/metrics-handlers.js';
export { ActionItemHandlers } from './api/action-item-handlers.js';
export { ConfigHandlers } from './api/config-handlers.js';

// Export hooks
export { DigestScheduler } from './hooks/digest-scheduler.js';

// Export reporting
export { EmailDashboard } from './reporting/email-dashboard.js';
export { TrendReport } from './reporting/trend-report.js';

// Export config
export * from './config/index.js';

// Export LLM tools
export { TOOLS, createToolHandlers } from './tools.js';
export type { ToolName, ToolHandler, Tool, ToolInput } from './tools.js';
