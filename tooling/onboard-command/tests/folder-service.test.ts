import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryRepository } from '../src/data/repository.js';
import { StandardFolderService } from '../src/services/folder-service.js';
import { OnboardingConfigSchema, EmployeeSchema } from '../src/data/schema.js';

describe('Folder Service', () => {
  let repo: InMemoryRepository;
  let folderService: StandardFolderService;

  beforeEach(() => {
    repo = new InMemoryRepository();
    folderService = new StandardFolderService(repo);
  });

  it('should return default folder structure', async () => {
    const structure = await folderService.getFolderStructure('NonExistentDept');

    expect(structure.folders).toContain('0-Operations');
    expect(structure.folders).toContain('1-Contracts');
    expect(structure.folders).toContain('2-Deliverables');
    expect(structure.folders).toContain('3-Automations');
    expect(structure.folders).toContain('4-Reports');
    expect(structure.folders).toContain('5-Finance');
    expect(structure.folders).toContain('Templates');
  });

  it('should return department-specific folder structure', async () => {
    const config = OnboardingConfigSchema.parse({
      id: 'CustomDept',
      folder_template: ['Custom1', 'Custom2', 'Custom3'],
    });

    await repo.createConfig(config);
    const structure = await folderService.getFolderStructure('CustomDept');

    expect(structure.folders).toEqual(['Custom1', 'Custom2', 'Custom3']);
  });

  it('should create folders for employee in test mode', async () => {
    process.env.MODE = 'test';

    const config = OnboardingConfigSchema.parse({
      id: 'TestDept',
      folder_template: ['Folder1', 'Folder2'],
    });

    await repo.createConfig(config);

    const employee = EmployeeSchema.parse({
      name: 'Test Employee',
      email: 'test@test.com',
      department: 'TestDept',
      role: 'Developer',
      license_type: 'standard',
    });

    const structure = await folderService.createFolders(employee, config);

    expect(structure.folders[0]).toContain('[TEST]');
  });

  it('should return folder structure without modification in production', async () => {
    process.env.MODE = 'production';

    const config = OnboardingConfigSchema.parse({
      id: 'ProdDept',
      folder_template: ['ProdFolder1', 'ProdFolder2'],
    });

    await repo.createConfig(config);

    const employee = EmployeeSchema.parse({
      name: 'Prod Employee',
      email: 'prod@test.com',
      department: 'ProdDept',
      role: 'Manager',
      license_type: 'standard',
    });

    const structure = await folderService.createFolders(employee, config);

    expect(structure.folders).toEqual(['ProdFolder1', 'ProdFolder2']);
  });

  it('should include all default 7 folders plus Templates', async () => {
    const structure = await folderService.getFolderStructure('DefaultDept');

    expect(structure.folders.length).toBe(7);
    const expectedFolders = ['0-Operations', '1-Contracts', '2-Deliverables', '3-Automations', '4-Reports', '5-Finance', 'Templates'];
    expect(structure.folders).toEqual(expect.arrayContaining(expectedFolders));
  });

  it('should preserve department info in structure', async () => {
    const structure = await folderService.getFolderStructure('Engineering');

    expect(structure.department).toBe('Engineering');
  });
});
