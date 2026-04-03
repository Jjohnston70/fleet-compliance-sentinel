import { describe, it, expect, beforeEach } from 'vitest';
import { DistributionManager } from '../src/services/distribution-manager.js';
import { DigestConfig } from '../src/data/schema.js';

describe('DistributionManager', () => {
  let manager: DistributionManager;

  beforeEach(() => {
    manager = new DistributionManager();
  });

  const createConfig = (overrides: Partial<DigestConfig> = {}): DigestConfig => ({
    id: 'test@example.com',
    report_types_enabled: ['daily'],
    schedule: {},
    filters: {},
    recipients: [
      { email: 'primary@example.com', name: 'Primary User', role: 'primary' },
      { email: 'cc@example.com', name: 'CC User', role: 'cc' },
    ],
    timezone: 'America/Denver',
    branding: {
      primary_color: '#0077cc',
      secondary_color: '#333333',
      accent_color: '#ff9900',
    },
    ...overrides,
  });

  it('should build delivery queue from config', () => {
    const config = createConfig();
    const queue = manager.buildDeliveryQueue(config, 'Test Subject', '<html></html>');

    expect(queue.to).toBeDefined();
    expect(queue.to.length).toBeGreaterThan(0);
    expect(queue.subject).toBe('Test Subject');
    expect(queue.html).toBe('<html></html>');
  });

  it('should separate recipients by role', () => {
    const config = createConfig({
      recipients: [
        { email: 'primary@example.com', name: 'Primary', role: 'to' },
        { email: 'cc@example.com', name: 'CC', role: 'cc' },
        { email: 'bcc@example.com', name: 'BCC', role: 'bcc' },
      ],
    });

    const queue = manager.buildDeliveryQueue(config, 'Subject', '<html></html>');

    expect(queue.to).toBeDefined();
    expect(queue.cc).toBeDefined();
    expect(queue.bcc).toBeDefined();
  });

  it('should record delivery status', () => {
    manager.recordDelivery('test@example.com', {
      recipient: 'test@example.com',
      status: 'sent',
      timestamp: new Date(),
    });

    const history = manager.getDeliveryHistory('test@example.com');
    expect(history).toHaveLength(1);
    expect(history[0].status).toBe('sent');
  });

  it('should track bounced deliveries', () => {
    manager.recordDelivery('bounce@example.com', {
      recipient: 'bounce@example.com',
      status: 'bounced',
      error: 'Invalid email',
      timestamp: new Date(),
    });

    const summary = manager.getDeliverySummary();
    expect(summary.bounced).toBe(1);
  });

  it('should provide delivery summary', () => {
    manager.recordDelivery('test1@example.com', {
      recipient: 'test1@example.com',
      status: 'sent',
      timestamp: new Date(),
    });
    manager.recordDelivery('test2@example.com', {
      recipient: 'test2@example.com',
      status: 'sent',
      timestamp: new Date(),
    });
    manager.recordDelivery('test3@example.com', {
      recipient: 'test3@example.com',
      status: 'failed',
      error: 'SMTP error',
      timestamp: new Date(),
    });

    const summary = manager.getDeliverySummary();
    expect(summary.total).toBe(3);
    expect(summary.sent).toBe(2);
    expect(summary.failed).toBe(1);
  });

  it('should clear delivery log', () => {
    manager.recordDelivery('test@example.com', {
      recipient: 'test@example.com',
      status: 'sent',
      timestamp: new Date(),
    });

    manager.clearLog();
    const summary = manager.getDeliverySummary();
    expect(summary.total).toBe(0);
  });
});
