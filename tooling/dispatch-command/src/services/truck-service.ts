import { Truck, TruckStatus } from '../data/schema';
import { InMemoryRepository } from '../data/repository';

/**
 * TruckService handles truck management, assignment, and maintenance scheduling.
 */
export class TruckService {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Create a new truck.
   */
  async createTruck(truck: Truck): Promise<Truck> {
    return this.repository.createTruck(truck);
  }

  /**
   * Get truck by ID.
   */
  async getTruck(id: string): Promise<Truck | null> {
    return this.repository.getTruck(id);
  }

  /**
   * List all trucks.
   */
  async listTrucks(): Promise<Truck[]> {
    return this.repository.listTrucks();
  }

  /**
   * Get trucks by zone.
   */
  async getTrucksByZone(zoneId: string): Promise<Truck[]> {
    const trucks = await this.repository.listTrucks();
    return trucks.filter((t) => t.zone_id === zoneId);
  }

  /**
   * Get available trucks (status === 'available').
   */
  async getAvailableTrucks(): Promise<Truck[]> {
    const trucks = await this.repository.listTrucks();
    return trucks.filter((t) => t.active && t.status === 'available');
  }

  /**
   * Get available trucks in a zone.
   */
  async getAvailableTrucksInZone(zoneId: string): Promise<Truck[]> {
    const trucks = await this.repository.listTrucks();
    return trucks.filter((t) => t.active && t.zone_id === zoneId && t.status === 'available');
  }

  /**
   * Get trucks assigned to a driver.
   */
  async getTrucksByDriver(driverId: string): Promise<Truck[]> {
    const trucks = await this.repository.listTrucks();
    return trucks.filter((t) => t.assigned_driver_id === driverId);
  }

  /**
   * Assign truck to driver.
   */
  async assignTruck(truckId: string, driverId: string): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, { assigned_driver_id: driverId });
  }

  /**
   * Unassign truck from driver.
   */
  async unassignTruck(truckId: string): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, { assigned_driver_id: undefined });
  }

  /**
   * Update truck status.
   */
  async updateTruckStatus(truckId: string, status: TruckStatus): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, { status });
  }

  /**
   * Update compartment load.
   */
  async updateCompartmentLoad(
    truckId: string,
    compartmentName: string,
    newLoad: number
  ): Promise<Truck | null> {
    const truck = await this.repository.getTruck(truckId);
    if (!truck) return null;

    const compartments = truck.compartments.map((c) =>
      c.name === compartmentName ? { ...c, current_load: newLoad } : c
    );

    return this.repository.updateTruck(truckId, { compartments });
  }

  /**
   * Check if compartment has space for new load.
   */
  hasCompartmentSpace(truck: Truck, compartmentName: string, amount: number): boolean {
    const compartment = truck.compartments.find((c) => c.name === compartmentName);
    if (!compartment) return false;
    return compartment.current_load + amount <= compartment.capacity;
  }

  /**
   * Schedule maintenance.
   */
  async scheduleMaintenance(truckId: string, nextDueDate: Date): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, {
      last_maintenance: new Date(),
      next_maintenance_due: nextDueDate,
    });
  }

  /**
   * Check if truck needs maintenance.
   */
  needsMaintenance(truck: Truck): boolean {
    if (!truck.next_maintenance_due) return false;
    return truck.next_maintenance_due <= new Date();
  }

  /**
   * Update mileage.
   */
  async updateMileage(truckId: string, miles: number): Promise<Truck | null> {
    const truck = await this.repository.getTruck(truckId);
    if (!truck) return null;
    return this.repository.updateTruck(truckId, { mileage: truck.mileage + miles });
  }

  /**
   * Deactivate truck (soft delete).
   */
  async deactivateTruck(truckId: string): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, { active: false });
  }

  /**
   * Activate truck.
   */
  async activateTruck(truckId: string): Promise<Truck | null> {
    return this.repository.updateTruck(truckId, { active: true });
  }
}
