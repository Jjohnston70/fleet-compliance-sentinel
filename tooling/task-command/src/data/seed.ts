import type { Category, Department, Task, User } from "./models.js";

const now = new Date().toISOString();

export const DEPARTMENT_SEED: Department[] = [
  { id: "dep-general", name: "General", colorCode: "#64748B", active: true, createdAt: now },
  { id: "dep-marketing", name: "Marketing", colorCode: "#0EA5E9", active: true, createdAt: now },
  { id: "dep-finance", name: "Finance", colorCode: "#10B981", active: true, createdAt: now },
  { id: "dep-hr", name: "Human Resources", colorCode: "#F59E0B", active: true, createdAt: now },
  { id: "dep-it", name: "IT", colorCode: "#8B5CF6", active: true, createdAt: now },
  { id: "dep-operations", name: "Operations", colorCode: "#EF4444", active: true, createdAt: now },
  { id: "dep-sales", name: "Sales", colorCode: "#06B6D4", active: true, createdAt: now },
  { id: "dep-support", name: "Customer Support", colorCode: "#F97316", active: true, createdAt: now },
];

export const USER_SEED: User[] = [
  { id: "usr-john", name: "John Doe", email: "john.doe@example.com", departmentId: "dep-general", role: "admin", active: true, createdAt: now },
  { id: "usr-sarah", name: "Sarah Smith", email: "sarah.smith@example.com", departmentId: "dep-marketing", role: "manager", active: true, createdAt: now },
  { id: "usr-mike", name: "Mike Jones", email: "mike.jones@example.com", departmentId: "dep-finance", role: "member", active: true, createdAt: now },
  { id: "usr-lisa", name: "Lisa Brown", email: "lisa.brown@example.com", departmentId: "dep-hr", role: "manager", active: true, createdAt: now },
  { id: "usr-tech", name: "Tech Admin", email: "tech.admin@example.com", departmentId: "dep-it", role: "admin", active: true, createdAt: now },
  { id: "usr-jane", name: "Jane Manager", email: "jane.manager@example.com", departmentId: "dep-finance", role: "manager", active: true, createdAt: now },
  { id: "usr-support", name: "Support Lead", email: "support.lead@example.com", departmentId: "dep-support", role: "manager", active: true, createdAt: now },
];

export const CATEGORY_SEED: Category[] = [
  { id: "cat-marketing", name: "Marketing", departmentId: "dep-marketing", colorCode: "#0EA5E9", active: true },
  { id: "cat-sales", name: "Sales", departmentId: "dep-sales", colorCode: "#06B6D4", active: true },
  { id: "cat-ops", name: "Operations", departmentId: "dep-operations", colorCode: "#EF4444", active: true },
  { id: "cat-finance", name: "Finance", departmentId: "dep-finance", colorCode: "#10B981", active: true },
  { id: "cat-hr", name: "Human Resources", departmentId: "dep-hr", colorCode: "#F59E0B", active: true },
  { id: "cat-it", name: "IT", departmentId: "dep-it", colorCode: "#8B5CF6", active: true },
  { id: "cat-support", name: "Customer Support", departmentId: "dep-support", colorCode: "#F97316", active: true },
  { id: "cat-general", name: "General", departmentId: "dep-general", colorCode: "#64748B", active: true },
];

export const TASK_SEED: Task[] = [
  {
    id: "task-001",
    taskNumber: "TASK-1234567890-001",
    title: "Update Website Homepage",
    description: "Refresh homepage content with new product offerings and testimonials",
    departmentId: "dep-marketing",
    categoryId: "cat-marketing",
    assignedTo: "usr-sarah",
    createdBy: "usr-john",
    status: "in_progress",
    priority: "high",
    dueDate: "2024-01-31",
    tags: ["website", "marketing"],
    createdAt: "2024-01-15T00:00:00.000Z",
    updatedAt: "2024-01-20T10:30:00.000Z",
  },
  {
    id: "task-002",
    taskNumber: "TASK-1234567891-002",
    title: "Q1 Financial Report",
    description: "Compile and analyze Q1 financial data for board presentation",
    departmentId: "dep-finance",
    categoryId: "cat-finance",
    assignedTo: "usr-mike",
    createdBy: "usr-jane",
    status: "open",
    priority: "high",
    dueDate: "2024-02-15",
    tags: ["finance", "reporting"],
    createdAt: "2024-01-16T00:00:00.000Z",
    updatedAt: "2024-01-16T14:22:00.000Z",
  },
  {
    id: "task-003",
    taskNumber: "TASK-1234567892-003",
    title: "Employee Onboarding - New Hire",
    description: "Set up workspace and accounts for new marketing coordinator",
    departmentId: "dep-hr",
    categoryId: "cat-hr",
    assignedTo: "usr-lisa",
    createdBy: "usr-lisa",
    status: "completed",
    priority: "medium",
    dueDate: "2024-01-18",
    completedDate: "2024-01-17T16:45:00.000Z",
    actualHours: 8,
    tags: ["hr", "onboarding"],
    createdAt: "2024-01-10T00:00:00.000Z",
    updatedAt: "2024-01-17T16:45:00.000Z",
  },
];
