import type { TaskRepository } from "../data/repository.js";

export function getWorkloadAnalysis(repo: TaskRepository, departmentId?: string) {
  const tasks = repo
    .listTasks()
    .filter((task) => !departmentId || task.departmentId === departmentId)
    .filter((task) => task.status !== "completed" && task.status !== "cancelled");

  const users = repo.listUsers();

  const byAssignee = tasks.reduce<Record<string, number>>((acc, task) => {
    const key = task.assignedTo ?? "unassigned";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const assignees = Object.entries(byAssignee).map(([assigneeId, openTasks]) => {
    const user = users.find((candidate) => candidate.id === assigneeId);
    return {
      assigneeId,
      assigneeName: user?.name ?? "Unassigned",
      openTasks,
    };
  });

  return {
    departmentId: departmentId ?? null,
    assignees: assignees.sort((a, b) => b.openTasks - a.openTasks),
    totalOpenTasks: tasks.length,
  };
}
