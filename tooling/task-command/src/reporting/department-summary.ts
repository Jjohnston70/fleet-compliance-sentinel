import type { TaskRepository } from "../data/repository.js";

export function getDepartmentSummary(repo: TaskRepository, departmentId: string) {
  const tasks = repo.listTasks().filter((task) => task.departmentId === departmentId);
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "completed").length;
  const overdue = tasks.filter((task) => task.dueDate && task.dueDate < new Date().toISOString().slice(0, 10) && task.status !== "completed").length;

  return {
    departmentId,
    totalTasks: total,
    completedTasks: completed,
    completionRate: total === 0 ? 0 : Math.round((completed / total) * 100),
    overdueTasks: overdue,
    byStatus: {
      open: tasks.filter((task) => task.status === "open").length,
      in_progress: tasks.filter((task) => task.status === "in_progress").length,
      review: tasks.filter((task) => task.status === "review").length,
      blocked: tasks.filter((task) => task.status === "blocked").length,
      completed,
      cancelled: tasks.filter((task) => task.status === "cancelled").length,
    },
  };
}
