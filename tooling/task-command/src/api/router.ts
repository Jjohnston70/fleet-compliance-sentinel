import { runtime } from "./runtime.js";
import type { TaskPriority, TaskStatus } from "../data/models.js";

export type TaskAction =
  | "createTask"
  | "assignTask"
  | "updateStatus"
  | "getDepartmentTasks"
  | "getOverdueTasks"
  | "getWorkloadReport"
  | "getDepartmentSummary"
  | "listUsers"
  | "listDepartments"
  | "listCategories";

export async function handleAction(action: TaskAction, data: Record<string, unknown>) {
  switch (action) {
    case "createTask":
      return runtime.taskService.createTask({
        title: String(data.title ?? ""),
        description: data.description ? String(data.description) : undefined,
        departmentId: String(data.departmentId ?? ""),
        categoryId: data.categoryId ? String(data.categoryId) : undefined,
        createdBy: data.createdBy ? String(data.createdBy) : undefined,
        assignedTo: data.assignedTo ? String(data.assignedTo) : undefined,
        priority: (data.priority as TaskPriority | undefined) ?? "medium",
        dueDate: data.dueDate ? String(data.dueDate) : undefined,
        estimatedHours: data.estimatedHours ? Number(data.estimatedHours) : undefined,
        tags: Array.isArray(data.tags) ? (data.tags as string[]) : [],
      });
    case "assignTask":
      return runtime.taskService.assignTask(String(data.taskId ?? ""), String(data.assigneeId ?? ""), String(data.changedBy ?? ""));
    case "updateStatus":
      return runtime.taskService.updateStatus(String(data.taskId ?? ""), String(data.status ?? "open") as TaskStatus, String(data.changedBy ?? ""));
    case "getDepartmentTasks":
      return runtime.taskService.getDepartmentTasks(String(data.departmentId ?? ""), data.viewerUserId ? String(data.viewerUserId) : undefined);
    case "getOverdueTasks":
      return runtime.taskService.getOverdueTasks();
    case "getWorkloadReport":
      return runtime.reporting.getWorkloadAnalysis(data.departmentId ? String(data.departmentId) : undefined);
    case "getDepartmentSummary":
      return runtime.reporting.getDepartmentSummary(String(data.departmentId ?? ""));
    case "listUsers":
      return runtime.userService.listUsers();
    case "listDepartments":
      return runtime.departmentService.listDepartments();
    case "listCategories":
      return runtime.categoryService.listCategories(data.departmentId ? String(data.departmentId) : undefined);
    default:
      throw new Error(`Unknown action: ${action}`);
  }
}
