import { describe, it, expect, beforeEach } from 'vitest';
import { randomUUID } from 'crypto';
import { InMemoryRepository } from '../src/data/repository.js';
import { StandardAuditService } from '../src/services/audit-service.js';
import { AuditStatus } from '../src/data/schema.js';

describe('Audit Service', () => {
  let repo: InMemoryRepository;
  let auditService: StandardAuditService;

  beforeEach(() => {
    repo = new InMemoryRepository();
    auditService = new StandardAuditService(repo);
  });

  it('should create audit log entry', async () => {
    const reqId = randomUUID();
    const entry = await auditService.log({
      request_id: reqId,
      action: 'TEST_ACTION',
      actor: 'test-user',
      target: 'test-target',
      status: AuditStatus.Success,
      details: { key: 'value' },
    });

    expect(entry.id).toBeDefined();
    expect(entry.action).toBe('TEST_ACTION');
    expect(entry.timestamp).toBeDefined();
  });

  it('should sanitize PII from audit logs', async () => {
    const entry = await auditService.log({
      request_id: randomUUID(),
      action: 'SENSITIVE_ACTION',
      actor: 'system',
      target: 'target',
      status: AuditStatus.Success,
      details: {
        email: 'user@example.com',
        employee_email: 'emp@company.com',
        password: 'secret123',
        api_key: 'sk_test_123456',
        token: 'token_abc123',
        safe_data: 'this is ok',
      },
    });

    expect(entry.details.email).toBeUndefined();
    expect(entry.details.employee_email).toBeUndefined();
    expect(entry.details.password).toBeUndefined();
    expect(entry.details.api_key).toBeUndefined();
    expect(entry.details.token).toBeUndefined();
    expect(entry.details.safe_data).toBe('this is ok');
  });

  it('should list logs by request ID', async () => {
    const req1 = randomUUID();
    const req2 = randomUUID();

    await auditService.log({
      request_id: req1,
      action: 'ACTION_1',
      actor: 'user1',
      target: 'target1',
      status: AuditStatus.Success,
    });

    await auditService.log({
      request_id: req1,
      action: 'ACTION_2',
      actor: 'user1',
      target: 'target2',
      status: AuditStatus.Success,
    });

    await auditService.log({
      request_id: req2,
      action: 'ACTION_3',
      actor: 'user2',
      target: 'target3',
      status: AuditStatus.Success,
    });

    const logs = await auditService.listByRequest(req1);
    expect(logs.length).toBe(2);
    expect(logs.every((log) => log.request_id === req1)).toBe(true);
  });

  it('should list logs by actor', async () => {
    await auditService.log({
      request_id: randomUUID(),
      action: 'ACTION_A',
      actor: 'alice',
      target: 'target',
      status: AuditStatus.Success,
    });

    await auditService.log({
      request_id: randomUUID(),
      action: 'ACTION_B',
      actor: 'alice',
      target: 'target',
      status: AuditStatus.Success,
    });

    await auditService.log({
      request_id: randomUUID(),
      action: 'ACTION_C',
      actor: 'bob',
      target: 'target',
      status: AuditStatus.Success,
    });

    const aliceLogs = await auditService.listByActor('alice');
    expect(aliceLogs.length).toBe(2);
    expect(aliceLogs.every((log) => log.actor === 'alice')).toBe(true);
  });

  it('should list logs by status', async () => {
    await auditService.log({
      request_id: randomUUID(),
      action: 'SUCCESS_ACTION',
      actor: 'system',
      target: 'target',
      status: AuditStatus.Success,
    });

    await auditService.log({
      request_id: randomUUID(),
      action: 'FAILURE_ACTION',
      actor: 'system',
      target: 'target',
      status: AuditStatus.Failure,
    });

    await auditService.log({
      request_id: randomUUID(),
      action: 'SUCCESS_ACTION_2',
      actor: 'system',
      target: 'target',
      status: AuditStatus.Success,
    });

    const successLogs = await auditService.listByStatus(AuditStatus.Success);
    expect(successLogs.length).toBe(2);
    expect(successLogs.every((log) => log.status === AuditStatus.Success)).toBe(true);

    const failureLogs = await auditService.listByStatus(AuditStatus.Failure);
    expect(failureLogs.length).toBe(1);
    expect(failureLogs[0].status).toBe(AuditStatus.Failure);
  });

  it('should handle contact_email PII', async () => {
    const entry = await auditService.log({
      request_id: randomUUID(),
      action: 'CONTACT_TEST',
      actor: 'system',
      target: 'target',
      status: AuditStatus.Success,
      details: {
        contact_email: 'contact@company.com',
        name: 'John Doe',
      },
    });

    expect(entry.details.contact_email).toBeUndefined();
    expect(entry.details.name).toBe('John Doe');
  });
});
