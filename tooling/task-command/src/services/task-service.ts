import { randomUUID } from "node:crypto";

import type { Task, TaskPriority, TaskStatus, User } from "../data/models.js";
import type { TaskRepository } from "../data/repository.js";

export type CreateTaskInput = {
  title: string;
  description?: string;
  departmentId: string;
  categoryId?: string;
  createdBy?: string;
  assignedTo?: string;
  priority?: TaskPriority;
  dueDate?: string;
  estimatedHours?: number;
  tags?: string[];
};

export class TaskService {
  constructor(private readonly repo: TaskRepository) {}

  generateTaskNumber(now: Date = new Date()): string {
    const timestamp = now.getTime();
    const randomPart = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    return `TASK-${timestamp}-${randomPart}`;
  }

  createTask(input: CreateTaskInput): Task {
    if (!input.title?.trim()) {
      throw new Error("title is required");
    }
    if (!input.departmentId?.trim()) {
      throw new Error("departmentId is required");
    }

    const now = new Date().toISOString();
    const task: Task = {
      id: `task_${randomUUID()}`,
      taskNumber: this.generateTaskNumber(new Date()),
      title: input.title.trim(),
      description: input.description,
      departmentId: input.departmentId,
      categoryId: input.categoryId,
      assignedTo: input.assignedTo,
      createdBy: input.createdBy,
      status: "open",
      priority: input.priority ?? "medium",
      dueDate: input.dueDate,
      estimatedHours: input.estimatedHours,
      tags: input.tags ?? [],
      createdAt: now,
      updatedAt: now,
    };

    return this.repo.saveTask(task);
  }

  assignTask(taskId: string, assigneeId: string, changedBy?: string): Task {
    const task = this.repo.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }
    const updated: Task = { ...task, assignedTo: assigneeId, updatedAt: new Date().toISOString() };
    this.repo.saveTask(updated);

    this.repo.saveHistory({
      id: "",
      taskId: task.id,
      fieldChanged: "assigned_to",
      oldValue: task.assignedTo,
      newValue: assigneeId,
      changedBy,
      changedAt: new Date().toISOString(),
    });

    return updated;
  }

  updateStatus(taskId: string, status: TaskStatus, changedBy?: string): Task {
    const task = this.repo.getTaskById(taskId);
    if (!task) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const updated: Task = {
      ...task,
      status,
      completedDate: status === "completed" ? new Date().toISOString() : task.completedDate,
      updatedAt: new Date().toISOString(),
    };
    this.repo.saveTask(updated);

    this.repo.saveHistory({
      id: "",
      taskId: task.id,
      fieldChanged: "status",
      oldValue: task.status,
      newValue: status,
      changedBy,
      changedAt: new Date().toISOString(),
    });

    return updated;
  }

  getDepartmentTasks(departmentId: string, viewerUserId?: string): Task[] {
    const tasks = this.repo.listTasks().filter((task) => task.departmentId === departmentId);
    if (!viewerUserId) {
      return tasks;
    }
    const user = this.repo.listUsers().find((candidate) => candidate.id === viewerUserId);
    if (!user) {
      throw new Error(`Viewer user not found: ${viewerUserId}`);
    }
    return this.filterTasksForViewer(tasks, user);
  }

  filterTasksForViewer(tasks: Task[], viewer: User): Task[] {
    if (viewer.role === "admin") {
      return tasks;
    }
    return tasks.filter((task) => task.departmentId === viewer.departmentId);
  }

  getOverdueTasks(referenceDate: Date = new Date()): Task[] {
    const nowDate = referenceDate.toISOString().slice(0, 10);
    return this.repo
      .listTasks()
      .filter((task) => !!task.dueDate && task.dueDate < nowDate && task.status !== "completed" && task.status !== "cancelled");
  }
}
