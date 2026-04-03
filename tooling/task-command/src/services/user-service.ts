import type { User } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export class UserService {
  constructor(private readonly repo: TaskRepository) {}

  listUsers(): User[] {
    return this.repo.listUsers();
  }
}
