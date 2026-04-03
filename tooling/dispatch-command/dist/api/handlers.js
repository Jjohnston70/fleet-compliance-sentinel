"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchAPIHandlers = void 0;
const dispatch_service_1 = require("../services/dispatch-service");
const driver_service_1 = require("../services/driver-service");
const truck_service_1 = require("../services/truck-service");
const sla_service_1 = require("../services/sla-service");
/**
 * API handlers for dispatch operations.
 * These map to REST endpoints and LLM tool calls.
 */
class DispatchAPIHandlers {
    constructor(repository) {
        this.repository = repository;
        this.dispatchService = new dispatch_service_1.DispatchService(repository);
        this.driverService = new driver_service_1.DriverService(repository);
        this.truckService = new truck_service_1.TruckService(repository);
        this.slaService = new sla_service_1.SLAService(repository);
    }
    // Dispatch Request Handlers
    async createDispatchRequest(data) {
        const request = {
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
    async getDispatchRequest(id) {
        return this.dispatchService.getDispatchRequest(id);
    }
    async listDispatchRequests() {
        return this.dispatchService.listDispatchRequests();
    }
    async updateDispatchRequest(id, updates) {
        return this.repository.updateDispatchRequest(id, updates);
    }
    async cancelDispatchRequest(id, reason) {
        return this.dispatchService.cancelDispatch(id, reason);
    }
    // Driver Assignment
    async assignDriver(requestId, driverId, truckId) {
        try {
            const assignment = await this.dispatchService.assignDriver(requestId, driverId, truckId);
            return { success: true, assignment };
        }
        catch (error) {
            return { success: false, error: String(error) };
        }
    }
    async reassignDriver(requestId, newDriverId) {
        try {
            const assignment = await this.dispatchService.reassignDriver(requestId, newDriverId);
            return { success: true, assignment };
        }
        catch (error) {
            return { success: false, error: String(error) };
        }
    }
    // Driver Handlers
    async listDrivers() {
        return this.driverService.listDrivers();
    }
    async getDriver(id) {
        return this.driverService.getDriver(id);
    }
    async getDriverAvailability(id) {
        const driver = await this.driverService.getDriver(id);
        if (!driver)
            return null;
        return {
            driverId: driver.id,
            available: driver.status === 'available',
            canAcceptJob: await this.driverService.canAcceptJob(id),
            status: driver.status,
            jobsToday: driver.jobs_today,
            maxJobsPerDay: driver.max_jobs_per_day,
        };
    }
    async updateDriverStatus(id, status) {
        return this.driverService.updateDriverStatus(id, status);
    }
    // Truck Handlers
    async listTrucks() {
        return this.truckService.listTrucks();
    }
    async getTruckStatus(id) {
        return this.truckService.getTruck(id);
    }
    // Zone Handlers
    async getZoneStatus(zoneId) {
        const zone = await this.repository.getZone(zoneId);
        if (!zone)
            return null;
        const drivers = await this.driverService.getAvailableDriversInZone(zoneId);
        const requests = await this.dispatchService.listByStatus('pending');
        const activeInZone = requests.filter((r) => r.zone_id === zoneId).length;
        return {
            zoneId: zone.id,
            name: zone.name,
            activeDriverts: drivers,
            activeRequests: activeInZone,
            avgResponseTime: zone.avg_response_time_minutes,
        };
    }
    // SLA Handlers
    async checkSLAStatus(requestId) {
        const request = await this.dispatchService.getDispatchRequest(requestId);
        if (!request)
            return null;
        const status = this.slaService.getSLAStatus(request);
        return {
            requestId: status.requestId,
            status: status.status,
            timeRemaining: status.timeRemaining,
            percentComplete: status.percentComplete,
        };
    }
    // Routing Handlers
    async findNearestDriver(requestId) {
        const request = await this.dispatchService.getDispatchRequest(requestId);
        if (!request)
            return null;
        const zone = await this.repository.getZone(request.zone_id);
        if (!zone)
            return { requestId, error: 'Zone not found' };
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
    async getDispatchMetrics() {
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
exports.DispatchAPIHandlers = DispatchAPIHandlers;
//# sourceMappingURL=handlers.js.map