import { createInMemoryTaskRepository } from "../data/in-memory-repository.js";
import { CATEGORY_SEED, DEPARTMENT_SEED, TASK_SEED, USER_SEED } from "../data/seed.js";
import { CategoryService } from "../services/category-service.js";
import { DepartmentService } from "../services/department-service.js";
import { TaskService } from "../services/task-service.js";
import { UserService } from "../services/user-service.js";
import { getCompletionMetrics } from "../reporting/completion-metrics.js";
import { getDepartmentSummary } from "../reporting/department-summary.js";
import { getWorkloadAnalysis } from "../reporting/workload-analysis.js";
import { runOverdueChecker } from "../hooks/overdue-checker.js";

const repo = createInMemoryTaskRepository({
  departments: DEPARTMENT_SEED,
  users: USER_SEED,
  categories: CATEGORY_SEED,
  tasks: TASK_SEED,
});

export const runtime = {
  repo,
  taskService: new TaskService(repo),
  userService: new UserService(repo),
  departmentService: new DepartmentService(repo),
  categoryService: new CategoryService(repo),
  reporting: {
    getDepartmentSummary: (departmentId: string) => getDepartmentSummary(repo, departmentId),
    getWorkloadAnalysis: (departmentId?: string) => getWorkloadAnalysis(repo, departmentId),
    getCompletionMetrics: () => getCompletionMetrics(repo),
  },
  hooks: {
    runOverdueChecker: () => runOverdueChecker(repo),
  },
};
