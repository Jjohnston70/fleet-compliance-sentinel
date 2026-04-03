import { describe, expect, it } from "vitest";
import { tools } from "../src/tools.js";

describe("tools", () => {
  it("defines all required tool signatures", () => {
    const toolNames = tools.map((t) => t.name);

    expect(toolNames).toContain("create_task");
    expect(toolNames).toContain("assign_task");
    expect(toolNames).toContain("update_status");
    expect(toolNames).toContain("get_department_tasks");
    expect(toolNames).toContain("get_overdue_tasks");
    expect(toolNames).toContain("get_workload_report");
    expect(toolNames).toContain("get_completion_metrics");
    expect(toolNames).toContain("get_department_summary");
  });

  it("each tool has description and parameters", () => {
    for (const tool of tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.parameters).toBeDefined();
      expect(typeof tool.handler).toBe("function");
    }
  });

  it("create_task tool works", async () => {
    const createTaskTool = tools.find((t) => t.name === "create_task");
    if (!createTaskTool) throw new Error("create_task tool not found");

    const result = await createTaskTool.handler({
      title: "Test Task",
      departmentId: "dep-it",
      priority: "high",
    });

    expect(result).toHaveProperty("success", true);
    expect(result).toHaveProperty("data");
  });

  it("get_overdue_tasks tool works", async () => {
    const tool = tools.find((t) => t.name === "get_overdue_tasks");
    if (!tool) throw new Error("get_overdue_tasks tool not found");

    const result = await tool.handler({});

    expect(result).toHaveProperty("success", true);
    expect(Array.isArray(result.data)).toBe(true);
  });

  it("get_completion_metrics tool works", async () => {
    const tool = tools.find((t) => t.name === "get_completion_metrics");
    if (!tool) throw new Error("get_completion_metrics tool not found");

    const result = await tool.handler({});

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("totalTasks");
    expect(result.data).toHaveProperty("completedTasks");
    expect(result.data).toHaveProperty("completionRate");
  });

  it("get_department_summary tool works", async () => {
    const tool = tools.find((t) => t.name === "get_department_summary");
    if (!tool) throw new Error("get_department_summary tool not found");

    const result = await tool.handler({ departmentId: "dep-marketing" });

    expect(result).toHaveProperty("success", true);
    expect(result.data).toHaveProperty("departmentId", "dep-marketing");
    expect(result.data).toHaveProperty("byStatus");
  });
});
