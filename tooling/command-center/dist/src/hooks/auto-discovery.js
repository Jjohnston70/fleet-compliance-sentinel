/**
 * Auto-Discovery Hook
 * Scan modules directory, find new/updated modules, register automatically
 */
import { discoveryService } from '../services/discovery-service.js';
export class AutoDiscovery {
    intervalId = null;
    /**
     * Start periodic discovery scans
     */
    start(intervalMs = 60000) {
        if (this.intervalId) {
            return; // Already running
        }
        this.intervalId = setInterval(async () => {
            await discoveryService.discoverModules();
        }, intervalMs);
    }
    /**
     * Stop discovery scans
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    /**
     * Run discovery immediately
     */
    async scanNow() {
        await discoveryService.discoverModules();
    }
}
export const autoDiscovery = new AutoDiscovery();
//# sourceMappingURL=auto-discovery.js.map