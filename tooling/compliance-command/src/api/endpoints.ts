import { runtime } from "./runtime.js";

export async function submitCompanyInfo(payload: Record<string, unknown>) {
  return runtime.companyService.submitCompanyInfo(payload as never);
}

export async function generatePackage(payload: Record<string, unknown>) {
  return runtime.packageService.generatePackage(
    String(payload.companyId ?? ""),
    Number(payload.packageNumber ?? 0),
    String(payload.generatedBy ?? "api"),
  );
}

export async function generateAll(payload: Record<string, unknown>) {
  return runtime.packageService.generateAll(String(payload.companyId ?? ""), String(payload.generatedBy ?? "api"));
}

export async function getCompanyInfo(payload: Record<string, unknown>) {
  return runtime.companyService.getCompanyInfo(String(payload.companyId ?? ""));
}

export async function listCompanies() {
  return runtime.companyService.listCompanies();
}

export async function getPackageStatus(payload: Record<string, unknown>) {
  return runtime.packageService.getPackageStatus(String(payload.companyId ?? ""));
}
