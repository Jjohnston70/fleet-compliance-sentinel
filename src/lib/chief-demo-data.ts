import {
  activity_logs as importedActivityLogs,
  assets as importedAssets,
  employee_compliance as importedEmployeeCompliance,
  maintenance_events as importedMaintenanceEvents,
  organizations as importedOrganizations,
  people as importedPeople,
  permit_license_records as importedPermitLicenseRecords,
  suspense_items as importedSuspenseItems,
  tank_assets as importedTankAssets,
} from '@/lib/chief-imported-data.generated';

const activityRows = importedActivityLogs as ReadonlyArray<Record<string, any>>;
const assetRows = importedAssets as ReadonlyArray<Record<string, any>>;
const employeeComplianceRows = importedEmployeeCompliance as ReadonlyArray<Record<string, any>>;
const maintenanceEventRows = importedMaintenanceEvents as ReadonlyArray<Record<string, any>>;
const organizationRows = importedOrganizations as ReadonlyArray<Record<string, any>>;
const peopleRows = importedPeople as ReadonlyArray<Record<string, any>>;
const permitRows = importedPermitLicenseRecords as ReadonlyArray<Record<string, any>>;
const suspenseRows = importedSuspenseItems as ReadonlyArray<Record<string, any>>;
const tankRows = importedTankAssets as ReadonlyArray<Record<string, any>>;

export type ChiefAssetCategory = string;

export interface ChiefAssetRecord {
  assetId: string;
  sourceRef: string;
  name: string;
  category: ChiefAssetCategory;
  status: string;
  location: string;
  assignedTo: string;
  complianceFocus: string;
  nextDueLabel: string;
  nextDueDate: string;
  purchaseDate: string;
  purchasePrice: string;
  note: string;
}

export interface ChiefPermitRecord {
  recordId: string;
  name: string;
  templateId: string;
  cadence: string;
  status: string;
  renewalDueDate: string;
  issuingAgency: string;
  owner: string;
  note: string;
}

export interface ChiefDriverComplianceRecord {
  personId: string;
  employeeId: string;
  driverName: string;
  licenseState: string;
  cdlClass: string;
  medicalExpiration: string;
  nextMvrDue: string;
  tsaExpiration: string;
  hazmatExpiration: string;
  clearinghouseStatus: string;
  note: string;
}

export interface ChiefSuspenseRecord {
  suspenseItemId: string;
  sourceType: string;
  sourceId: string;
  title: string;
  ownerEmail: string;
  dueDate: string;
  alertState: string;
  severity: string;
  status: string;
}

export interface ChiefResourceLink {
  href: string;
  label: string;
  note: string;
}

export interface ChiefModuleSummary {
  sourceSystems: number;
  plannedCollections: number;
  alertTracks: number;
  pennyCorpus: string;
}

export interface ChiefActivityLogRecord {
  activityId: string;
  assetId: string;
  timestamp: string;
  actionType: string;
  employeeName: string;
  location: string;
  notes: string;
}

export interface ChiefMaintenanceEventRecord {
  maintenanceEventId: string;
  assetId: string;
  serviceType: string;
  status: string;
  completedDate: string;
  vendor: string;
  notes: string;
}

const today = new Date('2026-03-17T12:00:00-06:00');

const permitCadenceMap: Record<string, string> = {
  state_hazmat: 'Annual',
  federal_hazmat: 'Every 4 years',
  ucr: 'Annual',
  operating_authority_mc150: 'Every 2 years, NLT October',
  ifta: 'Quarterly',
  irp: 'Annual',
};

const permitNameMap: Record<string, string> = {
  state_hazmat: 'State Hazmat',
  federal_hazmat: 'Federal Hazmat',
  ucr: 'UCR',
  operating_authority_mc150: 'Operating Authority MC150',
  ifta: 'IFTA',
  irp: 'IRP',
};

