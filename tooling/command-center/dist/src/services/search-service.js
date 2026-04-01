/**
 * Search Service
 * Full-text search across tool names/descriptions, filter by module/classification/tag
 */
import { registry } from '../data/in-memory-registry.js';
const DEFAULT_TOOL_SELECTION_CAP = 12;
const MAX_TOOL_SELECTION_CAP = 15;
const SELECTION_CACHE_TTL_MS = 60_000;
export class SearchService {
    selectionCache = new Map();
    clampSelectionCap(value) {
        const fallback = DEFAULT_TOOL_SELECTION_CAP;
        if (typeof value !== 'number' || Number.isNaN(value))
            return fallback;
        return Math.max(1, Math.min(MAX_TOOL_SELECTION_CAP, Math.floor(value)));
    }
    tokenize(value) {
        const tokens = value
            .toLowerCase()
            .split(/[^a-z0-9_]+/g)
            .map((token) => token.trim())
            .filter(Boolean);
        return Array.from(new Set(tokens));
    }
    scoreCandidate(candidate, contextLower, tokens) {
        const toolNameLower = candidate.toolName.toLowerCase();
        const descriptionLower = candidate.toolDescription.toLowerCase();
        const moduleNameLower = candidate.moduleName.toLowerCase();
        const qualifiedLower = candidate.qualifiedName.toLowerCase();
        let score = 0;
        if (contextLower) {
            if (qualifiedLower === contextLower || toolNameLower === contextLower) {
                score += 240;
            }
            if (qualifiedLower.includes(contextLower) || toolNameLower.includes(contextLower)) {
                score += 120;
            }
            if (descriptionLower.includes(contextLower)) {
                score += 40;
            }
        }
        for (const token of tokens) {
            if (token.length === 0)
                continue;
            if (toolNameLower === token)
                score += 80;
            if (toolNameLower.includes(token))
                score += 25;
            if (qualifiedLower.includes(token))
                score += 20;
            if (moduleNameLower.includes(token))
                score += 10;
            if (descriptionLower.includes(token))
                score += 8;
        }
        return score;
    }
    buildSelectionCacheKey(options, cap) {
        const query = (options.query || '').trim().toLowerCase();
        const intent = (options.intent || '').trim().toLowerCase();
        const moduleId = (options.filters?.moduleId || '').trim().toLowerCase();
        const classification = (options.filters?.classification || '').trim().toLowerCase();
        return [query, intent, moduleId, classification, cap].join('|');
    }
    selectRelevantTools(options) {
        const cap = this.clampSelectionCap(options.maxTools);
        const cacheKey = this.buildSelectionCacheKey(options, cap);
        const now = Date.now();
        const cached = this.selectionCache.get(cacheKey);
        if (cached && cached.expiresAt > now) {
            return cached.results;
        }
        const context = `${options.query || ''} ${options.intent || ''}`.trim();
        const contextLower = context.toLowerCase();
        const tokens = this.tokenize(contextLower);
        const candidates = this.filter(options.filters || {}).map((candidate) => ({
            ...candidate,
            matchScore: this.scoreCandidate(candidate, contextLower, tokens),
        }));
        const scored = context
            ? candidates.filter((candidate) => candidate.matchScore > 0)
            : candidates;
        const pool = scored.length > 0 ? scored : candidates;
        const selected = pool
            .sort((a, b) => {
            if (b.matchScore !== a.matchScore)
                return b.matchScore - a.matchScore;
            return a.qualifiedName.localeCompare(b.qualifiedName);
        })
            .slice(0, cap);
        this.selectionCache.set(cacheKey, {
            expiresAt: now + SELECTION_CACHE_TTL_MS,
            results: selected,
        });
        return selected;
    }
    /**
     * Search tools by keyword
     * Ranks by relevance (name match > description match)
     */
    search(query, filters) {
        const queryLower = query.toLowerCase();
        const results = [];
        const modules = registry.listModules();
        modules.forEach((module) => {
            // Apply module filter
            if (filters?.moduleId && module.id !== filters.moduleId) {
                return;
            }
            // Apply classification filter
            if (filters?.classification && module.classification !== filters.classification) {
                return;
            }
            // Search tools in this module
            module.tools.forEach((tool) => {
                const nameMatch = tool.name.toLowerCase().includes(queryLower);
                const descMatch = tool.description.toLowerCase().includes(queryLower);
                if (nameMatch || descMatch) {
                    // Name match scores higher
                    let matchScore = 0;
                    if (nameMatch)
                        matchScore += 100;
                    if (descMatch)
                        matchScore += 50;
                    // Boost exact name match
                    if (tool.name.toLowerCase() === queryLower) {
                        matchScore += 200;
                    }
                    results.push({
                        moduleId: module.id,
                        moduleName: module.displayName,
                        toolName: tool.name,
                        toolDescription: tool.description,
                        qualifiedName: `${module.id}.${tool.name}`,
                        matchScore,
                    });
                }
            });
        });
        // Sort by match score descending
        return results.sort((a, b) => b.matchScore - a.matchScore);
    }
    /**
     * Get all tools matching a filter
     */
    filter(filters) {
        const results = [];
        const modules = registry.listModules();
        modules.forEach((module) => {
            if (filters.moduleId && module.id !== filters.moduleId) {
                return;
            }
            if (filters.classification && module.classification !== filters.classification) {
                return;
            }
            module.tools.forEach((tool) => {
                results.push({
                    moduleId: module.id,
                    moduleName: module.displayName,
                    toolName: tool.name,
                    toolDescription: tool.description,
                    qualifiedName: `${module.id}.${tool.name}`,
                    matchScore: 0,
                });
            });
        });
        return results;
    }
    /**
     * Get distinct classifications with module counts
     */
    getClassifications() {
        const counts = new Map();
        registry.listModules().forEach((module) => {
            counts.set(module.classification, (counts.get(module.classification) || 0) + 1);
        });
        return Array.from(counts.entries())
            .map(([classification, count]) => ({
            classification: classification,
            count,
        }))
            .sort((a, b) => a.classification.localeCompare(b.classification));
    }
}
export const searchService = new SearchService();
//# sourceMappingURL=search-service.js.map