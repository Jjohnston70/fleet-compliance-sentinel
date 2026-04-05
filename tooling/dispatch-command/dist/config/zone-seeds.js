"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedZones = seedZones;
exports.seedDrivers = seedDrivers;
exports.seedTrucks = seedTrucks;
exports.seedAll = seedAll;
const seed_data_1 = require("../data/seed-data");
const ZONE_NAME_BY_SEED_ID = {
    'zone-pueblo': 'Pueblo',
    'zone-cos-north': 'COS North',
    'zone-cos-central': 'COS Central',
    'zone-cos-east': 'COS East',
    'zone-cos-south': 'COS South',
};
function resolveZoneId(zoneMap, seedZoneId) {
    const zoneName = ZONE_NAME_BY_SEED_ID[seedZoneId];
    if (!zoneName)
        return seedZoneId;
    return zoneMap.get(zoneName) ?? seedZoneId;
}
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
async function seedTrucks(repository) {
    const zones = await repository.listZones();
    const zoneMap = new Map(zones.map((z) => [z.name, z.id]));
    for (const truck of seed_data_1.DEFAULT_TRUCKS) {
        const zoneId = resolveZoneId(zoneMap, truck.zone_id);
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