const permitRouteHintMap: Record<string, string> = {
  state_hazmat: 'Colorado hazmat registration',
  federal_hazmat: 'Hazmat registration cycle',
  ucr: 'Unified Carrier Registration',
  operating_authority_mc150: 'Biennial update',
  ifta: 'Fuel tax filing',
  irp: 'Apportioned registration',
};

function daysUntil(dateText: string): number {
  const due = new Date(`${dateText}T12:00:00-06:00`);
  const diffMs = due.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

function sortByDateAsc<T>(rows: T[], selector: (row: T) => string): T[] {
  return [...rows].sort((a, b) => selector(a).localeCompare(selector(b)));
}

function titleCase(value: string | null | undefined): string {
  if (!value) return 'Unknown';
  return value
    .replace(/[_-]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function normalizeAssetCategory(category: string | null | undefined): string {
  const normalized = (category || '').trim().toLowerCase();
  if (!normalized) return 'asset';
  if (normalized === 'vehicle') return 'vehicle';
  if (normalized === 'tank') return 'tank';
  if (normalized === 'trailer') return 'trailer';
  return normalized;
}

function complianceFocusForCategory(category: string): string {
  if (category === 'vehicle') return 'Registration, DOT inspection, insurance, service interval';
  if (category === 'tank') return 'Leak test, inspection, tank permit, calibration';
  if (category === 'trailer') return 'Inspection, lights, tires, annual review';
  return 'Service interval, maintenance history, assignment tracking';
}

function addOneYear(dateText: string | null | undefined): string {
  if (!dateText) return '';
  const parsed = new Date(`${dateText}T12:00:00-06:00`);
  parsed.setFullYear(parsed.getFullYear() + 1);
  return parsed.toISOString().slice(0, 10);
}

function asString(value: unknown, fallback = ''): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return fallback;
}

function slugToMailbox(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '') || 'compliance';
}

function normalizeQuery(query: string | undefined): string {
  return (query || '').trim().toLowerCase();
}

function matchesQuery(query: string | undefined, values: Array<string | undefined>): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) return true;
  return values.some((value) => (value || '').toLowerCase().includes(normalized));
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

const peopleByEmployeeId = new Map(peopleRows.map((person) => [asString(person.employeeId), person]));

const assetRowsFromImports: ChiefAssetRecord[] = assetRows.map((asset) => {
  const category = normalizeAssetCategory(asString(asset.category));
  const nextDueDate =
    asString(asset.nextServiceDue) ||
    (category === 'tank' ? asString(asset.nextInspectionDue) : '') ||
    '2026-12-31';

  return {
    assetId: asString(asset.assetId),
    sourceRef: asString(asset.sourceRef, asString(asset.assetId)),
    name: asString(asset.name, asString(asset.assetId)),
    category,
    status: asString(asset.status, 'unknown').toLowerCase().replace(/\s+/g, '-'),
    location: asString(asset.location, 'Unassigned'),
    assignedTo: asString(asset.assignedToName, 'Unassigned'),
    complianceFocus: complianceFocusForCategory(category),
    nextDueLabel: category === 'tank' ? 'Inspection' : 'Service',
    nextDueDate,
    purchaseDate: asString(asset.purchaseDate),
    purchasePrice: asString(asset.purchasePrice),
    note: asString(asset.notes, 'Imported from source workbook.'),
  };
});

const tankAssetRows: ChiefAssetRecord[] = tankRows
  .filter((tank) => !assetRowsFromImports.some((asset) => asset.assetId === tank.assetId))
  .map((tank) => ({
    assetId: asString(tank.assetId),
    sourceRef: asString(tank.tankId, asString(tank.assetId)),
    name: `Tank ${asString(tank.tankId, asString(tank.assetId))}`,
    category: 'tank',
    status: asString(tank.status, 'active').toLowerCase(),
    location: asString(tank.location, 'Unassigned'),
    assignedTo: 'Operations',
    complianceFocus: 'Leak test, inspection, tank permit, calibration',
    nextDueLabel: 'Leak test',
    nextDueDate: asString(tank.nextLeakTestDue, asString(tank.nextInspectionDue, '2026-12-31')),
    purchaseDate: asString(tank.installationDate),
    purchasePrice: '',
    note: asString(tank.notes, 'Imported tank record.'),
  }));

