import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository.js';
import { StandardRollbackEngine } from '../src/services/rollback-engine.js';
import { StandardAuditService } from '../src/services/audit-service.js';
import { OnboardingStateMachine } from '../src/services/state-machine.js';
import { QueueItemStatus, OnboardingStatus, OnboardingRequestSchema, OnboardingMode } from '../src/data/schema.js';

describe('Rollback Engine', () => {
  let repo: InMemoryRepository;
  let rollbackEngine: StandardRollbackEngine;
  let auditService: StandardAuditService;
  let stateMachine: OnboardingStateMachine;

  beforeEach(() => {
    repo = new InMemoryRepository();
    auditService = new StandardAuditService(repo);
    rollbackEngine = new StandardRollbackEngine(repo, auditService);
    stateMachine = new OnboardingStateMachine(repo);
  });

  it('should generate reverse actions for completed items', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Rollback Test Client',
      contact_email: 'contact@rollback.com',
      employees: [
        {
          name: 'Test Employee',
          email: 'test@rollback.com',
          department: 'Engineering',
          role: 'Developer',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);

    // Mark some as complete
    for (let i = 0; i < 3; i++) {
      await repo.updateQueueItem(queueItems[i].id, { status: QueueItemStatus.Complete });
    }

    const rolledBack = await rollbackEngine.rollbackRequest(initialized.id, 'Test rollback');
    expect(rolledBack.status).toBe(OnboardingStatus.RolledBack);

    // Check that reverse actions were created
    const allItems = await repo.getQueueItemsByRequest(initialized.id);
    const newQueuedItems = allItems.filter((item) => item.status === QueueItemStatus.Queued);
    expect(newQueuedItems.length).toBeGreaterThan(0);
  });

  it('should log rollback action in audit log', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Audit Rollback Test',
      contact_email: 'contact@audit.com',
      employees: [
        {
          name: 'Audit Test Emp',
          email: 'audit@test.com',
          department: 'Operations',
          role: 'Manager',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);

    // Mark all as complete
    for (const item of queueItems) {
      await repo.updateQueueItem(item.id, { status: QueueItemStatus.Complete });
    }

    await rollbackEngine.rollbackRequest(initialized.id, 'Audit test rollback');

    const auditLogs = await repo.listAuditLogs({ requestId: initialized.id });
    expect(auditLogs.some((log) => log.action === 'ROLLBACK_INITIATED')).toBe(true);
  });

  it('should transition request to rolled_back status', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Status Rollback Test',
      contact_email: 'contact@status.com',
      employees: [
        {
          name: 'Status Test Emp',
          email: 'status@test.com',
          department: 'Finance',
          role: 'Analyst',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);
    const queueItems = await repo.getQueueItemsByRequest(initialized.id);

    // Mark some as complete
    for (let i = 0; i < 2; i++) {
      await repo.updateQueueItem(queueItems[i].id, { status: QueueItemStatus.Complete });
    }

    const rolled = await rollbackEngine.rollbackRequest(initialized.id, 'Status change test');

    expect(rolled.status).toBe(OnboardingStatus.RolledBack);
    expect(rolled.completed_at).toBeDefined();
  });

  it('should handle empty queue (all items already queued/skipped)', async () => {
    const request = OnboardingRequestSchema.parse({
      client_name: 'Empty Queue Test',
      contact_email: 'contact@empty.com',
      employees: [
        {
          name: 'Empty Test Emp',
          email: 'empty@test.com',
          department: 'Admin',
          role: 'Administrator',
          license_type: 'standard',
        },
      ],
      mode: OnboardingMode.Test,
    });

    const initialized = await stateMachine.initializeRequest(request);

    // Don't mark anything as complete, just rollback
    const rolled = await rollbackEngine.rollbackRequest(initialized.id, 'Empty queue rollback');

    expect(rolled.status).toBe(OnboardingStatus.RolledBack);
  });
});
