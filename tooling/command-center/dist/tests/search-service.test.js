/**
 * Search Service Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SearchService } from '../src/services/search-service.js';
import { RegistryService } from '../src/services/registry-service.js';
import { registry } from '../src/data/in-memory-registry.js';
describe('SearchService', () => {
    let search;
    let regService;
    beforeEach(() => {
        registry.clear();
        search = new SearchService();
        regService = new RegistryService();
    });
    afterEach(() => {
        registry.clear();
    });
    it('should search tools by keyword', () => {
        regService.registerModule('realty-cmd', 'Realty', '1.0.0', 'Real estate', 'Operations', [
            {
                name: 'add_property',
                description: 'Add a new property to the system',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'list_properties',
                description: 'List all properties',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const results = search.search('property');
        expect(results.length).toBeGreaterThan(0);
        expect(results[0].toolName).toContain('property');
    });
    it('should rank name matches higher than description matches', () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', [
            {
                name: 'search_tool',
                description: 'This is a description',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'other_tool',
                description: 'This search returns results',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const results = search.search('search');
        // Tool with 'search' in name should rank higher
        expect(results[0].toolName).toBe('search_tool');
    });
    it('should filter by module', () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', [
            {
                name: 'tool1',
                description: 'Tool 1',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        regService.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Finance', [
            {
                name: 'tool1',
                description: 'Tool 1',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const results = search.search('tool', { moduleId: 'mod1' });
        expect(results).toHaveLength(1);
        expect(results[0].moduleId).toBe('mod1');
    });
    it('should filter by classification', () => {
        regService.registerModule('ops-mod', 'Ops', '1.0.0', 'Ops', 'Operations', [
            {
                name: 'ops_tool',
                description: 'Operations tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        regService.registerModule('fin-mod', 'Fin', '1.0.0', 'Fin', 'Finance', [
            {
                name: 'fin_tool',
                description: 'Finance tool',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const results = search.search('tool', { classification: 'Finance' });
        expect(results.every((r) => r.moduleName === 'Fin')).toBe(true);
    });
    it('should get classifications with counts', () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', []);
        regService.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Operations', []);
        regService.registerModule('mod3', 'M3', '1.0.0', 'M3', 'Finance', []);
        const classifications = search.getClassifications();
        const ops = classifications.find((c) => c.classification === 'Operations');
        expect(ops?.count).toBe(2);
    });
    it('should select relevant tools with capped output', () => {
        regService.registerModule('asset-command', 'Asset Command', '1.0.0', 'Fleet asset workflows', 'Logistics', [
            {
                name: 'list_assets',
                description: 'List tracked assets with filters',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'create_maintenance_event',
                description: 'Create maintenance records for an asset',
                parameters: { type: 'object', properties: {} },
            },
            {
                name: 'inspect_asset',
                description: 'Run inspection workflow for one asset',
                parameters: { type: 'object', properties: {} },
            },
        ]);
        const selected = search.selectRelevantTools({
            query: 'asset inspection workflow',
            maxTools: 2,
        });
        expect(selected).toHaveLength(2);
        expect(selected.every((entry) => entry.matchScore > 0)).toBe(true);
    });
});
//# sourceMappingURL=search-service.test.js.map