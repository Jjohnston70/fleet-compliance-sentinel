/**
 * Bid Decision Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { BidDecisionService } from "../src/services/bid-decision-service.js";
import { OpportunityService } from "../src/services/opportunity-service.js";

describe("BidDecisionService", () => {
  let repo: InMemoryRepository;
  let bidService: BidDecisionService;
  let oppService: OpportunityService;
  let opportunityId: string;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    bidService = new BidDecisionService(repo);
    oppService = new OpportunityService(repo);

    // Create test opportunity
    const opp = await oppService.createOpportunity(
      "Test Opportunity",
      "TEST-2025-001",
      "Test Agency",
      new Date("2025-04-15"),
      "SDVOSB",
      "541512",
      "Computer Systems Design",
      "Test description"
    );
    opportunityId = opp.id;
  });

  it("should recommend bid for high-scoring opportunity", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 85,
      setAsideMatch: 90,
      competitionLevel: 70,
      contractValue: 150_000,
      timelineFeasibility: 80,
      relationship: 60,
      strategicValue: 75,
    });

    expect(decision.decision).toBe("bid");
    expect(decision.score).toBeGreaterThanOrEqual(70);
  });

  it("should recommend no-bid for low-scoring opportunity", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 30,
      setAsideMatch: 20,
      competitionLevel: 30,
      contractValue: 5_000,
      timelineFeasibility: 25,
      relationship: 10,
      strategicValue: 15,
    });

    expect(decision.decision).toBe("no_bid");
    expect(decision.score).toBeLessThan(40);
  });

  it("should handle micro-purchase contracts correctly", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 70,
      setAsideMatch: 80,
      competitionLevel: 75,
      contractValue: 8_000, // Micro-purchase
      timelineFeasibility: 90,
      relationship: 50,
      strategicValue: 40,
    });

    // Should still recommend bid if other criteria are strong
    expect(decision.criteria_scores).toBeDefined();
    const contractValueScore = decision.criteria_scores.find(
      (c) => c.criterion === "Contract Value"
    );
    expect(contractValueScore?.score).toBeLessThan(60);
  });

  it("should score large contracts highly", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 50,
      setAsideMatch: 50,
      competitionLevel: 50,
      contractValue: 300_000, // Large contract
      timelineFeasibility: 50,
      relationship: 30,
      strategicValue: 30,
    });

    const contractValueScore = decision.criteria_scores.find(
      (c) => c.criterion === "Contract Value"
    );
    expect(contractValueScore?.score).toBeGreaterThan(80);
  });

  it("should calculate weighted scores correctly", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 100,
      setAsideMatch: 100,
      competitionLevel: 0,
      contractValue: 200_000,
      timelineFeasibility: 100,
      relationship: 100,
      strategicValue: 100,
    });

    expect(decision.score).toBeGreaterThanOrEqual(80);
    expect(decision.criteria_scores.length).toBe(7);
  });

  it("should provide transparent criteria breakdown", async () => {
    const decision = await bidService.runBidDecision(opportunityId, {
      technicalFit: 75,
      setAsideMatch: 80,
      competitionLevel: 60,
      contractValue: 125_000,
      timelineFeasibility: 70,
      relationship: 50,
      strategicValue: 65,
    });

    expect(decision.criteria_scores.length).toBe(7);
    for (const criterion of decision.criteria_scores) {
      expect(criterion.criterion).toBeDefined();
      expect(criterion.score).toBeGreaterThanOrEqual(0);
      expect(criterion.weight).toBeGreaterThan(0);
      expect(criterion.notes).toBeDefined();
    }
  });
});
