import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository';
import { SchedulingService } from '../src/services/scheduling-service';
import { Schedule } from '../src/data/schema';

describe('SchedulingService', () => {
  let repository: InMemoryRepository;
  let service: SchedulingService;

  const testSchedule: Schedule = {
    id: crypto.randomUUID(),
    driver_id: 'driver-1',
    date: new Date('2026-03-30'),
    shift_start: new Date('2026-03-30T08:00:00Z'),
    shift_end: new Date('2026-03-30T17:00:00Z'),
    zone_id: 'zone-1',
    status: 'scheduled',
    breaks: [],
  };

  beforeEach(() => {
    repository = new InMemoryRepository();
    service = new SchedulingService(repository);
  });

  describe('createSchedule', () => {
    it('should create a schedule', async () => {
      const schedule = await service.createSchedule(testSchedule);
      expect(schedule.driver_id).toBe('driver-1');
      expect(schedule.status).toBe('scheduled');
    });
  });

  describe('hasScheduleConflict', () => {
    it('should detect overlapping schedule', async () => {
      await service.createSchedule(testSchedule);

      const conflict = await service.hasScheduleConflict(
        'driver-1',
        new Date('2026-03-30T09:00:00Z'),
        new Date('2026-03-30T10:00:00Z')
      );

      expect(conflict).toBe(true);
    });

    it('should return false for non-overlapping schedule', async () => {
      await service.createSchedule(testSchedule);

      const conflict = await service.hasScheduleConflict(
        'driver-1',
        new Date('2026-03-31T09:00:00Z'),
        new Date('2026-03-31T10:00:00Z')
      );

      expect(conflict).toBe(false);
    });

    it('should ignore cancelled schedules', async () => {
      const cancelled = { ...testSchedule, status: 'cancelled' as const };
      await service.createSchedule(cancelled);

      const conflict = await service.hasScheduleConflict(
        'driver-1',
        new Date('2026-03-30T09:00:00Z'),
        new Date('2026-03-30T10:00:00Z')
      );

      expect(conflict).toBe(false);
    });
  });

  describe('isOnBreak', () => {
    it('should return true if time is during break', () => {
      const schedule: Schedule = {
        ...testSchedule,
        breaks: [
          {
            start: new Date('2026-03-30T12:00:00Z'),
            end: new Date('2026-03-30T13:00:00Z'),
          },
        ],
      };

      const isBreak = service.isOnBreak(schedule, new Date('2026-03-30T12:30:00Z'));
      expect(isBreak).toBe(true);
    });

    it('should return false if time is not during break', () => {
      const schedule: Schedule = {
        ...testSchedule,
        breaks: [
          {
            start: new Date('2026-03-30T12:00:00Z'),
            end: new Date('2026-03-30T13:00:00Z'),
          },
        ],
      };

      const isBreak = service.isOnBreak(schedule, new Date('2026-03-30T14:00:00Z'));
      expect(isBreak).toBe(false);
    });
  });

  describe('addBreak', () => {
    it('should add break to schedule', async () => {
      const schedule = await service.createSchedule(testSchedule);

      const updated = await service.addBreak(
        schedule.id,
        new Date('2026-03-30T12:00:00Z'),
        new Date('2026-03-30T13:00:00Z')
      );

      expect(updated?.breaks.length).toBe(1);
      expect(updated?.breaks[0].start).toEqual(new Date('2026-03-30T12:00:00Z'));
    });
  });

  describe('activateSchedule', () => {
    it('should activate a scheduled shift', async () => {
      const schedule = await service.createSchedule(testSchedule);
      const activated = await service.activateSchedule(schedule.id);
      expect(activated?.status).toBe('active');
    });
  });

  describe('completeSchedule', () => {
    it('should mark schedule as completed', async () => {
      const schedule = await service.createSchedule(testSchedule);
      const completed = await service.completeSchedule(schedule.id);
      expect(completed?.status).toBe('completed');
    });
  });

  describe('cancelSchedule', () => {
    it('should cancel a schedule', async () => {
      const schedule = await service.createSchedule(testSchedule);
      const cancelled = await service.cancelSchedule(schedule.id);
      expect(cancelled?.status).toBe('cancelled');
    });
  });
});
