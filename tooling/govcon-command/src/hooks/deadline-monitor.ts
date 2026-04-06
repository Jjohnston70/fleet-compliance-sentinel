/**
 * Deadline Monitor Hook - Check for approaching response deadlines
 */

import { OpportunityService } from "../services/opportunity-service.js";
import { DEADLINE_ALERT_DAYS } from "../config/index.js";

export interface DeadlineAlert {
  opportunityId: string;
  title: string;
  deadline: Date;
  daysRemaining: number;
  severity: "week" | "threeDay" | "oneDay";
}

export class DeadlineMonitor {
  constructor(private opportunityService: OpportunityService) {}

  /**
   * Check for approaching deadlines
   */
  async checkDeadlines(): Promise<DeadlineAlert[]> {
    const alerts: DeadlineAlert[] = [];

    // Check 7-day threshold
    const weekOpps = await this.opportunityService.getUpcomingDeadlines(
      DEADLINE_ALERT_DAYS.week
    );
    for (const opp of weekOpps) {
      const daysRemaining = Math.ceil(
        (opp.response_deadline.getTime() - new Date().getTime()) /
          (24 * 60 * 60 * 1000)
      );
      if (daysRemaining > DEADLINE_ALERT_DAYS.threeDay) {
        alerts.push({
          opportunityId: opp.id,
          title: opp.title,
          deadline: opp.response_deadline,
          daysRemaining,
          severity: "week",
        });
      }
    }

    // Check 3-day threshold
    const threeDayOpps = await this.opportunityService.getUpcomingDeadlines(
      DEADLINE_ALERT_DAYS.threeDay
    );
    for (const opp of threeDayOpps) {
      const daysRemaining = Math.ceil(
        (opp.response_deadline.getTime() - new Date().getTime()) /
          (24 * 60 * 60 * 1000)
      );
      if (daysRemaining > DEADLINE_ALERT_DAYS.oneDay) {
        alerts.push({
          opportunityId: opp.id,
          title: opp.title,
          deadline: opp.response_deadline,
          daysRemaining,
          severity: "threeDay",
        });
      }
    }

    // Check 1-day threshold
    const oneDayOpps = await this.opportunityService.getUpcomingDeadlines(
      DEADLINE_ALERT_DAYS.oneDay
    );
    for (const opp of oneDayOpps) {
      alerts.push({
        opportunityId: opp.id,
        title: opp.title,
        deadline: opp.response_deadline,
        daysRemaining: Math.ceil(
          (opp.response_deadline.getTime() - new Date().getTime()) /
            (24 * 60 * 60 * 1000)
        ),
        severity: "oneDay",
      });
    }

    // Sort by days remaining (most urgent first)
    return alerts.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }
}
