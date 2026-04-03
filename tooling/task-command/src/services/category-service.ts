import type { Category } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export class CategoryService {
  constructor(private readonly repo: TaskRepository) {}

  listCategories(departmentId?: string): Category[] {
    return this.repo
      .listCategories()
      .filter((category) => category.active && (!departmentId || category.departmentId === departmentId));
  }
}
