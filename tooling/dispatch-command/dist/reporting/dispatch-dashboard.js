"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DispatchDashboard = void 0;
const dispatch_service_1 = require("../services/dispatch-service");
const driver_service_1 = require("../services/driver-service");
/**
 * DispatchDashboard provides real-time dispatch metrics.
 */
class DispatchDashboard {
    constructor(repository) {
        this.repository = repository;
        this.dispatchService = new dispatch_service_1.DispatchService(repository);
        this.driverService = new driver_service_1.DriverService(repository);
    }
    /**
     * Get current dashboard metrics.
     */
    async getDashboardMetrics() {
        const requests = await this.dispatchService.listDispatchRequests();
        const drivers = await this.driverService.listDrivers();
        const zones = await this.repository.listZones();
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const completedToday = requests.filter((r) => {
            const createdStr = r.created_at.toISOString().split('T')[0];
            return r.status === 'completed' && createdStr === todayStr;
        }).length;
        const cancelledToday = requests.filter((r) => {
            const createdStr = r.created_at.toISOString().split('T')[0];
            return r.status === 'cancelled' && createdStr === todayStr;
        }).length;
        const zoneHeatmap = zones.map((zone) => {
            const zoneRequests = requests.filter((r) => r.zone_id === zone.id &&
                r.status !== 'completed' &&
                r.status !== 'cancelled');
            return {
                zoneId: zone.id,
                zoneName: zone.name,
                activeRequestCount: zoneRequests.length,
                avgResponseTimeMinutes: zone.avg_response_time_minutes,
            };
        });
        return {
            activeRequests: {
                pending: requests.filter((r) => r.status === 'pending').length,
                dispatched: requests.filter((r) => r.status === 'dispatched').length,
                en_route: requests.filter((r) => r.status === 'en_route').length,
                on_site: requests.filter((r) => r.status === 'on_site').length,
            },
            driverUtilization: {
                available: drivers.filter((d) => d.status === 'available').length,
                en_route: drivers.filter((d) => d.status === 'en_route').length,
                on_site: drivers.filter((d) => d.status === 'on_site').length,
                off_duty: drivers.filter((d) => d.status === 'off_duty').length,
            },
            zoneHeatmap,
            completedToday,
            cancelledToday,
        };
    }
}
exports.DispatchDashboard = DispatchDashboard;
//# sourceMappingURL=dispatch-dashboard.js.map