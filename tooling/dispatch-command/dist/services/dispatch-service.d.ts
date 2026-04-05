import { DispatchRequest, Location, Zone } from '../data/schema';
import { InMemoryRepository } from '../data/repository';
export interface AssignmentResult {
    requestId: string;
    driverId: string;
    truckId?: string;
    estimatedArrival: Date;
    travelTimeMinutes: number;
}
/**
 * DispatchService is the core dispatch engine.
 * Handles request creation, driver assignment, and status management.
 */
export declare class DispatchService {
    private repository;
    private driverService;
    private truckService;
    constructor(repository: InMemoryRepository);
    /**
     * Create a new dispatch request.
     */
    createDispatchRequest(request: DispatchRequest): Promise<DispatchRequest>;
    /**
     * Get dispatch request by ID.
     */
    getDispatchRequest(id: string): Promise<DispatchRequest | null>;
    /**
     * List all dispatch requests.
     */
    listDispatchRequests(): Promise<DispatchRequest[]>;
    /**
     * List dispatch requests by status.
     */
    listByStatus(status: string): Promise<DispatchRequest[]>;
    /**
     * Find nearest available driver to a request address.
     * First tries primary zone drivers, then backup zones.
     */
    findNearestDriver(zone: Zone, requestLocation: Location): Promise<{
        driverId: string;
        travelTimeMinutes: number;
    } | null>;
    /**
     * Assign driver and truck to a dispatch request.
     */
    assignDriver(requestId: string, driverId: string, truckId?: string): Promise<AssignmentResult>;
    /**
     * Reassign driver to a different dispatch request.
     */
    reassignDriver(requestId: string, newDriverId: string): Promise<AssignmentResult>;
    /**
     * Mark request as en_route.
     */
    markEnRoute(requestId: string): Promise<DispatchRequest | null>;
    /**
     * Mark request as on_site.
     */
    markOnSite(requestId: string): Promise<DispatchRequest | null>;
    /**
     * Mark request as completed.
     */
    completeDispatch(requestId: string): Promise<DispatchRequest | null>;
    /**
     * Cancel a dispatch request.
     */
    cancelDispatch(requestId: string, reason: string): Promise<DispatchRequest | null>;
}
//# sourceMappingURL=dispatch-service.d.ts.map