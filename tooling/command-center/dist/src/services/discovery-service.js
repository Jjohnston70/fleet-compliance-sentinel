/**
 * Discovery Service
 * Auto-discovery: scan modules directory, parse tool definitions, normalize to unified format
 */
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { registryService } from './registry-service.js';
import { MODULE_MANIFEST } from '../config/module-manifest.js';
import { SERVICE_CONFIG } from '../config/index.js';
export class DiscoveryService {
    serviceDir = path.dirname(fileURLToPath(import.meta.url));
    commandCenterRoot = path.resolve(this.serviceDir, '..', '..');
    fallbackTools = {
        'asset-command': [
            {
                name: 'list_assets',
                description: 'List fleet assets with optional status and asset type filters, including pagination.',
                parameters: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            description: 'Optional asset status filter.',
                        },
                        assetType: {
                            type: 'string',
                            description: 'Optional asset type filter.',
                        },
                        page: {
                            type: 'number',
                            description: 'Page number to return (1-based).',
                            minimum: 1,
                        },
                        pageSize: {
                            type: 'number',
                            description: 'Number of assets to return per page.',
                            minimum: 1,
                            maximum: 100,
                        },
                    },
                },
            },
            {
                name: 'get_asset_detail',
                description: 'Get a single fleet asset with compliance and maintenance summary details.',
                parameters: {
                    type: 'object',
                    properties: {
                        assetId: {
                            type: 'string',
                            description: 'Unique asset identifier.',
                        },
                    },
                    required: ['assetId'],
                },
            },
            {
                name: 'list_maintenance_events',
                description: 'List maintenance events for fleet assets within an optional date range.',
                parameters: {
                    type: 'object',
                    properties: {
                        assetId: {
                            type: 'string',
                            description: 'Optional asset identifier to scope maintenance events.',
                        },
                        startDate: {
                            type: 'string',
                            description: 'Optional range start date (ISO format).',
                        },
                        endDate: {
                            type: 'string',
                            description: 'Optional range end date (ISO format).',
                        },
                        page: {
                            type: 'number',
                            description: 'Page number to return (1-based).',
                            minimum: 1,
                        },
                        pageSize: {
                            type: 'number',
                            description: 'Number of events to return per page.',
                            minimum: 1,
                            maximum: 100,
                        },
                    },
                },
            },
        ],
    };
    parseAclFilter(raw) {
        if (!raw || typeof raw !== 'object' || Array.isArray(raw))
            return undefined;
        const acl = raw;
        const allowedModuleIds = Array.isArray(acl.allowedModuleIds)
            ? acl.allowedModuleIds.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
            : undefined;
        const allowedQualifiedNames = Array.isArray(acl.allowedQualifiedNames)
            ? acl.allowedQualifiedNames.filter((entry) => typeof entry === 'string' && entry.trim().length > 0)
            : undefined;
        if ((!allowedModuleIds || allowedModuleIds.length === 0) && (!allowedQualifiedNames || allowedQualifiedNames.length === 0)) {
            return undefined;
        }
        return {
            allowedModuleIds,
            allowedQualifiedNames,
        };
    }
    isQualifiedToolAllowed(moduleId, toolName, acl) {
        if (!acl)
            return true;
        const qualifiedName = `${moduleId}.${toolName}`;
        const moduleSet = acl.allowedModuleIds && acl.allowedModuleIds.length > 0
            ? new Set(acl.allowedModuleIds)
            : null;
        const qualifiedSet = acl.allowedQualifiedNames && acl.allowedQualifiedNames.length > 0
            ? new Set(acl.allowedQualifiedNames)
            : null;
        if (qualifiedSet && qualifiedSet.has(qualifiedName))
            return true;
        if (moduleSet && moduleSet.has(moduleId))
            return true;
        return false;
    }
    isModuleAllowed(moduleId, acl) {
        if (!acl)
            return true;
        if (acl.allowedModuleIds && acl.allowedModuleIds.includes(moduleId))
            return true;
        if (acl.allowedQualifiedNames) {
            return acl.allowedQualifiedNames.some((qualifiedName) => qualifiedName.startsWith(`${moduleId}.`));
        }
        return false;
    }
    filterToolsByAcl(tools, acl) {
        if (!acl)
            return tools;
        return tools.filter((tool) => this.isQualifiedToolAllowed(tool.moduleId, tool.name, acl));
    }
    getFallbackTools(moduleId) {
        const fallback = this.fallbackTools[moduleId];
        if (!fallback || fallback.length === 0)
            return null;
        return fallback.map((tool) => this.normalizeToolDefinition(tool));
    }
    resolveModuleToolSourcePath(moduleId) {
        const candidateRoots = Array.from(new Set([
            SERVICE_CONFIG.modulesBasePath,
            path.resolve(this.commandCenterRoot, '..'),
            path.resolve(process.cwd(), 'tooling'),
            path.resolve(process.cwd(), '..'),
            process.cwd(),
        ]
            .filter((value) => typeof value === 'string' && value.trim().length > 0)
            .map((value) => path.resolve(value))));
        for (const rootPath of candidateRoots) {
            const directPath = path.join(rootPath, moduleId, 'src', 'tools.ts');
            if (existsSync(directPath))
                return directPath;
            const nestedPath = path.join(rootPath, 'tooling', moduleId, 'src', 'tools.ts');
            if (existsSync(nestedPath))
                return nestedPath;
        }
        return null;
    }
    readBalancedBraces(source, startIndex) {
        if (startIndex < 0 || source[startIndex] !== '{')
            return null;
        let depth = 0;
        let inSingle = false;
        let inDouble = false;
        let inTemplate = false;
        let inLineComment = false;
        let inBlockComment = false;
        let escape = false;
        for (let i = startIndex; i < source.length; i++) {
            const ch = source[i];
            const next = source[i + 1];
            if (inLineComment) {
                if (ch === '\n')
                    inLineComment = false;
                continue;
            }
            if (inBlockComment) {
                if (ch === '*' && next === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            if (inSingle) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '\'')
                    inSingle = false;
                continue;
            }
            if (inDouble) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '"')
                    inDouble = false;
                continue;
            }
            if (inTemplate) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '`')
                    inTemplate = false;
                continue;
            }
            if (ch === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (ch === '\'') {
                inSingle = true;
                continue;
            }
            if (ch === '"') {
                inDouble = true;
                continue;
            }
            if (ch === '`') {
                inTemplate = true;
                continue;
            }
            if (ch === '{')
                depth++;
            if (ch === '}') {
                depth--;
                if (depth === 0) {
                    return source.slice(startIndex, i + 1);
                }
            }
        }
        return null;
    }
    collectObjectRanges(source) {
        const ranges = [];
        const stack = [];
        let inSingle = false;
        let inDouble = false;
        let inTemplate = false;
        let inLineComment = false;
        let inBlockComment = false;
        let escape = false;
        for (let i = 0; i < source.length; i++) {
            const ch = source[i];
            const next = source[i + 1];
            if (inLineComment) {
                if (ch === '\n')
                    inLineComment = false;
                continue;
            }
            if (inBlockComment) {
                if (ch === '*' && next === '/') {
                    inBlockComment = false;
                    i++;
                }
                continue;
            }
            if (inSingle) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '\'')
                    inSingle = false;
                continue;
            }
            if (inDouble) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '"')
                    inDouble = false;
                continue;
            }
            if (inTemplate) {
                if (escape) {
                    escape = false;
                    continue;
                }
                if (ch === '\\') {
                    escape = true;
                    continue;
                }
                if (ch === '`')
                    inTemplate = false;
                continue;
            }
            if (ch === '/' && next === '/') {
                inLineComment = true;
                i++;
                continue;
            }
            if (ch === '/' && next === '*') {
                inBlockComment = true;
                i++;
                continue;
            }
            if (ch === '\'') {
                inSingle = true;
                continue;
            }
            if (ch === '"') {
                inDouble = true;
                continue;
            }
            if (ch === '`') {
                inTemplate = true;
                continue;
            }
            if (ch === '{') {
                stack.push(i);
                continue;
            }
            if (ch === '}' && stack.length > 0) {
                const start = stack.pop();
                ranges.push({ start, end: i });
            }
        }
        return ranges;
    }
    extractQuotedProperty(objectLiteral, propertyName) {
        const keyPattern = new RegExp(`\\b${propertyName}\\s*:`);
        const keyMatch = keyPattern.exec(objectLiteral);
        if (!keyMatch)
            return null;
        let i = keyMatch.index + keyMatch[0].length;
        while (i < objectLiteral.length && /\s/.test(objectLiteral[i]))
            i++;
        if (i >= objectLiteral.length)
            return null;
        const quote = objectLiteral[i];
        if (quote !== '\'' && quote !== '"' && quote !== '`')
            return null;
        i++;
        let value = '';
        let escape = false;
        for (; i < objectLiteral.length; i++) {
            const ch = objectLiteral[i];
            if (escape) {
                value += ch;
                escape = false;
                continue;
            }
            if (ch === '\\') {
                escape = true;
                continue;
            }
            if (ch === quote) {
                return value.trim();
            }
            value += ch;
        }
        return null;
    }
    extractSchemaLiteral(objectLiteral) {
        const schemaKeyMatch = /\b(parameters|input_schema)\s*:/.exec(objectLiteral);
        if (!schemaKeyMatch)
            return null;
        const searchFrom = schemaKeyMatch.index + schemaKeyMatch[0].length;
        const braceIndex = objectLiteral.indexOf('{', searchFrom);
        if (braceIndex < 0)
            return null;
        return this.readBalancedBraces(objectLiteral, braceIndex);
    }
    normalizeSchema(rawSchema) {
        if (!rawSchema || typeof rawSchema !== 'object' || Array.isArray(rawSchema)) {
            return { type: 'object', properties: {} };
        }
        const candidate = rawSchema;
        const properties = candidate.properties && typeof candidate.properties === 'object' && !Array.isArray(candidate.properties)
            ? candidate.properties
            : {};
        const required = Array.isArray(candidate.required)
            ? candidate.required.filter((entry) => typeof entry === 'string')
            : undefined;
        return {
            type: 'object',
            properties,
            ...(required && required.length > 0 ? { required } : {}),
        };
    }
    evaluateObjectLiteral(objectLiteral) {
        try {
            // Evaluate trusted, local module tool schema object literals.
            return Function(`"use strict"; return (${objectLiteral});`)();
        }
        catch {
            return null;
        }
    }
    extractToolsFromSource(moduleId, source) {
        const tools = [];
        const seen = new Set();
        const ranges = this.collectObjectRanges(source);
        const coveredRanges = new Set();
        const nameKeyPattern = /\bname\s*:/g;
        let match = null;
        while ((match = nameKeyPattern.exec(source))) {
            const index = match.index;
            let selectedRange = null;
            for (const range of ranges) {
                if (range.start <= index && index <= range.end) {
                    if (!selectedRange || (range.end - range.start) < (selectedRange.end - selectedRange.start)) {
                        selectedRange = range;
                    }
                }
            }
            if (!selectedRange)
                continue;
            const rangeKey = `${selectedRange.start}:${selectedRange.end}`;
            if (coveredRanges.has(rangeKey))
                continue;
            coveredRanges.add(rangeKey);
            const objectLiteral = source.slice(selectedRange.start, selectedRange.end + 1);
            const name = this.extractQuotedProperty(objectLiteral, 'name');
            const description = this.extractQuotedProperty(objectLiteral, 'description');
            if (!name || !description || seen.has(name))
                continue;
            const schemaLiteral = this.extractSchemaLiteral(objectLiteral);
            const rawSchema = schemaLiteral ? this.evaluateObjectLiteral(schemaLiteral) : null;
            const normalized = this.normalizeToolDefinition({
                name,
                description,
                parameters: this.normalizeSchema(rawSchema),
            });
            tools.push(normalized);
            seen.add(name);
        }
        if (tools.length === 0) {
            throw new Error(`No tool definitions parsed from ${moduleId}/src/tools.ts`);
        }
        return tools;
    }
    loadModuleTools(moduleId) {
        const sourcePath = this.resolveModuleToolSourcePath(moduleId);
        if (!sourcePath) {
            const fallback = this.getFallbackTools(moduleId);
            if (fallback)
                return fallback;
            throw new Error(`Tool source not found for module '${moduleId}'`);
        }
        const source = readFileSync(sourcePath, 'utf8');
        return this.extractToolsFromSource(moduleId, source);
    }
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
     * Auto-discover modules by scanning manifest and ingesting module tools.
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
                const tools = this.loadModuleTools(manifest.id);
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