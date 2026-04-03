"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TruckService = void 0;
/**
 * TruckService handles truck management, assignment, and maintenance scheduling.
 */
class TruckService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Create a new truck.
     */
    async createTruck(truck) {
        return this.repository.createTruck(truck);
    }
    /**
     * Get truck by ID.
     */
    async getTruck(id) {
        return this.repository.getTruck(id);
    }
    /**
     * List all trucks.
     */
    async listTrucks() {
        return this.repository.listTrucks();
    }
    /**
     * Get trucks by zone.
     */
    async getTrucksByZone(zoneId) {
        const trucks = await this.repository.listTrucks();
        return trucks.filter((t) => t.zone_id === zoneId);
    }
    /**
     * Get available trucks (status === 'available').
     */
    async getAvailableTrucks() {
        const trucks = await this.repository.listTrucks();
        return trucks.filter((t) => t.active && t.status === 'available');
    }
    /**
     * Get available trucks in a zone.
     */
    async getAvailableTrucksInZone(zoneId) {
        const trucks = await this.repository.listTrucks();
        return trucks.filter((t) => t.active && t.zone_id === zoneId && t.status === 'available');
    }
    /**
     * Get trucks assigned to a driver.
     */
    async getTrucksByDriver(driverId) {
        const trucks = await this.repository.listTrucks();
        return trucks.filter((t) => t.assigned_driver_id === driverId);
    }
    /**
     * Assign truck to driver.
     */
    async assignTruck(truckId, driverId) {
        return this.repository.updateTruck(truckId, { assigned_driver_id: driverId });
    }
    /**
     * Unassign truck from driver.
     */
    async unassignTruck(truckId) {
        return this.repository.updateTruck(truckId, { assigned_driver_id: undefined });
    }
    /**
     * Update truck status.
     */
    async updateTruckStatus(truckId, status) {
        return this.repository.updateTruck(truckId, { status });
    }
    /**
     * Update compartment load.
     */
    async updateCompartmentLoad(truckId, compartmentName, newLoad) {
        const truck = await this.repository.getTruck(truckId);
        if (!truck)
            return null;
        const compartments = truck.compartments.map((c) => c.name === compartmentName ? { ...c, current_load: newLoad } : c);
        return this.repository.updateTruck(truckId, { compartments });
    }
    /**
     * Check if compartment has space for new load.
     */
    hasCompartmentSpace(truck, compartmentName, amount) {
        const compartment = truck.compartments.find((c) => c.name === compartmentName);
        if (!compartment)
            return false;
        return compartment.current_load + amount <= compartment.capacity;
    }
    /**
     * Schedule maintenance.
     */
    async scheduleMaintenance(truckId, nextDueDate) {
        return this.repository.updateTruck(truckId, {
            last_maintenance: new Date(),
            next_maintenance_due: nextDueDate,
        });
    }
    /**
     * Check if truck needs maintenance.
     */
    needsMaintenance(truck) {
        if (!truck.next_maintenance_due)
            return false;
        return truck.next_maintenance_due <= new Date();
    }
    /**
     * Update mileage.
     */
    async updateMileage(truckId, miles) {
        const truck = await this.repository.getTruck(truckId);
        if (!truck)
            return null;
        return this.repository.updateTruck(truckId, { mileage: truck.mileage + miles });
    }
    /**
     * Deactivate truck (soft delete).
     */
    async deactivateTruck(truckId) {
        return this.repository.updateTruck(truckId, { active: false });
    }
    /**
     * Activate truck.
     */
    async activateTruck(truckId) {
        return this.repository.updateTruck(truckId, { active: true });
    }
}
exports.TruckService = TruckService;
//# sourceMappingURL=truck-service.js.map