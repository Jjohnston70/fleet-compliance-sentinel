import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { InMemoryRepository } from '../src/data/repository.js';
import { StandardQueueService } from '../src/services/queue-service.js';
import { QueueItemStatus, ProvisioningQueueItemSchema, QueueActionType } from '../src/data/schema.js';

describe('Queue Service', () => {
  let repo: InMemoryRepository;
  let queueService: StandardQueueService;

  beforeEach(() => {
    repo = new InMemoryRepository();
    queueService = new StandardQueueService(repo);
  });

  it('should mark item as processing', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.CreateUser,
      status: QueueItemStatus.Queued,
    });

    await repo.createQueueItem(item);
    const processed = await queueService.processItem(item.id);

    expect(processed.status).toBe(QueueItemStatus.Processing);
    expect(processed.processed_at).toBeDefined();
  });

  it('should mark item as complete with result', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp2@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.AssignLicense,
      status: QueueItemStatus.Queued,
    });

    await repo.createQueueItem(item);
    const completed = await queueService.markComplete(item.id, {
      license_assigned: true,
      timestamp: new Date().toISOString(),
    });

    expect(completed.status).toBe(QueueItemStatus.Complete);
    expect(completed.result).toEqual({
      license_assigned: true,
      timestamp: expect.any(String),
    });
  });

  it('should retry item when below max retries', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp3@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.CreateDrive,
      status: QueueItemStatus.Processing,
      retry_count: 0,
    });

    await repo.createQueueItem(item);
    const result = await queueService.markFailed(item.id, 'Test error');

    expect(result.status).toBe(QueueItemStatus.Queued);
    expect(result.retry_count).toBe(1);
  });

  it('should fail item when max retries exceeded', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp4@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.CreateFolders,
      status: QueueItemStatus.Processing,
      retry_count: 3,
    });

    await repo.createQueueItem(item);
    const result = await queueService.markFailed(item.id, 'Max retries exceeded');

    expect(result.status).toBe(QueueItemStatus.Failed);
    expect(result.retry_count).toBe(3);
  });

  it('should correctly identify when retry is possible', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp5@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.CreateLabels,
      status: QueueItemStatus.Queued,
      retry_count: 1,
    });

    expect(queueService.canRetry(item)).toBe(true);

    const maxedOut = ProvisioningQueueItemSchema.parse({
      ...item,
      retry_count: 3,
    });

    expect(queueService.canRetry(maxedOut)).toBe(false);
  });

  it('should track retry count progression', async () => {
    const item = ProvisioningQueueItemSchema.parse({
      request_id: randomUUID(),
      employee_email: 'emp6@test.com',
      employee_id: randomUUID(),
      action: QueueActionType.GenerateDocs,
      status: QueueItemStatus.Processing,
      retry_count: 0,
    });

    await repo.createQueueItem(item);

    const retry1 = await queueService.markFailed(item.id, 'Error 1');
    expect(retry1.retry_count).toBe(1);

    const retry2 = await queueService.markFailed(retry1.id, 'Error 2');
    expect(retry2.retry_count).toBe(2);

    const retry3 = await queueService.markFailed(retry2.id, 'Error 3');
    expect(retry3.retry_count).toBe(3);

    const failed = await queueService.markFailed(retry3.id, 'Error 4');
    expect(failed.status).toBe(QueueItemStatus.Failed);
  });
});
