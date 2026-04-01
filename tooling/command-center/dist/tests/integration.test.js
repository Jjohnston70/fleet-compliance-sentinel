/**
 * Integration Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RegistryService } from '../src/services/registry-service.js';
import { RouterService } from '../src/services/router-service.js';
import { SearchService } from '../src/services/search-service.js';
import { DiscoveryService } from '../src/services/discovery-service.js';
import { HealthService } from '../src/services/health-service.js';
import { registry } from '../src/data/in-memory-registry.js';
describe('Integration Tests', () => {
    let regService;
    let router;
    let search;
    let discovery;
    let health;
    beforeEach(() => {
        registry.clear();
        regService = new RegistryService();
        router = new RouterService();
        search = new SearchService();
        discovery = new DiscoveryService();
        health = new HealthService();
    });
    afterEach(() => {
        registry.clear();
    });
    it('should register 3 mock modules, search and route', async () => {
        // Register 3 modules
        regService.registerModule('real-estate', 'Realty Command', '1.0.0', 'Real estate CRM', 'Operations', [
            {
                name: 'add_property',
                description: 'Add a new property',
                parameters: {
                    type: 'object',
                    properties: { name: { type: 'string' }, address: { type: 'string' } },
                    required: ['name', 'address'],
                },
            },
        ]);
        regService.registerModule('sales', 'Sales Command', '1.0.0', 'Sales pipeline', 'Finance', [
            {
                name: 'create_deal',
                description: 'Create a new sales deal',
                parameters: {
                    type: 'object',
                    properties: { prospect: { type: 'string' }, amount: { type: 'number' } },
                    required: ['prospect', 'amount'],
                },
            },
        ]);
        regService.registerModule('tasks', 'Task Command', '1.0.0', 'Task management', 'Operations', [
            {
                name: 'create_task',
                description: 'Create a new task',
                parameters: {
                    type: 'object',
                    properties: { title: { type: 'string' }, description: { type: 'string' } },
                    required: ['title'],
                },
            },
        ]);
        // Verify registration
        const modules = regService.listModules();
        expect(modules).toHaveLength(3);
        // Search for property-related tools
        const searchResults = search.search('property');
        expect(searchResults.length).toBeGreaterThan(0);
        expect(searchResults[0].toolName).toBe('add_property');
        // Route a qualified tool call
        const route = router.routeByQualifiedName('real-estate.add_property');
        expect(route.success).toBe(true);
        expect(route.moduleId).toBe('real-estate');
        expect(route.tool?.name).toBe('add_property');
        // Validate parameters
        const validation = router.validateParameters(route.tool, {
            name: 'Downtown Condo',
            address: '123 Main St',
        });
        expect(validation.valid).toBe(true);
        // Check system health
        const healthReport = await health.checkAllModules();
        expect(healthReport.summary.total).toBe(3);
    });
    it('should discover all 14 manifest modules', async () => {
        const result = await discovery.discoverModules();
        expect(result.found).toBe(14);
        expect(result.failed).toHaveLength(0);
        const modules = regService.listModules();
        expect(modules.length).toBeGreaterThan(0);
    });
    it('should handle ambiguous tool names correctly', () => {
        regService.registerModule('mod1', 'Module 1', '1.0.0', 'M1', 'Operations', [
            {
                name: 'shared_tool',
                description: 'Tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        regService.registerModule('mod2', 'Module 2', '1.0.0', 'M2', 'Finance', [
            {
                name: 'shared_tool',
                description: 'Tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        // Unqualified should fail
        let result = router.route('shared_tool');
        expect(result.success).toBe(false);
        expect(result.error).toContain('Ambiguous');
        // Qualified should succeed
        result = router.route('mod1.shared_tool');
        expect(result.success).toBe(true);
        expect(result.moduleId).toBe('mod1');
    });
    it('should get statistics across all modules', () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', [
            { name: 't1', description: 'T1', parameters: { type: 'object', properties: {} } },
            { name: 't2', description: 'T2', parameters: { type: 'object', properties: {} } },
        ]);
        regService.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Finance', [
            { name: 't3', description: 'T3', parameters: { type: 'object', properties: {} } },
        ]);
        const stats = regService.getStats();
        expect(stats.totalModules).toBe(2);
        expect(stats.totalTools).toBe(3);
        expect(stats.classificationBreakdown.Operations).toBe(1);
        expect(stats.classificationBreakdown.Finance).toBe(1);
    });
});
//# sourceMappingURL=integration.test.js.map