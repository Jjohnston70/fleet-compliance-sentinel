/**
 * Seed data for initial database population
 */

import { Opportunity, OutreachContact, ComplianceItem } from "./schemas.js";
import { DEFAULT_COMPLIANCE_ITEMS } from "../config/compliance-seeds.js";

/**
 * Example opportunities for testing and demo
 */
export const SEED_OPPORTUNITIES: Opportunity[] = [
  {
    id: "opp-001",
    title: "Workflow Automation Platform Implementation",
    solicitation_number: "PRC-2025-001",
    agency: "General Services Administration",
    sub_agency: "Federal Acquisition Service",
    posted_date: new Date("2025-03-01"),
    response_deadline: new Date("2025-04-15"),
    set_aside_type: "small_business",
    naics_code: "541512",
    naics_description: "Computer Systems Design Services",
    estimated_value: 125_000,
    place_of_performance: "Washington, DC",
    description:
      "GSA FAS seeks contractor to design and implement workflow automation platform for regional processing center.",
    url: "https://sam.gov/opp/000000000",
    status: "evaluating",
    source: "sam_gov",
    created_at: new Date("2025-03-05"),
    updated_at: new Date("2025-03-05"),
  },
  {
    id: "opp-002",
    title: "Data Dashboard Development for Army Corps",
    solicitation_number: "W9124C-2025-0042",
    agency: "Department of Defense",
    sub_agency: "U.S. Army Corps of Engineers",
    posted_date: new Date("2025-02-20"),
    response_deadline: new Date("2025-03-25"),
    set_aside_type: "SDVOSB",
    naics_code: "541511",
    naics_description: "Custom Computer Programming Services",
    estimated_value: 85_000,
    place_of_performance: "Omaha, NE",
    description:
      "Development of real-time data dashboard for environmental monitoring and reporting.",
    url: "https://sam.gov/opp/000000001",
    status: "bid",
    source: "sam_gov",
    created_at: new Date("2025-02-21"),
    updated_at: new Date("2025-03-08"),
  },
];

/**
 * Example outreach contacts
 */
export const SEED_OUTREACH_CONTACTS: OutreachContact[] = [
  {
    id: "contact-001",
    agency: "General Services Administration",
    office: "Federal Acquisition Service",
    name: "Sarah Mitchell",
    title: "Contracting Officer",
    email: "sarah.mitchell@gsa.gov",
    phone: "202-555-0101",
    osdbu: false,
    last_contacted: new Date("2025-02-15"),
    contact_count: 1,
    notes: "Receptive to small business solutions. Interested in automation use cases.",
    status: "warm",
    created_at: new Date("2025-02-10"),
  },
  {
    id: "contact-002",
    agency: "Department of Veterans Affairs",
    office: "Office of Small and Disadvantaged Business Utilization",
    name: "James Rodriguez",
    title: "SDVOSB Liaison",
    email: "james.rodriguez@va.gov",
    phone: "202-555-0202",
    osdbu: true,
    last_contacted: new Date("2025-01-20"),
    contact_count: 2,
    notes: "Knows TNDS is pursuing SDVOSB. Has opportunities in pipeline.",
    status: "active",
    created_at: new Date("2024-12-01"),
  },
];

/**
 * Default compliance items seeded from config
 */
export const SEED_COMPLIANCE_ITEMS: ComplianceItem[] =
  DEFAULT_COMPLIANCE_ITEMS.map((item, idx) => ({
    id: `comp-${String(idx + 1).padStart(3, "0")}`,
    item_type: item.itemType as
      | "registration"
      | "certification"
      | "renewal"
      | "filing",
    name: item.name,
    description: item.description,
    authority: item.authority,
    status: "current" as const,
    effective_date: new Date("2025-01-01"),
    expiration_date: new Date(
      new Date().getTime() + item.renewalFrequencyMonths * 30 * 24 * 60 * 60 * 1000
    ),
    reminder_days_before: item.reminderDaysBefore,
    notes: `Auto-seeded from default compliance tracking list.`,
  }));

export async function seedDatabase(repo: any): Promise<void> {
  // Seed opportunities
  for (const opp of SEED_OPPORTUNITIES) {
    await repo.createOpportunity(opp);
  }

  // Seed outreach contacts
  for (const contact of SEED_OUTREACH_CONTACTS) {
    await repo.createOutreachContact(contact);
  }

  // Seed compliance items
  for (const item of SEED_COMPLIANCE_ITEMS) {
    await repo.createComplianceItem(item);
  }
}
