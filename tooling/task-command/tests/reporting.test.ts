import { describe, expect, it } from "vitest";
import { runtime } from "../src/api/runtime.js";
import { getCompletionMetrics } from "../src/reporting/completion-metrics.js";
import { getDepartmentSummary } from "../src/reporting/department-summary.js";
import { getWorkloadAnalysis } from "../src/reporting/workload-analysis.js";

describe("reporting functions", () => {
  it("calculates completion metrics correctly", () => {
    const metrics = getCompletionMetrics(runtime.repo);

    expect(metrics).toHaveProperty("totalTasks");
    expect(metrics).toHaveProperty("completedTasks");
    expect(metrics).toHaveProperty("completionRate");
    expect(metrics).toHaveProperty("avgActualHours");

    expect(metrics.totalTasks).toBeGreaterThan(0);
    expect(metrics.completionRate).toBeLessThanOrEqual(100);
    expect(metrics.completionRate).toBeGreaterThanOrEqual(0);
  });

  it("generates department summary with status breakdown", () => {
    const summary = getDepartmentSummary(runtime.repo, "dep-marketing");

    expect(summary).toHaveProperty("departmentId", "dep-marketing");
    expect(summary).toHaveProperty("totalTasks");
    expect(summary).toHaveProperty("completedTasks");
    expect(summary).toHaveProperty("completionRate");
    expect(summary).toHaveProperty("overdueTasks");
    expect(summary).toHaveProperty("byStatus");

    expect(summary.byStatus).toHaveProperty("open");
    expect(summary.byStatus).toHaveProperty("in_progress");
    expect(summary.byStatus).toHaveProperty("review");
    expect(summary.byStatus).toHaveProperty("blocked");
    expect(summary.byStatus).toHaveProperty("completed");
    expect(summary.byStatus).toHaveProperty("cancelled");
  });

  it("calculates workload analysis by assignee", () => {
    const analysis = getWorkloadAnalysis(runtime.repo);

    expect(analysis).toHaveProperty("assignees");
    expect(analysis).toHaveProperty("totalOpenTasks");
    expect(Array.isArray(analysis.assignees)).toBe(true);

    if (analysis.assignees.length > 0) {
      const assignee = analysis.assignees[0];
      expect(assignee).toHaveProperty("assigneeId");
      expect(assignee).toHaveProperty("assigneeName");
      expect(assignee).toHaveProperty("openTasks");
    }
  });

  it("filters workload analysis by department", () => {
    const analysis = getWorkloadAnalysis(runtime.repo, "dep-finance");

    expect(analysis).toHaveProperty("departmentId", "dep-finance");
    expect(analysis).toHaveProperty("assignees");
    expect(Array.isArray(analysis.assignees)).toBe(true);
  });
});
