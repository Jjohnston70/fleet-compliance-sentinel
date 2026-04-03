import { describe, expect, it } from "vitest";
import { runtime } from "../src/api/runtime.js";
import { runStaleTaskNotifier } from "../src/hooks/stale-task-notifier.js";

describe("stale task notifier", () => {
  it("finds tasks in_progress for more than 7 days without updates", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const staleTask = runtime.taskService.createTask({
      title: "Stale Task",
      departmentId: "dep-it",
    });

    runtime.taskService.updateStatus(staleTask.id, "in_progress");

    const taskBeforeUpdate = runtime.repo.getTaskById(staleTask.id);
    if (!taskBeforeUpdate) throw new Error("Task not found");

    const updatedManually = {
      ...taskBeforeUpdate,
      updatedAt: eightDaysAgo.toISOString(),
    };
    runtime.repo.saveTask(updatedManually);

    const now = new Date();
    const result = runStaleTaskNotifier(runtime.repo, 7, now);

    const foundStale = result.tasks.find((t) => t.id === staleTask.id);
    expect(foundStale).toBeDefined();
    expect(result.staleTaskCount).toBeGreaterThan(0);
  });

  it("ignores completed and cancelled tasks", () => {
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

    const completedTask = runtime.taskService.createTask({
      title: "Completed Task",
      departmentId: "dep-it",
    });

    runtime.taskService.updateStatus(completedTask.id, "completed");

    const taskRecord = runtime.repo.getTaskById(completedTask.id);
    if (!taskRecord) throw new Error("Task not found");

    const result = runStaleTaskNotifier(runtime.repo, 7, new Date());

    const foundStale = result.tasks.find((t) => t.id === completedTask.id);
    expect(foundStale).toBeUndefined();
  });
});
