import { describe, expect, it } from "vitest";

import { handlePost } from "../src/api/router.js";

describe("integration", () => {
  it("handles complete workflow: submit -> generate -> status", async () => {
    // Step 1: Submit company info
    const submitResult = await handlePost({
      action: "submitCompanyInfo",
      data: {
        companyName: "Integration Test Inc",
        primaryContact: "Test Manager",
        ein: "55-1234567",
        ceo: "Test CEO",
        cto: "Test CTO",
        ciso: "Test CISO",
      },
    });

    expect(submitResult.success).toBe(true);
    const companyId = (submitResult.data as Record<string, unknown>)?.companyId as string;
    expect(companyId).toBeTruthy();

    // Step 2: Generate package 1
    const genResult = await handlePost({
      action: "generatePackage",
      data: { companyId, packageNumber: 1 },
    });

    expect(genResult.success).toBe(true);
    const genData = genResult.data as Record<string, unknown>;
    expect(genData.packageNumber).toBe(1);
    expect(genData.documentsGenerated).toBeGreaterThan(0);

    // Step 3: Check package status
    const statusResult = await handlePost({
      action: "getPackageStatus",
      data: { companyId },
    });

    expect(statusResult.success).toBe(true);
    const statusData = statusResult.data as Record<string, unknown>;
    expect(statusData.packages).toBeDefined();
  });

  it("generates all packages for a company", async () => {
    const submitResult = await handlePost({
      action: "submitCompanyInfo",
      data: {
        companyName: "All Packages Test",
        primaryContact: "Tester",
      },
    });

    const companyId = (submitResult.data as Record<string, unknown>)?.companyId as string;

    const allResult = await handlePost({
      action: "generateAll",
      data: { companyId },
    });

    expect(allResult.success).toBe(true);
    const allData = allResult.data as Record<string, unknown>;
    const packages = allData.packages as Array<Record<string, unknown>>;
    expect(packages.length).toBe(7);
    expect(allData.totalDocuments).toBeGreaterThan(0);
  });

  it("retrieves company info through API", async () => {
    const submitResult = await handlePost({
      action: "submitCompanyInfo",
      data: {
        companyName: "Retrieve Test Co",
        primaryContact: "Retriever",
        ein: "77-7777777",
      },
    });

    const companyId = (submitResult.data as Record<string, unknown>)?.companyId as string;

    const getResult = await handlePost({
      action: "getCompanyInfo",
      data: { companyId },
    });

    expect(getResult.success).toBe(true);
    const company = getResult.data as Record<string, unknown>;
    expect(company.company_name).toBe("Retrieve Test Co");
    expect(company.ein).toBe("77-7777777");
  });

  it("lists all companies", async () => {
    await handlePost({
      action: "submitCompanyInfo",
      data: { companyName: "List Co 1", primaryContact: "Contact1" },
    });

    await handlePost({
      action: "submitCompanyInfo",
      data: { companyName: "List Co 2", primaryContact: "Contact2" },
    });

    const listResult = await handlePost({
      action: "listCompanies",
      data: {},
    });

    expect(listResult.success).toBe(true);
    const listData = listResult.data as Record<string, unknown>;
    expect(listData.count).toBeGreaterThanOrEqual(2);
    expect((listData.companies as Array<unknown>).length).toBe(listData.count);
  });

  it("handles API errors gracefully", async () => {
    const badResult = await handlePost({
      action: "getCompanyInfo",
      data: { companyId: "nonexistent" },
    });

    expect(badResult.success).toBe(false);
    expect(badResult.error).toContain("not found");
  });
});
