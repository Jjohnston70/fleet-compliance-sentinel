import { InMemoryRepository } from '../data/repository';
import { DispatchService } from '../services/dispatch-service';

export interface AutoDispatchResult {
  requestId: string;
  dispatched: boolean;
  driverId?: string;
  message: string;
}

/**
 * AutoDispatcher automatically assigns drivers to pending requests.
 * Runs continuously or on interval, finding nearest available drivers.
 */
export class AutoDispatcher {
  private dispatchService: DispatchService;

  constructor(private repository: InMemoryRepository) {
    this.dispatchService = new DispatchService(repository);
  }

  /**
   * Process all pending requests and auto-assign drivers.
   */
  async processPendingRequests(): Promise<AutoDispatchResult[]> {
    const results: AutoDispatchResult[] = [];

    const pending = await this.dispatchService.listByStatus('pending');

    for (const request of pending) {
      const zone = await this.repository.getZone(request.zone_id);
      if (!zone) {
        results.push({
          requestId: request.id,
          dispatched: false,
          message: 'Zone not found',
        });
        continue;
      }

      // Find nearest driver
      const requestLocation = { lat: 39.0, lng: -104.8 }; // Simplified
      const nearest = await this.dispatchService.findNearestDriver(zone, requestLocation);

      if (!nearest) {
        results.push({
          requestId: request.id,
          dispatched: false,
          message: 'No available drivers in zone',
        });
        continue;
      }

      try {
        await this.dispatchService.assignDriver(request.id, nearest.driverId);
        results.push({
          requestId: request.id,
          dispatched: true,
          driverId: nearest.driverId,
          message: `Assigned to driver ${nearest.driverId}. ETA ${nearest.travelTimeMinutes} minutes.`,
        });
      } catch (error) {
        results.push({
          requestId: request.id,
          dispatched: false,
          message: `Assignment failed: ${error}`,
        });
      }
    }

    return results;
  }
}
