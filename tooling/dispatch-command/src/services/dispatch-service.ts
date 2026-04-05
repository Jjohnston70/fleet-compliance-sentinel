import { DispatchRequest, Location, Zone } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
import { DriverService } from './driver-service';
import { TruckService } from './truck-service';
import { RoutingService } from './routing-service';
import { calculateSLADeadline } from '../config/sla-thresholds';

export interface AssignmentResult {
  requestId: string;
  driverId: string;
  truckId?: string;
  estimatedArrival: Date;
  travelTimeMinutes: number;
}

/**
 * DispatchService is the core dispatch engine.
 * Handles request creation, driver assignment, and status management.
 */
export class DispatchService {
  private driverService: DriverService;
  private truckService: TruckService;

  constructor(private repository: InMemoryRepository) {
    this.driverService = new DriverService(repository);
    this.truckService = new TruckService(repository);
  }

  /**
   * Create a new dispatch request.
   */
  async createDispatchRequest(
    request: DispatchRequest,
    slaHoursOverride?: number
  ): Promise<DispatchRequest> {
    const normalizedSlaHours =
      typeof slaHoursOverride === 'number' && Number.isFinite(slaHoursOverride)
        ? Math.trunc(slaHoursOverride)
        : null;
    // Calculate SLA deadline based on priority unless an explicit 24-72 hour override is provided.
    const slaDeadline = normalizedSlaHours !== null
      ? new Date(request.created_at.getTime() + normalizedSlaHours * 60 * 60 * 1000)
      : calculateSLADeadline(request.priority, request.created_at);
    const requestWithSLA = { ...request, sla_deadline: slaDeadline };

    const created = await this.repository.createDispatchRequest(requestWithSLA);

    // Log creation
    await this.repository.createLog({
      id: crypto.randomUUID(),
      request_id: created.id,
      action: 'created',
      actor: 'system',
      timestamp: new Date(),
      details: { priority: created.priority },
    });

    return created;
  }

  /**
   * Get dispatch request by ID.
   */
  async getDispatchRequest(id: string): Promise<DispatchRequest | null> {
    return this.repository.getDispatchRequest(id);
  }

  /**
   * List all dispatch requests.
   */
  async listDispatchRequests(): Promise<DispatchRequest[]> {
    return this.repository.listDispatchRequests();
  }

  /**
   * List dispatch requests by status.
   */
  async listByStatus(status: string): Promise<DispatchRequest[]> {
    const requests = await this.repository.listDispatchRequests();
    return requests.filter((r) => r.status === status);
  }

  /**
   * Find nearest available driver to a request address.
   * First tries primary zone drivers, then backup zones.
   */
  async findNearestDriver(
    zone: Zone,
    requestLocation: Location
  ): Promise<{ driverId: string; travelTimeMinutes: number } | null> {
    // Try primary drivers first
    const primaryDrivers = await Promise.all(
      (zone.primary_drivers || []).map((id: string) => this.driverService.getDriver(id))
    );

    const availablePrimary = primaryDrivers.filter(
      (d) => d && d.active && d.status === 'available' && d.jobs_today < d.max_jobs_per_day
    );

    if (availablePrimary.length > 0) {
      // Find nearest by distance
      const locations = availablePrimary.map((d) => d!.current_location);
      const nearest = RoutingService.findNearest(requestLocation, locations);

      if (nearest) {
        const driverId = availablePrimary[nearest.index]!.id;
        return {
          driverId,
          travelTimeMinutes: nearest.travelTimeMinutes,
        };
      }
    }

    // Try backup drivers
    const backupDrivers = await Promise.all(
      (zone.backup_drivers || []).map((id: string) => this.driverService.getDriver(id))
    );

    const availableBackup = backupDrivers.filter(
      (d) => d && d.active && d.status === 'available' && d.jobs_today < d.max_jobs_per_day
    );

    if (availableBackup.length > 0) {
      const locations = availableBackup.map((d) => d!.current_location);
      const nearest = RoutingService.findNearest(requestLocation, locations);

      if (nearest) {
        const driverId = availableBackup[nearest.index]!.id;
        return {
          driverId,
          travelTimeMinutes: nearest.travelTimeMinutes,
        };
      }
    }

    return null;
  }

