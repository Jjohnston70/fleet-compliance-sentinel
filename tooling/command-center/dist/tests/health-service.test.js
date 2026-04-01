/**
 * Health Service Tests
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { HealthService } from '../src/services/health-service.js';
import { RegistryService } from '../src/services/registry-service.js';
import { registry } from '../src/data/in-memory-registry.js';
describe('HealthService', () => {
    let health;
    let regService;
    beforeEach(() => {
        registry.clear();
        health = new HealthService();
        regService = new RegistryService();
    });
    afterEach(() => {
        registry.clear();
    });
    it('should check individual module health', async () => {
        regService.registerModule('test-module', 'Test', '1.0.0', 'Test', 'Operations', []);
        const moduleHealth = await health.checkModuleHealth('test-module');
        expect(moduleHealth.status).toBe('healthy');
        expect(moduleHealth.lastCheck).toBeDefined();
    });
    it('should return error for nonexistent module', async () => {
        const moduleHealth = await health.checkModuleHealth('nonexistent');
        expect(moduleHealth.status).toBe('error');
    });
    it('should check all modules', async () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', []);
        regService.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Finance', []);
        const report = await health.checkAllModules();
        expect(report.modules).toHaveLength(2);
        expect(report.summary.total).toBe(2);
    });
    it('should aggregate health summary', async () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', []);
        regService.registerModule('mod2', 'M2', '1.0.0', 'M2', 'Finance', []);
        const report = await health.checkAllModules();
        expect(report.summary.healthy).toBeGreaterThanOrEqual(0);
        expect(report.summary.offline).toBeDefined();
        expect(report.systemStatus).toBeDefined();
    });
    it('should determine system status', async () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', []);
        const report = await health.checkAllModules();
        expect(['healthy', 'degraded', 'critical']).toContain(report.systemStatus);
    });
    it('should get current health report', async () => {
        regService.registerModule('mod1', 'M1', '1.0.0', 'M1', 'Operations', []);
        await health.checkAllModules();
        const report = health.getCurrentHealthReport();
        expect(report.timestamp).toBeDefined();
        expect(report.summary).toBeDefined();
    });
});
//# sourceMappingURL=health-service.test.js.map