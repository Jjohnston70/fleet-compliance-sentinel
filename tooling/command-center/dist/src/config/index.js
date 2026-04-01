/**
 * Central configuration for Command Center
 * Branding, module paths, health check intervals, timeouts
 */
export const BRANDING = {
    name: 'TNDS Command Center',
    navy: '#1a3a5c',
    teal: '#3d8eb9',
    tagline: 'Unified TNDS Module Discovery & Routing',
};
export const SERVICE_CONFIG = {
    // Module discovery
    modulesBasePath: process.env.MODULES_BASE_PATH || '/sessions/admiring-nifty-cannon/mnt/MODULES-TNDS',
    // Auto-discovery
    autoDiscoveryEnabled: process.env.AUTO_DISCOVERY_ENABLED === 'true',
    // Health checks
    healthCheckIntervalMs: parseInt(process.env.HEALTH_CHECK_INTERVAL_MS || '30000', 10),
    // Tool invocation
    defaultTimeoutMs: parseInt(process.env.DEFAULT_TIMEOUT_MS || '10000', 10),
};
export const STATUS_CODES = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
};
//# sourceMappingURL=index.js.map