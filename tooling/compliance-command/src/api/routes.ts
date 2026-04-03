import type { ComplianceAction } from "./router.js";

export type RestRoute = {
  method: "POST";
  path: string;
  action: ComplianceAction;
};

export const REST_ROUTES: RestRoute[] = [
  { method: "POST", path: "/api/compliance/submit-company-info", action: "submitCompanyInfo" },
  { method: "POST", path: "/api/compliance/generate-package", action: "generatePackage" },
  { method: "POST", path: "/api/compliance/generate-all", action: "generateAll" },
  { method: "POST", path: "/api/compliance/get-company-info", action: "getCompanyInfo" },
  { method: "POST", path: "/api/compliance/list-companies", action: "listCompanies" },
  { method: "POST", path: "/api/compliance/get-package-status", action: "getPackageStatus" },
];
