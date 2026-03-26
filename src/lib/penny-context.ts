import { loadFleetComplianceData, loadFleetComplianceInvoices } from '@/lib/fleet-compliance-data';

const MAX_CONTEXT_CHARS = 12000;

type ContextEntry = {
  line: string;
  sortKey: string;
};

type ContextSections = {
  drivers: ContextEntry[];
  assets: ContextEntry[];
  permits: ContextEntry[];
  suspense: ContextEntry[];
  maintenance: ContextEntry[];
  invoices: ContextEntry[];
};

function stringValue(value: unknown, fallback = 'Unknown'): string {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function normalizeDate(value: unknown): string {
  if (typeof value !== 'string' || value.trim().length === 0) return 'Unknown';
  const raw = value.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return 'Unknown';
  return parsed.toISOString().slice(0, 10);
}

function normalizeDriverId(value: unknown): string {
  const cleaned = stringValue(value, 'unknown-driver').replace(/[^a-z0-9_-]/gi, '');
  return cleaned.toUpperCase() || 'UNKNOWN-DRIVER';
}

function normalizeOwnerId(value: unknown): string {
  const raw = stringValue(value, 'compliance');
  const beforeAt = raw.split('@', 1)[0] || raw;
  const cleaned = beforeAt.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return cleaned || 'compliance';
}

function titleCase(value: string): string {
  return value
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(' ');
}

function toSortableTimestamp(dateText: string): number {
  if (!dateText || dateText === 'Unknown') return 0;
  const parsed = Date.parse(`${dateText.slice(0, 10)}T00:00:00Z`);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function sortEntriesByDateAscending(entries: ContextEntry[]): ContextEntry[] {
  return [...entries].sort((a, b) => toSortableTimestamp(a.sortKey) - toSortableTimestamp(b.sortKey));
}

function sortEntriesByDateDescending(entries: ContextEntry[]): ContextEntry[] {
  return [...entries].sort((a, b) => toSortableTimestamp(b.sortKey) - toSortableTimestamp(a.sortKey));
}

function oldestEntryIndex(entries: ContextEntry[]): number {
  if (entries.length === 0) return -1;
  let oldestIndex = 0;
  let oldestSortKey = toSortableTimestamp(entries[0].sortKey);
  for (let index = 1; index < entries.length; index += 1) {
    const timestamp = toSortableTimestamp(entries[index].sortKey);
    if (timestamp < oldestSortKey) {
      oldestSortKey = timestamp;
      oldestIndex = index;
    }
  }
  return oldestIndex;
}

function formatCurrency(value: string): string {
  const cleaned = value.replace(/[^0-9.-]/g, '').trim();
  if (!cleaned) return 'Unknown';
  const parsed = Number(cleaned);
  if (Number.isNaN(parsed)) return 'Unknown';
  return `$${parsed.toFixed(2)}`;
}

function renderContext(sections: ContextSections): string {
  const lines: string[] = [];
  lines.push('--- OPERATOR FLEET DATA ---');
  lines.push(`DRIVERS (${sections.drivers.length} total):`);
  lines.push(...(sections.drivers.length ? sections.drivers.map((entry) => entry.line) : ['- None']));
  lines.push('');
  lines.push(`ASSETS (${sections.assets.length} total):`);
  lines.push(...(sections.assets.length ? sections.assets.map((entry) => entry.line) : ['- None']));
  lines.push('');
  lines.push(`PERMITS (${sections.permits.length} total):`);
  lines.push(...(sections.permits.length ? sections.permits.map((entry) => entry.line) : ['- None']));
  lines.push('');
  lines.push(`OPEN SUSPENSE ITEMS (${sections.suspense.length} items):`);
  lines.push(...(sections.suspense.length ? sections.suspense.map((entry) => entry.line) : ['- None']));
  lines.push('');
  lines.push(`RECENT MAINTENANCE (${sections.maintenance.length} events):`);
  lines.push(...(sections.maintenance.length ? sections.maintenance.map((entry) => entry.line) : ['- None']));
  lines.push('');
  lines.push(`RECENT INVOICES (${sections.invoices.length} records):`);
  lines.push(...(sections.invoices.length ? sections.invoices.map((entry) => entry.line) : ['- None']));
  lines.push('--- END OPERATOR DATA ---');
  return lines.join('\n');
}

function trimToMaxContextChars(sections: ContextSections): ContextSections {
  const mutable: ContextSections = {
    drivers: [...sections.drivers],
    assets: [...sections.assets],
    permits: [...sections.permits],
    suspense: [...sections.suspense],
    maintenance: [...sections.maintenance],
    invoices: [...sections.invoices],
  };

  let rendered = renderContext(mutable);
  while (rendered.length > MAX_CONTEXT_CHARS) {
    const sectionsWithOldest = [
      { key: 'drivers' as const, index: oldestEntryIndex(mutable.drivers) },
      { key: 'assets' as const, index: oldestEntryIndex(mutable.assets) },
      { key: 'permits' as const, index: oldestEntryIndex(mutable.permits) },
      { key: 'suspense' as const, index: oldestEntryIndex(mutable.suspense) },
      { key: 'maintenance' as const, index: oldestEntryIndex(mutable.maintenance) },
      { key: 'invoices' as const, index: oldestEntryIndex(mutable.invoices) },
    ]
      .filter((candidate) => candidate.index >= 0)
      .map((candidate) => ({
        key: candidate.key,
        index: candidate.index,
        item: mutable[candidate.key][candidate.index],
      })) as Array<{
      key: keyof ContextSections;
      index: number;
      item: ContextEntry;
    }>;

    if (sectionsWithOldest.length === 0) {
      break;
    }

    sectionsWithOldest.sort((a, b) => toSortableTimestamp(a.item.sortKey) - toSortableTimestamp(b.item.sortKey));
    const toTrim = sectionsWithOldest[0];
    mutable[toTrim.key].splice(toTrim.index, 1);
    rendered = renderContext(mutable);
  }

  return mutable;
}

function buildSuspenseDescription(sourceType: string, rawTitle: string): string {
  const title = rawTitle.toLowerCase();
  if (sourceType === 'employee_compliance') {
    if (title.includes('medical')) return 'Medical card renewal';
    if (title.includes('mvr')) return 'MVR review due';
    return 'Driver compliance item';
  }
  if (sourceType === 'permit_license_records') return 'Permit renewal';
  if (sourceType === 'assets') return 'Asset compliance item';
  return 'Compliance suspense item';
}

export async function buildOrgContext(orgId: string): Promise<string> {
  const normalizedOrgId = orgId.trim();
  if (!normalizedOrgId) return '';

  const [data, dbInvoices] = await Promise.all([
    loadFleetComplianceData(normalizedOrgId),
    loadFleetComplianceInvoices(normalizedOrgId),
  ]);
  const hasData =
    data.drivers.length > 0 ||
    data.assets.length > 0 ||
    data.permits.length > 0 ||
    data.suspense.length > 0 ||
    data.maintenanceEvents.length > 0 ||
    dbInvoices.length > 0;
  if (!hasData) return '';

  const employeeCdlMap = new Map<string, string>();
  for (const employee of data.employees) {
    const employeeId = stringValue(employee.employeeId, '').trim();
    if (!employeeId) continue;
    const cdlExpiry = normalizeDate(employee.cdlExpiration);
    if (cdlExpiry !== 'Unknown') employeeCdlMap.set(employeeId, cdlExpiry);
  }

  const lastInspectionByAsset = new Map<string, string>();
  for (const event of data.maintenanceEvents) {
    const assetId = stringValue(event.assetId, '').trim();
    if (!assetId) continue;
    const completed = normalizeDate(event.completedDate);
    if (completed === 'Unknown') continue;
    const existing = lastInspectionByAsset.get(assetId);
    if (!existing || toSortableTimestamp(completed) > toSortableTimestamp(existing)) {
      lastInspectionByAsset.set(assetId, completed);
    }
  }

  const drivers = sortEntriesByDateAscending(
    data.drivers.map((driver) => {
      const driverId = normalizeDriverId(driver.employeeId || driver.personId);
      const cdlExpiry = employeeCdlMap.get(driver.employeeId) || 'Unknown';
      const medicalExpiry = normalizeDate(driver.medicalExpiration);
      const statusRaw = stringValue(driver.clearinghouseStatus, 'Unknown');
      const status = statusRaw.toLowerCase() === 'unknown' ? 'Unknown' : titleCase(statusRaw);
      return {
        line: `- Driver ID: ${driverId} | CDL Expires: ${cdlExpiry} | Medical Expires: ${medicalExpiry} | Status: ${status}`,
        sortKey: medicalExpiry,
      };
    })
  );

  const assets = sortEntriesByDateAscending(
    data.assets.map((asset) => {
      const unitId = stringValue(asset.assetId, 'UNKNOWN-ASSET');
      const type = titleCase(stringValue(asset.category, 'Asset'));
      const status = titleCase(stringValue(asset.status, 'Unknown'));
      const lastInspection = lastInspectionByAsset.get(asset.assetId) || 'Unknown';
      return {
        line: `- Unit: ${unitId} | Type: ${type} | Status: ${status} | Last Inspection: ${lastInspection}`,
        sortKey: lastInspection,
      };
    })
  );

  const permits = sortEntriesByDateAscending(
    data.permits.map((permit) => {
      const permitType = stringValue(permit.name, permit.recordId || 'Permit');
      const expiry = normalizeDate(permit.renewalDueDate);
      const status = titleCase(stringValue(permit.status, 'Unknown'));
      return {
        line: `- ${permitType} | Expires: ${expiry} | Status: ${status}`,
        sortKey: expiry,
      };
    })
  );

  const suspense = sortEntriesByDateAscending(
    data.suspense
      .filter((item) => item.status.toLowerCase() === 'open')
      .map((item) => {
        const description = buildSuspenseDescription(item.sourceType, item.title);
        const dueDate = normalizeDate(item.dueDate);
        const severity = stringValue(item.severity, 'medium').toUpperCase();
        const ownerId = normalizeOwnerId(item.ownerEmail);
        const referenceId =
          item.sourceType === 'employee_compliance'
            ? `Driver ${normalizeDriverId(item.sourceId)}`
            : stringValue(item.sourceId, 'Unknown');

        return {
          line: `- ${description} | Ref: ${referenceId} | Due: ${dueDate} | Severity: ${severity} | Owner: ${ownerId}`,
          sortKey: dueDate,
        };
      })
  );

  const maintenance = sortEntriesByDateDescending(
    data.maintenanceEvents.map((event) => {
      const unit = stringValue(event.assetId, 'Unknown');
      const maintenanceType = titleCase(stringValue(event.serviceType, 'Service'));
      const date = normalizeDate(event.completedDate);
      const cost = formatCurrency(stringValue(event.estimatedCost, ''));
      const status = titleCase(stringValue(event.status, 'Unknown'));
      return {
        line: `- Unit: ${unit} | Type: ${maintenanceType} | Date: ${date} | Cost: ${cost} | Status: ${status}`,
        sortKey: date,
      };
    })
  ).slice(0, 20);

  const invoices = sortEntriesByDateDescending(
    dbInvoices.map((invoice) => {
      const vendor = stringValue(invoice.vendor, 'Unknown Vendor');
      const amount = formatCurrency(String(invoice.amount));
      const date = normalizeDate(invoice.invoiceDate);
      const category = titleCase(stringValue(invoice.category, 'other'));
      const asset = stringValue(invoice.assetId, 'Unknown');
      return {
        line: `- Vendor: ${vendor} | Amount: ${amount} | Date: ${date} | Category: ${category} | Asset: ${asset}`,
        sortKey: date,
      };
    })
  ).slice(0, 20);

  const trimmed = trimToMaxContextChars({
    drivers,
    assets,
    permits,
    suspense,
    maintenance,
    invoices,
  });
  const context = renderContext(trimmed);
  if (
    trimmed.drivers.length === 0 &&
    trimmed.assets.length === 0 &&
    trimmed.permits.length === 0 &&
    trimmed.suspense.length === 0 &&
    trimmed.maintenance.length === 0 &&
    trimmed.invoices.length === 0
  ) {
    return '';
  }
  return context;
}
