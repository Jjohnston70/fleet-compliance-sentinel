import { DigestConfig, ScheduleEntry } from '../data/schema.js';

export interface DueDigest {
  userEmail: string;
  reportType: string;
  config: DigestConfig;
}

export class DigestScheduler {
  /**
   * Check which digests are due based on config schedules
   */
  checkDueDigests(configs: DigestConfig[], currentDate: Date = new Date()): DueDigest[] {
    const dueDigests: DueDigest[] = [];

    configs.forEach((config) => {
      config.report_types_enabled.forEach((reportType) => {
        const schedule = config.schedule[reportType];
        if (schedule && this.isScheduleDue(schedule, currentDate)) {
          dueDigests.push({
            userEmail: config.id,
            reportType,
            config,
          });
        }
      });
    });

    return dueDigests;
  }

  /**
   * Determine if a schedule is due at the given time
   */
  private isScheduleDue(schedule: ScheduleEntry, now: Date): boolean {
    const currentHour = now.getHours();
    const currentDayOfWeek = now.getDay();

    // Hour must match
    if (schedule.hour !== currentHour) return false;

    switch (schedule.frequency) {
      case 'daily':
        return true;

      case 'weekly':
        if (schedule.day_of_week !== undefined) {
          return currentDayOfWeek === schedule.day_of_week;
        }
        return true;

      case 'monthly':
        // Simplistic: check if it's the first of the month
        return now.getDate() === 1;

      case 'quarterly':
        // Check if in first month of quarter
        const month = now.getMonth();
        return month === 0 || month === 3 || month === 6 || month === 9;

      default:
        return false;
    }
  }

  /**
   * Format schedule for display
   */
  formatSchedule(schedule: ScheduleEntry): string {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const timeStr = `${schedule.hour.toString().padStart(2, '0')}:00`;

    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${timeStr}`;
      case 'weekly':
        if (schedule.day_of_week !== undefined) {
          return `Every ${dayNames[schedule.day_of_week]} at ${timeStr}`;
        }
        return `Weekly at ${timeStr}`;
      case 'monthly':
        return `Monthly on 1st at ${timeStr}`;
      case 'quarterly':
        return `Quarterly (1st month) at ${timeStr}`;
      default:
        return `Custom`;
    }
  }
}
