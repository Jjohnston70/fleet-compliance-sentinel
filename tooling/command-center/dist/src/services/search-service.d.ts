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
export declare class SearchService {
    /**
     * Search tools by keyword
     * Ranks by relevance (name match > description match)
     */
    search(query: string, filters?: {
        moduleId?: string;
        classification?: RegisteredModule['classification'];
    }): SearchResult[];
    /**
     * Get all tools matching a filter
     */
    filter(filters: {
        moduleId?: string;
        classification?: RegisteredModule['classification'];
    }): SearchResult[];
    /**
     * Get distinct classifications with module counts
     */
    getClassifications(): Array<{
        classification: RegisteredModule['classification'];
        count: number;
    }>;
}
export declare const searchService: SearchService;
//# sourceMappingURL=search-service.d.ts.map