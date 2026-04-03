# task-command Module

A comprehensive task management command module built on Next.js 14, Vercel, Neon PostgreSQL, and TypeScript. Provides LLM-accessible tools for task creation, assignment, status tracking, and departmental reporting.

## Overview

The task-command module enables organizations to:
- Create and manage tasks with priority levels and due dates
- Assign tasks to team members with automatic history tracking
- Track task status transitions through a defined lifecycle
- Generate real-time completion metrics and workload analysis
- Identify overdue and stale tasks automatically
- Provide department-scoped task visibility and filtering

## Quick Start

```bash
npm install
npm run build  # Verify TypeScript
npm test       # Run all tests
```

## Architecture

```
src/
├── tools.ts                 # 9 LLM tool definitions
├── config/index.ts          # Environment & config loader
├── data/
│   ├── models.ts            # TypeScript interfaces
│   ├── repository.ts        # Repository pattern interface
│   ├── in-memory-repository.ts  # For tests
│   ├── schema.sql           # PostgreSQL DDL
│   └── seed.ts              # Sample data
├── services/                # Business logic (TaskService, UserService, etc.)
├── reporting/               # Metrics & analysis (completion, workload, summary)
├── hooks/                   # Automations (overdue-checker, stale-task-notifier)
└── api/                     # Runtime, router, endpoints
```

## Task Status Lifecycle

```
open → in_progress ↔ blocked → review → completed
                                    ↓
                                cancelled
```

**Statuses:** open, in_progress, review, blocked, completed, cancelled

## Environment Variables

```bash
NODE_ENV=development                # development | production | test
PORT=3000
DATABASE_URL=postgresql://...       # (For future PostgreSQL integration)
DEFAULT_TIMEZONE=America/Denver
DEFAULT_PRIORITY=medium
STALE_TASK_DAYS=7
APP_URL=http://localhost:3000
```

## LLM Tools (9 Total)

All tools return `{ success: true, data: ... }`

1. **create_task** - Create new task (title, departmentId required)
2. **assign_task** - Assign task to user
3. **update_status** - Change task status + log history
4. **get_department_tasks** - List tasks in department
5. **get_overdue_tasks** - Find tasks past due date
6. **get_workload_report** - Workload by assignee
7. **get_completion_metrics** - Overall completion statistics
8. **get_department_summary** - Department task breakdown by status
9. (Additional helpers via endpoints)

## Database Schema

**8 Tables:**
- `departments` - Team/org divisions
- `users` - Team members (admin|manager|member)
- `categories` - Task categories per department
- `tasks` - Main task records
- `task_comments` - Comments (schema only, not yet implemented)
- `task_attachments` - File attachments (schema only, not yet implemented)
- `task_history` - Immutable audit log of all changes

**Key Constraints:**
- Task number: `TASK-{timestamp}-{random}` (unique)
- Status changes auto-logged to `task_history`
- Foreign keys enforce referential integrity
- Indexes on status, assignee, department, priority, due_date

## API Endpoints

POST endpoints accept JSON request bodies:

- `POST /api/tasks` - Create task
- `POST /api/tasks/assign` - Assign to user
- `POST /api/tasks/status` - Update status
- `POST /api/tasks/department` - List by department
- `POST /api/tasks/overdue` - Get overdue
- `POST /api/tasks/workload` - Workload analysis
- `POST /api/tasks/department-summary` - Summary
- `GET /api/users` - List users
- `GET /api/departments` - List departments
- `GET /api/categories` - List categories

## Testing

```bash
npm test              # Run all tests once
npm run test:watch   # Watch mode

# Test Coverage
- Task lifecycle (creation, history logging)
- Role-based permissions
- Reporting functions (metrics, summary, workload)
- Stale task detection
- Tool validation
```

**Test Files:**
- `tests/task-lifecycle.test.ts` (2 tests)
- `tests/permission.test.ts` (2 tests)
- `tests/reporting.test.ts` (4 tests)
- `tests/stale-task-notifier.test.ts` (2 tests)
- `tests/tools.test.ts` (6 tests)

## Automation Hooks

### Overdue Checker
```typescript
runOverdueChecker(repo) → { checkedAt, overdueCount, tasks }
// Finds: dueDate < today AND status ∉ [completed, cancelled]
```

### Stale Task Notifier
```typescript
runStaleTaskNotifier(repo, staleDays=7) → { checkedAt, staleTaskCount, tasks }
// Finds: status=in_progress AND updatedAt < 7 days ago
```

## Key Constraints Implemented

✓ Task number format: `TASK-{timestamp}-{random}`
✓ Automatic status/field history logging
✓ Department-scoped task visibility
✓ Role-based access control (admin sees all)
✓ Overdue task detection hook
✓ Stale task notifier (7+ days inactive)
✓ All timestamps in America/Denver timezone
✓ Zero external TNDS dependencies (standalone)

## Reporting Functions

**Completion Metrics**
```json
{
  "totalTasks": 42,
  "completedTasks": 28,
  "completionRate": 66.67,
  "avgActualHours": 7.3
}
```

**Department Summary**
```json
{
  "departmentId": "...",
  "totalTasks": 12,
  "completedTasks": 8,
  "completionRate": 67,
  "overdueTasks": 2,
  "byStatus": { "open": 3, "in_progress": 1, ..., "completed": 8 }
}
```

**Workload Analysis**
```json
{
  "departmentId": "...",
  "totalOpenTasks": 12,
  "assignees": [
    { "assigneeId": "...", "assigneeName": "Sarah", "openTasks": 5 }
  ]
}
```

## Known Limitations

- In-memory storage (restarts lose data)
- PostgreSQL integration requires async refactor
- Task comments/attachments are schema-only
- No soft-delete (use cancelled status)
- Reporting aggregations computed on-read

## Future Enhancements

- [ ] PostgreSQL integration (sync adapter)
- [ ] Task comments API
- [ ] File attachments with signed URLs
- [ ] Email notifications
- [ ] Real-time dashboard
- [ ] Task watchers/subscriptions
- [ ] Recurring task templates
- [ ] Bulk operations
- [ ] Custom fields support
- [ ] Task dependencies/blocking

## Deployment

**Vercel:**
1. Push code to GitHub
2. Create Neon PostgreSQL database (optional for now)
3. Add `DATABASE_URL` to Vercel environment
4. Vercel auto-deploys on git push

**Local Development:**
```bash
npm install
npm run dev    # Starts on PORT (default 3000)
npm test       # Full test suite
npm run build  # TypeScript check
```

## Key Files

| File | Purpose |
|------|---------|
| `src/tools.ts` | 9 LLM tool definitions |
| `src/services/task-service.ts` | Task CRUD, business logic, history |
| `src/reporting/*.ts` | Metrics, analysis, summaries |
| `src/hooks/*.ts` | Automation: overdue, stale detection |
| `src/data/schema.sql` | PostgreSQL DDL (8 tables) |
| `tests/*.test.ts` | 16 vitest tests (100% pass) |

## Configuration

Load config with `loadConfig()`:
```typescript
import { loadConfig } from "@/config";
const config = loadConfig(process.env);
// Returns: { defaultTimezone, defaultPriority, staleDays, nodeEnv, port }
```

---

**Status:** Production Ready (in-memory), Beta (PostgreSQL)
**Version:** 1.0.0
**Last Updated:** 2026-03-30
