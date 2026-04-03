# Development Guide

## Project Structure

```
task-command/
├── src/
│   ├── tools.ts              # 9 LLM tool definitions for Claude
│   ├── config/index.ts       # Configuration loader (7 env vars)
│   ├── data/
│   │   ├── models.ts         # TypeScript types
│   │   ├── repository.ts     # Repository interface
│   │   ├── in-memory-repository.ts   # Test implementation
│   │   ├── schema.sql        # PostgreSQL schema (8 tables)
│   │   └── seed.ts           # Sample data (7 users, 8 depts, 3 tasks)
│   ├── services/
│   │   ├── task-service.ts   # Task CRUD, history logging
│   │   ├── user-service.ts   # User queries
│   │   ├── department-service.ts
│   │   └── category-service.ts
│   ├── reporting/
│   │   ├── completion-metrics.ts  # Task completion rates
│   │   ├── department-summary.ts  # Summary by department
│   │   └── workload-analysis.ts   # Distribution by assignee
│   ├── hooks/
│   │   ├── overdue-checker.ts     # Find overdue tasks
│   │   └── stale-task-notifier.ts # Find inactive in_progress
│   └── api/
│       ├── runtime.ts        # Service instantiation
│       ├── router.ts         # Action dispatch
│       ├── endpoints.ts      # Endpoint handlers
│       └── routes.ts         # REST route definitions
├── tests/
│   ├── task-lifecycle.test.ts     # Create, status update, history
│   ├── permission.test.ts         # Role-based access
│   ├── reporting.test.ts          # Metrics calculations
│   ├── stale-task-notifier.test.ts  # Stale detection
│   └── tools.test.ts              # Tool validation
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## Dependencies

**Production:**
- `@neondatabase/serverless` - PostgreSQL client (for future DB mode)
- `dotenv` - Environment variable loading

**Development:**
- `typescript` - Type checking
- `vitest` - Unit testing
- `@types/node` - Node.js types

## Module Lifecycle

### 1. Data Layer
- `models.ts` - Type definitions (Task, User, Department, etc.)
- `repository.ts` - Interface for CRUD operations
- `in-memory-repository.ts` - Test implementation using Map/Array
- `schema.sql` - PostgreSQL schema (8 tables with constraints)
- `seed.ts` - Sample data for development

### 2. Service Layer
- `TaskService` - Task creation, status updates, history tracking
- `UserService` - User listing
- `DepartmentService` - Department listing
- `CategoryService` - Category queries

**Key Business Logic:**
- Task number generation: `TASK-{timestamp}-{3-digit random}`
- Status transitions logged to `task_history` immediately
- Department-scoped access control
- Overdue detection: `dueDate < today AND status not in [completed, cancelled]`
- Stale detection: `status=in_progress AND updatedAt < 7 days`

### 3. Reporting Layer
- **Completion Metrics** - Calculate total, completed, rate, avg hours
- **Department Summary** - Breakdown by status per department
- **Workload Analysis** - Tasks per assignee sorted by count

### 4. Automation Hooks
- **Overdue Checker** - Daily cron to find overdue tasks
- **Stale Task Notifier** - Daily cron to find inactive in_progress tasks

### 5. API Layer
- `runtime.ts` - Singleton instances (repo, services, reporting)
- `router.ts` - Route action to service method
- `endpoints.ts` - Endpoint implementations
- `routes.ts` - REST route definitions

### 6. LLM Tools
9 tools in `tools.ts` for Claude integration:
1. create_task
2. assign_task
3. update_status
4. get_department_tasks
5. get_overdue_tasks
6. get_workload_report
7. get_completion_metrics
8. get_department_summary
9. (Hidden: listUsers, listDepartments, listCategories via endpoints)

## Adding a New Feature

### Example: Add Task Comment Support

**1. Update schema.sql** (already has table):
```sql
-- Already exists:
CREATE TABLE task_comments (
  id UUID PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES tasks(id),
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**2. Add to models.ts**:
```typescript
export interface TaskComment {
  id: string;
  taskId: string;
  authorId: string;
  content: string;
  createdAt: string;
}
```

**3. Update repository.ts**:
```typescript
export interface TaskRepository {
  // ... existing methods
  getTaskComments(taskId: string): TaskComment[];
  saveTaskComment(comment: TaskComment): TaskComment;
}
```

**4. Update in-memory-repository.ts**:
```typescript
const comments: TaskComment[] = [];

return {
  // ... existing methods
  getTaskComments: (taskId) => comments.filter(c => c.taskId === taskId),
  saveTaskComment: (comment) => {
    const persisted = { ...comment, id: comment.id || randomUUID() };
    comments.push(persisted);
    return persisted;
  },
};
```

**5. Create service method**:
```typescript
// In TaskService
addComment(taskId: string, authorId: string, content: string): TaskComment {
  const comment: TaskComment = {
    id: randomUUID(),
    taskId,
    authorId,
    content,
    createdAt: new Date().toISOString(),
  };
  return this.repo.saveTaskComment(comment);
}
```

**6. Add tool in tools.ts**:
```typescript
{
  name: "add_task_comment",
  description: "Add a comment to a task",
  parameters: {
    type: "object",
    properties: {
      taskId: { type: "string" },
      authorId: { type: "string" },
      content: { type: "string" },
    },
    required: ["taskId", "authorId", "content"],
  },
  handler: async (params) => ({
    success: true,
    data: runtime.taskService.addComment(
      String(params.taskId),
      String(params.authorId),
      String(params.content)
    ),
  }),
}
```

**7. Add test**:
```typescript
it("adds comment to task", () => {
  const task = runtime.taskService.createTask({...});
  const comment = runtime.taskService.addComment(
    task.id,
    "usr-john",
    "Looks good!"
  );
  expect(comment.content).toBe("Looks good!");
});
```

## Testing

**Run tests:**
```bash
npm test              # Run once
npm run test:watch   # Watch mode
```

**Test structure:**
- Each test file corresponds to a feature area
- Use `describe` + `it` for organization
- Mock data from `runtime.taskService.createTask()`, etc.
- Assert on return values, not side effects

**Example test:**
```typescript
it("tracks history on status update", () => {
  const task = runtime.taskService.createTask({
    title: "Test",
    departmentId: "dep-it",
  });

  runtime.taskService.updateStatus(task.id, "in_progress", "usr-tech");

  const history = runtime.repo.listTaskHistory(task.id);
  expect(history[0].fieldChanged).toBe("status");
  expect(history[0].newValue).toBe("in_progress");
});
```

## Configuration Management

**Load config:**
```typescript
import { loadConfig } from "@/config";
const config = loadConfig(process.env);
```

**Available options:**
- `config.defaultTimezone` - "America/Denver"
- `config.defaultPriority` - "medium"
- `config.staleDays` - 7
- `config.nodeEnv` - "development" | "production" | "test"
- `config.port` - 3000

**Environment variables (.env.local):**
```bash
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://...  # Future use
DEFAULT_TIMEZONE=America/Denver
DEFAULT_PRIORITY=medium
STALE_TASK_DAYS=7
APP_URL=http://localhost:3000
```

## TypeScript Compilation

**Check types (no emit):**
```bash
npm run build
```

**Key files:**
- `tsconfig.json` - ES2022, strict mode
- All code in `src/**/*.ts`
- Tests in `tests/**/*.ts`
- Uses Node ESM (`"type": "module"`)

## Runtime Architecture

**In-Memory Mode (Current):**
- Uses `in-memory-repository.ts`
- All data in RAM
- Perfect for testing and development
- Data lost on restart

**PostgreSQL Mode (Future):**
```typescript
// Would require:
// 1. Async repository implementation
// 2. Neon connection pooling
// 3. Refactor services to async
// 4. Add connection management
// 5. Migration system

// For now, use runtime.ts selection:
const usePostgres = process.env.DATABASE_URL?.startsWith('postgres');
const repo = usePostgres
  ? createPostgresRepository(db)
  : createInMemoryTaskRepository(seed);
```

## Common Tasks

**Add a new status:**
1. Update `TaskStatus` type in `models.ts`
2. Update status validation in `task-service.ts`
3. Add handling in reporting functions
4. Update seed data if needed
5. Add test case

**Change timestamp format:**
1. Update `createdAt`, `updatedAt` handling
2. Update service methods (all use `new Date().toISOString()`)
3. Update in-memory repository
4. Update tests to match new format

**Add department-level permission:**
1. Update `filterTasksForViewer` in `task-service.ts`
2. Test with `permission.test.ts`
3. Document in README

**Create new report:**
1. Add function to `src/reporting/my-report.ts`
2. Take `repo: TaskRepository` as parameter
3. Add to reporting object in `runtime.ts`
4. Add tool to `tools.ts`
5. Add test to `reporting.test.ts`

## Debugging

**Log repository state:**
```typescript
console.log("Tasks:", runtime.repo.listTasks());
console.log("Users:", runtime.repo.listUsers());
console.log("History:", runtime.repo.listTaskHistory());
```

**Trace a tool:**
```typescript
const result = await tools[0].handler({ title: "Test", departmentId: "dep-it" });
console.log("Result:", result);
```

**Run single test:**
```bash
npm test -- task-lifecycle
npm test -- permission
```

## Performance Notes

- All data is in-memory (no disk I/O)
- Reporting functions iterate arrays (O(n))
- For 10k+ tasks, consider materialized views or caching
- Workload analysis sorts by count (O(n log n))

## Migration to PostgreSQL

When ready for DB integration:

1. **Create `src/data/pg-repository.ts`:**
   - Implement TaskRepository using `pg` or `@neondatabase/serverless`
   - Use prepared statements for safety
   - Handle connection pooling

2. **Update `runtime.ts`:**
   ```typescript
   const repo = process.env.DATABASE_URL
     ? createPostgresRepository(pgClient)
     : createInMemoryTaskRepository(seed);
   ```

3. **Refactor services to async:**
   - Convert all `repo` calls to `await repo.method()`
   - Update tool handlers to `async`
   - Update reporting functions to async

4. **Set up migrations:**
   ```bash
   psql -f src/data/schema.sql -d $DATABASE_URL
   psql -f src/data/seed.sql -d $DATABASE_URL
   ```

5. **Add connection pooling for Vercel:**
   - Use `@vercel/postgres` for edge functions
   - Implement timeout handling

---

**Last Updated:** 2026-03-30
**Module Version:** 1.0.0
