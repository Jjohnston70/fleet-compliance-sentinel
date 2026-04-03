"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedZones = seedZones;
exports.seedDrivers = seedDrivers;
exports.seedTrucks = seedTrucks;
exports.seedAll = seedAll;
const seed_data_1 = require("../data/seed-data");
async function seedZones(repository) {
    for (const zone of seed_data_1.DEFAULT_ZONES) {
        await repository.createZone(zone);
    }
}
async function seedDrivers(repository) {
    // Update drivers with actual zone IDs
    const zones = await repository.listZones();
    const zoneMap = new Map(zones.map((z) => [z.name, z.id]));
    for (const driver of seed_data_1.DEFAULT_DRIVERS) {
        // Map driver zone names to IDs
        let zoneId = driver.zone_id;
        if (driver.zone_id === 'zone-pueblo') {
            zoneId = zoneMap.get('Pueblo') || driver.zone_id;
        }
        else if (driver.zone_id === 'zone-cos-north') {
            zoneId = zoneMap.get('COS North') || driver.zone_id;
        }
        else if (driver.zone_id === 'zone-cos-central') {
            zoneId = zoneMap.get('COS Central') || driver.zone_id;
        }
        else if (driver.zone_id === 'zone-cos-east') {
            zoneId = zoneMap.get('COS East') || driver.zone_id;
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
async function seedTrucks(repository) {
    const zones = await repository.listZones();
    const zoneMap = new Map(zones.map((z) => [z.name, z.id]));
    for (const truck of seed_data_1.DEFAULT_TRUCKS) {
        // Map truck zone names to IDs
        let zoneId = truck.zone_id;
        if (truck.zone_id === 'zone-pueblo') {
            zoneId = zoneMap.get('Pueblo') || truck.zone_id;
        }
        else if (truck.zone_id === 'zone-cos-north') {
            zoneId = zoneMap.get('COS North') || truck.zone_id;
        }
        else if (truck.zone_id === 'zone-cos-central') {
            zoneId = zoneMap.get('COS Central') || truck.zone_id;
        }
        else if (truck.zone_id === 'zone-cos-east') {
            zoneId = zoneMap.get('COS East') || truck.zone_id;
        }
        const truckWithZoneId = { ...truck, zone_id: zoneId };
        await repository.createTruck(truckWithZoneId);
    }
}
async function seedAll(repository) {
    await seedZones(repository);
    await seedDrivers(repository);
    await seedTrucks(repository);
}
//# sourceMappingURL=zone-seeds.js.map