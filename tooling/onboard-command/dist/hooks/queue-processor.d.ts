import { Repository } from '../data/repository.js';
import { ProvisioningQueueItem } from '../data/schema.js';
export interface QueueProcessor {
    processNextItem(): Promise<ProvisioningQueueItem | null>;
    processAllQueued(): Promise<ProvisioningQueueItem[]>;
}
export declare class StandardQueueProcessor implements QueueProcessor {
    private repo;
    private queueService;
    private stateMachine;
    constructor(repo: Repository);
    processNextItem(): Promise<ProvisioningQueueItem | null>;
    processAllQueued(): Promise<ProvisioningQueueItem[]>;
}
//# sourceMappingURL=queue-processor.d.ts.map