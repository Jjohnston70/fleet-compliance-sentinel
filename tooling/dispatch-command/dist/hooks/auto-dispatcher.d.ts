import { InMemoryRepository } from '../data/repository';
export interface AutoDispatchResult {
    requestId: string;
    dispatched: boolean;
    driverId?: string;
    message: string;
}
/**
 * AutoDispatcher automatically assigns drivers to pending requests.
 * Runs continuously or on interval, finding nearest available drivers.
 */
export declare class AutoDispatcher {
    private repository;
    private dispatchService;
    constructor(repository: InMemoryRepository);
    /**
     * Process all pending requests and auto-assign drivers.
     */
    processPendingRequests(): Promise<AutoDispatchResult[]>;
}
//# sourceMappingURL=auto-dispatcher.d.ts.map