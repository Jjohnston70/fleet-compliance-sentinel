import { ProvisioningQueueItem } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface QueueService {
    processItem(itemId: string): Promise<ProvisioningQueueItem>;
    markComplete(itemId: string, result?: Record<string, any>): Promise<ProvisioningQueueItem>;
    markFailed(itemId: string, error: string): Promise<ProvisioningQueueItem>;
    retryItem(itemId: string): Promise<ProvisioningQueueItem>;
    canRetry(item: ProvisioningQueueItem): boolean;
}
export declare class StandardQueueService implements QueueService {
    private repo;
    constructor(repo: Repository);
    processItem(itemId: string): Promise<ProvisioningQueueItem>;
    markComplete(itemId: string, result?: Record<string, any>): Promise<ProvisioningQueueItem>;
    markFailed(itemId: string, error: string): Promise<ProvisioningQueueItem>;
    canRetry(item: ProvisioningQueueItem): boolean;
    retryItem(itemId: string): Promise<ProvisioningQueueItem>;
}
//# sourceMappingURL=queue-service.d.ts.map