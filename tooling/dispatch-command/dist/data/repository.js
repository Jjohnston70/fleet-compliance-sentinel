"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryRepository = void 0;
/**
 * In-memory repository for dispatch command service.
 * Implements Repository pattern for easy testing and Firestore migration.
 */
class InMemoryRepository {
    constructor() {
        this.dispatchRequests = new Map();
        this.drivers = new Map();
        this.trucks = new Map();
        this.zones = new Map();
        this.schedules = new Map();
        this.logs = [];
        this.slaBreaches = new Map();
    }
    // DispatchRequest methods
    async createDispatchRequest(request) {
        this.dispatchRequests.set(request.id, request);
        return request;
    }
    async getDispatchRequest(id) {
        return this.dispatchRequests.get(id) ?? null;
    }
    async listDispatchRequests() {
        return Array.from(this.dispatchRequests.values());
    }
    async updateDispatchRequest(id, updates) {
        const existing = this.dispatchRequests.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates, updated_at: new Date() };
        this.dispatchRequests.set(id, updated);
        return updated;
    }
    async deleteDispatchRequest(id) {
        return this.dispatchRequests.delete(id);
    }
    // Driver methods
    async createDriver(driver) {
        this.drivers.set(driver.id, driver);
        return driver;
    }
    async getDriver(id) {
        return this.drivers.get(id) ?? null;
    }
    async listDrivers() {
        return Array.from(this.drivers.values());
    }
    async updateDriver(id, updates) {
        const existing = this.drivers.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.drivers.set(id, updated);
        return updated;
    }
    async deleteDriver(id) {
        return this.drivers.delete(id);
    }
    // Truck methods
    async createTruck(truck) {
        this.trucks.set(truck.id, truck);
        return truck;
    }
    async getTruck(id) {
        return this.trucks.get(id) ?? null;
    }
    async listTrucks() {
        return Array.from(this.trucks.values());
    }
    async updateTruck(id, updates) {
        const existing = this.trucks.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.trucks.set(id, updated);
        return updated;
    }
    async deleteTruck(id) {
        return this.trucks.delete(id);
    }
    // Zone methods
    async createZone(zone) {
        this.zones.set(zone.id, zone);
        return zone;
    }
    async getZone(id) {
        return this.zones.get(id) ?? null;
    }
    async listZones() {
        return Array.from(this.zones.values());
    }
    async updateZone(id, updates) {
        const existing = this.zones.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.zones.set(id, updated);
        return updated;
    }
    // Schedule methods
    async createSchedule(schedule) {
        this.schedules.set(schedule.id, schedule);
        return schedule;
    }
    async getSchedule(id) {
        return this.schedules.get(id) ?? null;
    }
    async listSchedules() {
        return Array.from(this.schedules.values());
    }
    async updateSchedule(id, updates) {
        const existing = this.schedules.get(id);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.schedules.set(id, updated);
        return updated;
    }
    // Log methods
    async createLog(log) {
        this.logs.push(log);
        return log;
    }
    async listLogs() {
        return [...this.logs];
    }
    async listLogsByRequestId(requestId) {
        return this.logs.filter((log) => log.request_id === requestId);
    }
    // SLA Breach methods
    async createSLABreach(breach) {
        this.slaBreaches.set(breach.request_id, breach);
        return breach;
    }
    async getSLABreach(requestId) {
        return this.slaBreaches.get(requestId) ?? null;
    }
    async updateSLABreach(requestId, updates) {
        const existing = this.slaBreaches.get(requestId);
        if (!existing)
            return null;
        const updated = { ...existing, ...updates };
        this.slaBreaches.set(requestId, updated);
        return updated;
    }
    // Clear all data (useful for testing)
    async clear() {
        this.dispatchRequests.clear();
        this.drivers.clear();
        this.trucks.clear();
        this.zones.clear();
        this.schedules.clear();
        this.logs = [];
        this.slaBreaches.clear();
    }
}
exports.InMemoryRepository = InMemoryRepository;
//# sourceMappingURL=repository.js.map