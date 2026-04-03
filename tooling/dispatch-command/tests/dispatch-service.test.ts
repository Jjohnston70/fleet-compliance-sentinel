import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository';
import { DispatchService } from '../src/services/dispatch-service';
import { DispatchRequest } from '../src/data/schema';
import { seedAll } from '../src/config/zone-seeds';

describe('DispatchService', () => {
  let repository: InMemoryRepository;
  let service: DispatchService;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    service = new DispatchService(repository);
    await seedAll(repository);
  });

  describe('createDispatchRequest', () => {
    it('should create a request with SLA deadline', async () => {
      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'John Doe',
        client_phone: '(555) 123-4567',
        address: '123 Main St',
        city: 'Colorado Springs',
        state: 'CO',
        zip: '80901',
        zone_id: 'zone-cos-north',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'No heat in home',
        status: 'pending',
        sla_deadline: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const created = await service.createDispatchRequest(request);

      expect(created.id).toBeDefined();
      expect(created.status).toBe('pending');
      expect(created.sla_deadline).toBeDefined();
      expect(created.sla_deadline.getTime()).toBeGreaterThan(created.created_at.getTime());
    });

    it('emergency priority should have 30min SLA', async () => {
      const now = new Date();
      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'John Doe',
        client_phone: '(555) 123-4567',
        address: '123 Main St',
        city: 'Colorado Springs',
        state: 'CO',
        zip: '80901',
        zone_id: 'zone-cos-north',
        priority: 'emergency',
        issue_type: 'no_heat',
        description: 'No heat',
        status: 'pending',
        sla_deadline: new Date(),
        created_at: now,
        updated_at: now,
      };

      const created = await service.createDispatchRequest(request);
      const deadline = created.sla_deadline;
      const elapsedMinutes = (deadline.getTime() - now.getTime()) / 1000 / 60;

      expect(elapsedMinutes).toBeLessThanOrEqual(35); // Allow some tolerance
      expect(elapsedMinutes).toBeGreaterThanOrEqual(25);
    });
  });

  describe('getDispatchRequest', () => {
    it('should return null for non-existent request', async () => {
      const result = await service.getDispatchRequest('non-existent');
      expect(result).toBeNull();
    });
  });

  describe('listDispatchRequests', () => {
    it('should return empty list initially', async () => {
      const requests = await service.listDispatchRequests();
      expect(requests).toEqual([]);
    });

    it('should return created requests', async () => {
      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '(555) 000-0000',
        address: '123 Test St',
        city: 'Test City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone-cos-north',
        priority: 'standard',
        issue_type: 'maintenance',
        description: 'Test',
        status: 'pending',
        sla_deadline: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      await service.createDispatchRequest(request);
      const requests = await service.listDispatchRequests();

      expect(requests.length).toBe(1);
      expect(requests[0].client_name).toBe('Test');
    });
  });

  describe('cancelDispatch', () => {
    it('should cancel a pending request', async () => {
      const request: DispatchRequest = {
        id: crypto.randomUUID(),
        client_name: 'Test',
        client_phone: '(555) 000-0000',
        address: '123 Test St',
        city: 'Test City',
        state: 'CO',
        zip: '80000',
        zone_id: 'zone-cos-north',
        priority: 'standard',
        issue_type: 'maintenance',
        description: 'Test',
        status: 'pending',
        sla_deadline: new Date(),
        created_at: new Date(),
        updated_at: new Date(),
      };

      const created = await service.createDispatchRequest(request);
      const cancelled = await service.cancelDispatch(created.id, 'Client cancelled');

      expect(cancelled?.status).toBe('cancelled');
    });
  });
});
