"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLAMonitor = void 0;
const sla_service_1 = require("../services/sla-service");
/**
 * SLAMonitor continuously checks SLA deadlines and flags warnings/breaches.
 * Typically run as an interval/cron job.
 */
class SLAMonitor {
    constructor(_repository) {
        this.slaService = new sla_service_1.SLAService(_repository);
    }
    /**
     * Check all active requests for SLA violations.
     * Returns list of alerts that need attention.
     */
    async checkSLAViolations(now = new Date()) {
        const alerts = [];
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
    async getCriticalAlerts(now = new Date()) {
        const alerts = await this.checkSLAViolations(now);
        return alerts.filter((a) => a.type === 'critical' || a.type === 'breached');
    }
}
exports.SLAMonitor = SLAMonitor;
//# sourceMappingURL=sla-monitor.js.map