"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DriverService = void 0;
/**
 * DriverService handles driver management, availability checking, and workload balancing.
 */
class DriverService {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * Create a new driver.
     */
    async createDriver(driver) {
        return this.repository.createDriver(driver);
    }
    /**
     * Get driver by ID.
     */
    async getDriver(id) {
        return this.repository.getDriver(id);
    }
    /**
     * List all drivers.
     */
    async listDrivers() {
        return this.repository.listDrivers();
    }
    /**
     * Get drivers by zone ID.
     */
    async getDriversByZone(zoneId) {
        const drivers = await this.repository.listDrivers();
        return drivers.filter((d) => d.zone_id === zoneId);
    }
    /**
     * Get available drivers (status === 'available').
     */
    async getAvailableDrivers() {
        const drivers = await this.repository.listDrivers();
        return drivers.filter((d) => d.active &&
            d.status === 'available' &&
            d.jobs_today < d.max_jobs_per_day);
    }
    /**
     * Get available drivers in a specific zone.
     */
    async getAvailableDriversInZone(zoneId) {
        const drivers = await this.repository.listDrivers();
        return drivers.filter((d) => d.active &&
            d.zone_id === zoneId &&
            d.status === 'available' &&
            d.jobs_today < d.max_jobs_per_day);
    }
    /**
     * Check if driver can accept more jobs.
     */
    async canAcceptJob(driverId) {
        const driver = await this.repository.getDriver(driverId);
        if (!driver)
            return false;
        return driver.active && driver.status === 'available' && driver.jobs_today < driver.max_jobs_per_day;
    }
    /**
     * Check if driver has required certification.
     */
    hasCertification(driver, certification) {
        return driver.certifications.includes(certification);
    }
    /**
     * Update driver status.
     */
    async updateDriverStatus(driverId, status) {
        return this.repository.updateDriver(driverId, { status });
    }
    /**
     * Increment driver's daily job count.
     */
    async incrementJobCount(driverId) {
        const driver = await this.repository.getDriver(driverId);
        if (!driver)
            return null;
        return this.repository.updateDriver(driverId, { jobs_today: driver.jobs_today + 1 });
    }
    /**
     * Decrement driver's daily job count.
     */
    async decrementJobCount(driverId) {
        const driver = await this.repository.getDriver(driverId);
        if (!driver)
            return null;
        if (driver.jobs_today > 0) {
            return this.repository.updateDriver(driverId, { jobs_today: driver.jobs_today - 1 });
        }
        return driver;
    }
    /**
     * Reset daily job counts for all drivers (call once per day).
     */
    async resetDailyJobCounts() {
        const drivers = await this.repository.listDrivers();
        for (const driver of drivers) {
            if (driver.jobs_today > 0) {
                await this.repository.updateDriver(driver.id, { jobs_today: 0 });
            }
        }
    }
    /**
     * Update driver location.
     */
    async updateDriverLocation(driverId, lat, lng) {
        return this.repository.updateDriver(driverId, {
            current_location: { lat, lng },
        });
    }
    /**
     * Delete driver (soft delete by setting active to false).
     */
    async deactivateDriver(driverId) {
        return this.repository.updateDriver(driverId, { active: false });
    }
    /**
     * Activate driver.
     */
    async activateDriver(driverId) {
        return this.repository.updateDriver(driverId, { active: true });
    }
}
exports.DriverService = DriverService;
//# sourceMappingURL=driver-service.js.map