import type { Department } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export class DepartmentService {
  constructor(private readonly repo: TaskRepository) {}

  listDepartments(): Department[] {
    return this.repo.listDepartments().filter((department) => department.active);
  }
}
