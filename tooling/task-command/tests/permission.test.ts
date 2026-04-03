import { describe, expect, it } from "vitest";

import { runtime } from "../src/api/runtime.js";

describe("department permission scoping", () => {
  it("non-admin viewer only sees own department tasks", () => {
    const financeUser = runtime.userService.listUsers().find((user) => user.id === "usr-mike");
    if (!financeUser) {
      throw new Error("finance user seed missing");
    }

    const visible = runtime.taskService.filterTasksForViewer(runtime.repo.listTasks(), financeUser);
    expect(visible.every((task) => task.departmentId === financeUser.departmentId)).toBe(true);
  });

  it("admin viewer can see all tasks", () => {
    const adminUser = runtime.userService.listUsers().find((user) => user.id === "usr-john");
    if (!adminUser) {
      throw new Error("admin user seed missing");
    }

    const visible = runtime.taskService.filterTasksForViewer(runtime.repo.listTasks(), adminUser);
    expect(visible.length).toBe(runtime.repo.listTasks().length);
  });
});
