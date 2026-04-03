import { describe, expect, it } from "vitest";

import { runtime } from "../src/api/runtime.js";

describe("company-service", () => {
  it("creates a new company with submitCompanyInfo", () => {
    const result = runtime.companyService.submitCompanyInfo({
      companyName: "Test Corp",
      primaryContact: "Alice Smith",
      companyShortName: "TC",
      ein: "12-3456789",
    });

    expect(result.companyId).toBeTruthy();
    expect(result.status).toBe("created");
    expect(result.timestamp).toBeTruthy();
  });

  it("updates an existing company on duplicate name", () => {
    const first = runtime.companyService.submitCompanyInfo({
      companyName: "Updatable Corp",
      primaryContact: "John Doe",
    });

    const second = runtime.companyService.submitCompanyInfo({
      companyName: "Updatable Corp",
      primaryContact: "Jane Doe",
      ein: "98-7654321",
    });

    expect(first.companyId).toBe(second.companyId);
    expect(first.status).toBe("created");
    expect(second.status).toBe("updated");
  });

  it("retrieves company info by ID", () => {
    const submit = runtime.companyService.submitCompanyInfo({
      companyName: "Retrievable Inc",
      primaryContact: "Bob",
      ceo: "Bob Smith",
      cto: "Charlie Brown",
    });

    const info = runtime.companyService.getCompanyInfo(submit.companyId);

    expect(info.id).toBe(submit.companyId);
    expect(info.company_name).toBe("Retrievable Inc");
    expect(info.ceo).toBe("Bob Smith");
  });

  it("lists all companies", () => {
    runtime.companyService.submitCompanyInfo({
      companyName: "List Test 1",
      primaryContact: "Contact 1",
    });

    runtime.companyService.submitCompanyInfo({
      companyName: "List Test 2",
      primaryContact: "Contact 2",
    });

    const listing = runtime.companyService.listCompanies();

    expect(listing.count).toBeGreaterThanOrEqual(2);
    expect(listing.companies.length).toEqual(listing.count);
    expect(listing.companies.some((c) => c.companyName === "List Test 1")).toBe(true);
  });

  it("throws error for missing required fields", () => {
    expect(() => {
      runtime.companyService.submitCompanyInfo({
        companyName: "",
        primaryContact: "Someone",
      });
    }).toThrow("companyName is required");

    expect(() => {
      runtime.companyService.submitCompanyInfo({
        companyName: "Some Company",
        primaryContact: "",
      });
    }).toThrow("primaryContact is required");
  });

  it("throws error for nonexistent company", () => {
    expect(() => {
      runtime.companyService.getCompanyInfo("nonexistent-id-12345");
    }).toThrow("Company not found");
  });
});
