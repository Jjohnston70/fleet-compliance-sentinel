import { beforeEach, describe, expect, it } from 'vitest';
import { seedAll } from '../src/config/zone-seeds';
import { InMemoryRepository } from '../src/data/repository';
import {
  createDispatchToolHandlers,
  createDispatchTools,
  createToolDefinition,
  DISPATCH_COMMAND_TOOLS,
} from '../src/tools';

describe('dispatch tools', () => {
  let repository: InMemoryRepository;

  beforeEach(async () => {
    repository = new InMemoryRepository();
    await seedAll(repository);
  });

  it('exports discoverable tool definitions with schemas', () => {
    const names = DISPATCH_COMMAND_TOOLS.map((tool) => tool.name);
    expect(names).toContain('reassign_driver');

    const createTool = DISPATCH_COMMAND_TOOLS.find((tool) => tool.name === 'create_dispatch_request');
    expect(createTool).toBeDefined();
    expect(createTool?.input_schema.required).toContain('client_name');
    expect(createTool?.input_schema.required).toContain('priority');
  });

  it('creates backward-compatible handler array', () => {
    const handlers = createDispatchTools(repository);
    expect(handlers.length).toBe(DISPATCH_COMMAND_TOOLS.length);

    const definition = createToolDefinition(handlers[0]);
    expect(definition).toHaveProperty('input_schema');
  });

  it('supports create, assign, and reassign dispatch flow', async () => {
    const handlers = createDispatchToolHandlers(repository);

    const createdRaw = await handlers.create_dispatch_request({
      client_name: 'Test Client',
      client_phone: '(555) 000-0000',
      address: '100 Main St',
      city: 'Colorado Springs',
      state: 'CO',
      zip: '80901',
      zone_id: 'zone-cos-north',
      priority: 'emergency',
      issue_type: 'no_heat',
      description: 'No heat',
    });

    const created = JSON.parse(createdRaw as string) as { id: string };
    expect(created.id).toBeTruthy();

    const assignRaw = await handlers.assign_driver({
      request_id: created.id,
      driver_id: 'driver-3',
      truck_id: 'truck-3',
    });

    const assignResult = JSON.parse(assignRaw as string) as { success: boolean };
    expect(assignResult.success).toBe(true);

    const reassignRaw = await handlers.reassign_driver({
      request_id: created.id,
      driver_id: 'driver-4',
    });

    const reassignResult = JSON.parse(reassignRaw as string) as { success: boolean };
    expect(reassignResult.success).toBe(true);
  });
});
