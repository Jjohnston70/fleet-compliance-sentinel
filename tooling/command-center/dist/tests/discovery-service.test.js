/**
 * Discovery Service Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DiscoveryService } from '../src/services/discovery-service.js';
import { registry } from '../src/data/in-memory-registry.js';
describe('DiscoveryService', () => {
    let discovery;
    beforeEach(() => {
        registry.clear();
        discovery = new DiscoveryService();
    });
    afterEach(() => {
        registry.clear();
    });
    it('should normalize tool definitions', () => {
        const rawTool = {
            name: 'my_tool',
            description: 'Does something',
            parameters: { foo: { type: 'string' } },
        };
        const normalized = discovery.normalizeToolDefinition(rawTool);
        expect(normalized.name).toBe('my_tool');
        expect(normalized.description).toBe('Does something');
        expect(normalized.parameters.type).toBe('object');
        expect(normalized.parameters.properties.foo).toBeDefined();
    });
    it('should discover modules from manifest', async () => {
        const result = await discovery.discoverModules();
        expect(result.found).toBe(14); // All 14 modules in manifest
        expect(result.registered).toBe(14);
        expect(result.failed).toHaveLength(0);
        const modules = registry.listModules();
        expect(modules.length).toBe(14);
        const totalTools = modules.reduce((sum, moduleEntry) => sum + moduleEntry.toolCount, 0);
        expect(totalTools).toBeGreaterThan(14);
        const hasStubToolName = modules.some((moduleEntry) => moduleEntry.tools.some((tool) => tool.name.startsWith('discover_')));
        expect(hasStubToolName).toBe(false);
    });
    it('should not duplicate on re-discovery', async () => {
        let result = await discovery.discoverModules();
        expect(result.registered).toBe(14);
        result = await discovery.discoverModules();
        expect(result.registered).toBe(0);
        expect(result.skipped).toBe(14);
    });
});
//# sourceMappingURL=discovery-service.test.js.map