export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

import { runtime } from "./api/runtime.js";
import type { TaskStatus } from "./data/models.js";

export const tools: ToolDefinition[] = [
  {
    name: "create_task",
    description: "Create a task in the task-command module.",
    parameters: {
      type: "object",
      properties: {
        title: { type: "string" },
        departmentId: { type: "string" },
        priority: { type: "string", enum: ["critical", "high", "medium", "low"] },
        categoryId: { type: "string" },
        description: { type: "string" },
        dueDate: { type: "string", description: "YYYY-MM-DD" },
      },
      required: ["title", "departmentId"],
    },
    handler: async (params) => ({ success: true, data: runtime.taskService.createTask(params as never) }),
  },
  {
    name: "assign_task",
    description: "Assign a task to a specific user.",
    parameters: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        assigneeId: { type: "string" },
        changedBy: { type: "string" },
      },
      required: ["taskId", "assigneeId"],
    },
    handler: async (params) => ({
      success: true,
      data: runtime.taskService.assignTask(String(params.taskId), String(params.assigneeId), params.changedBy ? String(params.changedBy) : undefined),
    }),
  },
  {
    name: "update_status",
    description: "Update task status and write a history entry.",
    parameters: {
      type: "object",
      properties: {
        taskId: { type: "string" },
        status: { type: "string", enum: ["open", "in_progress", "review", "blocked", "completed", "cancelled"] },
        changedBy: { type: "string" },
      },
      required: ["taskId", "status"],
    },
    handler: async (params) => ({
      success: true,
      data: runtime.taskService.updateStatus(String(params.taskId), String(params.status) as TaskStatus, params.changedBy ? String(params.changedBy) : undefined),
    }),
  },
  {
    name: "get_department_tasks",
    description: "List tasks scoped to a department, optionally filtered by viewer permissions.",
    parameters: {
      type: "object",
      properties: {
        departmentId: { type: "string" },
        viewerUserId: { type: "string" },
      },
      required: ["departmentId"],
    },
    handler: async (params) => ({
      success: true,
      data: runtime.taskService.getDepartmentTasks(String(params.departmentId), params.viewerUserId ? String(params.viewerUserId) : undefined),
    }),
  },
  {
    name: "get_overdue_tasks",
    description: "Return all overdue non-completed tasks.",
    parameters: { type: "object", properties: {} },
    handler: async () => ({ success: true, data: runtime.taskService.getOverdueTasks() }),
  },
  {
    name: "get_workload_report",
    description: "Return workload analysis by assignee.",
    parameters: { type: "object", properties: { departmentId: { type: "string" } } },
    handler: async (params) => ({
      success: true,
      data: runtime.reporting.getWorkloadAnalysis(params.departmentId ? String(params.departmentId) : undefined),
    }),
  },
  {
    name: "get_completion_metrics",
    description: "Return task completion metrics and statistics.",
    parameters: { type: "object", properties: {} },
    handler: async () => ({
      success: true,
      data: runtime.reporting.getCompletionMetrics(),
    }),
  },
  {
    name: "get_department_summary",
    description: "Get task summary for a specific department including status breakdown.",
    parameters: {
      type: "object",
      properties: {
        departmentId: { type: "string" },
      },
      required: ["departmentId"],
    },
    handler: async (params) => ({
      success: true,
      data: runtime.reporting.getDepartmentSummary(String(params.departmentId ?? "")),
    }),
  },
];
