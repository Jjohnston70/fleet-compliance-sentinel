/**
 * Search Service
 * Full-text search across tool names/descriptions, filter by module/classification/tag
 */
import { RegisteredModule } from '../data/schema.js';
export interface SearchResult {
    moduleId: string;
    moduleName: string;
    toolName: string;
    toolDescription: string;
    qualifiedName: string;
    matchScore: number;
}
interface ToolSelectionFilters {
    moduleId?: string;
    classification?: RegisteredModule['classification'];
}
interface ToolSelectionOptions {
    query?: string;
    intent?: string;
    filters?: ToolSelectionFilters;
    maxTools?: number;
}
export declare class SearchService {
    private selectionCache;
    private clampSelectionCap;
    private tokenize;
    private scoreCandidate;
    private buildSelectionCacheKey;
    selectRelevantTools(options: ToolSelectionOptions): SearchResult[];
    /**
     * Search tools by keyword
     * Ranks by relevance (name match > description match)
     */
    search(query: string, filters?: ToolSelectionFilters): SearchResult[];
    /**
     * Get all tools matching a filter
     */
    filter(filters: ToolSelectionFilters): SearchResult[];
    /**
     * Get distinct classifications with module counts
     */
    getClassifications(): Array<{
        classification: RegisteredModule['classification'];
        count: number;
    }>;
}
export declare const searchService: SearchService;
export {};
//# sourceMappingURL=search-service.d.ts.map