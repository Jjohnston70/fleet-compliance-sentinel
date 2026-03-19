// Client-side only — all functions return safe defaults on the server.

export type StoreKey =
  | 'chief:store:employees'
  | 'chief:store:assets'
  | 'chief:store:suspense'
  | 'chief:store:invoices';

export type SettingsKey = 'chief:settings:alerts';

export function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function safeRead<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T[]) : [];
  } catch {
    return [];
  }
}

function safeWrite<T>(key: string, records: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(records));
}

export function listRecords<T extends { id: string }>(key: StoreKey): T[] {
  return safeRead<T>(key);
}

export function addRecord<T extends { id: string }>(key: StoreKey, record: T): void {
  const existing = safeRead<T>(key);
  safeWrite<T>(key, [...existing, record]);
}

export function updateRecord<T extends { id: string }>(
  key: StoreKey,
  id: string,
  updates: Partial<T>
): void {
  const existing = safeRead<T>(key);
  safeWrite<T>(key, existing.map((r) => (r.id === id ? { ...r, ...updates } : r)));
}

export function deleteRecord<T extends { id: string }>(key: StoreKey, id: string): void {
  const existing = safeRead<T>(key);
  safeWrite<T>(key, existing.filter((r) => r.id !== id));
}

export function readSettings<T>(key: SettingsKey): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : null;
  } catch {
    return null;
  }
}

export function writeSettings<T>(key: SettingsKey, settings: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(settings));
}

// ── Typed record shapes ─────────────────────────────────────────────────────

export interface LocalEmployee {
  id: string;
  createdAt: string;
  status: 'active' | 'archived';
  employeeId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  department: string;
  supervisor: string;
  workEmail: string;
  workPhone: string;
  companyPhone: string;
  hireDate: string;
  assignedVehicle: string;
  // CDL
  cdlNumber: string;
  cdlClass: string;
  cdlExpiration: string;
  hazmatEndorsement: string;
  tankEndorsement: string;
  // Medical / compliance
  medicalCertNumber: string;
  medicalExpiration: string;
  nextMvrDue: string;
  lastDrugTest: string;
  tsaExpiration: string;
  clearinghouseStatus: string;
  note: string;
}

export interface LocalAsset {
  id: string;
  createdAt: string;
  status: 'active' | 'maintenance-hold' | 'retired' | 'inactive';
  assetId: string;
  name: string;
  category: 'vehicle' | 'tank' | 'trailer' | 'equipment';
  location: string;
  assignedTo: string;
  complianceFocus: string;
  nextServiceDue: string;
  purchaseDate: string;
  purchasePrice: string;
  vin: string;
  licensePlate: string;
  year: string;
  make: string;
  model: string;
  note: string;
}

export interface LocalSuspenseItem {
  id: string;
  createdAt: string;
  title: string;
  ownerEmail: string;
  dueDate: string;
  severity: 'high' | 'medium' | 'low';
  status: 'open' | 'closed';
  alertState: string;
  sourceType: string;
  sourceId: string;
  note: string;
}

export interface LocalInvoice {
  id: string;
  createdAt: string;
  vendor: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: string;
  partsCost: string;
  laborCost: string;
  category: 'maintenance' | 'permit' | 'fuel' | 'insurance' | 'other';
  assetId: string;
  serviceType: string;
  status: 'pending' | 'paid' | 'overdue';
  note: string;
}

export interface AlertSettings {
  orgName: string;
  fromEmail: string;
  managerEmail: string;
  thresholdDays: number;
}
