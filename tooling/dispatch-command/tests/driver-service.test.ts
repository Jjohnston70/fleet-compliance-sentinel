import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository';
import { DriverService } from '../src/services/driver-service';
import { Driver } from '../src/data/schema';

describe('DriverService', () => {
  let repository: InMemoryRepository;
  let service: DriverService;

  const testDriver: Driver = {
    id: crypto.randomUUID(),
    name: 'John Doe',
    phone: '(555) 123-4567',
    email: 'john@hvac.local',
    zone_id: 'zone-1',
    status: 'available',
    certifications: ['EPA-609'],
    current_location: { lat: 39.0, lng: -104.8 },
    shift_start: new Date(),
    shift_end: new Date(Date.now() + 8 * 60 * 60 * 1000),
    jobs_today: 0,
    max_jobs_per_day: 8,
    rating: 4.8,
    active: true,
  };

  beforeEach(async () => {
    repository = new InMemoryRepository();
    service = new DriverService(repository);
  });

  describe('createDriver', () => {
    it('should create a driver', async () => {
      const driver = await service.createDriver(testDriver);
      expect(driver.name).toBe('John Doe');
      expect(driver.status).toBe('available');
    });
  });

  describe('getAvailableDrivers', () => {
    it('should return only available drivers with capacity', async () => {
      const driver1 = { ...testDriver, id: crypto.randomUUID(), status: 'available', jobs_today: 0 };
      const driver2 = { ...testDriver, id: crypto.randomUUID(), status: 'on_site', jobs_today: 0 };
      const driver3 = { ...testDriver, id: crypto.randomUUID(), status: 'available', jobs_today: 8 };

      await service.createDriver(driver1);
      await service.createDriver(driver2);
      await service.createDriver(driver3);

      const available = await service.getAvailableDrivers();

      expect(available.length).toBe(1);
      expect(available[0].id).toBe(driver1.id);
    });
  });

  describe('canAcceptJob', () => {
    it('should return true for available driver with capacity', async () => {
      await service.createDriver(testDriver);
      const canAccept = await service.canAcceptJob(testDriver.id);
      expect(canAccept).toBe(true);
    });

    it('should return false if at max capacity', async () => {
      const maxedDriver = { ...testDriver, jobs_today: 8 };
      await service.createDriver(maxedDriver);
      const canAccept = await service.canAcceptJob(maxedDriver.id);
      expect(canAccept).toBe(false);
    });

    it('should return false if not available', async () => {
      const busyDriver = { ...testDriver, status: 'on_site' };
      await service.createDriver(busyDriver);
      const canAccept = await service.canAcceptJob(busyDriver.id);
      expect(canAccept).toBe(false);
    });
  });

  describe('incrementJobCount', () => {
    it('should increment daily job count', async () => {
      await service.createDriver(testDriver);
      const updated = await service.incrementJobCount(testDriver.id);
      expect(updated?.jobs_today).toBe(1);
    });

    it('should not exceed max jobs per day', async () => {
      const maxedDriver = { ...testDriver, jobs_today: 7 };
      await service.createDriver(maxedDriver);
      const updated = await service.incrementJobCount(maxedDriver.id);
      expect(updated?.jobs_today).toBe(8);
    });
  });

  describe('hasCertification', () => {
    it('should return true if driver has certification', () => {
      const hasIt = service.hasCertification(testDriver, 'EPA-609');
      expect(hasIt).toBe(true);
    });

    it('should return false if missing certification', () => {
      const hasIt = service.hasCertification(testDriver, 'EPA-608');
      expect(hasIt).toBe(false);
    });
  });

  describe('deactivateDriver', () => {
    it('should deactivate a driver', async () => {
      await service.createDriver(testDriver);
      const deactivated = await service.deactivateDriver(testDriver.id);
      expect(deactivated?.active).toBe(false);
    });
  });

  describe('resetDailyJobCounts', () => {
    it('should reset all drivers job counts', async () => {
      const driver1 = { ...testDriver, id: crypto.randomUUID(), jobs_today: 5 };
      const driver2 = { ...testDriver, id: crypto.randomUUID(), jobs_today: 3 };

      await service.createDriver(driver1);
      await service.createDriver(driver2);

      await service.resetDailyJobCounts();

      const updated1 = await service.getDriver(driver1.id);
      const updated2 = await service.getDriver(driver2.id);

      expect(updated1?.jobs_today).toBe(0);
      expect(updated2?.jobs_today).toBe(0);
    });
  });
});
