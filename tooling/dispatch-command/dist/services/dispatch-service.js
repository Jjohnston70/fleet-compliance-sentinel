"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchService = void 0;
const driver_service_1 = require("./driver-service");
const truck_service_1 = require("./truck-service");
const routing_service_1 = require("./routing-service");
const sla_thresholds_1 = require("../config/sla-thresholds");
/**
 * DispatchService is the core dispatch engine.
 * Handles request creation, driver assignment, and status management.
 */
class DispatchService {
    constructor(repository) {
        this.repository = repository;
        this.driverService = new driver_service_1.DriverService(repository);
        this.truckService = new truck_service_1.TruckService(repository);
    }
    /**
     * Create a new dispatch request.
     */
    async createDispatchRequest(request) {
        // Calculate SLA deadline based on priority
        const slaDeadline = (0, sla_thresholds_1.calculateSLADeadline)(request.priority, request.created_at);
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
    async getDispatchRequest(id) {
        return this.repository.getDispatchRequest(id);
    }
    /**
     * List all dispatch requests.
     */
    async listDispatchRequests() {
        return this.repository.listDispatchRequests();
    }
    /**
     * List dispatch requests by status.
     */
    async listByStatus(status) {
        const requests = await this.repository.listDispatchRequests();
        return requests.filter((r) => r.status === status);
    }
    /**
     * Find nearest available driver to a request address.
     * First tries primary zone drivers, then backup zones.
     */
    async findNearestDriver(zone, requestLocation) {
        // Try primary drivers first
        const primaryDrivers = await Promise.all((zone.primary_drivers || []).map((id) => this.driverService.getDriver(id)));
        const availablePrimary = primaryDrivers.filter((d) => d && d.active && d.status === 'available' && d.jobs_today < d.max_jobs_per_day);
        if (availablePrimary.length > 0) {
            // Find nearest by distance
            const locations = availablePrimary.map((d) => d.current_location);
            const nearest = routing_service_1.RoutingService.findNearest(requestLocation, locations);
            if (nearest) {
                const driverId = availablePrimary[nearest.index].id;
                return {
                    driverId,
                    travelTimeMinutes: nearest.travelTimeMinutes,
                };
            }
        }
        // Try backup drivers
        const backupDrivers = await Promise.all((zone.backup_drivers || []).map((id) => this.driverService.getDriver(id)));
        const availableBackup = backupDrivers.filter((d) => d && d.active && d.status === 'available' && d.jobs_today < d.max_jobs_per_day);
        if (availableBackup.length > 0) {
            const locations = availableBackup.map((d) => d.current_location);
            const nearest = routing_service_1.RoutingService.findNearest(requestLocation, locations);
            if (nearest) {
                const driverId = availableBackup[nearest.index].id;
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
    async assignDriver(requestId, driverId, truckId) {
        const request = await this.repository.getDispatchRequest(requestId);
        if (!request)
            throw new Error(`Request not found: ${requestId}`);
        if (request.status === 'completed' || request.status === 'cancelled') {
            throw new Error(`Cannot assign driver to request with status: ${request.status}`);
        }
        if (request.assigned_driver_id === driverId) {
            throw new Error(`Driver ${driverId} is already assigned to request ${requestId}`);
        }
        const driver = await this.driverService.getDriver(driverId);
        if (!driver)
            throw new Error(`Driver not found: ${driverId}`);
        const canAcceptJob = await this.driverService.canAcceptJob(driverId);
        if (!canAcceptJob) {
            throw new Error(`Driver cannot accept new jobs: ${driverId}`);
        }
        // Calculate estimated arrival
        const requestLocation = {
            lat: 39.0, // Simplified for now
            lng: -104.8,
        };
        const travelTime = routing_service_1.RoutingService.estimateTravelTime(routing_service_1.RoutingService.calculateDistance(driver.current_location, requestLocation));
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
    async reassignDriver(requestId, newDriverId) {
        const request = await this.repository.getDispatchRequest(requestId);
        if (!request)
            throw new Error(`Request not found: ${requestId}`);
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
    async markEnRoute(requestId) {
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
    async markOnSite(requestId) {
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
    async completeDispatch(requestId) {
        const request = await this.repository.getDispatchRequest(requestId);
        if (!request)
            return null;
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
    async cancelDispatch(requestId, reason) {
        const request = await this.repository.getDispatchRequest(requestId);
        if (!request)
            return null;
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
exports.DispatchService = DispatchService;
//# sourceMappingURL=dispatch-service.js.map