export const chiefAssets: ChiefAssetRecord[] = sortByDateAsc([...assetRowsFromImports, ...tankAssetRows], (row) => row.nextDueDate);

export const chiefPermitCadence = [
  { name: 'State Hazmat', cadence: 'Annual', routeHint: 'Colorado hazmat registration' },
  { name: 'Federal Hazmat', cadence: 'Every 4 years', routeHint: 'Hazmat registration cycle' },
  { name: 'UCR', cadence: 'Annual', routeHint: 'Unified Carrier Registration' },
  { name: 'Operating Authority MC150', cadence: 'Every 2 years, NLT October', routeHint: 'Biennial update' },
  { name: 'IFTA', cadence: 'Quarterly', routeHint: 'Fuel tax filing' },
  { name: 'IRP', cadence: 'Annual', routeHint: 'Apportioned registration' },
];

export const chiefPermitRecords: ChiefPermitRecord[] = sortByDateAsc(
  permitRows.map((record) => {
    const templateId = asString(record.templateId, 'permit');
    return {
      recordId: asString(record.recordId),
      name: permitNameMap[templateId] || titleCase(templateId),
      templateId,
      cadence: permitCadenceMap[templateId] || 'Tracked',
      status: asString(record.status, 'active').toLowerCase(),
      renewalDueDate: asString(record.renewalDueDate, asString(record.expirationDate, '2026-12-31')),
      issuingAgency: asString(record.issuingAgency, 'Unknown agency'),
      owner: `${slugToMailbox(asString(record.responsibleEmployeeName, 'compliance'))}@examplefleetco.com`,
      note: asString(record.notes, 'Imported permit record.'),
    };
  }),
  (row) => row.renewalDueDate
);

export const chiefDriverCompliance: ChiefDriverComplianceRecord[] = sortByDateAsc(
  employeeComplianceRows.map((row) => {
    const employeeId = asString(row.driverId || row.employeeId, '');
    const person = peopleByEmployeeId.get(employeeId);
    const driverName = asString(person?.fullName, employeeId);
    const nextMvrDue = asString(row.nextMvrDue, addOneYear(asString(row.mvrReviewDate, asString(row.mvrAnnualReviewDate))));
    const tsaExpiration = asString(row.tsaExpiration, '');
    return {
      personId: asString(person?.personId, employeeId.toLowerCase()),
      employeeId,
      driverName,
      licenseState: asString(row.licenseState, 'N/A'),
      cdlClass: asString(row.licenseType || row.cdlClass, 'Unknown'),
      medicalExpiration: asString(row.medicalExpiration, '2026-12-31'),
      nextMvrDue: nextMvrDue || '2026-12-31',
      tsaExpiration: tsaExpiration || '2026-12-31',
      hazmatExpiration: asString(row.hazmatExpiration, tsaExpiration || '2026-12-31'),
      clearinghouseStatus: asString(row.clearinghouseStatus, 'unknown').toLowerCase(),
      note: asString(row.notes, 'Imported driver compliance record.'),
    };
  }),
  (row) => row.medicalExpiration
);

export const chiefSuspenseItems: ChiefSuspenseRecord[] = sortByDateAsc(
  suspenseRows.map((item) => ({
    suspenseItemId: asString(item.suspenseItemId),
    sourceType: asString(item.sourceType),
    sourceId: asString(item.sourceId),
    title: asString(item.title),
    ownerEmail: asString(item.ownerEmail, 'ops@examplefleetco.com'),
    dueDate: asString(item.dueDate, '2026-12-31'),
    alertState: asString(item.alertState, 'scheduled'),
    severity: asString(item.severity, 'medium'),
    status: asString(item.status, 'open'),
  })),
  (row) => row.dueDate
);

