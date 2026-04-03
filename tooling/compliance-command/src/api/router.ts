import { MODULE_META } from "../config/module-config.js";
import { runtime } from "./runtime.js";

export type ComplianceAction =
  | "submitCompanyInfo"
  | "generatePackage"
  | "generateAll"
  | "getCompanyInfo"
  | "listCompanies"
  | "getPackageStatus"
  | "getStatus";

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  availableActions?: ComplianceAction[];
};

function assertAction(action: string): asserts action is ComplianceAction {
  const actions = MODULE_META.actions as readonly string[];
  if (!actions.includes(action)) {
    throw new Error(`Unknown action: ${action}`);
  }
}

export async function handleAction(action: ComplianceAction, data: Record<string, unknown>): Promise<unknown> {
  switch (action) {
    case "submitCompanyInfo":
      return runtime.companyService.submitCompanyInfo(data as never);
    case "generatePackage":
      return runtime.packageService.generatePackage(
        String(data.companyId ?? ""),
        Number(data.packageNumber ?? 0),
        String(data.generatedBy ?? "api"),
      );
    case "generateAll":
      return runtime.packageService.generateAll(String(data.companyId ?? ""), String(data.generatedBy ?? "api"));
    case "getCompanyInfo":
      return runtime.companyService.getCompanyInfo(String(data.companyId ?? ""));
    case "listCompanies":
      return runtime.companyService.listCompanies();
    case "getPackageStatus":
    case "getStatus":
      return runtime.packageService.getPackageStatus(String(data.companyId ?? ""));
    default:
      throw new Error(`Unhandled action: ${action satisfies never}`);
  }
}

export async function handlePost(body: { action?: string; data?: Record<string, unknown> }): Promise<ApiResponse> {
  try {
    const action = body.action ?? "";
    assertAction(action);
    const result = await handleAction(action, body.data ?? {});
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return {
      success: false,
      error: message,
      availableActions: [...MODULE_META.actions] as ComplianceAction[],
    };
  }
}

export function handleGet(action = "meta"): ApiResponse {
  if (action === "meta") {
    return { success: true, data: MODULE_META };
  }
  return { success: false, error: "Use POST for actions" };
}
