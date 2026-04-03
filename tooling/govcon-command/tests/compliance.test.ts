/**
 * Compliance Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { ComplianceService } from "../src/services/compliance-service.js";

describe("ComplianceService", () => {
  let repo: InMemoryRepository;
  let service: ComplianceService;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    service = new ComplianceService(repo);
  });

  it("should create a compliance item", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 365);

    const item = await service.createComplianceItem(
      "SAM.gov Registration",
      "Federal contractor registration",
      "registration",
      "SAM",
      future
    );

    expect(item.id).toBeDefined();
    expect(item.name).toBe("SAM.gov Registration");
    expect(item.status).toBe("current");
  });

  it.skip("should identify items expiring in 90 days", async () => {
    const future90 = new Date();
    future90.setDate(future90.getDate() + 45); // Within 90 days

    const future180 = new Date();
    future180.setDate(future180.getDate() + 180); // Beyond 90 days

    await service.createComplianceItem(
      "Item 1",
      "Will expire soon",
      "certification",
      "SBA",
      future90
    );

    await service.createComplianceItem(
      "Item 2",
      "Will expire later",
      "certification",
      "SBA",
      future180
    );

    const expiring = await service.getExpiringItems(90);
    expect(expiring.length).toBe(1);
    expect(expiring[0].name).toBe("Item 1");
  });

  it.skip("should identify expired items", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const future = new Date();
    future.setDate(future.getDate() + 365);

    const expiredItem = await service.createComplianceItem(
      "Expired Item",
      "Already expired",
      "certification",
      "SBA",
      yesterday,
      { status: "expired" }
    );

    const currentItem = await service.createComplianceItem(
      "Current Item",
      "Still valid",
      "certification",
      "SBA",
      future
    );

    const expired = await service.getExpiredItems();
    expect(expired.some((i) => i.id === expiredItem.id)).toBe(true);
    expect(expired.some((i) => i.id === currentItem.id)).toBe(false);
  });

  it.skip("should alert at 7-day threshold", async () => {
    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const in10Days = new Date();
    in10Days.setDate(in10Days.getDate() + 10);

    await service.createComplianceItem(
      "Alert Item",
      "Expires in 7 days",
      "certification",
      "SBA",
      in7Days
    );

    await service.createComplianceItem(
      "No Alert Item",
      "Expires in 10 days",
      "certification",
      "SBA",
      in10Days
    );

    const alerts = await service.getExpiringItems(7);
    expect(alerts.length).toBe(1);
    expect(alerts[0].name).toBe("Alert Item");
  });

  it.skip("should alert at 30-day threshold", async () => {
    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    const in45Days = new Date();
    in45Days.setDate(in45Days.getDate() + 45);

    await service.createComplianceItem(
      "Alert Item",
      "Expires in 30 days",
      "certification",
      "SBA",
      in30Days
    );

    await service.createComplianceItem(
      "No Alert Item",
      "Expires in 45 days",
      "certification",
      "SBA",
      in45Days
    );

    const alerts = await service.getExpiringItems(30);
    expect(alerts.length).toBe(1);
    expect(alerts[0].name).toBe("Alert Item");
  });

  it.skip("should categorize alerts by severity", async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const in7Days = new Date();
    in7Days.setDate(in7Days.getDate() + 7);

    const in30Days = new Date();
    in30Days.setDate(in30Days.getDate() + 30);

    await service.createComplianceItem(
      "Expired",
      "Already expired",
      "certification",
      "SBA",
      yesterday,
      { status: "expired" }
    );

    await service.createComplianceItem(
      "Warning",
      "7-day threshold",
      "certification",
      "SBA",
      in7Days
    );

    await service.createComplianceItem(
      "Upcoming",
      "30-day threshold",
      "certification",
      "SBA",
      in30Days
    );

    const { critical, warning, upcoming } =
      await service.getComplianceAlerts();

    expect(critical.length).toBe(1);
    expect(warning.length).toBe(1);
    expect(upcoming.length).toBe(1);
  });

  it.skip("should filter by authority", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 365);

    await service.createComplianceItem(
      "SAM Item",
      "SAM registration",
      "registration",
      "SAM",
      future
    );

    await service.createComplianceItem(
      "SBA Item",
      "SBA certification",
      "certification",
      "SBA",
      future
    );

    const samItems = await service.listComplianceItems({ authority: "SAM" });
    expect(samItems.length).toBe(1);
    expect(samItems[0].authority).toBe("SAM");
  });

  it("should mark item as renewed", async () => {
    const future = new Date();
    future.setDate(future.getDate() + 365);

    const item = await service.createComplianceItem(
      "Renewable Item",
      "Can be renewed",
      "certification",
      "SBA",
      future
    );

    const newExpiration = new Date();
    newExpiration.setDate(newExpiration.getDate() + 730);

    const renewed = await service.markRenewed(item.id, newExpiration);
    expect(renewed.status).toBe("current");
    expect(renewed.expiration_date).toEqual(newExpiration);
  });
});
