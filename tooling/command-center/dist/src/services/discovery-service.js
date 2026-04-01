/**
 * Discovery Service
 * Auto-discovery: scan modules directory, parse tool definitions, normalize to unified format
 */
import { registryService } from './registry-service.js';
import { MODULE_MANIFEST } from '../config/module-manifest.js';
export class DiscoveryService {
    /**
     * Normalize tool definitions from various export patterns
     */
    normalizeToolDefinition(raw) {
        // Ensure name and description
        const name = raw.name || raw.id || 'unknown';
        const description = raw.description || raw.docs || 'No description';
        // Normalize parameters
        let parameters = raw.parameters || raw.params || {};
        if (!parameters.type) {
            parameters = {
                type: 'object',
                properties: parameters,
            };
        }
        return {
            name,
            description,
            parameters: {
                type: 'object',
                properties: parameters.properties || {},
                required: parameters.required,
            },
        };
    }
    /**
     * Auto-discover modules by scanning manifest
     * In production, would scan filesystem; here we use static manifest
     */
    async discoverModules() {
        const result = {
            found: 0,
            registered: 0,
            skipped: 0,
            failed: [],
        };
        for (const manifest of MODULE_MANIFEST) {
            result.found++;
            try {
                // Check if module already registered
                const existing = registryService.getModule(manifest.id);
                if (existing) {
                    // Module already registered, skip
                    result.skipped++;
                    continue;
                }
                // In a real scenario, we would:
                // 1. Check if /modules/{id}/package.json exists
                // 2. Check if /modules/{id}/src/tools.ts exists
                // 3. Import and parse tools
                // For now, create stub tools based on manifest
                const tools = [
                    {
                        name: `discover_${manifest.id}`,
                        description: `Discover tools from ${manifest.displayName}`,
                        parameters: {
                            type: 'object',
                            properties: {},
                        },
                    },
                ];
                registryService.registerModule(manifest.id, manifest.displayName, manifest.version, manifest.description, manifest.classification, tools);
                result.registered++;
            }
            catch (error) {
                result.failed.push({
                    moduleId: manifest.id,
                    error: error instanceof Error ? error.message : String(error),
                });
            }
        }
        return result;
    }
    /**
     * Re-scan modules and update registry
     */
    async rescan() {
        return this.discoverModules();
    }
}
export const discoveryService = new DiscoveryService();
//# sourceMappingURL=discovery-service.js.map