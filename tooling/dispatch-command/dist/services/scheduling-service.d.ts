import { Schedule } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
/**
 * SchedulingService manages driver shifts and schedule conflicts.
 */
export declare class SchedulingService {
    private repository;
    constructor(repository: InMemoryRepository);
    /**
     * Create a new schedule.
     */
    createSchedule(schedule: Schedule): Promise<Schedule>;
    /**
     * Get schedule by ID.
     */
    getSchedule(id: string): Promise<Schedule | null>;
    /**
     * Get schedules for a driver on a specific date.
     */
    getDriverScheduleForDate(driverId: string, date: Date): Promise<Schedule | null>;
    /**
     * Check if driver has schedule conflict at given time.
     */
    hasScheduleConflict(driverId: string, startTime: Date, endTime: Date): Promise<boolean>;
    /**
     * Check if driver is on break at given time.
     */
    isOnBreak(schedule: Schedule, time: Date): boolean;
    /**
     * Add break to schedule.
     */
    addBreak(scheduleId: string, breakStart: Date, breakEnd: Date): Promise<Schedule | null>;
    /**
     * Get all active schedules for a date.
     */
    getActiveSchedulesForDate(date: Date): Promise<Schedule[]>;
    /**
     * Mark schedule as active (shift started).
     */
    activateSchedule(scheduleId: string): Promise<Schedule | null>;
    /**
     * Mark schedule as completed (shift ended).
     */
    completeSchedule(scheduleId: string): Promise<Schedule | null>;
    /**
     * Cancel a schedule.
     */
    cancelSchedule(scheduleId: string): Promise<Schedule | null>;
}
//# sourceMappingURL=scheduling-service.d.ts.map