"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLAService = void 0;
const sla_thresholds_1 = require("../config/sla-thresholds");
/**
 * SLAService monitors and tracks SLA compliance.
 */
class SLAService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Calculate time remaining until SLA deadline (in minutes).
     */
    calculateTimeRemaining(deadline, now = new Date()) {
        return Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / 1000 / 60));
    }
    /**
     * Calculate percent of SLA time consumed.
     */
    calculatePercentComplete(deadline, createdAt, now = new Date()) {
        const totalMinutes = (deadline.getTime() - createdAt.getTime()) / 1000 / 60;
        const elapsedMinutes = (now.getTime() - createdAt.getTime()) / 1000 / 60;
        return Math.min(100, Math.max(0, (elapsedMinutes / totalMinutes) * 100));
    }
    /**
     * Get SLA status for a request.
     */
    getSLAStatus(request, now = new Date()) {
        const timeRemaining = this.calculateTimeRemaining(request.sla_deadline, now);
        const percentComplete = this.calculatePercentComplete(request.sla_deadline, request.created_at, now);
        const threshold = (0, sla_thresholds_1.getSLAThreshold)(request.priority);
        let status;
        if (timeRemaining <= 0) {
            status = 'breached';
        }
        else if (percentComplete >= threshold.criticalThresholdPercent) {
            status = 'critical';
        }
        else if (percentComplete >= threshold.warningThresholdPercent) {
            status = 'warning';
        }
        else {
            status = 'healthy';
        }
        return {
            requestId: request.id,
            priority: request.priority,
            deadline: request.sla_deadline,
            now,
            timeRemaining,
            percentComplete,
            status,
        };
    }
    /**
     * Check all active requests for SLA breaches and update tracking.
     */
    async checkAllSLAStatus(now = new Date()) {
        const requests = await this.repository.listDispatchRequests();
        const active = requests.filter((r) => r.status !== 'completed' && r.status !== 'cancelled');
        const statuses = [];
        for (const request of active) {
            const slaStatus = this.getSLAStatus(request, now);
            statuses.push(slaStatus);
            // Update SLA breach tracking
            let breach = await this.repository.getSLABreach(request.id);
            if (!breach) {
                breach = {
                    request_id: request.id,
                    deadline: request.sla_deadline,
                    warning_triggered: false,
                    critical_triggered: false,
                    breached: false,
                };
                await this.repository.createSLABreach(breach);
            }
            if (breach) {
                // Update breach flags
                if (slaStatus.status === 'warning' && !breach.warning_triggered) {
                    await this.repository.updateSLABreach(request.id, {
                        warning_triggered: true,
                    });
                }
                if (slaStatus.status === 'critical' && !breach.critical_triggered) {
                    await this.repository.updateSLABreach(request.id, {
                        critical_triggered: true,
                    });
                }
                if (slaStatus.status === 'breached' && !breach.breached) {
                    await this.repository.updateSLABreach(request.id, {
                        breached: true,
                        breach_at: now,
                    });
                }
            }
        }
        return statuses;
    }
    /**
     * Get all requests with SLA warnings.
     */
    async getWarningRequests(now = new Date()) {
        const statuses = await this.checkAllSLAStatus(now);
        return statuses.filter((s) => s.status === 'warning' || s.status === 'critical');
    }
    /**
     * Get all breached requests.
     */
    async getBreachedRequests(now = new Date()) {
        const statuses = await this.checkAllSLAStatus(now);
        return statuses.filter((s) => s.status === 'breached');
    }
}
exports.SLAService = SLAService;
//# sourceMappingURL=sla-service.js.map