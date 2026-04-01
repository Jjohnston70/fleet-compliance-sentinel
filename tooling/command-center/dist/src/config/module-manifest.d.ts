/**
 * Static manifest of all 14 TNDS modules with metadata
 */
export interface ModuleManifestEntry {
    id: string;
    displayName: string;
    classification: 'Operations' | 'Finance' | 'Intelligence' | 'Planning' | 'Infrastructure' | 'Logistics';
    description: string;
    version: string;
}
export declare const MODULE_MANIFEST: ModuleManifestEntry[];
//# sourceMappingURL=module-manifest.d.ts.map