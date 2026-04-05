import { describe, it, expect } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { SEED_OPPORTUNITIES, SEED_OUTREACH_CONTACTS, SEED_COMPLIANCE_ITEMS, seedDatabase } from "../src/data/seeds.js";
import { DEFAULT_COMPLIANCE_ITEMS } from "../src/config/compliance-seeds.js";

describe("seed data validation", () => {
  it("seed opportunities have valid UUIDs", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const opp of SEED_OPPORTUNITIES) {
      expect(opp.id).toMatch(uuidRegex);
    }
  });

  it("seed contacts have valid UUIDs", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const contact of SEED_OUTREACH_CONTACTS) {
      expect(contact.id).toMatch(uuidRegex);
    }
  });

  it("seed compliance items have valid UUIDs", () => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const item of SEED_COMPLIANCE_ITEMS) {
      expect(item.id).toMatch(uuidRegex);
    }
  });

  it("seedDatabase populates repository without throwing", async () => {
    const repo = new InMemoryRepository();
    await expect(seedDatabase(repo)).resolves.not.toThrow();
  });

  it("seedDatabase creates expected number of records", async () => {
    const repo = new InMemoryRepository();
    await seedDatabase(repo);

    const opportunities = await repo.listOpportunities();
    expect(opportunities).toHaveLength(SEED_OPPORTUNITIES.length);

    const contacts = await repo.listOutreachContacts();
    expect(contacts).toHaveLength(SEED_OUTREACH_CONTACTS.length);

    const items = await repo.listComplianceItems();
    expect(items).toHaveLength(SEED_COMPLIANCE_ITEMS.length);
  });

  it("Colorado State Tax Return uses state authority, not IRS", () => {
    const coTax = DEFAULT_COMPLIANCE_ITEMS.find(
      (item) => item.name === "Colorado State Tax Return"
    );
    expect(coTax).toBeDefined();
    expect(coTax!.authority).toBe("state");
  });
});
