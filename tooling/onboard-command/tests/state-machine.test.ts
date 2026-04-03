import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository.js';
import { OnboardingStateMachine } from '../src/services/state-machine.js';
import { OnboardingStatus, QueueItemStatus, OnboardingRequestSchema, OnboardingMode } from '../src/data/schema.js';

describe('State Machine', () => {
  let repo: InMemoryRepository;
  let stateMachine: OnboardingStateMachine;

  beforeEach(() => {
    repo = new InMemoryRepository();
    stateMachine = new OnboardingStateMachine(repo);
  });

  it('should initialize request and create queue items', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Test Client',
      contact_email: 'contact@test.com',
      employees: [
        {
          name: 'John Doe',
          email: 'john@test.com',
          department: 'Engineering',
          role: 'Developer',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    expect(initialized.status).toBe(OnboardingStatus.Provisioning);

    const queueItems = await repo.getQueueItemsByRequest(initialized.id);
    expect(queueItems.length).toBe(6); // 6 actions per employee
  });

  it('should transition to complete when all queue items complete', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Test Client',
      contact_email: 'contact@test.com',
      employees: [
        {
          name: 'Jane Doe',
          email: 'jane@test.com',
          department: 'Operations',
          role: 'Manager',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);

    // Mark all items as complete
    for (const item of queueItems) {
      await repo.updateQueueItem(item.id, { status: QueueItemStatus.Complete });
    }

    const newStatus = await stateMachine.evaluateState(initialized.id);
    expect(newStatus).toBe(OnboardingStatus.Complete);

    const updated = await stateMachine.transitionState(initialized.id, newStatus);
    expect(updated.status).toBe(OnboardingStatus.Complete);
    expect(updated.completed_at).toBeDefined();
  });

  it('should transition to partial when some items fail', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Test Client',
      contact_email: 'contact@test.com',
      employees: [
        {
          name: 'Bob Smith',
          email: 'bob@test.com',
          department: 'Sales',
          role: 'Rep',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);

    // Mark some as complete, some as failed
    for (let i = 0; i < queueItems.length; i++) {
      const status = i < 4 ? QueueItemStatus.Complete : QueueItemStatus.Failed;
      await repo.updateQueueItem(queueItems[i].id, { status });
    }

    const newStatus = await stateMachine.evaluateState(initialized.id);
    expect(newStatus).toBe(OnboardingStatus.Partial);
  });

  it('should remain in provisioning while items are queued', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Test Client',
      contact_email: 'contact@test.com',
      employees: [
        {
          name: 'Alice Johnson',
          email: 'alice@test.com',
          department: 'Finance',
          role: 'Analyst',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const status = await stateMachine.evaluateState(initialized.id);
    expect(status).toBe(OnboardingStatus.Provisioning);
  });

  it('should handle multiple employees', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Multi Employee Client',
      contact_email: 'contact@multitest.com',
      employees: [
        {
          name: 'Employee 1',
          email: 'emp1@test.com',
          department: 'Engineering',
          role: 'Dev',
          license_type: 'standard',
        },
        {
          name: 'Employee 2',
          email: 'emp2@test.com',
          department: 'Sales',
          role: 'Rep',
          license_type: 'standard',
        },
        {
          name: 'Employee 3',
          email: 'emp3@test.com',
          department: 'Operations',
          role: 'Manager',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);
    expect(queueItems.length).toBe(18); // 3 employees × 6 actions
  });
});