export const chiefActivityLogs: ChiefActivityLogRecord[] = sortByDateAsc(
  activityRows.map((row) => ({
    activityId: asString(row.activityId),
    assetId: asString(row.assetId),
    timestamp: asString(row.timestamp),
    actionType: asString(row.actionType),
    employeeName: asString(row.employeeName, 'Unknown'),
    location: asString(row.location, 'Unknown'),
    notes: asString(row.notes),
  })),
  (row) => row.timestamp
).reverse();

export const chiefMaintenanceEvents: ChiefMaintenanceEventRecord[] = sortByDateAsc(
  maintenanceEventRows.map((row) => ({
    maintenanceEventId: asString(row.maintenanceEventId),
    assetId: asString(row.assetId),
    serviceType: asString(row.serviceType, 'Service'),
    status: asString(row.status, 'open'),
    completedDate: asString(row.completedDate, asString(row.scheduledDate)),
    vendor: asString(row.vendor, 'Unknown'),
    notes: asString(row.notes),
  })),
  (row) => row.completedDate
).reverse();

export const chiefResourceLinks: ChiefResourceLink[] = [
  {
    href: '/resources',
    label: 'Protected Resources',
    note: 'Use the live Drive-backed route for manuals, permits, certificates, and PDF support files.',
  },
  {
    href: '/penny',
    label: 'CFR-backed Penny',
    note: 'Use Penny for CFR questions, permit cadence checks, and operational compliance prompts.',
  },
];

export const chiefModuleSummary: ChiefModuleSummary = {
  sourceSystems: 9,
  plannedCollections: 17,
  alertTracks: chiefPermitCadence.length,
  pennyCorpus: '49 CFR',
};

export const chiefAssetCategories = uniqueValues(chiefAssets.map((asset) => asset.category));
export const chiefAssetStatuses = uniqueValues(chiefAssets.map((asset) => asset.status));
export const chiefDriverStates = uniqueValues(chiefDriverCompliance.map((row) => row.licenseState));
export const chiefPermitTemplates = uniqueValues(chiefPermitRecords.map((row) => row.templateId));
export const chiefPermitStatuses = uniqueValues(chiefPermitRecords.map((row) => row.status));
export const chiefSuspenseAlertStates = uniqueValues(chiefSuspenseItems.map((row) => row.alertState));
export const chiefSuspenseSeverities = uniqueValues(chiefSuspenseItems.map((row) => row.severity));

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function filterChiefAssets(filters: { q?: string; category?: string; status?: string; sort?: string }) {
  const results = chiefAssets.filter((asset) => {
    if (filters.category && filters.category !== 'all' && asset.category !== filters.category) return false;
    if (filters.status && filters.status !== 'all' && asset.status !== filters.status) return false;
    return matchesQuery(filters.q, [asset.assetId, asset.sourceRef, asset.name, asset.location, asset.assignedTo, asset.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.name.localeCompare(b.name));
    case 'due_desc': return [...results].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate));
    case 'category': return [...results].sort((a, b) => a.category.localeCompare(b.category));
    case 'status': return [...results].sort((a, b) => a.status.localeCompare(b.status));
    default: return results; // already sorted due_asc by default
  }
}

