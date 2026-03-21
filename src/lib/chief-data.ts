/**
 * Async data layer for Chief module — reads from Neon Postgres.
 *
 * Replaces chief-demo-data.ts which read from the (now-empty) generated file.
 * All pages are server components so they can await these functions.
 */
import { getSQL } from '@/lib/chief-db';

// ── Re-export interfaces (same shapes as chief-demo-data.ts) ──────────────

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

export interface ChiefDocumentLink {
  label: string;
  note: string;
  href: string;
}

export interface ChiefImportCollectionStat {
  name: string;
  count: number;
}

export interface ChiefEmployeeRecord {
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  supervisor: string;
  workEmail: string;
  workPhone: string;
  hireDate: string;
  assignedVehicle: string;
  cdlClass: string;
  cdlExpiration: string;
  medicalExpiration: string;
  hazmatEndorsement: string;
  note: string;
}

export type SourceQuality = 'complete' | 'partial' | 'minimal';

// ── Helpers ───────────────────────────────────────────────────────────────

function s(val: unknown, fallback = ''): string {
  if (typeof val === 'string' && val.trim()) return val.trim();
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return fallback;
}

function slugId(val: string): string {
  return val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function today(): Date {
  return new Date();
}

function daysUntil(dateText: string): number {
  const due = new Date(`${dateText}T12:00:00`);
  const diffMs = due.getTime() - today().getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDueLabel(dateText: string): string {
  const days = daysUntil(dateText);
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'due today';
  return `${days}d out`;
}

function sortByDateAsc<T>(rows: T[], selector: (r: T) => string): T[] {
  return [...rows].sort((a, b) => selector(a).localeCompare(selector(b)));
}

function uniqueValues(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

function normalizeQuery(query: string | undefined): string {
  return (query || '').trim().toLowerCase();
}

function matchesQuery(query: string | undefined, values: Array<string | undefined>): boolean {
  const normalized = normalizeQuery(query);
  if (!normalized) return true;
  return values.some((v) => (v || '').toLowerCase().includes(normalized));
}

function complianceFocusForCategory(category: string): string {
  if (category === 'vehicle') return 'Registration, DOT inspection, insurance, service interval';
  if (category === 'tank') return 'Leak test, inspection, tank permit, calibration';
  if (category === 'trailer') return 'Inspection, lights, tires, annual review';
  return 'Service interval, maintenance history, assignment tracking';
}

function normalizeAssetCategory(category: string | null | undefined): string {
  const n = (category || '').trim().toLowerCase();
  if (!n) return 'asset';
  if (n === 'vehicle' || n.includes('truck') || n.includes('transport')) return 'vehicle';
  if (n === 'tank' || n.includes('tank')) return 'tank';
  if (n === 'trailer') return 'trailer';
  return n;
}

function addOneYear(dateText: string | null | undefined): string {
  if (!dateText) return '';
  const parsed = new Date(`${dateText}T12:00:00`);
  if (isNaN(parsed.getTime())) return '';
  parsed.setFullYear(parsed.getFullYear() + 1);
  return parsed.toISOString().slice(0, 10);
}

// ── Raw DB access ─────────────────────────────────────────────────────────

type RawRow = Record<string, unknown>;

async function loadCollection(collection: string): Promise<RawRow[]> {
  try {
    const sql = getSQL();
    const rows = await sql`
      SELECT data FROM chief_records
      WHERE collection = ${collection}
      ORDER BY imported_at ASC
    `;
    return rows.map((r) => r.data as RawRow);
  } catch {
    return [];
  }
}

// ── Transformers ──────────────────────────────────────────────────────────

function transformAssets(raw: RawRow[]): ChiefAssetRecord[] {
  return raw.map((r) => {
    const category = normalizeAssetCategory(s(r['Asset Type']));
    return {
      assetId: s(r['Asset ID']),
      sourceRef: s(r['Asset ID']),
      name: s(r['Asset Name'], s(r['Asset ID'])),
      category,
      status: s(r['Status'], 'active').toLowerCase().replace(/\s+/g, '-'),
      location: s(r['Current Location'], 'Unassigned'),
      assignedTo: s(r['Assigned To'], 'Unassigned'),
      complianceFocus: complianceFocusForCategory(category),
      nextDueLabel: category === 'tank' ? 'Inspection' : 'Service',
      nextDueDate: s(r['Next Service Due'], '2026-12-31'),
      purchaseDate: s(r['Acquisition Date']),
      purchasePrice: s(r['Acquisition Cost']),
      note: s(r['Notes'], 'Imported record.'),
    };
  });
}

function transformTanks(raw: RawRow[]): ChiefAssetRecord[] {
  return raw.map((r) => ({
    assetId: s(r['Tank ID']),
    sourceRef: s(r['Tank ID']),
    name: `Tank ${s(r['Tank ID'])}`,
    category: 'tank',
    status: s(r['Tank Status'], 'active').toLowerCase(),
    location: s(r['Tank Location'], 'Unassigned'),
    assignedTo: 'Operations',
    complianceFocus: 'Leak test, inspection, tank permit, calibration',
    nextDueLabel: 'Leak test',
    nextDueDate: s(r['Next Leak Test Due'], s(r['Next Inspection Due'], '2026-12-31')),
    purchaseDate: s(r['Installation Date']),
    purchasePrice: '',
    note: s(r['Notes'], 'Imported tank record.'),
  }));
}

function transformVehicles(raw: RawRow[]): ChiefAssetRecord[] {
  return raw.map((r) => ({
    assetId: s(r['Unit Number']),
    sourceRef: s(r['Unit Number']),
    name: `${s(r['Year'])} ${s(r['Make'])} ${s(r['Model'])}`.trim() || s(r['Unit Number']),
    category: 'vehicle',
    status: s(r['Vehicle Status'], 'active').toLowerCase().replace(/\s+/g, '-'),
    location: s(r['Location'], 'Unassigned'),
    assignedTo: s(r['Assigned Driver'], 'Unassigned'),
    complianceFocus: 'Registration, DOT inspection, insurance, service interval',
    nextDueLabel: 'Service',
    nextDueDate: s(r['Next Service Due'], s(r['Next DOT Inspection Due'], '2026-12-31')),
    purchaseDate: s(r['Purchase Date']),
    purchasePrice: s(r['Purchase Price']),
    note: s(r['Notes'], 'Imported vehicle record.'),
  }));
}

function transformDrivers(raw: RawRow[]): ChiefDriverComplianceRecord[] {
  return raw.map((r) => ({
    personId: slugId(s(r['Driver ID'], 'unknown')),
    employeeId: s(r['Driver ID']),
    driverName: s(r['Driver Name']),
    licenseState: s(r['License State'], 'N/A'),
    cdlClass: s(r['License Type'], 'Unknown'),
    medicalExpiration: s(r['Medical Card Expiry'], '2026-12-31'),
    nextMvrDue: s(r['MVR Review Date']) ? addOneYear(s(r['MVR Review Date'])) : '2026-12-31',
    tsaExpiration: '2026-12-31',
    hazmatExpiration: '2026-12-31',
    clearinghouseStatus: s(r['Clearinghouse Status'], 'unknown').toLowerCase(),
    note: s(r['Notes'], 'Imported driver record.'),
  }));
}

function transformEmployeesToDrivers(raw: RawRow[]): ChiefDriverComplianceRecord[] {
  return raw.map((r) => ({
    personId: slugId(s(r['Employee ID'], 'unknown')),
    employeeId: s(r['Employee ID']),
    driverName: `${s(r['Last Name'])}, ${s(r['First Name'])}`,
    licenseState: 'CO',
    cdlClass: s(r['CDL Class'], 'Unknown'),
    medicalExpiration: s(r['Medical Expiration'], '2026-12-31'),
    nextMvrDue: s(r['Next MVR Due'], addOneYear(s(r['Last MVR Check'])) || '2026-12-31'),
    tsaExpiration: s(r['TSA Expiration'], '2026-12-31'),
    hazmatExpiration: s(r['Hazmat Expiration'], '2026-12-31'),
    clearinghouseStatus: 'unknown',
    note: s(r['Notes'], 'Imported employee record.'),
  }));
}

const permitTypeToTemplateId: Record<string, string> = {
  'state hazmat': 'state_hazmat',
  'federal hazmat': 'federal_hazmat',
  'ucr': 'ucr',
  'operating authority': 'operating_authority_mc150',
  'mc-150': 'operating_authority_mc150',
  'mc150': 'operating_authority_mc150',
  'ifta': 'ifta',
  'irp': 'irp',
};

const permitCadenceMap: Record<string, string> = {
  state_hazmat: 'Annual',
  federal_hazmat: 'Every 4 years',
  ucr: 'Annual',
  operating_authority_mc150: 'Every 2 years, NLT October',
  ifta: 'Quarterly',
  irp: 'Annual',
};

function guessTemplateId(permitType: string): string {
  const lower = permitType.toLowerCase();
  for (const [key, val] of Object.entries(permitTypeToTemplateId)) {
    if (lower.includes(key)) return val;
  }
  return slugId(permitType) || 'permit';
}

function transformPermits(raw: RawRow[]): ChiefPermitRecord[] {
  return raw.map((r, i) => {
    const templateId = guessTemplateId(s(r['Permit Type']));
    return {
      recordId: s(r['Permit Number'], `permit-${i + 1}`),
      name: s(r['Permit Type']),
      templateId,
      cadence: permitCadenceMap[templateId] || 'Tracked',
      status: s(r['Status'], 'active').toLowerCase(),
      renewalDueDate: s(r['Renewal Due Date'], s(r['Expiration Date'], '2026-12-31')),
      issuingAgency: s(r['Issuing Agency'], 'Unknown agency'),
      owner: s(r['Responsible Employee'], 'compliance'),
      note: s(r['Compliance Notes'], 'Imported permit record.'),
    };
  });
}

function transformActivityLogs(raw: RawRow[]): ChiefActivityLogRecord[] {
  return raw.map((r, i) => ({
    activityId: `act-${i + 1}`,
    assetId: s(r['Asset ID']),
    timestamp: s(r['Timestamp']),
    actionType: s(r['Action Type']),
    employeeName: s(r['Employee'], 'Unknown'),
    location: s(r['Location'], 'Unknown'),
    notes: s(r['Condition Notes'], ''),
  }));
}

function transformMaintenanceEvents(raw: RawRow[]): ChiefMaintenanceEventRecord[] {
  return raw.map((r) => ({
    maintenanceEventId: s(r['Maintenance ID']),
    assetId: s(r['Asset ID']),
    serviceType: s(r['Service Type'], 'Service'),
    status: s(r['Status'], 'open').toLowerCase(),
    completedDate: s(r['Completed Date'], s(r['Scheduled Date'])),
    vendor: s(r['Vendor'], 'Unknown'),
    notes: s(r['Notes'], ''),
  }));
}

function transformMaintenanceSchedule(raw: RawRow[]): ChiefMaintenanceEventRecord[] {
  return raw.map((r, i) => ({
    maintenanceEventId: s(r['Work Order Number'], `sched-${i + 1}`),
    assetId: s(r['Unit/Equipment']),
    serviceType: s(r['Maintenance Type'], 'Scheduled'),
    status: s(r['Status'], 'scheduled').toLowerCase(),
    completedDate: s(r['Last Performed'], s(r['Next Due Date'])),
    vendor: s(r['Service Provider'], 'Unknown'),
    notes: s(r['Notes'], ''),
  }));
}

function transformEmployees(raw: RawRow[]): ChiefEmployeeRecord[] {
  return raw.map((r) => ({
    employeeId: s(r['Employee ID']),
    firstName: s(r['First Name']),
    lastName: s(r['Last Name']),
    jobTitle: s(r['Job Title']),
    department: s(r['Department']),
    supervisor: s(r['Supervisor']),
    workEmail: s(r['Work Email']),
    workPhone: s(r['Work Phone'], s(r['COMPANY PHONE'])),
    hireDate: s(r['Hire Date']),
    assignedVehicle: s(r['Assigned Vehicle']),
    cdlClass: s(r['CDL Class']),
    cdlExpiration: s(r['CDL Expiration']),
    medicalExpiration: s(r['Medical Expiration']),
    hazmatEndorsement: s(r['Hazmat Endorsement']),
    note: s(r['Notes']),
  }));
}

// ── Suspense generation from compliance deadlines ─────────────────────────

function generateSuspenseFromDrivers(drivers: ChiefDriverComplianceRecord[]): ChiefSuspenseRecord[] {
  const items: ChiefSuspenseRecord[] = [];
  for (const d of drivers) {
    if (d.medicalExpiration && daysUntil(d.medicalExpiration) <= 90) {
      items.push({
        suspenseItemId: `susp-med-${d.personId}`,
        sourceType: 'employee_compliance',
        sourceId: d.personId,
        title: `Medical card expiring for ${d.driverName}`,
        ownerEmail: 'compliance@company.com',
        dueDate: d.medicalExpiration,
        alertState: daysUntil(d.medicalExpiration) < 0 ? 'overdue' : 'scheduled',
        severity: daysUntil(d.medicalExpiration) <= 30 ? 'high' : 'medium',
        status: 'open',
      });
    }
    if (d.nextMvrDue && daysUntil(d.nextMvrDue) <= 60) {
      items.push({
        suspenseItemId: `susp-mvr-${d.personId}`,
        sourceType: 'employee_compliance',
        sourceId: d.personId,
        title: `MVR review due for ${d.driverName}`,
        ownerEmail: 'compliance@company.com',
        dueDate: d.nextMvrDue,
        alertState: daysUntil(d.nextMvrDue) < 0 ? 'overdue' : 'scheduled',
        severity: 'medium',
        status: 'open',
      });
    }
  }
  return items;
}

function generateSuspenseFromPermits(permits: ChiefPermitRecord[]): ChiefSuspenseRecord[] {
  const items: ChiefSuspenseRecord[] = [];
  for (const p of permits) {
    if (p.renewalDueDate && daysUntil(p.renewalDueDate) <= 120) {
      items.push({
        suspenseItemId: `susp-permit-${p.recordId}`,
        sourceType: 'permit_license_records',
        sourceId: p.recordId,
        title: `${p.name} renewal due`,
        ownerEmail: p.owner || 'compliance@company.com',
        dueDate: p.renewalDueDate,
        alertState: daysUntil(p.renewalDueDate) < 0 ? 'overdue' : 'scheduled',
        severity: daysUntil(p.renewalDueDate) <= 30 ? 'high' : 'medium',
        status: 'open',
      });
    }
  }
  return items;
}

function generateSuspenseFromAssets(assets: ChiefAssetRecord[]): ChiefSuspenseRecord[] {
  const items: ChiefSuspenseRecord[] = [];
  for (const a of assets) {
    if (a.nextDueDate && daysUntil(a.nextDueDate) <= 30) {
      items.push({
        suspenseItemId: `susp-asset-${a.assetId}`,
        sourceType: 'assets',
        sourceId: a.assetId,
        title: `${a.nextDueLabel} due for ${a.name}`,
        ownerEmail: 'ops@company.com',
        dueDate: a.nextDueDate,
        alertState: daysUntil(a.nextDueDate) < 0 ? 'overdue' : 'scheduled',
        severity: daysUntil(a.nextDueDate) < 0 ? 'high' : 'medium',
        status: 'open',
      });
    }
  }
  return items;
}

// ── Main data loader ──────────────────────────────────────────────────────

export interface ChiefData {
  assets: ChiefAssetRecord[];
  employees: ChiefEmployeeRecord[];
  drivers: ChiefDriverComplianceRecord[];
  permits: ChiefPermitRecord[];
  suspense: ChiefSuspenseRecord[];
  activityLogs: ChiefActivityLogRecord[];
  maintenanceEvents: ChiefMaintenanceEventRecord[];
  assetCategories: string[];
  assetStatuses: string[];
  driverStates: string[];
  permitTemplates: string[];
  permitStatuses: string[];
  suspenseAlertStates: string[];
  suspenseSeverities: string[];
}

export async function loadChiefData(): Promise<ChiefData> {
  const [
    rawAssets, rawTanks, rawVehicles, rawDrivers, rawEmployees,
    rawPermits, rawActivity, rawMaintenance, rawSchedule,
  ] = await Promise.all([
    loadCollection('assets_master'),
    loadCollection('storage_tanks'),
    loadCollection('vehicles_equipment'),
    loadCollection('drivers'),
    loadCollection('employees'),
    loadCollection('permits_licenses'),
    loadCollection('activity_log'),
    loadCollection('maintenance_tracker'),
    loadCollection('maintenance_schedule'),
  ]);

  // Assets = assets_master + tanks + vehicles (deduped)
  const assetRecords = transformAssets(rawAssets);
  const tankRecords = transformTanks(rawTanks);
  const vehicleRecords = transformVehicles(rawVehicles);
  const seenAssetIds = new Set(assetRecords.map((a) => a.assetId));
  const allAssets = sortByDateAsc(
    [
      ...assetRecords,
      ...tankRecords.filter((t) => !seenAssetIds.has(t.assetId)),
      ...vehicleRecords.filter((v) => !seenAssetIds.has(v.assetId)),
    ],
    (r) => r.nextDueDate
  );

  // Drivers = drivers collection + employees with CDL info (deduped)
  const driverRecords = transformDrivers(rawDrivers);
  const employeeDrivers = transformEmployeesToDrivers(
    rawEmployees.filter((e) => s(e['CDL Number']) || s(e['CDL Class']))
  );
  const seenDriverIds = new Set(driverRecords.map((d) => d.personId));
  const allDrivers = sortByDateAsc(
    [
      ...driverRecords,
      ...employeeDrivers.filter((e) => !seenDriverIds.has(e.personId)),
    ],
    (r) => r.medicalExpiration
  );

  const allPermits = sortByDateAsc(transformPermits(rawPermits), (r) => r.renewalDueDate);

  // Suspense = generated from compliance deadlines
  const allSuspense = sortByDateAsc(
    [
      ...generateSuspenseFromDrivers(allDrivers),
      ...generateSuspenseFromPermits(allPermits),
      ...generateSuspenseFromAssets(allAssets),
    ],
    (r) => r.dueDate
  );

  const allEmployees = transformEmployees(rawEmployees);

  const allActivity = transformActivityLogs(rawActivity).reverse();
  const allMaintenance = [
    ...transformMaintenanceEvents(rawMaintenance),
    ...transformMaintenanceSchedule(rawSchedule),
  ].reverse();

  return {
    assets: allAssets,
    employees: allEmployees,
    drivers: allDrivers,
    permits: allPermits,
    suspense: allSuspense,
    activityLogs: allActivity,
    maintenanceEvents: allMaintenance,
    assetCategories: uniqueValues(allAssets.map((a) => a.category)),
    assetStatuses: uniqueValues(allAssets.map((a) => a.status)),
    driverStates: uniqueValues(allDrivers.map((d) => d.licenseState)),
    permitTemplates: uniqueValues(allPermits.map((p) => p.templateId)),
    permitStatuses: uniqueValues(allPermits.map((p) => p.status)),
    suspenseAlertStates: uniqueValues(allSuspense.map((s) => s.alertState)),
    suspenseSeverities: uniqueValues(allSuspense.map((s) => s.severity)),
  };
}

// ── Filter functions ──────────────────────────────────────────────────────

export function filterAssets(
  assets: ChiefAssetRecord[],
  filters: { q?: string; category?: string; status?: string; sort?: string }
): ChiefAssetRecord[] {
  const results = assets.filter((asset) => {
    if (filters.category && filters.category !== 'all' && asset.category !== filters.category) return false;
    if (filters.status && filters.status !== 'all' && asset.status !== filters.status) return false;
    return matchesQuery(filters.q, [asset.assetId, asset.sourceRef, asset.name, asset.location, asset.assignedTo, asset.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.name.localeCompare(b.name));
    case 'due_desc': return [...results].sort((a, b) => b.nextDueDate.localeCompare(a.nextDueDate));
    case 'category': return [...results].sort((a, b) => a.category.localeCompare(b.category));
    case 'status': return [...results].sort((a, b) => a.status.localeCompare(b.status));
    default: return results;
  }
}

export function filterDriverCompliance(
  drivers: ChiefDriverComplianceRecord[],
  filters: { q?: string; state?: string; sort?: string }
): ChiefDriverComplianceRecord[] {
  const results = drivers.filter((row) => {
    if (filters.state && filters.state !== 'all' && row.licenseState !== filters.state) return false;
    return matchesQuery(filters.q, [row.personId, row.employeeId, row.driverName, row.licenseState, row.cdlClass, row.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.driverName.localeCompare(b.driverName));
    case 'medical_desc': return [...results].sort((a, b) => b.medicalExpiration.localeCompare(a.medicalExpiration));
    case 'mvr_asc': return [...results].sort((a, b) => a.nextMvrDue.localeCompare(b.nextMvrDue));
    default: return results;
  }
}

export function filterPermitRecords(
  permits: ChiefPermitRecord[],
  filters: { q?: string; templateId?: string; status?: string; sort?: string }
): ChiefPermitRecord[] {
  const results = permits.filter((row) => {
    if (filters.templateId && filters.templateId !== 'all' && row.templateId !== filters.templateId) return false;
    if (filters.status && filters.status !== 'all' && row.status !== filters.status) return false;
    return matchesQuery(filters.q, [row.recordId, row.name, row.templateId, row.issuingAgency, row.owner, row.note]);
  });
  switch (filters.sort) {
    case 'name_asc': return [...results].sort((a, b) => a.name.localeCompare(b.name));
    case 'due_desc': return [...results].sort((a, b) => b.renewalDueDate.localeCompare(a.renewalDueDate));
    default: return results;
  }
}

const SEVERITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export function filterSuspenseItems(
  items: ChiefSuspenseRecord[],
  filters: { q?: string; severity?: string; alertState?: string; status?: string; sort?: string }
): ChiefSuspenseRecord[] {
  const results = items.filter((item) => {
    if (filters.severity && filters.severity !== 'all' && item.severity !== filters.severity) return false;
    if (filters.alertState && filters.alertState !== 'all' && item.alertState !== filters.alertState) return false;
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
    return matchesQuery(filters.q, [item.suspenseItemId, item.title, item.sourceType, item.sourceId, item.ownerEmail]);
  });
  switch (filters.sort) {
    case 'due_desc': return [...results].sort((a, b) => b.dueDate.localeCompare(a.dueDate));
    case 'severity': return [...results].sort((a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9));
    case 'owner': return [...results].sort((a, b) => a.ownerEmail.localeCompare(b.ownerEmail));
    default: return results;
  }
}

// ── Find functions ────────────────────────────────────────────────────────

export function findAsset(assets: ChiefAssetRecord[], assetId: string) {
  return assets.find((a) => a.assetId === assetId) || null;
}

export function findDriver(drivers: ChiefDriverComplianceRecord[], personId: string) {
  return drivers.find((d) => d.personId === personId) || null;
}

export function findPermit(permits: ChiefPermitRecord[], recordId: string) {
  return permits.find((p) => p.recordId === recordId) || null;
}

export function findSuspenseItem(items: ChiefSuspenseRecord[], suspenseItemId: string) {
  return items.find((i) => i.suspenseItemId === suspenseItemId) || null;
}

export function findMaintenanceEvent(events: ChiefMaintenanceEventRecord[], id: string) {
  return events.find((e) => e.maintenanceEventId === id) || null;
}

export function findActivityLog(logs: ChiefActivityLogRecord[], id: string) {
  return logs.find((l) => l.activityId === id) || null;
}

// ── Relation functions ────────────────────────────────────────────────────

export function getAssetActivity(logs: ChiefActivityLogRecord[], assetId: string) {
  return logs.filter((l) => l.assetId === assetId).slice(0, 8);
}

export function getAssetMaintenance(events: ChiefMaintenanceEventRecord[], assetId: string) {
  return events.filter((e) => e.assetId === assetId).slice(0, 8);
}

export function getAssetSuspense(items: ChiefSuspenseRecord[], assetId: string) {
  return items.filter((i) => i.sourceId === assetId);
}

export function getDriverSuspense(items: ChiefSuspenseRecord[], personId: string) {
  return items.filter((i) => i.sourceId === personId);
}

export function getPermitSuspense(items: ChiefSuspenseRecord[], recordId: string) {
  return items.filter((i) => i.sourceId === recordId);
}

export function getSuspenseRelatedRecord(
  item: ChiefSuspenseRecord,
  data: ChiefData
) {
  if (item.sourceType === 'employee_compliance') return findDriver(data.drivers, item.sourceId);
  if (item.sourceType === 'permit_license_records') return findPermit(data.permits, item.sourceId);
  if (item.sourceType === 'assets') return findAsset(data.assets, item.sourceId);
  return null;
}

// ── Stats functions ───────────────────────────────────────────────────────

export function getAssetStats(assets: ChiefAssetRecord[]) {
  return {
    total: assets.length,
    dueSoon: assets.filter((a) => daysUntil(a.nextDueDate) <= 30).length,
    maintenanceHold: assets.filter((a) => a.status.includes('maintenance')).length,
    tanks: assets.filter((a) => a.category === 'tank').length,
  };
}

export function getComplianceStats(drivers: ChiefDriverComplianceRecord[], permits: ChiefPermitRecord[]) {
  return {
    drivers: drivers.length,
    expiringWithin60Days: drivers.filter((d) => daysUntil(d.medicalExpiration) <= 60).length,
    permitDeadlines: permits.filter((p) => daysUntil(p.renewalDueDate) <= 120).length,
    requirements: chiefPermitCadence.length,
  };
}

export function getSuspenseStats(items: ChiefSuspenseRecord[]) {
  return {
    totalOpen: items.filter((i) => i.status === 'open').length,
    overdue: items.filter((i) => daysUntil(i.dueDate) < 0).length,
    next7Days: items.filter((i) => { const d = daysUntil(i.dueDate); return d >= 0 && d <= 7; }).length,
    highSeverity: items.filter((i) => i.severity === 'high').length,
  };
}

export async function getImportStats(): Promise<{ generatedAt: string; collections: ChiefImportCollectionStat[] }> {
  try {
    const sql = getSQL();
    const rows = await sql`
      SELECT collection, count(*)::int as count
      FROM chief_records GROUP BY collection ORDER BY collection
    `;
    return {
      generatedAt: new Date().toISOString().slice(0, 10),
      collections: rows.map((r) => ({ name: r.collection as string, count: r.count as number })),
    };
  } catch {
    return { generatedAt: '', collections: [] };
  }
}

// ── Source quality functions ───────────────────────────────────────────────

export function getAssetSourceQuality(asset: ChiefAssetRecord): SourceQuality {
  const fields = [asset.name, asset.category, asset.status, asset.location, asset.assignedTo, asset.nextDueDate];
  const populated = fields.filter(Boolean).length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

export function getDriverSourceQuality(driver: ChiefDriverComplianceRecord): SourceQuality {
  const fields = [driver.driverName, driver.cdlClass, driver.licenseState, driver.medicalExpiration, driver.nextMvrDue, driver.clearinghouseStatus];
  const populated = fields.filter((v) => v && v !== 'N/A' && v !== 'unknown' && v !== 'Unknown').length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

export function getPermitSourceQuality(permit: ChiefPermitRecord): SourceQuality {
  const fields = [permit.name, permit.templateId, permit.status, permit.renewalDueDate, permit.issuingAgency, permit.owner];
  const populated = fields.filter((v) => v && v !== 'unknown' && v !== 'Unknown agency').length;
  if (populated >= 5) return 'complete';
  if (populated >= 3) return 'partial';
  return 'minimal';
}

// ── Static constants (no DB needed) ───────────────────────────────────────

export const chiefPermitCadence = [
  { name: 'State Hazmat', cadence: 'Annual', routeHint: 'Colorado hazmat registration' },
  { name: 'Federal Hazmat', cadence: 'Every 4 years', routeHint: 'Hazmat registration cycle' },
  { name: 'UCR', cadence: 'Annual', routeHint: 'Unified Carrier Registration' },
  { name: 'Operating Authority MC150', cadence: 'Every 2 years, NLT October', routeHint: 'Biennial update' },
  { name: 'IFTA', cadence: 'Quarterly', routeHint: 'Fuel tax filing' },
  { name: 'IRP', cadence: 'Annual', routeHint: 'Apportioned registration' },
];

export const chiefResourceLinks: ChiefResourceLink[] = [
  { href: '/chief/import', label: 'Document Intake', note: 'Use Import Review for manuals, permits, certificates, and support file workflows.' },
  { href: '/penny', label: 'CFR-backed Penny', note: 'Use Penny for CFR questions, permit cadence checks, and operational compliance prompts.' },
];

export function getChiefModuleSummary(data: ChiefData): ChiefModuleSummary {
  return {
    sourceSystems: 9,
    plannedCollections: 17,
    alertTracks: chiefPermitCadence.length,
    pennyCorpus: '49 CFR',
  };
}

// ── Document link functions (static, no DB) ───────────────────────────────

const DOC_LINKS_BY_CATEGORY: Record<string, ChiefDocumentLink[]> = {
  vehicle: [
    { label: 'DOT Inspection Certificate', note: 'Annual 49 CFR 396.17 inspection cert', href: '/chief/import' },
    { label: 'Vapor Test Certificate', note: 'Annual vapor recovery test cert', href: '/chief/import' },
    { label: 'Registration & Insurance', note: 'Current registration and insurance binder', href: '/chief/import' },
    { label: 'Driver Vehicle Inspection Reports (DVIR)', note: 'Pre/post trip inspection records', href: '/chief/import' },
  ],
  tank: [
    { label: 'UST Permit', note: 'Colorado CDPHE underground/aboveground storage tank permit', href: '/chief/import' },
    { label: 'Leak Test Certificate', note: 'Annual leak detection test results', href: '/chief/import' },
    { label: 'ATG Calibration Record', note: 'Annual automatic tank gauge calibration', href: '/chief/import' },
    { label: 'Spill & Overfill Equipment Inspection', note: 'Annual inspection documentation', href: '/chief/import' },
  ],
  trailer: [
    { label: 'Annual Inspection Certificate', note: '49 CFR 393 trailer inspection cert', href: '/chief/import' },
    { label: 'Registration', note: 'Current trailer registration', href: '/chief/import' },
  ],
};

const DEFAULT_ASSET_DOCS: ChiefDocumentLink[] = [
  { label: 'Maintenance Records', note: 'Service history and work orders', href: '/chief/import' },
  { label: 'Purchase Documentation', note: 'Purchase agreement or invoice', href: '/chief/import' },
];

const DRIVER_DOCS: ChiefDocumentLink[] = [
  { label: 'CDL Copy', note: 'Current commercial driver license', href: '/chief/import' },
  { label: 'Medical Certificate', note: 'DOT physical medical examiner certificate', href: '/chief/import' },
  { label: 'Motor Vehicle Record (MVR)', note: 'Annual MVR pull from state DMV', href: '/chief/import' },
  { label: 'Drug & Alcohol Test Records', note: 'Pre-employment and random test results', href: '/chief/import' },
  { label: 'Clearinghouse Query Results', note: 'FMCSA Drug & Alcohol Clearinghouse record', href: '/chief/import' },
  { label: 'Hazmat Training Certificate', note: '3-year hazmat training certification (if applicable)', href: '/chief/import' },
];

const PERMIT_DOCS: Record<string, ChiefDocumentLink[]> = {
  state_hazmat: [
    { label: 'CO Hazmat Registration Certificate', note: 'Issued by Colorado CDPHE', href: '/chief/import' },
    { label: 'MCS-90 Endorsement', note: 'Motor carrier insurance endorsement', href: '/chief/import' },
  ],
  federal_hazmat: [
    { label: 'PHMSA Hazmat Registration Certificate', note: 'PHMSA-issued federal hazmat registration', href: '/chief/import' },
    { label: 'Insurance Certificate', note: 'Proof of financial responsibility', href: '/chief/import' },
  ],
  ucr: [{ label: 'UCR Confirmation', note: 'Annual Unified Carrier Registration receipt', href: '/chief/import' }],
  operating_authority_mc150: [
    { label: 'MCS-150 Filing Confirmation', note: 'FMCSA biennial update acknowledgment', href: '/chief/import' },
    { label: 'Operating Authority Certificate', note: 'MC number certificate of authority', href: '/chief/import' },
  ],
  ifta: [
    { label: 'IFTA License', note: 'Current quarter IFTA license', href: '/chief/import' },
    { label: 'Fuel Purchase Records', note: 'Supporting fuel receipts by state', href: '/chief/import' },
  ],
  irp: [{ label: 'IRP Cab Cards', note: 'Current apportioned registration cab cards for each vehicle', href: '/chief/import' }],
};

const DEFAULT_PERMIT_DOCS: ChiefDocumentLink[] = [
  { label: 'Permit Certificate', note: 'Issued permit or license document', href: '/chief/import' },
  { label: 'Renewal Correspondence', note: 'Agency renewal notices and confirmations', href: '/chief/import' },
];

export function getAssetDocuments(category: string): ChiefDocumentLink[] {
  return [...(DOC_LINKS_BY_CATEGORY[category] || DEFAULT_ASSET_DOCS)];
}

export function getDriverDocuments(): ChiefDocumentLink[] {
  return DRIVER_DOCS;
}

export function getPermitDocuments(templateId: string): ChiefDocumentLink[] {
  return PERMIT_DOCS[templateId] || DEFAULT_PERMIT_DOCS;
}
