import type { Task } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export function runOverdueChecker(repo: TaskRepository, now: Date = new Date()): {
  checkedAt: string;
  overdueCount: number;
  tasks: Task[];
} {
  const today = now.toISOString().slice(0, 10);
  const overdueTasks = repo
    .listTasks()
    .filter((task) => !!task.dueDate && task.dueDate < today && task.status !== "completed" && task.status !== "cancelled");

  return {
    checkedAt: now.toISOString(),
    overdueCount: overdueTasks.length,
    tasks: overdueTasks,
  };
}
