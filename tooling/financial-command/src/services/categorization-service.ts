import { Category } from '../data/firestore-schema.js';
import { IRepository } from '../data/in-memory-repository.js';
import { categorizeByKeywords } from '../config/category-seeds.js';

export class CategorizationService {
  constructor(private repo: IRepository) {}

  async categorizeTransaction(description: string): Promise<Category | null> {
    const categories = await this.repo.listCategories();
    return this.categorizeByDescription(description, categories);
  }

  private categorizeByDescription(description: string, categories: Category[]): Category | null {
    const lowerDesc = description.toLowerCase();
    
    // Exact keyword matching
    for (const category of categories) {
      for (const keyword of category.keywords) {
        if (lowerDesc.includes(keyword.toLowerCase())) {
          return category;
        }
      }
    }

    // USAA-specific rules
    if (lowerDesc.includes('usaa')) {
      if (lowerDesc.includes('insurance')) {
        return categories.find(c => c.name.includes('Insurance')) ?? null;
      }
      if (lowerDesc.includes('transfer') || lowerDesc.includes('move')) {
        return categories.find(c => c.type === 'transfer') ?? null;
      }
      if (lowerDesc.includes('interest')) {
        return categories.find(c => c.name.includes('Interest')) ?? null;
      }
    }

    return null;
  }

  async getDefaultCategoryForType(type: 'income' | 'expense' | 'transfer'): Promise<Category | null> {
    const categories = await this.repo.listCategories();
    return categories.find(c => c.type === type) ?? null;
  }
}
