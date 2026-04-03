import { InMemoryRepository } from '../data/repository';
import { SLAService } from '../services/sla-service';

export interface SLAAlert {
  type: 'warning' | 'critical' | 'breached';
  requestId: string;
  message: string;
  timeRemaining: number;
}

/**
 * SLAMonitor continuously checks SLA deadlines and flags warnings/breaches.
 * Typically run as an interval/cron job.
 */
export class SLAMonitor {
  private slaService: SLAService;

  constructor(_repository: InMemoryRepository) {
    this.slaService = new SLAService(_repository);
  }

  /**
   * Check all active requests for SLA violations.
   * Returns list of alerts that need attention.
   */
  async checkSLAViolations(now: Date = new Date()): Promise<SLAAlert[]> {
    const alerts: SLAAlert[] = [];

    const statuses = await this.slaService.checkAllSLAStatus(now);

    for (const status of statuses) {
      if (status.status === 'warning') {
        alerts.push({
          type: 'warning',
          requestId: status.requestId,
          message: `SLA warning: ${status.priority} request approaching deadline. ${status.timeRemaining} minutes remaining.`,
          timeRemaining: status.timeRemaining,
        });
      }

      if (status.status === 'critical') {
        alerts.push({
          type: 'critical',
          requestId: status.requestId,
          message: `SLA critical: ${status.priority} request critical. ${status.timeRemaining} minutes remaining.`,
          timeRemaining: status.timeRemaining,
        });
      }

      if (status.status === 'breached') {
        alerts.push({
          type: 'breached',
          requestId: status.requestId,
          message: `SLA breached: ${status.priority} request deadline passed by ${Math.abs(status.timeRemaining)} minutes.`,
          timeRemaining: status.timeRemaining,
        });
      }
    }

    return alerts;
  }

  /**
   * Get critical/breached alerts only.
   */
  async getCriticalAlerts(now: Date = new Date()): Promise<SLAAlert[]> {
    const alerts = await this.checkSLAViolations(now);
    return alerts.filter((a) => a.type === 'critical' || a.type === 'breached');
  }
}
