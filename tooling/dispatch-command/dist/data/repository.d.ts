import { DispatchRequest, Driver, Truck, Zone, Schedule, DispatchLog, SLABreach } from './schema';
/**
 * In-memory repository for dispatch command service.
 * Implements Repository pattern for easy testing and Firestore migration.
 */
export declare class InMemoryRepository {
    private dispatchRequests;
    private drivers;
    private trucks;
    private zones;
    private schedules;
    private logs;
    private slaBreaches;
    createDispatchRequest(request: DispatchRequest): Promise<DispatchRequest>;
    getDispatchRequest(id: string): Promise<DispatchRequest | null>;
    listDispatchRequests(): Promise<DispatchRequest[]>;
    updateDispatchRequest(id: string, updates: Partial<DispatchRequest>): Promise<DispatchRequest | null>;
    deleteDispatchRequest(id: string): Promise<boolean>;
    createDriver(driver: Driver): Promise<Driver>;
    getDriver(id: string): Promise<Driver | null>;
    listDrivers(): Promise<Driver[]>;
    updateDriver(id: string, updates: Partial<Driver>): Promise<Driver | null>;
    deleteDriver(id: string): Promise<boolean>;
    createTruck(truck: Truck): Promise<Truck>;
    getTruck(id: string): Promise<Truck | null>;
    listTrucks(): Promise<Truck[]>;
    updateTruck(id: string, updates: Partial<Truck>): Promise<Truck | null>;
    deleteTruck(id: string): Promise<boolean>;
    createZone(zone: Zone): Promise<Zone>;
    getZone(id: string): Promise<Zone | null>;
    listZones(): Promise<Zone[]>;
    updateZone(id: string, updates: Partial<Zone>): Promise<Zone | null>;
    createSchedule(schedule: Schedule): Promise<Schedule>;
    getSchedule(id: string): Promise<Schedule | null>;
    listSchedules(): Promise<Schedule[]>;
    updateSchedule(id: string, updates: Partial<Schedule>): Promise<Schedule | null>;
    createLog(log: DispatchLog): Promise<DispatchLog>;
    listLogs(): Promise<DispatchLog[]>;
    listLogsByRequestId(requestId: string): Promise<DispatchLog[]>;
    createSLABreach(breach: SLABreach): Promise<SLABreach>;
    getSLABreach(requestId: string): Promise<SLABreach | null>;
    updateSLABreach(requestId: string, updates: Partial<SLABreach>): Promise<SLABreach | null>;
    clear(): Promise<void>;
}
//# sourceMappingURL=repository.d.ts.map