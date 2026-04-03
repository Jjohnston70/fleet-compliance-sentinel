import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository.js';
import { DigestConfig } from '../src/data/schema.js';
import crypto from 'crypto';

describe('InMemoryRepository', () => {
  let repo: InMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryRepository();
  });

  describe('Email Digests', () => {
    it('should create and retrieve digest', async () => {
      const digest = await repo.createDigest({
        report_type: 'daily',
        date: new Date(),
        total_emails_analyzed: 50,
        urgent_count: 5,
        categories: {},
        insights: [],
        anomalies: [],
        generated_html: '<html></html>',
        generated_at: new Date(),
      });

      expect(digest.id).toBeDefined();
      const retrieved = await repo.getDigest(digest.id);
      expect(retrieved?.total_emails_analyzed).toBe(50);
    });

    it('should list digests', async () => {
      await repo.createDigest({
        report_type: 'daily',
        date: new Date(),
        total_emails_analyzed: 50,
        urgent_count: 5,
        categories: {},
        insights: [],
        anomalies: [],
        generated_html: '<html></html>',
        generated_at: new Date(),
      });

      const digests = await repo.listDigests();
      expect(digests.length).toBeGreaterThan(0);
    });

    it('should update digest', async () => {
      const digest = await repo.createDigest({
        report_type: 'daily',
        date: new Date(),
        total_emails_analyzed: 50,
        urgent_count: 5,
        categories: {},
        insights: [],
        anomalies: [],
        generated_html: '<html></html>',
        generated_at: new Date(),
      });

      const updated = await repo.updateDigest(digest.id, { urgent_count: 10 });
      expect(updated.urgent_count).toBe(10);
    });
  });

  describe('Digest Config', () => {
    it('should create and retrieve config', async () => {
      const config: DigestConfig = {
        id: 'test@example.com',
        report_types_enabled: ['daily'],
        schedule: {},
        filters: {},
        recipients: [],
        timezone: 'America/Denver',
        branding: { primary_color: '#0077cc', secondary_color: '#333333', accent_color: '#ff9900' },
      };

      await repo.createConfig(config);
      const retrieved = await repo.getConfig('test@example.com');
      expect(retrieved?.id).toBe('test@example.com');
    });

    it('should update config', async () => {
      const config: DigestConfig = {
        id: 'test@example.com',
        report_types_enabled: ['daily'],
        schedule: {},
        filters: {},
        recipients: [],
        timezone: 'America/Denver',
        branding: { primary_color: '#0077cc', secondary_color: '#333333', accent_color: '#ff9900' },
      };

      await repo.createConfig(config);
      const updated = await repo.updateConfig('test@example.com', { timezone: 'UTC' });
      expect(updated.timezone).toBe('UTC');
    });
  });

  describe('Email Metrics', () => {
    it('should create and retrieve metrics', async () => {
      const metrics = await repo.createMetrics({
        date: new Date(),
        period_type: 'daily',
        total_received: 50,
        total_sent: 10,
        avg_response_time_minutes: 120,
        unread_count: 5,
        thread_count: 20,
        top_senders: [],
        category_breakdown: {},
      });

      const retrieved = await repo.getMetrics(metrics.id);
      expect(retrieved?.total_received).toBe(50);
    });

    it('should list metrics by date range', async () => {
      const now = new Date();
      await repo.createMetrics({
        date: now,
        period_type: 'daily',
        total_received: 50,
        total_sent: 10,
        avg_response_time_minutes: 120,
        unread_count: 5,
        thread_count: 20,
        top_senders: [],
        category_breakdown: {},
      });

      const metrics = await repo.listMetricsByDate(new Date(now.getTime() - 86400000), new Date(now.getTime() + 86400000));
      expect(metrics.length).toBeGreaterThan(0);
    });

    it('should list metrics by period', async () => {
      await repo.createMetrics({
        date: new Date(),
        period_type: 'daily',
        total_received: 50,
        total_sent: 10,
        avg_response_time_minutes: 120,
        unread_count: 5,
        thread_count: 20,
        top_senders: [],
        category_breakdown: {},
      });

      const metrics = await repo.listMetricsByPeriod('daily');
      expect(metrics.length).toBeGreaterThan(0);
    });
  });

  describe('Action Items', () => {
    it('should create and retrieve action item', async () => {
      const digestId = crypto.randomUUID();
      const item = await repo.createActionItem({
        digest_id: digestId,
        email_thread_id: 'thread-1',
        subject: 'Action Required',
        sender: 'test@example.com',
        description: 'Test action',
        priority: 'high',
        status: 'pending',
      });

      const retrieved = await repo.getActionItem(item.id);
      expect(retrieved?.subject).toBe('Action Required');
    });

    it('should list action items by status', async () => {
      const digestId = crypto.randomUUID();
      await repo.createActionItem({
        digest_id: digestId,
        email_thread_id: 'thread-1',
        subject: 'Action Required',
        sender: 'test@example.com',
        description: 'Test action',
        priority: 'high',
        status: 'pending',
      });

      const items = await repo.listActionItems('pending');
      expect(items.length).toBeGreaterThan(0);
    });

    it('should update action item', async () => {
      const digestId = crypto.randomUUID();
      const item = await repo.createActionItem({
        digest_id: digestId,
        email_thread_id: 'thread-1',
        subject: 'Action Required',
        sender: 'test@example.com',
        description: 'Test action',
        priority: 'high',
        status: 'pending',
      });

      const updated = await repo.updateActionItem(item.id, { status: 'completed' });
      expect(updated.status).toBe('completed');
    });
  });

  describe('Repository', () => {
    it('should clear all data', async () => {
      await repo.createDigest({
        report_type: 'daily',
        date: new Date(),
        total_emails_analyzed: 50,
        urgent_count: 5,
        categories: {},
        insights: [],
        anomalies: [],
        generated_html: '<html></html>',
        generated_at: new Date(),
      });

      repo.clear();
      const digests = await repo.listDigests();
      expect(digests).toHaveLength(0);
    });
  });
});
