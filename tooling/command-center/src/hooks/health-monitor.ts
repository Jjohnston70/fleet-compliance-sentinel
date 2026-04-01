/**
 * Health Monitor Hook
 * Periodic health checks on all registered modules
 */

import { healthService } from '../services/health-service.js';

export class HealthMonitor {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start periodic health checks
   */
  start(intervalMs: number = 30000): void {
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
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Run health check immediately
   */
  async checkNow(): Promise<void> {
    await healthService.checkAllModules();
  }
}

export const healthMonitor = new HealthMonitor();
