import { DEFAULT_ZONES, DEFAULT_DRIVERS, DEFAULT_TRUCKS } from '../data/seed-data';
import { InMemoryRepository } from '../data/repository';
import { Zone } from '../data/schema';

const ZONE_NAME_BY_SEED_ID: Record<string, string> = {
  'zone-pueblo': 'Pueblo',
  'zone-cos-north': 'COS North',
  'zone-cos-central': 'COS Central',
  'zone-cos-east': 'COS East',
  'zone-cos-south': 'COS South',
};

function resolveZoneId(zoneMap: Map<string, string>, seedZoneId: string): string {
  const zoneName = ZONE_NAME_BY_SEED_ID[seedZoneId];
  if (!zoneName) return seedZoneId;
  return zoneMap.get(zoneName) ?? seedZoneId;
}

export async function seedZones(repository: InMemoryRepository): Promise<void> {
  for (const zone of DEFAULT_ZONES) {
    await repository.createZone(zone);
  }
}

export async function seedDrivers(repository: InMemoryRepository): Promise<void> {
  // Update drivers with actual zone IDs
  const zones = await repository.listZones();
  const zoneMap = new Map(zones.map((z: Zone) => [z.name, z.id]));

  for (const driver of DEFAULT_DRIVERS) {
    const zoneId = resolveZoneId(zoneMap, driver.zone_id);
    const driverWithZoneId = { ...driver, zone_id: zoneId };
    await repository.createDriver(driverWithZoneId);

    // Update zone to add driver as primary
    const zone = await repository.getZone(zoneId);
    if (zone) {
      zone.primary_drivers = [...(zone.primary_drivers || []), driver.id];
      await repository.updateZone(zoneId, { primary_drivers: zone.primary_drivers });
    }
  }
}

export async function seedTrucks(repository: InMemoryRepository): Promise<void> {
  const zones = await repository.listZones();
  const zoneMap = new Map(zones.map((z: Zone) => [z.name, z.id]));

  for (const truck of DEFAULT_TRUCKS) {
    const zoneId = resolveZoneId(zoneMap, truck.zone_id);
    const truckWithZoneId = { ...truck, zone_id: zoneId };
    await repository.createTruck(truckWithZoneId);
  }
}

export async function seedAll(repository: InMemoryRepository): Promise<void> {
  await seedZones(repository);
  await seedDrivers(repository);
  await seedTrucks(repository);
}
