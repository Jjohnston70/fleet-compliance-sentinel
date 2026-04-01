/**
 * Discovery Service
 * Auto-discovery: scan modules directory, parse tool definitions, normalize to unified format
 */
import { ToolDefinition } from '../data/schema.js';
export interface DiscoveryResult {
    found: number;
    registered: number;
    skipped: number;
    failed: Array<{
        moduleId: string;
        error: string;
    }>;
}
export declare class DiscoveryService {
    /**
     * Normalize tool definitions from various export patterns
     */
    normalizeToolDefinition(raw: any): ToolDefinition;
    /**
     * Auto-discover modules by scanning manifest
     * In production, would scan filesystem; here we use static manifest
     */
    discoverModules(): Promise<DiscoveryResult>;
    /**
     * Re-scan modules and update registry
     */
    rescan(): Promise<DiscoveryResult>;
}
export declare const discoveryService: DiscoveryService;
//# sourceMappingURL=discovery-service.d.ts.map