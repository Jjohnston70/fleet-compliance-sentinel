import { Resource } from '../data/schema';
import { IRepository } from '../data/repository';

export class ResourceService {
  constructor(private repo: IRepository) {}

  async createResource(resource: Resource): Promise<Resource> {
    return this.repo.createResource(resource);
  }

  async getResource(id: string): Promise<Resource | null> {
    return this.repo.getResource(id);
  }

  async getResourceWithAccessCheck(
    id: string,
    studentPlan: 'free' | 'basic' | 'professional' | 'enterprise'
  ): Promise<Resource | null> {
    const resource = await this.repo.getResource(id);
    if (!resource) return null;

    if (!this.canAccessResource(resource.access_level, studentPlan)) {
      throw new Error(
        `${studentPlan} plan does not have access to ${resource.access_level} resources`
      );
    }

    return resource;
  }

  async listResources(filters?: {
    type?: string;
    category?: string;
    studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise';
  }): Promise<Resource[]> {
    let resources = await this.repo.listResources({
      type: filters?.type,
      category: filters?.category,
    });

    if (filters?.studentPlan) {
      resources = resources.filter((r) =>
        this.canAccessResource(r.access_level, filters.studentPlan!)
      );
    }

    return resources;
  }

  async updateResource(id: string, updates: Partial<Resource>): Promise<Resource> {
    return this.repo.updateResource(id, updates);
  }

  async deleteResource(id: string): Promise<void> {
    return this.repo.deleteResource(id);
  }

  async recordDownload(id: string): Promise<Resource> {
    const resource = await this.repo.getResource(id);
    if (!resource) throw new Error(`Resource ${id} not found`);

    return this.repo.updateResource(id, {
      download_count: resource.download_count + 1,
    });
  }

  async searchResources(
    query: string,
    studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'
  ): Promise<Resource[]> {
    let resources = await this.repo.listResources();

    const lowerQuery = query.toLowerCase();

    resources = resources.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
        r.type.includes(lowerQuery) ||
        r.category.toLowerCase().includes(lowerQuery)
    );

    if (studentPlan) {
      resources = resources.filter((r) =>
        this.canAccessResource(r.access_level, studentPlan)
      );
    }

    return resources;
  }

  async getResourcesByIndustry(
    industry: string,
    studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'
  ): Promise<Resource[]> {
    let resources = await this.repo.listResources({
      category: industry,
    });

    if (studentPlan) {
      resources = resources.filter((r) =>
        this.canAccessResource(r.access_level, studentPlan)
      );
    }

    return resources;
  }

  private canAccessResource(
    resourceAccessLevel: 'free' | 'basic' | 'professional',
    studentPlan: 'free' | 'basic' | 'professional' | 'enterprise'
  ): boolean {
    const accessHierarchy: Record<string, number> = {
      free: 0,
      basic: 1,
      professional: 2,
      enterprise: 3,
    };

    const resourceLevel = accessHierarchy[resourceAccessLevel];
    const studentLevel = accessHierarchy[studentPlan];

    return studentLevel >= resourceLevel;
  }
}
