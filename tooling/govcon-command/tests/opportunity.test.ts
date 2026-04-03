/**
 * Opportunity Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { OpportunityService } from "../src/services/opportunity-service.js";

describe("OpportunityService", () => {
  let repo: InMemoryRepository;
  let service: OpportunityService;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    service = new OpportunityService(repo);
  });

  it("should create an opportunity", async () => {
    const opp = await service.createOpportunity(
      "Test Opportunity",
      "TEST-2025-001",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test description"
    );

    expect(opp.id).toBeDefined();
    expect(opp.title).toBe("Test Opportunity");
    expect(opp.status).toBe("identified");
  });

  it.skip("should filter opportunities by agency", async () => {
    await service.createOpportunity(
      "Test 1",
      "TEST-001",
      "Agency A",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    await service.createOpportunity(
      "Test 2",
      "TEST-002",
      "Agency B",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    const results = await service.listOpportunities({ agency: "Agency A" });
    expect(results.length).toBe(1);
    expect(results[0].agency).toBe("Agency A");
  });

  it.skip("should filter opportunities by NAICS code", async () => {
    await service.createOpportunity(
      "Test 1",
      "TEST-001",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    await service.createOpportunity(
      "Test 2",
      "TEST-002",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541611",
      "Admin Management Consulting",
      "Test"
    );

    const results = await service.listOpportunities({ naics_code: "541512" });
    expect(results.length).toBe(1);
    expect(results[0].naics_code).toBe("541512");
  });

  it.skip("should get upcoming deadlines within 7 days", async () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    await service.createOpportunity(
      "Tomorrow",
      "TEST-001",
      "Test Agency",
      tomorrow,
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    await service.createOpportunity(
      "Next Month",
      "TEST-002",
      "Test Agency",
      nextMonth,
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    const results = await service.getUpcomingDeadlines(7);
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toBe("Tomorrow");
  });

  it.skip("should count opportunities by status", async () => {
    const opp1 = await service.createOpportunity(
      "Test 1",
      "TEST-001",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    const opp2 = await service.createOpportunity(
      "Test 2",
      "TEST-002",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    await service.updateOpportunity(opp2.id, { status: "bid" });

    const counts = await service.countByStatus();
    expect(counts.identified).toBe(1);
    expect(counts.bid).toBe(1);
  });

  it.skip("should calculate pipeline value", async () => {
    await service.createOpportunity(
      "Test 1",
      "TEST-001",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test",
      { estimated_value: 100_000 }
    );

    await service.createOpportunity(
      "Test 2",
      "TEST-002",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test",
      { estimated_value: 50_000 }
    );

    const value = await service.getPipelineValue();
    expect(value).toBe(150_000);
  });

  it("should get expired opportunities", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    await service.createOpportunity(
      "Expired",
      "TEST-001",
      "Test Agency",
      yesterday,
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test"
    );

    const expired = await service.getExpiredOpportunities();
    expect(expired.length).toBe(1);
    expect(expired[0].title).toBe("Expired");
  });
});
