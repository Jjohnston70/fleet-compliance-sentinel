/**
 * Central configuration for Command Center
 * Branding, module paths, health check intervals, timeouts
 */
import { existsSync } from 'node:fs';
import path from 'node:path';
function resolveModulesBasePath() {
    const configured = (process.env.MODULES_BASE_PATH || '').trim();
    if (configured)
        return configured;
    const workspaceToolingPath = path.resolve(process.cwd(), 'tooling');
    if (existsSync(workspaceToolingPath))
        return workspaceToolingPath;
    const siblingModulesPath = path.resolve(process.cwd(), '..');
    if (existsSync(siblingModulesPath))
        return siblingModulesPath;
    return '/sessions/admiring-nifty-cannon/mnt/MODULES-TNDS';
}
export const BRANDING = {
    name: 'TNDS Command Center',
    navy: '#1a3a5c',
    teal: '#3d8eb9',
    tagline: 'Unified TNDS Module Discovery & Routing',
};
export const SERVICE_CONFIG = {
    // Module discovery
    modulesBasePath: resolveModulesBasePath(),
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