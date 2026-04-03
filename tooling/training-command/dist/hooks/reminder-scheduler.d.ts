import { IRepository } from '../data/repository';
export declare class ReminderScheduler {
    private repo;
    constructor(repo: IRepository);
    checkInactiveEnrollments(inactiveDays?: number): Promise<void>;
    private sendInactivityReminder;
    generateProgressNotifications(): Promise<void>;
}
//# sourceMappingURL=reminder-scheduler.d.ts.map