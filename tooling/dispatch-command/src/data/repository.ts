import {
  DispatchRequest,
  Driver,
  Truck,
  Zone,
  Schedule,
  DispatchLog,
  SLABreach,
} from './schema';

/**
 * In-memory repository for dispatch command service.
 * Implements Repository pattern for easy testing and Firestore migration.
 */
export class InMemoryRepository {
  private dispatchRequests: Map<string, DispatchRequest> = new Map();
  private drivers: Map<string, Driver> = new Map();
  private trucks: Map<string, Truck> = new Map();
  private zones: Map<string, Zone> = new Map();
  private schedules: Map<string, Schedule> = new Map();
  private logs: DispatchLog[] = [];
  private slaBreaches: Map<string, SLABreach> = new Map();

  // DispatchRequest methods
  async createDispatchRequest(request: DispatchRequest): Promise<DispatchRequest> {
    this.dispatchRequests.set(request.id, request);
    return request;
  }

  async getDispatchRequest(id: string): Promise<DispatchRequest | null> {
    return this.dispatchRequests.get(id) ?? null;
  }

  async listDispatchRequests(): Promise<DispatchRequest[]> {
    return Array.from(this.dispatchRequests.values());
  }

  async updateDispatchRequest(id: string, updates: Partial<DispatchRequest>): Promise<DispatchRequest | null> {
    const existing = this.dispatchRequests.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates, updated_at: new Date() };
    this.dispatchRequests.set(id, updated);
    return updated;
  }

  async deleteDispatchRequest(id: string): Promise<boolean> {
    return this.dispatchRequests.delete(id);
  }

  // Driver methods
  async createDriver(driver: Driver): Promise<Driver> {
    this.drivers.set(driver.id, driver);
    return driver;
  }

  async getDriver(id: string): Promise<Driver | null> {
    return this.drivers.get(id) ?? null;
  }

  async listDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | null> {
    const existing = this.drivers.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.drivers.set(id, updated);
    return updated;
  }

  async deleteDriver(id: string): Promise<boolean> {
    return this.drivers.delete(id);
  }

  // Truck methods
  async createTruck(truck: Truck): Promise<Truck> {
    this.trucks.set(truck.id, truck);
    return truck;
  }

  async getTruck(id: string): Promise<Truck | null> {
    return this.trucks.get(id) ?? null;
  }

  async listTrucks(): Promise<Truck[]> {
    return Array.from(this.trucks.values());
  }

  async updateTruck(id: string, updates: Partial<Truck>): Promise<Truck | null> {
    const existing = this.trucks.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.trucks.set(id, updated);
    return updated;
  }

  async deleteTruck(id: string): Promise<boolean> {
    return this.trucks.delete(id);
  }

  // Zone methods
  async createZone(zone: Zone): Promise<Zone> {
    this.zones.set(zone.id, zone);
    return zone;
  }

  async getZone(id: string): Promise<Zone | null> {
    return this.zones.get(id) ?? null;
  }

  async listZones(): Promise<Zone[]> {
    return Array.from(this.zones.values());
  }

  async updateZone(id: string, updates: Partial<Zone>): Promise<Zone | null> {
    const existing = this.zones.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.zones.set(id, updated);
    return updated;
  }

  // Schedule methods
  async createSchedule(schedule: Schedule): Promise<Schedule> {
    this.schedules.set(schedule.id, schedule);
    return schedule;
  }

  async getSchedule(id: string): Promise<Schedule | null> {
    return this.schedules.get(id) ?? null;
  }

  async listSchedules(): Promise<Schedule[]> {
    return Array.from(this.schedules.values());
  }

  async updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null> {
    const existing = this.schedules.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.schedules.set(id, updated);
    return updated;
  }

  // Log methods
  async createLog(log: DispatchLog): Promise<DispatchLog> {
    this.logs.push(log);
    return log;
  }

  async listLogs(): Promise<DispatchLog[]> {
    return [...this.logs];
  }

  async listLogsByRequestId(requestId: string): Promise<DispatchLog[]> {
    return this.logs.filter((log) => log.request_id === requestId);
  }

  // SLA Breach methods
  async createSLABreach(breach: SLABreach): Promise<SLABreach> {
    this.slaBreaches.set(breach.request_id, breach);
    return breach;
  }

  async getSLABreach(requestId: string): Promise<SLABreach | null> {
    return this.slaBreaches.get(requestId) ?? null;
  }

  async updateSLABreach(requestId: string, updates: Partial<SLABreach>): Promise<SLABreach | null> {
    const existing = this.slaBreaches.get(requestId);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.slaBreaches.set(requestId, updated);
    return updated;
  }

  // Clear all data (useful for testing)
  async clear(): Promise<void> {
    this.dispatchRequests.clear();
    this.drivers.clear();
    this.trucks.clear();
    this.zones.clear();
    this.schedules.clear();
    this.logs = [];
    this.slaBreaches.clear();
  }
}
