import { describe, expect, it } from "vitest";

import { buildReplacementValues, renderTemplate } from "../src/services/template-engine.js";

describe("template-engine", () => {
  it("replaces known placeholders", () => {
    const replacementValues = buildReplacementValues({
      id: "c1",
      company_name: "Acme Federal",
      primary_contact: "Jane Doe",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const rendered = renderTemplate("Company: {{COMPANY_NAME}} Contact: {{PRIMARY_CONTACT}}", replacementValues);
    expect(rendered.renderedContent).toContain("Acme Federal");
    expect(rendered.renderedContent).toContain("Jane Doe");
    expect(rendered.unresolvedPlaceholders).toEqual([]);
  });

  it("returns unresolved placeholders for missing values", () => {
    const replacementValues = buildReplacementValues({
      id: "c2",
      company_name: "Blue Canyon",
      primary_contact: "Alex Roe",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const rendered = renderTemplate("Missing: {{CISO}} and {{COMPANY_NAME}}", replacementValues);
    expect(rendered.renderedContent).toContain("Blue Canyon");
    expect(rendered.unresolvedPlaceholders).toContain("CISO");
  });
});
