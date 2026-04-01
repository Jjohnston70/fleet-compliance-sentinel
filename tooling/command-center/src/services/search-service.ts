/**
 * Search Service
 * Full-text search across tool names/descriptions, filter by module/classification/tag
 */

import { registry } from '../data/in-memory-registry.js';
import { RegisteredModule } from '../data/schema.js';

export interface SearchResult {
  moduleId: string;
  moduleName: string;
  toolName: string;
  toolDescription: string;
  qualifiedName: string;
  matchScore: number;
}

export class SearchService {
  /**
   * Search tools by keyword
   * Ranks by relevance (name match > description match)
   */
  search(
    query: string,
    filters?: {
      moduleId?: string;
      classification?: RegisteredModule['classification'];
    },
  ): SearchResult[] {
    const queryLower = query.toLowerCase();
    const results: SearchResult[] = [];

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
          if (nameMatch) matchScore += 100;
          if (descMatch) matchScore += 50;

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
  filter(filters: {
    moduleId?: string;
    classification?: RegisteredModule['classification'];
  }): SearchResult[] {
    const results: SearchResult[] = [];

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
  getClassifications(): Array<{ classification: RegisteredModule['classification']; count: number }> {
    const counts = new Map<string, number>();

    registry.listModules().forEach((module) => {
      counts.set(module.classification, (counts.get(module.classification) || 0) + 1);
    });

    return Array.from(counts.entries())
      .map(([classification, count]) => ({
        classification: classification as RegisteredModule['classification'],
        count,
      }))
      .sort((a, b) => a.classification.localeCompare(b.classification));
  }
}

export const searchService = new SearchService();
