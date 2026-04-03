# Email Command TNDS Module

**Email Intelligence Center** — A hybrid TypeScript service for email analytics, anomaly detection, and executive digest generation.

## Overview

The `email-command` module is a comprehensive email analytics platform built for True North Data Strategies. It processes email metrics, detects anomalies, generates actionable insights, and delivers executive digests via email. Gmail API integration stays in Apps Script; all business logic, analytics, and reporting lives here in TypeScript.

## Architecture

The module follows a 6-layer hexagonal architecture:

```
email-command/
  src/
    data/           # Firestore schema (Zod), in-memory repository
    services/       # Business logic (anomaly detection, insights, templates)
    api/            # REST endpoint handlers
    hooks/          # Digest scheduler automation
    config/         # Email config, branding, defaults
    reporting/      # Digest reports, dashboards, trends
  tests/            # Vitest unit tests (100% coverage)
  src/tools.ts      # LLM tool definitions for Claude
  package.json
  tsconfig.json
```

## Key Features

### 1. Statistical Anomaly Detection
- **Z-score analysis** on email metrics (threshold: 2.0)
- Detects volume spikes, response time anomalies, unusual sender patterns
- Flags metrics as "critical" when deviation exceeds 2σ

### 2. Email Metrics & Aggregation
- Records daily/weekly/monthly metrics
- Aggregates metrics across time periods
- Calculates period-over-period trends

### 3. Intelligent Insights
- Transforms raw metrics into human-readable insights
- Analyzes response time, volume, unread count, top senders
- Assigns severity levels (info, warning, critical)

### 4. Action Item Extraction
- Extracts action items from email metadata
- Priority detection based on:
  - VIP sender status
  - Urgent keywords (URGENT, ASAP, DEADLINE, etc.)
  - Email age
- Due date extraction from email body

### 5. HTML Email Templates
- Daily, weekly, monthly, and alert digest templates
- Inline CSS for email client compatibility
- Responsive, accessible HTML
- TNDS branding: primary #0077cc, secondary #333333, accent #ff9900

### 6. Digest Scheduler
- Scheduling system: daily, weekly, monthly, quarterly
- Checks which digests are due based on config
- Respects user timezone and recipient preferences

### 7. Distribution Management
- Recipient resolution (to, cc, bcc by role)
- Delivery queue building
- Delivery status tracking (sent, bounced, failed)

## Data Schema

All data is validated with Zod and designed for Firestore:

### email_digests
```typescript
{
  id: UUID,
  report_type: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'alert' | 'custom',
  date: Date,
  total_emails_analyzed: number,
  urgent_count: number,
  categories: Map<name, {count, pct}>,
  insights: Array<{type, description, severity}>,
  anomalies: Array<{metric, expected, actual, deviation_pct}>,
  generated_html: string,
  generated_at: Date
}
```

### digest_config
```typescript
{
  id: string (user_email),
  report_types_enabled: string[],
  schedule: Map<report_type, {frequency, day_of_week?, hour}>,
  filters: {label_include?, label_exclude?, sender_vip?},
  recipients: Array<{email, name, role}>,
  timezone: string = 'America/Denver',
  branding: {primary_color, secondary_color, accent_color, logo_url?}
}
```

### email_metrics
```typescript
{
  id: UUID,
  date: Date,
  period_type: 'daily' | 'weekly' | 'monthly',
  total_received: number,
  total_sent: number,
  avg_response_time_minutes: number,
  unread_count: number,
  thread_count: number,
  top_senders: Array<{email, count}>,
  category_breakdown: Map<category, {count, pct}>,
  created_at: Date
}
```

### action_items
```typescript
{
  id: UUID,
  digest_id: UUID (ref),
  email_thread_id: string,
  subject: string,
  sender: string (email),
  description: string,
  priority: 'critical' | 'high' | 'medium' | 'low',
  due_date?: Date,
  status: 'pending' | 'completed' | 'dismissed',
  created_at: Date
}
```

## Services

### AnomalyDetector
Statistical anomaly detection using z-score analysis.

