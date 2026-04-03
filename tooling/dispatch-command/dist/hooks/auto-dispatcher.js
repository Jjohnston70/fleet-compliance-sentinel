"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoDispatcher = void 0;
const dispatch_service_1 = require("../services/dispatch-service");
/**
 * AutoDispatcher automatically assigns drivers to pending requests.
 * Runs continuously or on interval, finding nearest available drivers.
 */
class AutoDispatcher {
    constructor(repository) {
        this.repository = repository;
        this.dispatchService = new dispatch_service_1.DispatchService(repository);
    }
    /**
     * Process all pending requests and auto-assign drivers.
     */
    async processPendingRequests() {
        const results = [];
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
            }
            catch (error) {
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
exports.AutoDispatcher = AutoDispatcher;
//# sourceMappingURL=auto-dispatcher.js.map