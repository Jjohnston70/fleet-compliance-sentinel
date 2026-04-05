import { DispatchRequest, Driver, DriverStatusSchema, Truck } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
import { AssignmentResult, DispatchService } from '../services/dispatch-service';
import { DriverService } from '../services/driver-service';
import { TruckService } from '../services/truck-service';
import { SLAService } from '../services/sla-service';

/**
 * API handlers for dispatch operations.
 * These map to REST endpoints and LLM tool calls.
 */
export class DispatchAPIHandlers {
  private dispatchService: DispatchService;
  private driverService: DriverService;
  private truckService: TruckService;
  private slaService: SLAService;

  constructor(private repository: InMemoryRepository) {
    this.dispatchService = new DispatchService(repository);
    this.driverService = new DriverService(repository);
    this.truckService = new TruckService(repository);
    this.slaService = new SLAService(repository);
  }

  // Dispatch Request Handlers
  async createDispatchRequest(data: Partial<DispatchRequest>): Promise<DispatchRequest> {
    const request: DispatchRequest = {
      id: crypto.randomUUID(),
      client_name: data.client_name || '',
      client_phone: data.client_phone || '',
      address: data.address || '',
      city: data.city || '',
      state: data.state || '',
      zip: data.zip || '',
      zone_id: data.zone_id || '',
      priority: data.priority || 'standard',
      issue_type: data.issue_type || 'maintenance',
      description: data.description || '',
      status: 'pending',
      sla_deadline: new Date(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.dispatchService.createDispatchRequest(request);
  }

  async getDispatchRequest(id: string): Promise<DispatchRequest | null> {
    return this.dispatchService.getDispatchRequest(id);
  }

  async listDispatchRequests(): Promise<DispatchRequest[]> {
    return this.dispatchService.listDispatchRequests();
  }

  async updateDispatchRequest(
    id: string,
    updates: Partial<DispatchRequest>
  ): Promise<DispatchRequest | null> {
    return this.repository.updateDispatchRequest(id, updates);
  }

  async cancelDispatchRequest(id: string, reason: string): Promise<DispatchRequest | null> {
    return this.dispatchService.cancelDispatch(id, reason);
  }

  // Driver Assignment
  async assignDriver(
    requestId: string,
    driverId: string,
    truckId?: string
  ): Promise<{
    success: boolean;
    assignment?: AssignmentResult;
    error?: string;
  }> {
    try {
      const assignment = await this.dispatchService.assignDriver(requestId, driverId, truckId);
      return { success: true, assignment };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  async reassignDriver(requestId: string, newDriverId: string): Promise<{
    success: boolean;
    assignment?: AssignmentResult;
    error?: string;
  }> {
    try {
      const assignment = await this.dispatchService.reassignDriver(requestId, newDriverId);
      return { success: true, assignment };
    } catch (error) {
      return { success: false, error: String(error) };
    }
  }

  // Driver Handlers
  async listDrivers(): Promise<Driver[]> {
    return this.driverService.listDrivers();
  }

  async getDriver(id: string): Promise<Driver | null> {
    return this.driverService.getDriver(id);
  }

  async getDriverAvailability(id: string): Promise<{
    driverId: string;
    available: boolean;
    canAcceptJob: boolean;
    status: string;
    jobsToday: number;
    maxJobsPerDay: number;
  } | null> {
    const driver = await this.driverService.getDriver(id);
    if (!driver) return null;

    return {
      driverId: driver.id,
      available: driver.status === 'available',
      canAcceptJob: await this.driverService.canAcceptJob(id),
      status: driver.status,
      jobsToday: driver.jobs_today,
      maxJobsPerDay: driver.max_jobs_per_day,
    };
  }

  async updateDriverStatus(id: string, status: string): Promise<Driver | null> {
    const parsedStatus = DriverStatusSchema.safeParse(status);
    if (!parsedStatus.success) return null;
    return this.driverService.updateDriverStatus(id, parsedStatus.data);
  }

  // Truck Handlers
  async listTrucks(): Promise<Truck[]> {
    return this.truckService.listTrucks();
  }

  async getTruckStatus(id: string): Promise<Truck | null> {
    return this.truckService.getTruck(id);
  }

  // Zone Handlers
  async getZoneStatus(zoneId: string): Promise<{
    zoneId: string;
    name: string;
    activeDrivers: Driver[];
    activeDriverts: Driver[]; // Backward-compatible typo alias, use activeDrivers moving forward.
    activeRequests: number;
    avgResponseTime: number;
  } | null> {
    const zone = await this.repository.getZone(zoneId);
    if (!zone) return null;

    const drivers = await this.driverService.getAvailableDriversInZone(zoneId);
    const requests = await this.dispatchService.listByStatus('pending');
    const activeInZone = requests.filter((r) => r.zone_id === zoneId).length;

    return {
      zoneId: zone.id,
      name: zone.name,
      activeDrivers: drivers,
      activeDriverts: drivers,
      activeRequests: activeInZone,
      avgResponseTime: zone.avg_response_time_minutes,
    };
  }

  // SLA Handlers
  async checkSLAStatus(requestId: string): Promise<{
    requestId: string;
    status: string;
    timeRemaining: number;
    percentComplete: number;
  } | null> {
    const request = await this.dispatchService.getDispatchRequest(requestId);
    if (!request) return null;

    const status = this.slaService.getSLAStatus(request);

    return {
      requestId: status.requestId,
      status: status.status,
      timeRemaining: status.timeRemaining,
      percentComplete: status.percentComplete,
    };
  }

  // Routing Handlers
  async findNearestDriver(requestId: string): Promise<{
    requestId: string;
    driverId?: string;
    travelTimeMinutes?: number;
    error?: string;
  } | null> {
    const request = await this.dispatchService.getDispatchRequest(requestId);
    if (!request) return null;

    const zone = await this.repository.getZone(request.zone_id);
    if (!zone) return { requestId, error: 'Zone not found' };

    const requestLocation = { lat: 39.0, lng: -104.8 }; // Simplified
    const result = await this.dispatchService.findNearestDriver(zone, requestLocation);

    if (!result) {
      return { requestId, error: 'No available drivers' };
    }

    return {
      requestId,
      driverId: result.driverId,
      travelTimeMinutes: result.travelTimeMinutes,
    };
  }

  // Metrics Handlers
  async getDispatchMetrics(): Promise<{
    totalRequests: number;
    pendingRequests: number;
    dispatchedRequests: number;
    completedRequests: number;
    cancelledRequests: number;
    activeDrivers: number;
    availableTrucks: number;
  }> {
    const requests = await this.dispatchService.listDispatchRequests();
    const drivers = await this.driverService.getAvailableDrivers();
    const trucks = await this.truckService.getAvailableTrucks();

    return {
      totalRequests: requests.length,
      pendingRequests: requests.filter((r) => r.status === 'pending').length,
      dispatchedRequests: requests.filter((r) => r.status === 'dispatched').length,
      completedRequests: requests.filter((r) => r.status === 'completed').length,
      cancelledRequests: requests.filter((r) => r.status === 'cancelled').length,
      activeDrivers: drivers.length,
      availableTrucks: trucks.length,
    };
  }
}
