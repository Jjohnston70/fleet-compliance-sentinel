import { QueueItemStatus, ProvisioningQueueItem } from '../data/schema.js';
import { Repository } from '../data/repository.js';
import { getConfig } from '../config/index.js';

export interface QueueService {
  processItem(itemId: string): Promise<ProvisioningQueueItem>;
  markComplete(itemId: string, result?: Record<string, any>): Promise<ProvisioningQueueItem>;
  markFailed(itemId: string, error: string): Promise<ProvisioningQueueItem>;
  retryItem(itemId: string): Promise<ProvisioningQueueItem>;
  canRetry(item: ProvisioningQueueItem): boolean;
}

export class StandardQueueService implements QueueService {
  constructor(private repo: Repository) {}

  async processItem(itemId: string): Promise<ProvisioningQueueItem> {
    const item = await this.repo.getQueueItem(itemId);
    if (!item) {
      throw new Error(`Queue item ${itemId} not found`);
    }

    return this.repo.updateQueueItem(itemId, {
      status: QueueItemStatus.Processing,
      processed_at: new Date(),
    });
  }

  async markComplete(itemId: string, result?: Record<string, any>): Promise<ProvisioningQueueItem> {
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

  async markFailed(itemId: string, error: string): Promise<ProvisioningQueueItem> {
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

  canRetry(item: ProvisioningQueueItem): boolean {
    const maxRetries = getConfig().maxQueueRetries;
    return item.retry_count < maxRetries;
  }

  async retryItem(itemId: string): Promise<ProvisioningQueueItem> {
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
