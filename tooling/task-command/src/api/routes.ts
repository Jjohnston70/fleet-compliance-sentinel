export const REST_ROUTES = [
  { method: "POST", path: "/api/tasks", action: "createTask" },
  { method: "POST", path: "/api/tasks/assign", action: "assignTask" },
  { method: "POST", path: "/api/tasks/status", action: "updateStatus" },
  { method: "POST", path: "/api/tasks/department", action: "getDepartmentTasks" },
  { method: "POST", path: "/api/tasks/overdue", action: "getOverdueTasks" },
  { method: "POST", path: "/api/tasks/workload", action: "getWorkloadReport" },
  { method: "POST", path: "/api/tasks/department-summary", action: "getDepartmentSummary" },
  { method: "GET", path: "/api/users", action: "listUsers" },
  { method: "GET", path: "/api/departments", action: "listDepartments" },
  { method: "GET", path: "/api/categories", action: "listCategories" },
] as const;
