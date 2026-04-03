import { describe, expect, it } from "vitest";

import { runtime } from "../src/api/runtime.js";

describe("package-service", () => {
  it("is idempotent for package generation", async () => {
    const submit = runtime.companyService.submitCompanyInfo({
      companyName: "Idempotent Systems",
      primaryContact: "Taylor Quinn",
    });

    const first = await runtime.packageService.generatePackage(submit.companyId, 1, "test");
    const second = await runtime.packageService.generatePackage(submit.companyId, 1, "test");

    expect(first.packageNumber).toBe(1);
    expect(second.packageNumber).toBe(1);

    const status = runtime.packageService.getPackageStatus(submit.companyId);
    const packageOne = status.packages.find((pkg) => pkg.name === "Internal Compliance");

    expect(packageOne?.status).toBe("generated");
    expect(packageOne?.documentCount).toBeGreaterThan(0);
  });
});
