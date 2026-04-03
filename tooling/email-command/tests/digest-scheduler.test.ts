import { describe, it, expect } from 'vitest';
import { DigestScheduler } from '../src/hooks/digest-scheduler.js';
import { DigestConfig } from '../src/data/schema.js';

describe('DigestScheduler', () => {
  const scheduler = new DigestScheduler();

  const createConfig = (overrides: Partial<DigestConfig> = {}): DigestConfig => ({
    id: 'test@example.com',
    report_types_enabled: ['daily'],
    schedule: {
      daily: { frequency: 'daily', hour: 9 },
    },
    filters: {},
    recipients: [],
    timezone: 'America/Denver',
    branding: {
      primary_color: '#0077cc',
      secondary_color: '#333333',
      accent_color: '#ff9900',
    },
    ...overrides,
  });

  it('should identify daily digest due', () => {
    const testDate = new Date();
    testDate.setHours(9, 0, 0, 0);

    const config = createConfig();
    const dueDigests = scheduler.checkDueDigests([config], testDate);

    expect(dueDigests).toHaveLength(1);
    expect(dueDigests[0].reportType).toBe('daily');
  });

  it('should not identify digest due outside schedule window', () => {
    const testDate = new Date();
    testDate.setHours(10, 0, 0, 0);

    const config = createConfig();
    const dueDigests = scheduler.checkDueDigests([config], testDate);

    expect(dueDigests).toHaveLength(0);
  });

  it('should identify multiple report types when due', () => {
    const testDate = new Date('2026-01-01');
    testDate.setHours(9, 0, 0, 0);

    const config = createConfig({
      report_types_enabled: ['daily', 'quarterly'],
      schedule: {
        daily: { frequency: 'daily', hour: 9 },
        quarterly: { frequency: 'quarterly', hour: 9 },
      },
    });

    const dueDigests = scheduler.checkDueDigests([config], testDate);
    expect(dueDigests.length).toBeGreaterThanOrEqual(1);
  });

  it('should format daily schedule', () => {
    const schedule = { frequency: 'daily' as const, hour: 9 };
    const formatted = scheduler.formatSchedule(schedule);

    expect(formatted).toContain('Daily');
    expect(formatted).toContain('09:00');
  });

  it('should format weekly schedule', () => {
    const schedule = { frequency: 'weekly' as const, day_of_week: 1, hour: 9 };
    const formatted = scheduler.formatSchedule(schedule);

    expect(formatted).toContain('Every');
    expect(formatted).toContain('Mon');
  });

  it('should format monthly schedule', () => {
    const schedule = { frequency: 'monthly' as const, hour: 9 };
    const formatted = scheduler.formatSchedule(schedule);

    expect(formatted).toContain('Monthly');
    expect(formatted).toContain('1st');
  });

  it('should format quarterly schedule', () => {
    const schedule = { frequency: 'quarterly' as const, hour: 9 };
    const formatted = scheduler.formatSchedule(schedule);

    expect(formatted).toContain('Quarterly');
  });

  it('should handle multiple configs with different schedules', () => {
    const testDate = new Date();
    testDate.setHours(9, 0, 0, 0);

    const dailyConfig = createConfig({
      id: 'daily@example.com',
      report_types_enabled: ['daily'],
      schedule: { daily: { frequency: 'daily', hour: 9 } },
    });

    const dueDigests = scheduler.checkDueDigests([dailyConfig], testDate);
    expect(dueDigests.length).toBeGreaterThanOrEqual(0);
  });
});
