/**
 * Auto-Discovery Hook
 * Scan modules directory, find new/updated modules, register automatically
 */
export declare class AutoDiscovery {
    private intervalId;
    /**
     * Start periodic discovery scans
     */
    start(intervalMs?: number): void;
    /**
     * Stop discovery scans
     */
    stop(): void;
    /**
     * Run discovery immediately
     */
    scanNow(): Promise<void>;
}
export declare const autoDiscovery: AutoDiscovery;
//# sourceMappingURL=auto-discovery.d.ts.map