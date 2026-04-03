import { randomUUID } from "node:crypto";

import type { Category, Department, Task, TaskHistory, User } from "./models.js";
import type { TaskRepository } from "./repository.js";

type Seed = {
  departments: Department[];
  users: User[];
  categories: Category[];
  tasks: Task[];
};

export function createInMemoryTaskRepository(seed: Seed): TaskRepository {
  const departments = [...seed.departments];
  const users = [...seed.users];
  const categories = [...seed.categories];
  const tasks = new Map<string, Task>(seed.tasks.map((task) => [task.id, task]));
  const history: TaskHistory[] = [];

  return {
    listDepartments: () => departments,
    listUsers: () => users,
    listCategories: () => categories,
    getTaskById: (taskId) => tasks.get(taskId) ?? null,
    getTaskByNumber: (taskNumber) => [...tasks.values()].find((task) => task.taskNumber === taskNumber) ?? null,
    listTasks: () => [...tasks.values()],
    saveTask(task) {
      tasks.set(task.id, task);
      return task;
    },
    saveHistory(entry) {
      const persisted = { ...entry, id: entry.id || `hist_${randomUUID()}` };
      history.push(persisted);
      return persisted;
    },
    listTaskHistory(taskId) {
      return taskId ? history.filter((entry) => entry.taskId === taskId) : history;
    },
  };
}
