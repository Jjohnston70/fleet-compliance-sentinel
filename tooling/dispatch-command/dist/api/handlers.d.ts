import { DispatchRequest, Driver, Truck } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
import { AssignmentResult } from '../services/dispatch-service';
/**
 * API handlers for dispatch operations.
 * These map to REST endpoints and LLM tool calls.
 */
export declare class DispatchAPIHandlers {
    private repository;
    private dispatchService;
    private driverService;
    private truckService;
    private slaService;
    constructor(repository: InMemoryRepository);
    createDispatchRequest(data: Partial<DispatchRequest> & {
        sla_hours_override?: number;
    }): Promise<DispatchRequest>;
    getDispatchRequest(id: string): Promise<DispatchRequest | null>;
    listDispatchRequests(): Promise<DispatchRequest[]>;
    updateDispatchRequest(id: string, updates: Partial<DispatchRequest>): Promise<DispatchRequest | null>;
    cancelDispatchRequest(id: string, reason: string): Promise<DispatchRequest | null>;
    assignDriver(requestId: string, driverId: string, truckId?: string): Promise<{
        success: boolean;
        assignment?: AssignmentResult;
        error?: string;
    }>;
    reassignDriver(requestId: string, newDriverId: string): Promise<{
        success: boolean;
        assignment?: AssignmentResult;
        error?: string;
    }>;
    listDrivers(): Promise<Driver[]>;
    getDriver(id: string): Promise<Driver | null>;
    getDriverAvailability(id: string): Promise<{
        driverId: string;
        available: boolean;
        canAcceptJob: boolean;
        status: string;
        jobsToday: number;
        maxJobsPerDay: number;
    } | null>;
    updateDriverStatus(id: string, status: string): Promise<Driver | null>;
    listTrucks(): Promise<Truck[]>;
    getTruckStatus(id: string): Promise<Truck | null>;
    getZoneStatus(zoneId: string): Promise<{
        zoneId: string;
        name: string;
        activeDrivers: Driver[];
        activeDriverts: Driver[];
        activeRequests: number;
        avgResponseTime: number;
    } | null>;
    checkSLAStatus(requestId: string): Promise<{
        requestId: string;
        status: string;
        timeRemaining: number;
        percentComplete: number;
    } | null>;
    findNearestDriver(requestId: string): Promise<{
        requestId: string;
        driverId?: string;
        travelTimeMinutes?: number;
        error?: string;
    } | null>;
    getDispatchMetrics(): Promise<{
        totalRequests: number;
        pendingRequests: number;
        dispatchedRequests: number;
        completedRequests: number;
        cancelledRequests: number;
        activeDrivers: number;
        availableTrucks: number;
    }>;
}
//# sourceMappingURL=handlers.d.ts.map