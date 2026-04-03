import { DEFAULT_ZONES, DEFAULT_DRIVERS, DEFAULT_TRUCKS } from '../data/seed-data';

export async function seedZones(repository: any): Promise<void> {
  for (const zone of DEFAULT_ZONES) {
    await repository.createZone(zone);
  }
}

export async function seedDrivers(repository: any): Promise<void> {
  // Update drivers with actual zone IDs
  const zones = await repository.listZones();
  const zoneMap = new Map(zones.map((z: any) => [z.name, z.id]));

  for (const driver of DEFAULT_DRIVERS) {
    // Map driver zone names to IDs
    let zoneId = driver.zone_id as string;
    if (driver.zone_id === 'zone-pueblo') {
      zoneId = (zoneMap.get('Pueblo') as string) || driver.zone_id;
    } else if (driver.zone_id === 'zone-cos-north') {
      zoneId = (zoneMap.get('COS North') as string) || driver.zone_id;
    } else if (driver.zone_id === 'zone-cos-central') {
      zoneId = (zoneMap.get('COS Central') as string) || driver.zone_id;
    } else if (driver.zone_id === 'zone-cos-east') {
      zoneId = (zoneMap.get('COS East') as string) || driver.zone_id;
    }

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

export async function seedTrucks(repository: any): Promise<void> {
  const zones = await repository.listZones();
  const zoneMap = new Map(zones.map((z: any) => [z.name, z.id]));

  for (const truck of DEFAULT_TRUCKS) {
    // Map truck zone names to IDs
    let zoneId = truck.zone_id as string;
    if (truck.zone_id === 'zone-pueblo') {
      zoneId = (zoneMap.get('Pueblo') as string) || truck.zone_id;
    } else if (truck.zone_id === 'zone-cos-north') {
      zoneId = (zoneMap.get('COS North') as string) || truck.zone_id;
    } else if (truck.zone_id === 'zone-cos-central') {
      zoneId = (zoneMap.get('COS Central') as string) || truck.zone_id;
    } else if (truck.zone_id === 'zone-cos-east') {
      zoneId = (zoneMap.get('COS East') as string) || truck.zone_id;
    }

    const truckWithZoneId = { ...truck, zone_id: zoneId };
    await repository.createTruck(truckWithZoneId);
  }
}

export async function seedAll(repository: any): Promise<void> {
  await seedZones(repository);
  await seedDrivers(repository);
  await seedTrucks(repository);
}