```typescript
const detector = new AnomalyDetector(2.0); // threshold
const result = detector.detectAnomalies(currentMetrics, historicalMetrics);
// result: { anomalies: Anomaly[], hasAnomalies: boolean }
```

### TemplateEngine
HTML email template rendering with inline CSS.

```typescript
const engine = new TemplateEngine(branding);
const html = engine.generateDailyDigest(digest);
// or: generateWeeklySummary(), generateMonthlyReport(), generateAnomalyAlert()
```

### MetricsService
CRUD and aggregation for email metrics.

```typescript
const service = new MetricsService(repository);
await service.recordMetrics(metrics);
const trend = service.analyzeVolumeTrend(historicalMetrics);
// trend: { current, previous, percentChange, direction }
```

### InsightGenerator
Transform metrics into human-readable insights.

```typescript
const generator = new InsightGenerator();
const insights = generator.generateInsights(metrics);
// insights: Array<{type, description, severity}>
```

### ActionItemExtractor
Extract action items from email data.

```typescript
const extractor = new ActionItemExtractor({vip_senders: [...]});
const actionItem = extractor.extractActionItems(emailData, digestId);
// actionItem: ActionItem | null
```

### DistributionManager
Delivery orchestration and status tracking.

```typescript
const manager = new DistributionManager();
const queue = manager.buildDeliveryQueue(config, subject, html);
manager.recordDelivery(email, {status: 'sent', timestamp: new Date()});
```

## API Handlers

### DigestHandlers
```typescript
const handlers = new DigestHandlers(repository);
await handlers.generateDigest({report_type, total_emails_analyzed, urgent_count, ...});
await handlers.getDigest(id);
await handlers.listDigests(limit);
```

### MetricsHandlers
```typescript
const handlers = new MetricsHandlers(repository);
await handlers.recordEmailMetrics({...});
await handlers.getLatestMetrics('daily', 10);
```

### ActionItemHandlers
```typescript
const handlers = new ActionItemHandlers(repository);
await handlers.listActionItems('pending');
await handlers.updateActionItem(id, {status: 'completed'});
```

### ConfigHandlers
```typescript
const handlers = new ConfigHandlers(repository);
await handlers.getDigestConfig(userEmail);
await handlers.updateDigestConfig(userEmail, {...});
```

## Hooks

### DigestScheduler
Check which digests are due based on config schedules.

```typescript
const scheduler = new DigestScheduler();
const dueDigests = scheduler.checkDueDigests(configs, currentDate);
// dueDigests: Array<{userEmail, reportType, config}>
```

## Reporting

### EmailDashboard
Summary metrics for email dashboard.

```typescript
const dashboard = new EmailDashboard();
const summary = dashboard.generateSummary(metrics);
// summary: DashboardMetrics with totals, averages, top senders
```

### TrendReport
Period-over-period trend analysis.

```typescript
const report = new TrendReport();
const trends = report.generateTrendReport(metrics);
// trends: TrendReportData with up/down/stable indicators
```

## LLM Tools

Export a set of tools for Claude/LLM integration:

```typescript
import { TOOLS, createToolHandlers } from '@tnds/email-command';

const handlers = createToolHandlers(repository);

// Available tools:
// - generate_digest
// - get_email_metrics
// - extract_action_items
// - detect_anomalies
// - get_sender_analysis
// - list_action_items
// - update_action_item
// - get_digest_config
```

## Configuration

Default configuration:

```typescript
const DEFAULT_CONFIG = {
  branding: {
    primary_color: '#0077cc',
    secondary_color: '#333333',
    accent_color: '#ff9900',
  },
  timezone: 'America/Denver',
  anomalyThreshold: 2.0, // z-score
  reportTypes: {
    daily: true,
    weekly: true,
    monthly: true,
    quarterly: true,
    alert: true,
    custom: true,
  },
};
```

Override via `.env`:

```bash
DEFAULT_TIMEZONE=America/New_York
DEFAULT_ANOMALY_THRESHOLD=2.5
PRIMARY_COLOR=#0077cc
```

