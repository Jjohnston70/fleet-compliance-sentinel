import { Truck, TruckStatus } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
/**
 * TruckService handles truck management, assignment, and maintenance scheduling.
 */
export declare class TruckService {
    private repository;
    constructor(repository: InMemoryRepository);
    /**
     * Create a new truck.
     */
    createTruck(truck: Truck): Promise<Truck>;
    /**
     * Get truck by ID.
     */
    getTruck(id: string): Promise<Truck | null>;
    /**
     * List all trucks.
     */
    listTrucks(): Promise<Truck[]>;
    /**
     * Get trucks by zone.
     */
    getTrucksByZone(zoneId: string): Promise<Truck[]>;
    /**
     * Get available trucks (status === 'available').
     */
    getAvailableTrucks(): Promise<Truck[]>;
    /**
     * Get available trucks in a zone.
     */
    getAvailableTrucksInZone(zoneId: string): Promise<Truck[]>;
    /**
     * Get trucks assigned to a driver.
     */
    getTrucksByDriver(driverId: string): Promise<Truck[]>;
    /**
     * Assign truck to driver.
     */
    assignTruck(truckId: string, driverId: string): Promise<Truck | null>;
    /**
     * Unassign truck from driver.
     */
    unassignTruck(truckId: string): Promise<Truck | null>;
    /**
     * Update truck status.
     */
    updateTruckStatus(truckId: string, status: TruckStatus): Promise<Truck | null>;
    /**
     * Update compartment load.
     */
    updateCompartmentLoad(truckId: string, compartmentName: string, newLoad: number): Promise<Truck | null>;
    /**
     * Check if compartment has space for new load.
     */
    hasCompartmentSpace(truck: Truck, compartmentName: string, amount: number): boolean;
    /**
     * Schedule maintenance.
     */
    scheduleMaintenance(truckId: string, nextDueDate: Date): Promise<Truck | null>;
    /**
     * Check if truck needs maintenance.
     */
    needsMaintenance(truck: Truck): boolean;
    /**
     * Update mileage.
     */
    updateMileage(truckId: string, miles: number): Promise<Truck | null>;
    /**
     * Deactivate truck (soft delete).
     */
    deactivateTruck(truckId: string): Promise<Truck | null>;
    /**
     * Activate truck.
     */
    activateTruck(truckId: string): Promise<Truck | null>;
}
//# sourceMappingURL=truck-service.d.ts.map