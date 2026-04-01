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
export interface ToolAclFilter {
    allowedModuleIds?: string[];
    allowedQualifiedNames?: string[];
}
export declare class DiscoveryService {
    private readonly serviceDir;
    private readonly commandCenterRoot;
    private readonly fallbackTools;
    parseAclFilter(raw: unknown): ToolAclFilter | undefined;
    isQualifiedToolAllowed(moduleId: string, toolName: string, acl?: ToolAclFilter): boolean;
    isModuleAllowed(moduleId: string, acl?: ToolAclFilter): boolean;
    filterToolsByAcl<T extends {
        moduleId: string;
        name: string;
    }>(tools: T[], acl?: ToolAclFilter): T[];
    private getFallbackTools;
    private resolveModuleToolSourcePath;
    private readBalancedBraces;
    private collectObjectRanges;
    private extractQuotedProperty;
    private extractSchemaLiteral;
    private normalizeSchema;
    private evaluateObjectLiteral;
    private extractToolsFromSource;
    private loadModuleTools;
    /**
     * Normalize tool definitions from various export patterns
     */
    normalizeToolDefinition(raw: any): ToolDefinition;
    /**
     * Auto-discover modules by scanning manifest and ingesting module tools.
     */
    discoverModules(): Promise<DiscoveryResult>;
    /**
     * Re-scan modules and update registry
     */
    rescan(): Promise<DiscoveryResult>;
}
export declare const discoveryService: DiscoveryService;
//# sourceMappingURL=discovery-service.d.ts.map