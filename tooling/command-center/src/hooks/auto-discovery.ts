/**
 * Auto-Discovery Hook
 * Scan modules directory, find new/updated modules, register automatically
 */

import { discoveryService } from '../services/discovery-service.js';

export class AutoDiscovery {
  private intervalId: NodeJS.Timeout | null = null;

  /**
   * Start periodic discovery scans
   */
  start(intervalMs: number = 60000): void {
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
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Run discovery immediately
   */
  async scanNow(): Promise<void> {
    await discoveryService.discoverModules();
  }
}

export const autoDiscovery = new AutoDiscovery();
