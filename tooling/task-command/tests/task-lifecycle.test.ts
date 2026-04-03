import { describe, expect, it } from "vitest";

import { runtime } from "../src/api/runtime.js";

describe("task lifecycle", () => {
  it("creates task with TASK-{timestamp}-{random} format", () => {
    const task = runtime.taskService.createTask({
      title: "Lifecycle Test Task",
      departmentId: "dep-it",
      createdBy: "usr-tech",
    });

    expect(task.taskNumber).toMatch(/^TASK-\d{13}-\d{3}$/);
    expect(task.status).toBe("open");
  });

  it("writes history on status update", () => {
    const created = runtime.taskService.createTask({
      title: "History Test Task",
      departmentId: "dep-marketing",
      createdBy: "usr-sarah",
    });

    runtime.taskService.updateStatus(created.id, "in_progress", "usr-sarah");

    const history = runtime.repo.listTaskHistory(created.id);
    expect(history.length).toBeGreaterThan(0);
    expect(history[0]?.fieldChanged).toBe("status");
    expect(history[0]?.newValue).toBe("in_progress");
  });
});
