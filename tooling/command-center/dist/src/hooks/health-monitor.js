/**
 * Health Monitor Hook
 * Periodic health checks on all registered modules
 */
import { healthService } from '../services/health-service.js';
export class HealthMonitor {
    intervalId = null;
    /**
     * Start periodic health checks
     */
    start(intervalMs = 30000) {
        if (this.intervalId) {
            return; // Already running
        }
        this.intervalId = setInterval(async () => {
            await healthService.checkAllModules();
        }, intervalMs);
    }
    /**
     * Stop health checks
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Run health check immediately
     */
    async checkNow() {
        await healthService.checkAllModules();
    }
}
export const healthMonitor = new HealthMonitor();
//# sourceMappingURL=health-monitor.js.map