  /**
   * Assign driver and truck to a dispatch request.
   */
  async assignDriver(
    requestId: string,
    driverId: string,
    truckId?: string
  ): Promise<AssignmentResult> {
    const request = await this.repository.getDispatchRequest(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);
    if (request.status === 'completed' || request.status === 'cancelled') {
      throw new Error(`Cannot assign driver to request with status: ${request.status}`);
    }
    if (request.assigned_driver_id === driverId) {
      throw new Error(`Driver ${driverId} is already assigned to request ${requestId}`);
    }

    const driver = await this.driverService.getDriver(driverId);
    if (!driver) throw new Error(`Driver not found: ${driverId}`);
    const canAcceptJob = await this.driverService.canAcceptJob(driverId);
    if (!canAcceptJob) {
      throw new Error(`Driver cannot accept new jobs: ${driverId}`);
    }

    // Calculate estimated arrival
    const requestLocation: Location = {
      lat: 39.0, // Simplified for now
      lng: -104.8,
    };
    const travelTime = RoutingService.estimateTravelTime(
      RoutingService.calculateDistance(driver.current_location, requestLocation)
    );
    const estimatedArrival = new Date(Date.now() + travelTime * 60 * 1000);

    // Update request
    await this.repository.updateDispatchRequest(requestId, {
      status: 'dispatched',
      assigned_driver_id: driverId,
      assigned_truck_id: truckId,
      estimated_arrival: estimatedArrival,
    });

    // Update driver status and job count
    await this.driverService.updateDriverStatus(driverId, 'en_route');
    await this.driverService.incrementJobCount(driverId);

    // Update truck status if assigned
    if (truckId) {
      await this.truckService.updateTruckStatus(truckId, 'in_use');
    }

    // Log assignment
    await this.repository.createLog({
      id: crypto.randomUUID(),
      request_id: requestId,
      action: 'assigned',
      actor: 'system',
      timestamp: new Date(),
      details: { driver_id: driverId, truck_id: truckId },
    });

    return {
      requestId,
      driverId,
      truckId,
      estimatedArrival,
      travelTimeMinutes: travelTime,
    };
  }

  /**
   * Reassign driver to a different dispatch request.
   */
  async reassignDriver(
    requestId: string,
    newDriverId: string
  ): Promise<AssignmentResult> {
    const request = await this.repository.getDispatchRequest(requestId);
    if (!request) throw new Error(`Request not found: ${requestId}`);

    if (request.assigned_driver_id) {
      // Decrement old driver's job count
      await this.driverService.decrementJobCount(request.assigned_driver_id);

      // Reset old truck status
      if (request.assigned_truck_id) {
        await this.truckService.updateTruckStatus(request.assigned_truck_id, 'available');
      }

      // Log unassignment
      await this.repository.createLog({
        id: crypto.randomUUID(),
        request_id: requestId,
        action: 'unassigned',
        actor: 'system',
        timestamp: new Date(),
        details: { driver_id: request.assigned_driver_id },
      });
    }

    return this.assignDriver(requestId, newDriverId, request.assigned_truck_id);
  }

  /**
   * Mark request as en_route.
   */
  async markEnRoute(requestId: string): Promise<DispatchRequest | null> {
    const request = await this.repository.updateDispatchRequest(requestId, {
      status: 'en_route',
    });

    if (request) {
      await this.repository.createLog({
        id: crypto.randomUUID(),
        request_id: requestId,
        action: 'en_route',
        actor: 'driver',
        timestamp: new Date(),
      });
    }

    return request;
  }

  /**
   * Mark request as on_site.
   */
  async markOnSite(requestId: string): Promise<DispatchRequest | null> {
    const request = await this.repository.updateDispatchRequest(requestId, {
      status: 'on_site',
      actual_arrival: new Date(),
    });

    if (request) {
      await this.repository.createLog({
        id: crypto.randomUUID(),
        request_id: requestId,
        action: 'on_site',
        actor: 'driver',
        timestamp: new Date(),
      });
    }

    return request;
  }

  /**
   * Mark request as completed.
   */
  async completeDispatch(requestId: string): Promise<DispatchRequest | null> {
    const request = await this.repository.getDispatchRequest(requestId);
    if (!request) return null;

    const updated = await this.repository.updateDispatchRequest(requestId, {
      status: 'completed',
      completed_at: new Date(),
    });

    if (updated && updated.assigned_driver_id) {
      // Reset driver status
      await this.driverService.updateDriverStatus(updated.assigned_driver_id, 'available');

      // Reset truck status
      if (updated.assigned_truck_id) {
        await this.truckService.updateTruckStatus(updated.assigned_truck_id, 'available');
      }
    }

    if (updated) {
      await this.repository.createLog({
        id: crypto.randomUUID(),
        request_id: requestId,
        action: 'completed',
        actor: 'driver',
        timestamp: new Date(),
      });
    }

    return updated;
  }

  /**
   * Cancel a dispatch request.
   */
  async cancelDispatch(requestId: string, reason: string): Promise<DispatchRequest | null> {
    const request = await this.repository.getDispatchRequest(requestId);
    if (!request) return null;

    const updated = await this.repository.updateDispatchRequest(requestId, {
      status: 'cancelled',
    });

    if (updated && updated.assigned_driver_id) {
      // Decrement job count and reset status
      await this.driverService.decrementJobCount(updated.assigned_driver_id);
      await this.driverService.updateDriverStatus(updated.assigned_driver_id, 'available');

      // Reset truck status
      if (updated.assigned_truck_id) {
        await this.truckService.updateTruckStatus(updated.assigned_truck_id, 'available');
      }
    }

    if (updated) {
      await this.repository.createLog({
        id: crypto.randomUUID(),
        request_id: requestId,
        action: 'cancelled',
        actor: 'system',
        timestamp: new Date(),
        details: { reason },
      });
    }

    return updated;
  }
}
