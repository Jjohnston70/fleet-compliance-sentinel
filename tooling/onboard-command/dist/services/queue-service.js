import { QueueItemStatus } from '../data/schema.js';
import { getConfig } from '../config/index.js';
export class StandardQueueService {
    constructor(repo) {
        this.repo = repo;
    }
    async processItem(itemId) {
        const item = await this.repo.getQueueItem(itemId);
        if (!item) {
            throw new Error(`Queue item ${itemId} not found`);
        }
        return this.repo.updateQueueItem(itemId, {
            status: QueueItemStatus.Processing,
            processed_at: new Date(),
        });
    }
    async markComplete(itemId, result) {
        const item = await this.repo.getQueueItem(itemId);
        if (!item) {
            throw new Error(`Queue item ${itemId} not found`);
        }
        return this.repo.updateQueueItem(itemId, {
            status: QueueItemStatus.Complete,
            result: result || null,
            processed_at: new Date(),
        });
    }
    async markFailed(itemId, error) {
        const item = await this.repo.getQueueItem(itemId);
        if (!item) {
            throw new Error(`Queue item ${itemId} not found`);
        }
        // Check if we can retry
        if (this.canRetry(item)) {
            return this.retryItem(itemId);
        }
        return this.repo.updateQueueItem(itemId, {
            status: QueueItemStatus.Failed,
            result: { error },
            processed_at: new Date(),
        });
    }
    canRetry(item) {
        const maxRetries = getConfig().maxQueueRetries;
        return item.retry_count < maxRetries;
    }
    async retryItem(itemId) {
        const item = await this.repo.getQueueItem(itemId);
        if (!item) {
            throw new Error(`Queue item ${itemId} not found`);
        }
        return this.repo.updateQueueItem(itemId, {
            status: QueueItemStatus.Queued,
            retry_count: item.retry_count + 1,
            processed_at: undefined,
        });
    }
}