export function filterChiefDriverCompliance(filters: { q?: string; state?: string; sort?: string }) {
  const results = chiefDriverCompliance.filter((row) => {
    if (filters.state && filters.state !== 'all' && row.licenseState !== filters.state) return false;
    return matchesQuery(filters.q, [row.personId, row.employeeId, row.driverName, row.licenseState, row.cdlClass, row.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.driverName.localeCompare(b.driverName));
    case 'medical_desc': return [...results].sort((a, b) => b.medicalExpiration.localeCompare(a.medicalExpiration));
    case 'mvr_asc': return [...results].sort((a, b) => a.nextMvrDue.localeCompare(b.nextMvrDue));
    default: return results; // already sorted medical_asc
  }
}

export function filterChiefPermitRecords(filters: { q?: string; templateId?: string; status?: string; sort?: string }) {
  const results = chiefPermitRecords.filter((row) => {
    if (filters.templateId && filters.templateId !== 'all' && row.templateId !== filters.templateId) return false;
    if (filters.status && filters.status !== 'all' && row.status !== filters.status) return false;
    return matchesQuery(filters.q, [row.recordId, row.name, row.templateId, row.issuingAgency, row.owner, row.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.name.localeCompare(b.name));
    case 'due_desc': return [...results].sort((a, b) => b.renewalDueDate.localeCompare(a.renewalDueDate));
    default: return results; // already sorted due_asc
  }
}

export function filterChiefSuspenseItems(filters: { q?: string; severity?: string; alertState?: string; status?: string; sort?: string }) {
  const results = chiefSuspenseItems.filter((item) => {
    if (filters.severity && filters.severity !== 'all' && item.severity !== filters.severity) return false;
    if (filters.alertState && filters.alertState !== 'all' && item.alertState !== filters.alertState) return false;
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
    return matchesQuery(filters.q, [item.suspenseItemId, item.title, item.sourceType, item.sourceId, item.ownerEmail]);
  });
  switch (filters.sort) {
    case 'due_desc': return [...results].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    case 'severity': return [...results].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
    case 'owner': return [...results].sort((a, b) => a.ownerEmail.localeCompare(b.ownerEmail));
    default: return results; // already sorted due_asc
  }
}

export function findChiefAsset(assetId: string) {
  return chiefAssets.find((asset) => asset.assetId === assetId) || null;
}

export function findChiefDriverCompliance(personId: string) {
  return chiefDriverCompliance.find((row) => row.personId === personId) || null;
}

export function findChiefPermitRecord(recordId: string) {
  return chiefPermitRecords.find((row) => row.recordId === recordId) || null;
}

export function findChiefSuspenseItem(suspenseItemId: string) {
  return chiefSuspenseItems.find((row) => row.suspenseItemId === suspenseItemId) || null;
}

export function findChiefMaintenanceEvent(maintenanceEventId: string) {
  return chiefMaintenanceEvents.find((row) => row.maintenanceEventId === maintenanceEventId) || null;
}

export function findChiefActivityLog(activityId: string) {
  return chiefActivityLogs.find((row) => row.activityId === activityId) || null;
}

export function getChiefAssetActivity(assetId: string) {
  return chiefActivityLogs.filter((row) => row.assetId === assetId).slice(0, 8);
}

export function getChiefAssetMaintenance(assetId: string) {
  return chiefMaintenanceEvents.filter((row) => row.assetId === assetId).slice(0, 8);
}

export function getChiefAssetSuspense(assetId: string) {
  return chiefSuspenseItems.filter((row) => row.sourceId === assetId);
}

export function getChiefDriverSuspense(personId: string) {
  return chiefSuspenseItems.filter((row) => row.sourceId === personId);
}

export function getChiefPermitSuspense(recordId: string) {
  return chiefSuspenseItems.filter((row) => row.sourceId === recordId);
}

export function getChiefSuspenseRelatedRecord(item: ChiefSuspenseRecord) {
  if (item.sourceType === 'employee_compliance') {
    return findChiefDriverCompliance(item.sourceId);
  }
  if (item.sourceType === 'permit_license_records') {
    return findChiefPermitRecord(item.sourceId);
  }
  if (item.sourceType === 'assets') {
    return findChiefAsset(item.sourceId);
  }
  return null;
}

export function getChiefAssetStats() {
  const dueSoon = chiefAssets.filter((asset) => daysUntil(asset.nextDueDate) <= 30).length;
  const maintenanceHold = chiefAssets.filter((asset) => asset.status.includes('maintenance')).length;
  return {
    total: chiefAssets.length,
    dueSoon,
    maintenanceHold,
    tanks: chiefAssets.filter((asset) => asset.category === 'tank').length,
  };
}

export function getChiefComplianceStats() {
  const expiringWithin60Days = chiefDriverCompliance.filter((row) => daysUntil(row.medicalExpiration) <= 60).length;
  const permitDeadlines = chiefPermitRecords.filter((row) => daysUntil(row.renewalDueDate) <= 120).length;
  return {
    drivers: chiefDriverCompliance.length,
    expiringWithin60Days,
    permitDeadlines,
    requirements: chiefPermitCadence.length,
  };
}

export function getChiefSuspenseStats() {
  const overdue = chiefSuspenseItems.filter((item) => daysUntil(item.dueDate) < 0).length;
  const next7Days = chiefSuspenseItems.filter((item) => {
    const days = daysUntil(item.dueDate);
    return days >= 0 && days <= 7;
  }).length;
  return {
    totalOpen: chiefSuspenseItems.filter((item) => item.status === 'open').length,
    overdue,
    next7Days,
    highSeverity: chiefSuspenseItems.filter((item) => item.severity === 'high').length,
  };
}

export function formatDueLabel(dateText: string) {
  const days = daysUntil(dateText);
  if (days < 0) {
    return `${Math.abs(days)}d overdue`;
  }
  if (days === 0) {
    return 'due today';
  }
  return `${days}d out`;
}

export const chiefOrganizationName = asString(organizationRows[0]?.name, 'Example Fleet Co');
export const chiefOrganizationAlertEmail = asString(organizationRows[0]?.alertEmail, 'ops@examplefleetco.com');

export const chiefPermitHints = chiefPermitRecords.map((record) => ({
  name: record.name,
  cadence: record.cadence,
  routeHint: permitRouteHintMap[record.templateId] || 'Compliance tracking',
}));

export interface ChiefDocumentLink {
  label: string;
  note: string;
  href: string;
}

const DOC_LINKS_BY_CATEGORY: Record<string, ChiefDocumentLink[]> = {
  vehicle: [
    { label: 'DOT Inspection Certificate', note: 'Annual 49 CFR 396.17 inspection cert', href: '/resources' },
    { label: 'Vapor Test Certificate', note: 'Annual vapor recovery test cert', href: '/resources' },
    { label: 'Registration & Insurance', note: 'Current registration and insurance binder', href: '/resources' },
    { label: 'Driver Vehicle Inspection Reports (DVIR)', note: 'Pre/post trip inspection records', href: '/resources' },
  ],
  tank: [
    { label: 'UST Permit', note: 'Colorado CDPHE underground/aboveground storage tank permit', href: '/resources' },
    { label: 'Leak Test Certificate', note: 'Annual leak detection test results', href: '/resources' },
    { label: 'ATG Calibration Record', note: 'Annual automatic tank gauge calibration', href: '/resources' },
    { label: 'Spill & Overfill Equipment Inspection', note: 'Annual inspection documentation', href: '/resources' },
  ],
  trailer: [
    { label: 'Annual Inspection Certificate', note: '49 CFR 393 trailer inspection cert', href: '/resources' },
    { label: 'Registration', note: 'Current trailer registration', href: '/resources' },
  ],
};

const DEFAULT_ASSET_DOCS: ChiefDocumentLink[] = [
  { label: 'Maintenance Records', note: 'Service history and work orders', href: '/resources' },
  { label: 'Purchase Documentation', note: 'Purchase agreement or invoice', href: '/resources' },
];

const DRIVER_DOCS: ChiefDocumentLink[] = [
  { label: 'CDL Copy', note: 'Current commercial driver license', href: '/resources' },
  { label: 'Medical Certificate', note: 'DOT physical medical examiner certificate', href: '/resources' },
  { label: 'Motor Vehicle Record (MVR)', note: 'Annual MVR pull from state DMV', href: '/resources' },
  { label: 'Drug & Alcohol Test Records', note: 'Pre-employment and random test results', href: '/resources' },
  { label: 'Clearinghouse Query Results', note: 'FMCSA Drug & Alcohol Clearinghouse record', href: '/resources' },
  { label: 'Hazmat Training Certificate', note: '3-year hazmat training certification (if applicable)', href: '/resources' },
];

const PERMIT_DOCS: Record<string, ChiefDocumentLink[]> = {
  state_hazmat: [
    { label: 'CO Hazmat Registration Certificate', note: 'Issued by Colorado CDPHE', href: '/resources' },
    { label: 'MCS-90 Endorsement', note: 'Motor carrier insurance endorsement', href: '/resources' },
  ],
  federal_hazmat: [
    { label: 'PHMSA Hazmat Registration Certificate', note: 'PHMSA-issued federal hazmat registration', href: '/resources' },
    { label: 'Insurance Certificate', note: 'Proof of financial responsibility', href: '/resources' },
  ],
  ucr: [
    { label: 'UCR Confirmation', note: 'Annual Unified Carrier Registration receipt', href: '/resources' },
  ],
  operating_authority_mc150: [
    { label: 'MCS-150 Filing Confirmation', note: 'FMCSA biennial update acknowledgment', href: '/resources' },
    { label: 'Operating Authority Certificate', note: 'MC number certificate of authority', href: '/resources' },
  ],
  ifta: [
    { label: 'IFTA License', note: 'Current quarter IFTA license', href: '/resources' },
    { label: 'Fuel Purchase Records', note: 'Supporting fuel receipts by state', href: '/resources' },
  ],
  irp: [
    { label: 'IRP Cab Cards', note: 'Current apportioned registration cab cards for each vehicle', href: '/resources' },
  ],
};

const DEFAULT_PERMIT_DOCS: ChiefDocumentLink[] = [
  { label: 'Permit Certificate', note: 'Issued permit or license document', href: '/resources' },
  { label: 'Renewal Correspondence', note: 'Agency renewal notices and confirmations', href: '/resources' },
];

export type SourceQuality = 'complete' | 'partial' | 'minimal';

export function getChiefAssetSourceQuality(asset: ChiefAssetRecord): SourceQuality {
  const fields = [asset.name, asset.category, asset.status, asset.location, asset.assignedTo, asset.nextDueDate];
  const populated = fields.filter(Boolean).length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

export function getChiefDriverSourceQuality(driver: ChiefDriverComplianceRecord): SourceQuality {
  const fields = [driver.driverName, driver.cdlClass, driver.licenseState, driver.medicalExpiration, driver.nextMvrDue, driver.clearinghouseStatus];
  const populated = fields.filter((v) => v && v !== 'N/A' && v !== 'unknown' && v !== 'Unknown').length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

export function getChiefPermitSourceQuality(permit: ChiefPermitRecord): SourceQuality {
  const fields = [permit.name, permit.templateId, permit.status, permit.renewalDueDate, permit.issuingAgency, permit.owner];
  const populated = fields.filter((v) => v && v !== 'unknown' && v !== 'Unknown agency').length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

export interface ChiefImportCollectionStat {
  name: string;
  count: number;
}

export function getChiefImportStats(): { generatedAt: string; collections: ChiefImportCollectionStat[] } {
  return {
    generatedAt: '2026-03-18',
    collections: [
      { name: 'people', count: peopleRows.length },
      { name: 'employee_compliance', count: employeeComplianceRows.length },
      { name: 'assets', count: assetRows.length },
      { name: 'tank_assets', count: tankRows.length },
      { name: 'permit_license_records', count: permitRows.length },
      { name: 'suspense_items', count: importedSuspenseItems.length },
      { name: 'activity_logs', count: activityRows.length },
      { name: 'maintenance_events', count: maintenanceEventRows.length },
    ],
  };
}

export function getChiefAssetDocuments(category: string): ChiefDocumentLink[] {
  return [...(DOC_LINKS_BY_CATEGORY[category] || DEFAULT_ASSET_DOCS)];
}

export function getChiefDriverDocuments(): ChiefDocumentLink[] {
  return DRIVER_DOCS;
}

export function getChiefPermitDocuments(templateId: string): ChiefDocumentLink[] {
  return PERMIT_DOCS[templateId] || DEFAULT_PERMIT_DOCS;
}
