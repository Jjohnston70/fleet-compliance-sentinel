export type UserRole = "admin" | "manager" | "member";
export type TaskStatus = "open" | "in_progress" | "review" | "blocked" | "completed" | "cancelled";
export type TaskPriority = "critical" | "high" | "medium" | "low";

export interface Department {
  id: string;
  name: string;
  description?: string;
  leadId?: string;
  colorCode?: string;
  active: boolean;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  departmentId?: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  departmentId?: string;
  colorCode?: string;
  active: boolean;
}

export interface Task {
  id: string;
  taskNumber: string;
  title: string;
  description?: string;
  departmentId: string;
  categoryId?: string;
  assignedTo?: string;
  createdBy?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: string;
  completedDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskHistory {
  id: string;
  taskId: string;
  fieldChanged: string;
  oldValue?: string;
  newValue?: string;
  changedBy?: string;
  changedAt: string;
}
