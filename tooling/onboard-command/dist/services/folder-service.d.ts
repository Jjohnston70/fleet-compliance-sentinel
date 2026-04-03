import { OnboardingConfig, Employee } from '../data/schema.js';
import { Repository } from '../data/repository.js';
export interface FolderStructure {
    folders: string[];
    department: string;
}
export interface FolderService {
    getFolderStructure(department: string): Promise<FolderStructure>;
    createFolders(employee: Employee, config: OnboardingConfig): Promise<FolderStructure>;
}
export declare class StandardFolderService implements FolderService {
    private repo;
    constructor(repo: Repository);
    getFolderStructure(department: string): Promise<FolderStructure>;
    createFolders(employee: Employee, config: OnboardingConfig): Promise<FolderStructure>;
}
//# sourceMappingURL=folder-service.d.ts.map