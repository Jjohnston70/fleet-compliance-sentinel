/**
 * Tool Usage Report
 * Track tool invocations: most used, response times, error rates
 */
import { registry } from '../data/in-memory-registry.js';
export class ToolUsageReportGenerator {
    generate(limit = 100) {
        const invocations = registry.getInvocationHistory(undefined, limit);
        const byQualifiedName = new Map();
        invocations.forEach((inv) => {
            if (!byQualifiedName.has(inv.toolId)) {
                byQualifiedName.set(inv.toolId, { success: 0, error: 0, timeout: 0, times: [] });
            }
            const stats = byQualifiedName.get(inv.toolId);
            if (inv.status === 'success')
                stats.success++;
            else if (inv.status === 'error')
                stats.error++;
            else if (inv.status === 'timeout')
                stats.timeout++;
            stats.times.push(inv.durationMs);
        });
        const toolStats = Array.from(byQualifiedName.entries())
            .map(([qualifiedName, stats]) => {
            const total = stats.success + stats.error + stats.timeout;
            return {
                qualifiedName,
                invocationCount: total,
                successCount: stats.success,
                errorCount: stats.error,
                timeoutCount: stats.timeout,
                averageResponseTimeMs: stats.times.reduce((a, b) => a + b, 0) / stats.times.length,
                errorRate: total > 0 ? (stats.error + stats.timeout) / total : 0,
            };
        })
            .sort((a, b) => b.invocationCount - a.invocationCount);
        // By module
        const byModule = new Map();
        invocations.forEach((inv) => {
            const [moduleId] = inv.toolId.split('.');
            if (!byModule.has(moduleId)) {
                byModule.set(moduleId, { invocations: 0, errors: 0 });
            }
            const stats = byModule.get(moduleId);
            stats.invocations++;
            if (inv.status !== 'success')
                stats.errors++;
        });
        const byModuleRecord = {};
        byModule.forEach((stats, moduleId) => {
            byModuleRecord[moduleId] = {
                invocations: stats.invocations,
                errorRate: stats.invocations > 0 ? stats.errors / stats.invocations : 0,
            };
        });
        return {
            timestamp: Date.now(),
            totalInvocations: invocations.length,
            byTool: toolStats,
            byModule: byModuleRecord,
        };
    }
}
export const toolUsageReport = new ToolUsageReportGenerator();
//# sourceMappingURL=tool-usage-report.js.map