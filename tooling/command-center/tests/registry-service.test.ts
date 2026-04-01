/**
 * Registry Service Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegistryService } from '../src/services/registry-service.js';
import { registry } from '../src/data/in-memory-registry.js';

describe('RegistryService', () => {
  let service: RegistryService;

  beforeEach(() => {
    registry.clear();
    service = new RegistryService();
  });

  afterEach(() => {
    registry.clear();
  });

  it('should register a module', () => {
    service.registerModule(
      'test-module',
      'Test Module',
      '1.0.0',
      'A test module',
      'Operations',
      [
        {
          name: 'test_tool',
          description: 'A test tool',
          parameters: {
            type: 'object',
            properties: { foo: { type: 'string' } },
          },
        },
      ],
    );

    const module = service.getModule('test-module');
    expect(module).toBeDefined();
    expect(module?.displayName).toBe('Test Module');
    expect(module?.toolCount).toBe(1);
    expect(module?.status).toBe('active');
  });

  it('should prevent duplicate module registration', () => {
    service.registerModule(
      'test-module',
      'Test Module',
      '1.0.0',
      'A test module',
      'Operations',
      [],
    );

    expect(() => {
      service.registerModule(
        'test-module',
        'Another Test',
        '2.0.0',
        'Different description',
        'Operations',
        [],
      );
    }).toThrow('already registered');
  });

  it('should deregister a module', () => {
    service.registerModule('test-module', 'Test', '1.0.0', 'Test', 'Operations', []);
    expect(service.getModule('test-module')).toBeDefined();

    service.deregisterModule('test-module');
    expect(service.getModule('test-module')).toBeNull();
  });

  it('should list all modules', () => {
    service.registerModule('module-1', 'Module 1', '1.0.0', 'First', 'Operations', []);
    service.registerModule('module-2', 'Module 2', '1.0.0', 'Second', 'Finance', []);

    const modules = service.listModules();
    expect(modules).toHaveLength(2);
    expect(modules[0].id).toBeDefined();
  });

  it('should filter modules by classification', () => {
    service.registerModule('ops-module', 'Ops', '1.0.0', 'Ops', 'Operations', []);
    service.registerModule('fin-module', 'Fin', '1.0.0', 'Fin', 'Finance', []);

    const ops = service.getModulesByClassification('Operations');
    expect(ops).toHaveLength(1);
    expect(ops[0].id).toBe('ops-module');
  });

  it('should update module status', () => {
    service.registerModule('test-module', 'Test', '1.0.0', 'Test', 'Operations', []);
    service.updateStatus('test-module', 'maintenance');

    const module = service.getModule('test-module');
    expect(module?.status).toBe('maintenance');
  });

  it('should get module statistics', () => {
    service.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', [
      {
        name: 'tool1',
        description: 'Tool 1',
        parameters: { type: 'object', properties: {} },
      },
      {
        name: 'tool2',
        description: 'Tool 2',
        parameters: { type: 'object', properties: {} },
      },
    ]);
    service.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Finance', [
      {
        name: 'tool3',
        description: 'Tool 3',
        parameters: { type: 'object', properties: {} },
      },
    ]);

    const stats = service.getStats();
    expect(stats.totalModules).toBe(2);
    expect(stats.activeModules).toBe(2);
    expect(stats.totalTools).toBe(3);
    expect(stats.classificationBreakdown.Operations).toBe(1);
    expect(stats.classificationBreakdown.Finance).toBe(1);
  });
});
