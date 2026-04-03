import type { TaskRepository } from "../data/repository.js";

export function getCompletionMetrics(repo: TaskRepository) {
  const tasks = repo.listTasks();
  const completed = tasks.filter((task) => task.status === "completed");

  const avgActualHours =
    completed.length === 0
      ? 0
      : Number(
          (completed.reduce((sum, task) => sum + (task.actualHours ?? 0), 0) / completed.length).toFixed(2),
        );

  return {
    totalTasks: tasks.length,
    completedTasks: completed.length,
    completionRate: tasks.length === 0 ? 0 : Number(((completed.length / tasks.length) * 100).toFixed(2)),
    avgActualHours,
  };
}