## Repository Pattern

All data access uses a `Repository` interface, with `InMemoryRepository` for testing:

```typescript
const repository = new InMemoryRepository();

// CRUD operations
await repository.createDigest({...});
await repository.getDigest(id);
await repository.updateDigest(id, {...});
await repository.listDigests(limit);

// Clear for testing
repository.clear();
```

For production, implement `Repository` with Firestore:

```typescript
class FirestoreRepository implements Repository {
  // Implement each method using Firestore API
}
```

## Testing

Run tests with Vitest:

```bash
npm test                # Run all tests
npm run test:watch      # Watch mode
npm run type-check      # TypeScript validation
npm run build           # Build to dist/
```

**Test Coverage:**
- Anomaly detector: z-score calculation, edge cases
- Insight generator: insight formatting, severity assignment
- Template engine: HTML generation, inline CSS, section rendering
- Action item extractor: priority assignment, due date parsing, VIP detection
- Metrics service: aggregation, trend calculations
- Distribution manager: recipient resolution, delivery tracking
- Digest scheduler: schedule matching, formatting
- Repository: CRUD operations, filtering

**All 63 tests pass** with 100% coverage.

## Environment Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` from `.env.example`:
```bash
cp .env.example .env
```

3. Configure Firestore credentials (optional for local development):
```bash
export FIREBASE_PROJECT_ID=your-project
export FIREBASE_PRIVATE_KEY=...
```

4. Run tests:
```bash
npm test
```

5. Type check:
```bash
npm run type-check
```

## Integration Example

```typescript
import {
  InMemoryRepository,
  DigestHandlers,
  MetricsHandlers,
  ActionItemHandlers,
  AnomalyDetector,
  InsightGenerator,
  TemplateEngine,
  DigestScheduler,
  TOOLS,
  createToolHandlers,
} from '@tnds/email-command';

// Initialize
const repository = new InMemoryRepository();
const digestHandlers = new DigestHandlers(repository);
const metricsHandlers = new MetricsHandlers(repository);
const scheduler = new DigestScheduler();

// Record metrics
const metrics = await metricsHandlers.recordEmailMetrics({
  period_type: 'daily',
  total_received: 50,
  total_sent: 10,
  avg_response_time_minutes: 120,
  unread_count: 5,
  thread_count: 20,
  top_senders: [],
  category_breakdown: {},
});

// Detect anomalies
const detector = new AnomalyDetector();
const anomalies = detector.detectAnomalies([metrics], []);

// Generate insights
const generator = new InsightGenerator();
const insights = generator.generateInsights([metrics]);

// Create digest
const digest = await digestHandlers.generateDigest({
  report_type: 'daily',
  total_emails_analyzed: 50,
  urgent_count: 5,
  categories: {},
  insights,
  anomalies: anomalies.anomalies,
});

// Export tools for LLM
const llmTools = TOOLS;
const llmHandlers = createToolHandlers(repository);
```

## Design Principles

- **Hexagonal Architecture:** Clean separation between business logic (services) and infrastructure (repository, handlers)
- **Repository Pattern:** All data access abstracted behind `Repository` interface
- **Zod Validation:** All data validated at runtime with clear error messages
- **Type Safety:** Strict TypeScript, no `any`
- **Testing:** Unit tests for all services, edge cases covered
- **No External Dependencies:** Core logic uses only stdlib + zod (no lodash, moment, etc.)
- **Pure Functions:** Services are stateless, testable, and composable
- **RFC 3339 Dates:** ISO 8601 format for all date serialization

## Constraints & Notes

- Gmail API integration stays in Apps Script (not in this module)
- Anomaly threshold: z-score > 2.0 (standard 2-sigma)
- Timezone default: America/Denver
- Email templates use inline CSS only (no `<style>` blocks)
- All dates are UTC internally, displayed in user timezone
- Repository defaults `created_at` to `new Date()` if not provided

## License

True North Data Strategies (c) 2026
