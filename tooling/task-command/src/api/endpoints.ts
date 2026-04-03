import { runtime } from "./runtime.js";
import type { TaskPriority, TaskStatus } from "../data/models.js";

export const endpoints = {
  createTask: (payload: Record<string, unknown>) =>
    runtime.taskService.createTask({
      title: String(payload.title ?? ""),
      description: payload.description ? String(payload.description) : undefined,
      departmentId: String(payload.departmentId ?? ""),
      categoryId: payload.categoryId ? String(payload.categoryId) : undefined,
      createdBy: payload.createdBy ? String(payload.createdBy) : undefined,
      assignedTo: payload.assignedTo ? String(payload.assignedTo) : undefined,
      priority: (payload.priority as TaskPriority | undefined) ?? "medium",
      dueDate: payload.dueDate ? String(payload.dueDate) : undefined,
      estimatedHours: payload.estimatedHours ? Number(payload.estimatedHours) : undefined,
      tags: Array.isArray(payload.tags) ? (payload.tags as string[]) : [],
    }),
  assignTask: (payload: Record<string, unknown>) =>
    runtime.taskService.assignTask(String(payload.taskId ?? ""), String(payload.assigneeId ?? ""), String(payload.changedBy ?? "")),
  updateStatus: (payload: Record<string, unknown>) =>
    runtime.taskService.updateStatus(String(payload.taskId ?? ""), String(payload.status ?? "open") as TaskStatus, String(payload.changedBy ?? "")),
  getDepartmentTasks: (payload: Record<string, unknown>) =>
    runtime.taskService.getDepartmentTasks(String(payload.departmentId ?? ""), payload.viewerUserId ? String(payload.viewerUserId) : undefined),
  getOverdueTasks: () => runtime.taskService.getOverdueTasks(),
  getWorkloadReport: (payload: Record<string, unknown>) =>
    runtime.reporting.getWorkloadAnalysis(payload.departmentId ? String(payload.departmentId) : undefined),
  getDepartmentSummary: (payload: Record<string, unknown>) => runtime.reporting.getDepartmentSummary(String(payload.departmentId ?? "")),
  listUsers: () => runtime.userService.listUsers(),
  listDepartments: () => runtime.departmentService.listDepartments(),
  listCategories: (payload: Record<string, unknown>) => runtime.categoryService.listCategories(payload.departmentId ? String(payload.departmentId) : undefined),
};
