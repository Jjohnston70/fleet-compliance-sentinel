import { Driver, DriverStatus } from '../data/schema';
import { InMemoryRepository } from '../data/repository';

/**
 * DriverService handles driver management, availability checking, and workload balancing.
 */
export class DriverService {
  constructor(private repository: InMemoryRepository) {}

  /**
   * Create a new driver.
   */
  async createDriver(driver: Driver): Promise<Driver> {
    return this.repository.createDriver(driver);
  }

  /**
   * Get driver by ID.
   */
  async getDriver(id: string): Promise<Driver | null> {
    return this.repository.getDriver(id);
  }

  /**
   * List all drivers.
   */
  async listDrivers(): Promise<Driver[]> {
    return this.repository.listDrivers();
  }

  /**
   * Get drivers by zone ID.
   */
  async getDriversByZone(zoneId: string): Promise<Driver[]> {
    const drivers = await this.repository.listDrivers();
    return drivers.filter((d) => d.zone_id === zoneId);
  }

  /**
   * Get available drivers (status === 'available').
   */
  async getAvailableDrivers(): Promise<Driver[]> {
    const drivers = await this.repository.listDrivers();
    return drivers.filter(
      (d) =>
        d.active &&
        d.status === 'available' &&
        d.jobs_today < d.max_jobs_per_day
    );
  }

  /**
   * Get available drivers in a specific zone.
   */
  async getAvailableDriversInZone(zoneId: string): Promise<Driver[]> {
    const drivers = await this.repository.listDrivers();
    return drivers.filter(
      (d) =>
        d.active &&
        d.zone_id === zoneId &&
        d.status === 'available' &&
        d.jobs_today < d.max_jobs_per_day
    );
  }

  /**
   * Check if driver can accept more jobs.
   */
  async canAcceptJob(driverId: string): Promise<boolean> {
    const driver = await this.repository.getDriver(driverId);
    if (!driver) return false;
    return driver.active && driver.status === 'available' && driver.jobs_today < driver.max_jobs_per_day;
  }

  /**
   * Check if driver has required certification.
   */
  hasCertification(driver: Driver, certification: string): boolean {
    return driver.certifications.includes(certification);
  }

  /**
   * Update driver status.
   */
  async updateDriverStatus(driverId: string, status: DriverStatus): Promise<Driver | null> {
    return this.repository.updateDriver(driverId, { status });
  }

  /**
   * Increment driver's daily job count.
   */
  async incrementJobCount(driverId: string): Promise<Driver | null> {
    const driver = await this.repository.getDriver(driverId);
    if (!driver) return null;
    return this.repository.updateDriver(driverId, { jobs_today: driver.jobs_today + 1 });
  }

  /**
   * Decrement driver's daily job count.
   */
  async decrementJobCount(driverId: string): Promise<Driver | null> {
    const driver = await this.repository.getDriver(driverId);
    if (!driver) return null;
    if (driver.jobs_today > 0) {
      return this.repository.updateDriver(driverId, { jobs_today: driver.jobs_today - 1 });
    }
    return driver;
  }

  /**
   * Reset daily job counts for all drivers (call once per day).
   */
  async resetDailyJobCounts(): Promise<void> {
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
  async updateDriverLocation(driverId: string, lat: number, lng: number): Promise<Driver | null> {
    return this.repository.updateDriver(driverId, {
      current_location: { lat, lng },
    });
  }

  /**
   * Delete driver (soft delete by setting active to false).
   */
  async deactivateDriver(driverId: string): Promise<Driver | null> {
    return this.repository.updateDriver(driverId, { active: false });
  }

  /**
   * Activate driver.
   */
  async activateDriver(driverId: string): Promise<Driver | null> {
    return this.repository.updateDriver(driverId, { active: true });
  }
}
