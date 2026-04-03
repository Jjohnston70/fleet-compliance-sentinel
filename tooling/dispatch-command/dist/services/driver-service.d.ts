import { Driver, DriverStatus } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
/**
 * DriverService handles driver management, availability checking, and workload balancing.
 */
export declare class DriverService {
    private repository;
    constructor(repository: InMemoryRepository);
    /**
     * Create a new driver.
     */
    createDriver(driver: Driver): Promise<Driver>;
    /**
     * Get driver by ID.
     */
    getDriver(id: string): Promise<Driver | null>;
    /**
     * List all drivers.
     */
    listDrivers(): Promise<Driver[]>;
    /**
     * Get drivers by zone ID.
     */
    getDriversByZone(zoneId: string): Promise<Driver[]>;
    /**
     * Get available drivers (status === 'available').
     */
    getAvailableDrivers(): Promise<Driver[]>;
    /**
     * Get available drivers in a specific zone.
     */
    getAvailableDriversInZone(zoneId: string): Promise<Driver[]>;
    /**
     * Check if driver can accept more jobs.
     */
    canAcceptJob(driverId: string): Promise<boolean>;
    /**
     * Check if driver has required certification.
     */
    hasCertification(driver: Driver, certification: string): boolean;
    /**
     * Update driver status.
     */
    updateDriverStatus(driverId: string, status: DriverStatus): Promise<Driver | null>;
    /**
     * Increment driver's daily job count.
     */
    incrementJobCount(driverId: string): Promise<Driver | null>;
    /**
     * Decrement driver's daily job count.
     */
    decrementJobCount(driverId: string): Promise<Driver | null>;
    /**
     * Reset daily job counts for all drivers (call once per day).
     */
    resetDailyJobCounts(): Promise<void>;
    /**
     * Update driver location.
     */
    updateDriverLocation(driverId: string, lat: number, lng: number): Promise<Driver | null>;
    /**
     * Delete driver (soft delete by setting active to false).
     */
    deactivateDriver(driverId: string): Promise<Driver | null>;
    /**
     * Activate driver.
     */
    activateDriver(driverId: string): Promise<Driver | null>;
}
//# sourceMappingURL=driver-service.d.ts.map