import { OnboardingConfig, Employee } from '../data/schema.js';
import { Repository } from '../data/repository.js';
import { isTestMode } from '../config/index.js';

export interface FolderStructure {
  folders: string[];
  department: string;
}

export interface FolderService {
  getFolderStructure(department: string): Promise<FolderStructure>;
  createFolders(employee: Employee, config: OnboardingConfig): Promise<FolderStructure>;
}

export class StandardFolderService implements FolderService {
  constructor(private repo: Repository) {}

  async getFolderStructure(department: string): Promise<FolderStructure> {
    const config = await this.repo.getConfig(department);
    if (!config) {
      return {
        folders: [
          '0-Operations',
          '1-Contracts',
          '2-Deliverables',
          '3-Automations',
          '4-Reports',
          '5-Finance',
          'Templates',
        ],
        department,
      };
    }

    return {
      folders: config.folder_template,
      department,
    };
  }

  async createFolders(employee: Employee, config: OnboardingConfig): Promise<FolderStructure> {
    const structure = await this.getFolderStructure(employee.department);

    if (isTestMode()) {
      // Simulate folder creation in test mode
      return {
        ...structure,
        folders: structure.folders.map((folder) => `[TEST] ${folder}`),
      };
    }

    // In production, return folder creation commands for Apps Script to execute
    // The actual folder creation happens in Apps Script via the returned structure
    return structure;
  }
}
