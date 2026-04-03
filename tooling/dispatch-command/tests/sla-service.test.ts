import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository';
import { SLAService } from '../src/services/sla-service';
import { DispatchRequest } from '../src/data/schema';

describe('SLAService', () => {
  let repository: InMemoryRepository;
  let service: SLAService;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    service = new SLAService(repository);
  });

  describe('getSLAStatus', () => {
    it('should mark request as healthy when well before deadline', () => {
      const now = new Date();
      const deadline = new Date(now.getTime() + 20 * 60 * 1000); // 20 minutes away

      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'Test',
        status: 'pending',
        sla_deadline: deadline,
        created_at: now,
        updated_at: now,
      };

      const status = service.getSLAStatus(request, now);

      expect(status.status).toBe('healthy');
      expect(status.timeRemaining).toBeGreaterThan(10);
    });

    it('should mark as warning at 75% of SLA time consumed', () => {
      const createdAt = new Date();
      const deadline = new Date(createdAt.getTime() + 100 * 60 * 1000); // 100 minutes
      const now = new Date(createdAt.getTime() + 76 * 60 * 1000); // 76% consumed

      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'standard',
        issue_type: 'maintenance',
        description: 'Test',
        status: 'pending',
        sla_deadline: deadline,
        created_at: createdAt,
        updated_at: createdAt,
      };

      const status = service.getSLAStatus(request, now);

      expect(status.status).toBe('warning');
      expect(status.percentComplete).toBeGreaterThan(75);
    });

    it('should mark as critical at 90% of SLA time consumed', () => {
      const createdAt = new Date();
      const deadline = new Date(createdAt.getTime() + 100 * 60 * 1000); // 100 minutes
      const now = new Date(createdAt.getTime() + 91 * 60 * 1000); // 91% consumed

      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'standard',
        issue_type: 'maintenance',
        description: 'Test',
        status: 'pending',
        sla_deadline: deadline,
        created_at: createdAt,
        updated_at: createdAt,
      };

      const status = service.getSLAStatus(request, now);

      expect(status.status).toBe('critical');
      expect(status.percentComplete).toBeGreaterThan(90);
    });

    it('should mark as breached when deadline passed', () => {
      const createdAt = new Date();
      const deadline = new Date(createdAt.getTime() + 30 * 60 * 1000);
      const now = new Date(createdAt.getTime() + 35 * 60 * 1000); // Past deadline

      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'Test',
        status: 'pending',
        sla_deadline: deadline,
        created_at: createdAt,
        updated_at: createdAt,
      };

      const status = service.getSLAStatus(request, now);

      expect(status.status).toBe('breached');
      expect(status.timeRemaining).toBeLessThanOrEqual(0);
    });
  });

  describe('checkAllSLAStatus', () => {
    it('should track SLA breaches', async () => {
      const createdAt = new Date();
      const deadline = new Date(createdAt.getTime() + 30 * 60 * 1000);
      const now = new Date(createdAt.getTime() + 35 * 60 * 1000);

      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'Test',
        status: 'pending',
        sla_deadline: deadline,
        created_at: createdAt,
        updated_at: createdAt,
      };

      await repository.createDispatchRequest(request);
      const statuses = await service.checkAllSLAStatus(now);

      expect(statuses.length).toBe(1);
      expect(statuses[0].status).toBe('breached');

      const breach = await repository.getSLABreach(request.id);
      expect(breach).not.toBeNull();
      expect(breach?.breached).toBe(true);
    });
  });

  describe('getBreachedRequests', () => {
    it('should return only breached requests', async () => {
      const createdAt = new Date();

      const emergency = {
        id: crypto.randomUUID(),
        client_name: 'Test1',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'Test',
        status: 'pending',
        sla_deadline: new Date(createdAt.getTime() + 30 * 60 * 1000),
        created_at: createdAt,
        updated_at: createdAt,
      };

      const standard = {
        id: crypto.randomUUID(),
        client_name: 'Test2',
        client_phone: '555',
        address: '123 St',
        city: 'City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone1',
        priority: 'standard',
        issue_type: 'maintenance',
        description: 'Test',
        status: 'pending',
        sla_deadline: new Date(createdAt.getTime() + 240 * 60 * 1000),
        created_at: createdAt,
        updated_at: createdAt,
      };

      await repository.createDispatchRequest(emergency);
      await repository.createDispatchRequest(standard);

      const now = new Date(createdAt.getTime() + 35 * 60 * 1000);
      const breached = await service.getBreachedRequests(now);

      expect(breached.length).toBe(1);
      expect(breached[0].requestId).toBe(emergency.id);
    });
  });
});
