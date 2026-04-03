"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceService = void 0;
class ResourceService {
    constructor(repo) {
        this.repo = repo;
    }
    async createResource(resource) {
        return this.repo.createResource(resource);
    }
    async getResource(id) {
        return this.repo.getResource(id);
    }
    async getResourceWithAccessCheck(id, studentPlan) {
        const resource = await this.repo.getResource(id);
        if (!resource)
            return null;
        if (!this.canAccessResource(resource.access_level, studentPlan)) {
            throw new Error(`${studentPlan} plan does not have access to ${resource.access_level} resources`);
        }
        return resource;
    }
    async listResources(filters) {
        let resources = await this.repo.listResources({
            type: filters?.type,
            category: filters?.category,
        });
        if (filters?.studentPlan) {
            resources = resources.filter((r) => this.canAccessResource(r.access_level, filters.studentPlan));
        }
        return resources;
    }
    async updateResource(id, updates) {
        return this.repo.updateResource(id, updates);
    }
    async deleteResource(id) {
        return this.repo.deleteResource(id);
    }
    async recordDownload(id) {
        const resource = await this.repo.getResource(id);
        if (!resource)
            throw new Error(`Resource ${id} not found`);
        return this.repo.updateResource(id, {
            download_count: resource.download_count + 1,
        });
    }
    async searchResources(query, studentPlan) {
        let resources = await this.repo.listResources();
        const lowerQuery = query.toLowerCase();
        resources = resources.filter((r) => r.title.toLowerCase().includes(lowerQuery) ||
            r.description.toLowerCase().includes(lowerQuery) ||
            r.tags.some((t) => t.toLowerCase().includes(lowerQuery)) ||
            r.type.includes(lowerQuery) ||
            r.category.toLowerCase().includes(lowerQuery));
        if (studentPlan) {
            resources = resources.filter((r) => this.canAccessResource(r.access_level, studentPlan));
        }
        return resources;
    }
    async getResourcesByIndustry(industry, studentPlan) {
        let resources = await this.repo.listResources({
            category: industry,
        });
        if (studentPlan) {
            resources = resources.filter((r) => this.canAccessResource(r.access_level, studentPlan));
        }
        return resources;
    }
    canAccessResource(resourceAccessLevel, studentPlan) {
        const accessHierarchy = {
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
exports.ResourceService = ResourceService;
//# sourceMappingURL=resource-service.js.map