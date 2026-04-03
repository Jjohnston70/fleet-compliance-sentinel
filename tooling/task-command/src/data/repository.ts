import type { Category, Department, Task, TaskHistory, User } from "./models.js";

export interface TaskRepository {
  listDepartments(): Department[];
  listUsers(): User[];
  listCategories(): Category[];
  getTaskById(taskId: string): Task | null;
  getTaskByNumber(taskNumber: string): Task | null;
  listTasks(): Task[];
  saveTask(task: Task): Task;
  saveHistory(entry: TaskHistory): TaskHistory;
  listTaskHistory(taskId?: string): TaskHistory[];
}
