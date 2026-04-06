/**
 * Outreach Service Tests
 */

import { describe, it, expect, beforeEach } from "vitest";
import { InMemoryRepository } from "../src/data/repository.js";
import { OutreachService } from "../src/services/outreach-service.js";

describe("OutreachService", () => {
  let repo: InMemoryRepository;
  let service: OutreachService;

  beforeEach(async () => {
    repo = new InMemoryRepository();
    service = new OutreachService(repo);
  });

  it("should create an outreach contact", async () => {
    const contact = await service.createContact(
      "John Smith",
      "john@agency.gov",
      "Test Agency",
      "Contracting Officer"
    );

    expect(contact.id).toBeDefined();
    expect(contact.name).toBe("John Smith");
    expect(contact.status).toBe("prospect");
    expect(contact.contact_count).toBe(0);
  });

  it("should log outreach activity", async () => {
    const contact = await service.createContact(
      "John Smith",
      "john@agency.gov",
      "Test Agency",
      "Contracting Officer"
    );

    const activity = await service.logActivity(
      contact.id,
      "email",
      "Introduction to SDVOSB services"
    );

    expect(activity.id).toBeDefined();
    expect(activity.activity_type).toBe("email");
    expect(activity.completed).toBe(true);

    // Verify contact was updated
    const updated = await service.getContact(contact.id);
    expect(updated?.contact_count).toBe(1);
    expect(updated?.status).toBe("warm");
  });

  it.skip("should get contact history", async () => {
    const contact = await service.createContact(
      "Jane Doe",
      "jane@agency.gov",
      "Test Agency",
      "OSDBU Officer"
    );

    await service.logActivity(contact.id, "email", "First outreach");
    await service.logActivity(contact.id, "phone", "Follow-up call");

    const history = await service.getContactHistory(contact.id);
    expect(history.length).toBe(2);
  });

  it.skip("should filter contacts by agency", async () => {
    await service.createContact(
      "Contact A",
      "a@agencyA.gov",
      "Agency A",
      "CO"
    );

    await service.createContact(
      "Contact B",
      "b@agencyB.gov",
      "Agency B",
      "CO"
    );

    const results = await service.listContacts({ agency: "Agency A" });
    expect(results.length).toBe(1);
    expect(results[0].agency).toBe("Agency A");
  });

  it.skip("should filter contacts by status", async () => {
    const contact1 = await service.createContact(
      "Contact A",
      "a@agency.gov",
      "Agency",
      "CO"
    );

    const contact2 = await service.createContact(
      "Contact B",
      "b@agency.gov",
      "Agency",
      "CO"
    );

    await service.logActivity(contact1.id, "email", "Introduction");
    await service.markActive(contact2.id);

    const warmContacts = await service.listContacts({ status: "warm" });
    expect(warmContacts.length).toBe(1);

    const activeContacts = await service.listContacts({ status: "active" });
    expect(activeContacts.length).toBe(1);
  });

  it("should schedule follow-ups", async () => {
    const contact = await service.createContact(
      "John Smith",
      "john@agency.gov",
      "Test Agency",
      "Contracting Officer"
    );

    const followUpDate = new Date();
    followUpDate.setDate(followUpDate.getDate() + 7);

    const followUp = await service.scheduleFollowUp(
      contact.id,
      "Initial introduction",
      followUpDate
    );

    expect(followUp.follow_up_date).toEqual(followUpDate);
    expect(followUp.completed).toBe(false);
  });

  it.skip("should count contacts by status", async () => {
    const c1 = await service.createContact(
      "Contact 1",
      "c1@agency.gov",
      "Agency",
      "CO"
    );

    const c2 = await service.createContact(
      "Contact 2",
      "c2@agency.gov",
      "Agency",
      "CO"
    );

    const c3 = await service.createContact(
      "Contact 3",
      "c3@agency.gov",
      "Agency",
      "CO"
    );

    await service.logActivity(c1.id, "email", "Email");
    await service.markActive(c2.id);

    const counts = await service.countByStatus();
    expect(counts.prospect).toBe(1);
    expect(counts.warm).toBe(1);
    expect(counts.active).toBe(1);
  });

  it("should track contact count", async () => {
    const contact = await service.createContact(
      "John Smith",
      "john@agency.gov",
      "Test Agency",
      "CO"
    );

    expect(contact.contact_count).toBe(0);

    await service.logActivity(contact.id, "email", "Email 1");
    let updated = await service.getContact(contact.id);
    expect(updated?.contact_count).toBe(1);

    await service.logActivity(contact.id, "phone", "Call 1");
    updated = await service.getContact(contact.id);
    expect(updated?.contact_count).toBe(2);
  });
});
