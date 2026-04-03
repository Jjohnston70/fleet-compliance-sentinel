import { Resource } from '../data/schema';
import { IRepository } from '../data/repository';
export declare class ResourceService {
    private repo;
    constructor(repo: IRepository);
    createResource(resource: Resource): Promise<Resource>;
    getResource(id: string): Promise<Resource | null>;
    getResourceWithAccessCheck(id: string, studentPlan: 'free' | 'basic' | 'professional' | 'enterprise'): Promise<Resource | null>;
    listResources(filters?: {
        type?: string;
        category?: string;
        studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise';
    }): Promise<Resource[]>;
    updateResource(id: string, updates: Partial<Resource>): Promise<Resource>;
    deleteResource(id: string): Promise<void>;
    recordDownload(id: string): Promise<Resource>;
    searchResources(query: string, studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'): Promise<Resource[]>;
    getResourcesByIndustry(industry: string, studentPlan?: 'free' | 'basic' | 'professional' | 'enterprise'): Promise<Resource[]>;
    private canAccessResource;
}
//# sourceMappingURL=resource-service.d.ts.map