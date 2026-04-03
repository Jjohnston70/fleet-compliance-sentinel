"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulingService = void 0;
/**
 * SchedulingService manages driver shifts and schedule conflicts.
 */
class SchedulingService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Create a new schedule.
     */
    async createSchedule(schedule) {
        return this.repository.createSchedule(schedule);
    }
    /**
     * Get schedule by ID.
     */
    async getSchedule(id) {
        return this.repository.getSchedule(id);
    }
    /**
     * Get schedules for a driver on a specific date.
     */
    async getDriverScheduleForDate(driverId, date) {
        const schedules = await this.repository.listSchedules();
        const dateStr = date.toISOString().split('T')[0];
        return (schedules.find((s) => {
            const scheduleStr = s.date.toISOString().split('T')[0];
            return s.driver_id === driverId && scheduleStr === dateStr;
        }) || null);
    }
    /**
     * Check if driver has schedule conflict at given time.
     */
    async hasScheduleConflict(driverId, startTime, endTime) {
        const schedules = await this.repository.listSchedules();
        return schedules.some((s) => {
            if (s.driver_id !== driverId || s.status === 'cancelled')
                return false;
            return !(endTime <= s.shift_start || startTime >= s.shift_end);
        });
    }
    /**
     * Check if driver is on break at given time.
     */
    isOnBreak(schedule, time) {
        return schedule.breaks.some((b) => time >= b.start && time <= b.end);
    }
    /**
     * Add break to schedule.
     */
    async addBreak(scheduleId, breakStart, breakEnd) {
        const schedule = await this.repository.getSchedule(scheduleId);
        if (!schedule)
            return null;
        const breaks = [
            ...schedule.breaks,
            { start: breakStart, end: breakEnd },
        ];
        return this.repository.updateSchedule(scheduleId, { breaks });
    }
    /**
     * Get all active schedules for a date.
     */
    async getActiveSchedulesForDate(date) {
        const schedules = await this.repository.listSchedules();
        const dateStr = date.toISOString().split('T')[0];
        return schedules.filter((s) => {
            const scheduleStr = s.date.toISOString().split('T')[0];
            return s.status === 'active' && scheduleStr === dateStr;
        });
    }
    /**
     * Mark schedule as active (shift started).
     */
    async activateSchedule(scheduleId) {
        return this.repository.updateSchedule(scheduleId, { status: 'active' });
    }
    /**
     * Mark schedule as completed (shift ended).
     */
    async completeSchedule(scheduleId) {
        return this.repository.updateSchedule(scheduleId, { status: 'completed' });
    }
    /**
     * Cancel a schedule.
     */
    async cancelSchedule(scheduleId) {
        return this.repository.updateSchedule(scheduleId, { status: 'cancelled' });
    }
}
exports.SchedulingService = SchedulingService;
//# sourceMappingURL=scheduling-service.js.map