/**
 * Router Service Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RouterService } from '../src/services/router-service.js';
import { RegistryService } from '../src/services/registry-service.js';
import { registry } from '../src/data/in-memory-registry.js';
describe('RouterService', () => {
    let router;
    let regService;
    beforeEach(() => {
        registry.clear();
        router = new RouterService();
        regService = new RegistryService();
    });
    afterEach(() => {
        registry.clear();
    });
    it('should route by qualified name', () => {
        regService.registerModule('test-module', 'Test', '1.0.0', 'Test', 'Operations', [
            {
                name: 'my_tool',
                description: 'My tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const result = router.routeByQualifiedName('test-module.my_tool');
        expect(result.success).toBe(true);
        expect(result.moduleId).toBe('test-module');
        expect(result.tool?.name).toBe('my_tool');
    });
    it('should fail on unknown qualified name', () => {
        const result = router.routeByQualifiedName('test-module.unknown_tool');
        expect(result.success).toBe(false);
        expect(result.error).toContain('not found');
    });
    it('should route by unqualified name when unique', () => {
        regService.registerModule('test-module', 'Test', '1.0.0', 'Test', 'Operations', [
            {
                name: 'unique_tool',
                description: 'Tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const result = router.routeByName('unique_tool');
        expect(result.success).toBe(true);
        expect(result.moduleId).toBe('test-module');
    });
    it('should fail on ambiguous unqualified name', () => {
        regService.registerModule('module1', 'M1', '1.0.0', 'M1', 'Operations', [
            {
                name: 'shared_tool',
                description: 'Tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        regService.registerModule('module2', 'M2', '1.0.0', 'M2', 'Finance', [
            {
                name: 'shared_tool',
                description: 'Tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const result = router.routeByName('shared_tool');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Ambiguous');
        expect(result.error).toContain('qualified name');
    });
    it('should validate required parameters', () => {
        const tool = {
            name: 'test',
            description: 'Test',
            parameters: {
                type: 'object',
                properties: { foo: { type: 'string' }, bar: { type: 'number' } },
                required: ['foo', 'bar'],
            },
        };
        // Missing required param
        let validation = router.validateParameters(tool, { foo: 'value' });
        expect(validation.valid).toBe(false);
        expect(validation.errors).toContain('Missing required parameter: bar');
        // All params present
        validation = router.validateParameters(tool, { foo: 'value', bar: 42 });
        expect(validation.valid).toBe(true);
    });
    it('should validate parameter types', () => {
        const tool = {
            name: 'test',
            description: 'Test',
            parameters: {
                type: 'object',
                properties: { count: { type: 'number' }, name: { type: 'string' } },
            },
        };
        // Wrong type for count
        let validation = router.validateParameters(tool, { count: 'not a number' });
        expect(validation.valid).toBe(false);
        // Correct types
        validation = router.validateParameters(tool, { count: 42, name: 'test' });
        expect(validation.valid).toBe(true);
    });
    it('should coerce safe string values for number and boolean params', () => {
        const tool = {
            name: 'test',
            description: 'Test',
            parameters: {
                type: 'object',
                properties: { count: { type: 'number' }, enabled: { type: 'boolean' } },
            },
        };
        const validation = router.validateParameters(tool, { count: '42', enabled: 'true' });
        expect(validation.valid).toBe(true);
        expect(validation.normalizedParams?.count).toBe(42);
        expect(validation.normalizedParams?.enabled).toBe(true);
    });
});
//# sourceMappingURL=router-service.test.js.map