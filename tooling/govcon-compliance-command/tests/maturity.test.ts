import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { MaturityService } from "../src/services/maturity-service.js";
import { IntakeService } from "../src/services/intake-service.js";
import { createToolHandlers } from "../src/tools.js";

describe("maturity tracker initialization", () => {
  let repo: InMemoryRepository;

  beforeEach(() => {
    repo = new InMemoryRepository();
  });

  it("initializeTracker creates a tracker with template statuses", async () => {
    const maturity = new MaturityService(repo);
    const companyId = "d0000000-0000-4000-8000-000000000001";
    const tracker = await maturity.initializeTracker(companyId, [
      { template_id: "security-governance", skill_domain: "Security Governance", governance_level: "ROOT" },
      { template_id: "internal-compliance", skill_domain: "Internal Compliance", governance_level: "BASELINE" },
    ]);

    expect(tracker.company_id).toBe(companyId);
    expect(tracker.template_statuses).toHaveLength(2);
    expect(tracker.template_statuses[0].status).toBe("not_started");
    expect(tracker.overall_score).toBe(0);
  });

  it("initialize_maturity_tracker tool requires intake result", async () => {
    const handlers = createToolHandlers(repo);
    await expect(
      handlers.initialize_maturity_tracker({ company_id: "nonexistent" })
    ).rejects.toThrow("No intake result");
  });

  it("initialize_maturity_tracker tool works after intake", async () => {
    // Create a company first
    const company = await repo.createCompany({
      company_name: "Test Corp",
      federal_contracts: true,
      handles_phi: false,
      handles_pci: false,
      handles_cui: false,
      frameworks_required: [],
    });

    // Run intake
    const intake = new IntakeService(repo);
    await intake.runIntake(company.id);

    // Now initialize maturity tracker via tool handler
    const handlers = createToolHandlers(repo);
    const tracker = await handlers.initialize_maturity_tracker({ company_id: company.id });

    expect(tracker.company_id).toBe(company.id);
    expect(tracker.template_statuses.length).toBeGreaterThan(0);
    expect(tracker.template_statuses.every((t: any) => t.status === "not_started")).toBe(true);
  });
});
