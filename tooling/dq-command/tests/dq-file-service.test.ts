/**
 * dq-command — DQ File Service Tests
 * Placeholder test file for Phase 1 implementation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryDqRepository } from '../src/data/repository';
import { DqFileService } from '../src/services/dq-file-service';

describe('DqFileService', () => {
  let repo: InMemoryDqRepository;
  let service: DqFileService;

  beforeEach(() => {
    repo = new InMemoryDqRepository();
    service = new DqFileService(repo);
  });

  it('should create DQ file pair (DQF + DHF) for a driver', async () => {
    const dqf = await service.createDqFile('org_test', {
      driver_id: 'driver_001',
      driver_name: 'John Carter',
      cdl_holder: true,
      hire_date: '2026-04-01',
    });

    expect(dqf.driver_id).toBe('driver_001');
    expect(dqf.file_type).toBe('dqf');
    expect(dqf.intake_token).toBeTruthy();
    expect(dqf.status).toBe('incomplete');
  });

  it('should generate a checklist with all required docs for CDL holder', async () => {
    const dqf = await service.createDqFile('org_test', {
      driver_id: 'driver_001',
      driver_name: 'John Carter',
      cdl_holder: true,
      hire_date: '2026-04-01',
    });

    const checklist = await service.getChecklist(dqf.id);
    expect(checklist).toBeTruthy();
    expect(checklist!.total_docs).toBeGreaterThan(0);
    expect(checklist!.completion_pct).toBe(0);
    expect(checklist!.items.every((i) => i.status === 'missing')).toBe(true);
  });

  it('should return org summary with correct counts', async () => {
    await service.createDqFile('org_test', {
      driver_id: 'driver_001',
      driver_name: 'John Carter',
      cdl_holder: true,
      hire_date: '2026-04-01',
    });

    const summary = await service.getOrgSummary('org_test');
    expect(summary.total_drivers).toBe(1);
    expect(summary.incomplete).toBe(1);
    expect(summary.complete).toBe(0);
  });
});
