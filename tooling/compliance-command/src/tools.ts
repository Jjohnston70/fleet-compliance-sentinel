import { runtime } from "./api/runtime.js";
import type { ComplianceAction } from "./api/router.js";

export type ToolDefinition = {
  name: string;
  description: string;
  parameters: Record<string, unknown>;
  handler: (params: Record<string, unknown>) => Promise<Record<string, unknown>>;
};

const toResult = async (action: ComplianceAction, params: Record<string, unknown>) => {
  switch (action) {
    case "generatePackage":
      return runtime.packageService.generatePackage(String(params.companyId ?? ""), Number(params.packageNumber ?? 0), "tool");
    case "getCompanyInfo":
      return runtime.companyService.getCompanyInfo(String(params.companyId ?? ""));
    case "getPackageStatus":
      return runtime.packageService.getPackageStatus(String(params.companyId ?? ""));
    default:
      throw new Error(`Unsupported tool action: ${action}`);
  }
};

export const tools: ToolDefinition[] = [
  {
    name: "generate_compliance_package",
    description: "Generate one compliance package for a company and return generated document links.",
    parameters: {
      type: "object",
      properties: {
        companyId: { type: "string" },
        packageNumber: { type: "integer", minimum: 1, maximum: 7 },
      },
      required: ["companyId", "packageNumber"],
    },
    handler: async (params) => ({ success: true, data: await toResult("generatePackage", params) }),
  },
  {
    name: "get_company_info",
    description: "Retrieve full company profile by company ID.",
    parameters: {
      type: "object",
      properties: { companyId: { type: "string" } },
      required: ["companyId"],
    },
    handler: async (params) => ({ success: true, data: await toResult("getCompanyInfo", params) }),
  },
  {
    name: "check_package_status",
    description: "Return generation status for all seven compliance packages for a company.",
    parameters: {
      type: "object",
      properties: { companyId: { type: "string" } },
      required: ["companyId"],
    },
    handler: async (params) => ({ success: true, data: await toResult("getPackageStatus", params) }),
  },
  {
    name: "list_frameworks",
    description: "List supported compliance frameworks and versions.",
    parameters: {
      type: "object",
      properties: {},
    },
    handler: async () => ({ success: true, data: runtime.frameworkService.listFrameworks() }),
  },
];
