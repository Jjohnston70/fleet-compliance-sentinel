/**
 * compliance-command — TypeScript Platform Wrapper
 * True North Data Strategies
 *
 * USAGE:
 *   import { submitCompany, generateAll, getPackageStatus } from './complianceCommand';
 *   const result = await submitCompany({ companyName: 'Acme Corp', primaryContact: 'Jane Doe' });
 *   const packages = await generateAll(result.companyId);
 */

const WEBAPP_URL = '';
const API_KEY = '';

// ── Types ────────────────────────────────────────────────────

type ComplianceAction =
  | 'submitCompanyInfo'
  | 'generatePackage'
  | 'generateAll'
  | 'getCompanyInfo'
  | 'listCompanies'
  | 'getPackageStatus';

interface CompanyInfo {
  companyName: string;
  primaryContact: string;
  companyShortName?: string;
  companyAddress?: string;
  companyCity?: string;
  companyState?: string;
  companyZip?: string;
  companyEmail?: string;
  companyPhone?: string;
  website?: string;
  ein?: string;
  stateOfIncorporation?: string;
  yearFounded?: string;
  entityType?: string;
  cageCode?: string;
  dunsNumber?: string;
  samUei?: string;
  naicsCodes?: string;
  sicCodes?: string;
  contractTypes?: string;
  clearanceLevel?: string;
  setAsideStatus?: string;
  ceo?: string;
  cfo?: string;
  cto?: string;
  ciso?: string;
  itPoc?: string;
  securityPoc?: string;
  compliancePoc?: string;
  hrPoc?: string;
  employeeCount?: string;
  annualRevenue?: string;
  physicalLocations?: string;
  remoteWorkforce?: string;
  cloudProvider?: string;
  emailPlatform?: string;
  insuranceCarrier?: string;
  cyberInsurance?: string;
}

interface SubmitResult {
  companyId: string;
  status: 'created' | 'updated';
  timestamp: string;
}

interface PackageResult {
  packageName: string;
  packageNumber: number;
  documentsGenerated: number;
  folderUrl: string;
  status: string;
  error?: string;
}

interface GenerateAllResult {
  packages: PackageResult[];
  totalDocuments: number;
  folderUrl: string;
}

interface CompanyListItem {
  companyId: string;
  companyName: string;
  primaryContact: string;
  updatedAt: string;
}

interface PackageStatusItem {
  name: string;
  status: string;
  documentCount: number;
  lastGenerated: string | null;
  folderUrl?: string;
}

// ── Internal ─────────────────────────────────────────────────

async function callWebapp(action: ComplianceAction, data: Record<string, unknown> = {}): Promise<any> {
  if (!WEBAPP_URL) throw new Error('WEBAPP_URL not set.');
  const payload: Record<string, unknown> = { action, data };
  if (API_KEY) payload.apiKey = API_KEY;

  const response = await fetch(WEBAPP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  const result = await response.json();
  if (!result.success) throw new Error(`compliance-command error: ${result.error}`);
  return result.data ?? result;
}

// ── Public API ───────────────────────────────────────────────

export async function run(context: Record<string, unknown>): Promise<any> {
  const action = context.action as ComplianceAction;
  if (!action) throw new Error('Missing action');
  const data: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    if (k !== 'action' && v != null) data[k] = v;
  }
  return callWebapp(action, data);
}

export async function submitCompany(info: CompanyInfo): Promise<SubmitResult> {
  return callWebapp('submitCompanyInfo', info as unknown as Record<string, unknown>);
}

export async function generatePackage(
  companyId: string,
  packageNumber: number,
  outputFolderId?: string,
): Promise<PackageResult> {
  const data: Record<string, unknown> = { companyId, packageNumber };
  if (outputFolderId) data.outputFolderId = outputFolderId;
  return callWebapp('generatePackage', data);
}

export async function generateAll(
  companyId: string,
  outputFolderId?: string,
): Promise<GenerateAllResult> {
  const data: Record<string, unknown> = { companyId };
  if (outputFolderId) data.outputFolderId = outputFolderId;
  return callWebapp('generateAll', data);
}

export async function getCompanyInfo(companyId: string): Promise<CompanyInfo & { companyId: string }> {
  return callWebapp('getCompanyInfo', { companyId });
}

export async function listCompanies(): Promise<{ companies: CompanyListItem[]; count: number }> {
  return callWebapp('listCompanies', {});
}

export async function getPackageStatus(companyId: string): Promise<{
  companyId: string;
  packages: PackageStatusItem[];
}> {
  return callWebapp('getPackageStatus', { companyId });
}
