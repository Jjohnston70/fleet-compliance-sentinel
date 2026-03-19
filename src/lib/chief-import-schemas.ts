export type CollectionKey = 'assets' | 'permits' | 'drivers' | 'suspense_items';

export interface FieldSchema {
  required?: boolean;
  isDate?: boolean;
  isEmail?: boolean;
  oneOf?: string[];
}

export interface CollectionSchema {
  label: string;
  fields: Record<string, FieldSchema>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const IMPORT_SCHEMAS: Record<CollectionKey, CollectionSchema> = {
  assets: {
    label: 'Assets',
    fields: {
      name:             { required: true },
      category:         { required: true },
      status:           { required: true, oneOf: ['active', 'maintenance-hold', 'retired', 'inactive'] },
      location:         {},
      assignedTo:       {},
      complianceFocus:  {},
      nextDueDate:      { isDate: true },
      purchaseDate:     { isDate: true },
      purchasePrice:    {},
      note:             {},
    },
  },
  permits: {
    label: 'Permits / Licenses',
    fields: {
      name:           { required: true },
      issuingAgency:  { required: true },
      renewalDueDate: { required: true, isDate: true },
      cadence:        {},
      status:         { required: true, oneOf: ['current', 'expiring-soon', 'overdue', 'expired'] },
      owner:          {},
      note:           {},
    },
  },
  drivers: {
    label: 'Driver Compliance',
    fields: {
      driverName:           { required: true },
      employeeId:           { required: true },
      licenseState:         { required: true },
      cdlClass:             { required: true, oneOf: ['A', 'B', 'C', 'None'] },
      medicalExpiration:    { required: true, isDate: true },
      nextMvrDue:           { isDate: true },
      tsaExpiration:        { isDate: true },
      hazmatExpiration:     { isDate: true },
      clearinghouseStatus:  {},
      note:                 {},
    },
  },
  suspense_items: {
    label: 'Suspense Items',
    fields: {
      title:      { required: true },
      ownerEmail: { required: true, isEmail: true },
      dueDate:    { required: true, isDate: true },
      severity:   { required: true, oneOf: ['high', 'medium', 'low'] },
      sourceType: {},
      sourceId:   {},
      status:     { oneOf: ['open', 'closed'] },
    },
  },
};

export interface ParsedRow {
  rowIndex: number;
  data: Record<string, string>;
  issues: string[];
}

export function validateRows(
  collection: CollectionKey,
  rows: Record<string, string>[]
): ParsedRow[] {
  const schema = IMPORT_SCHEMAS[collection];
  return rows.map((data, i) => {
    const issues: string[] = [];
    for (const [field, rules] of Object.entries(schema.fields)) {
      const val = (data[field] ?? '').trim();
      if (rules.required && !val) {
        issues.push(`${field}: required`);
        continue;
      }
      if (!val) continue;
      if (rules.isDate && !DATE_RE.test(val)) {
        issues.push(`${field}: must be YYYY-MM-DD (got "${val}")`);
      }
      if (rules.isEmail && !EMAIL_RE.test(val)) {
        issues.push(`${field}: invalid email`);
      }
      if (rules.oneOf && !rules.oneOf.includes(val)) {
        issues.push(`${field}: must be one of ${rules.oneOf.join(', ')} (got "${val}")`);
      }
    }
    return { rowIndex: i + 1, data, issues };
  });
}
