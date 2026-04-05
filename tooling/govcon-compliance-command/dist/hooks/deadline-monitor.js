/**
 * Deadline Monitor Hook - Check for approaching response deadlines
 */
import { DEADLINE_ALERT_DAYS } from "../config/index.js";
export class DeadlineMonitor {
    constructor(opportunityService) {
        this.opportunityService = opportunityService;
    }
    async checkDeadlines() {
        const alerts = [];
        const weekOpps = await this.opportunityService.getUpcomingDeadlines(DEADLINE_ALERT_DAYS.week);
        for (const opp of weekOpps) {
            const daysRemaining = Math.ceil((opp.response_deadline.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
            if (daysRemaining > DEADLINE_ALERT_DAYS.threeDay) {
                alerts.push({ opportunityId: opp.id, title: opp.title, deadline: opp.response_deadline, daysRemaining, severity: "week" });
            }
        }
        const threeDayOpps = await this.opportunityService.getUpcomingDeadlines(DEADLINE_ALERT_DAYS.threeDay);
        for (const opp of threeDayOpps) {
            const daysRemaining = Math.ceil((opp.response_deadline.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000));
            if (daysRemaining > DEADLINE_ALERT_DAYS.oneDay) {
                alerts.push({ opportunityId: opp.id, title: opp.title, deadline: opp.response_deadline, daysRemaining, severity: "threeDay" });
            }
        }
        const oneDayOpps = await this.opportunityService.getUpcomingDeadlines(DEADLINE_ALERT_DAYS.oneDay);
        for (const opp of oneDayOpps) {
            alerts.push({
                opportunityId: opp.id, title: opp.title, deadline: opp.response_deadline,
                daysRemaining: Math.ceil((opp.response_deadline.getTime() - new Date().getTime()) / (24 * 60 * 60 * 1000)),
                severity: "oneDay",
            });
        }
        return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
    }
}
//# sourceMappingURL=deadline-monitor.js.map