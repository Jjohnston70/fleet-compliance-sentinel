import type { Task } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export function runStaleTaskNotifier(
  repo: TaskRepository,
  staleDays: number = 7,
  now: Date = new Date()
): {
  checkedAt: string;
  staleTaskCount: number;
  tasks: Task[];
} {
  const cutoffDate = new Date(now.getTime() - staleDays * 24 * 60 * 60 * 1000);
  const tasks = repo.listTasks();

  const staleTasks = tasks.filter((task) => {
    if (task.status !== "in_progress") {
      return false;
    }
    const updatedAt = new Date(task.updatedAt);
    return updatedAt < cutoffDate;
  });

  return {
    checkedAt: now.toISOString(),
    staleTaskCount: staleTasks.length,
    tasks: staleTasks,
  };
}
