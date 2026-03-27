export type CollectionKey =
  | 'drivers'
  | 'assets_master'
  | 'vehicles_equipment'
  | 'permits_licenses'
  | 'employees'
  | 'storage_tanks'
  | 'maintenance_schedule'
  | 'activity_log'
  | 'maintenance_tracker'
  | 'invoices'
  | 'maintenance_line_items'
  | 'colorado_contacts'
  | 'emergency_contacts';

export interface FieldSchema {
  required?: boolean;
  isDate?: boolean;
  isEmail?: boolean;
  oneOf?: string[];
}

export interface CollectionSchema {
  label: string;
  /** Sheet name in the bulk-upload XLSX template */
  sheetName: string;
  fields: Record<string, FieldSchema>;
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const IMPORT_SCHEMAS: Record<CollectionKey, CollectionSchema> = {
  drivers: {
    label: 'Drivers',
    sheetName: 'Drivers',
    fields: {
      'Driver ID':            { required: true },
      'Driver Name':          { required: true },
      'Status':               { required: true, oneOf: ['Active', 'Inactive', 'On Leave', 'Terminated'] },
      'Phone':                {},
      'Email':                { isEmail: true },
      'License Number':       {},
      'License State':        { required: true },
      'License Expiry':       { isDate: true },
      'License Type':         {},
      'CDL Number':           {},
      'CDL Expiry':           { isDate: true },
      'CDL Endorsements':     {},
      'Medical Card Expiry':  { required: true, isDate: true },
      'Medical Examiner':     {},
      'Medical Exam Date':    { isDate: true },
      'Background Check Date': { isDate: true },
      'Clearinghouse Status': {},
      'MVR Review Date':      { isDate: true },
      'Drug Test Date':       { isDate: true },
      'Drug Test Result':     {},
      'Last HOS Audit':       { isDate: true },
      'ELD Provider':         {},
      'ELD Device ID':        {},
      'ELD Compliant':        {},
      'Last Pre-Trip Date':   { isDate: true },
      'Last Post-Trip Date':  { isDate: true },
      'Annual Inspection Due': { isDate: true },
      'Hire Date':            { isDate: true },
      'Termination Date':     { isDate: true },
      'Notes':                {},
    },
  },
  assets_master: {
    label: 'Assets Master',
    sheetName: 'Assets Master',
    fields: {
      'Asset ID':               { required: true },
      'Asset Name':             { required: true },
      'Asset Type':             { required: true },
      'Status':                 { required: true, oneOf: ['Active', 'Maintenance Hold', 'Retired', 'Inactive'] },
      'Current Location':       {},
      'Assigned To':            {},
      'Last Service Date':      { isDate: true },
      'Next Service Due':       { isDate: true },
      'Service Interval (Days)': {},
      'Acquisition Date':       { isDate: true },
      'Acquisition Cost':       {},
      'Notes':                  {},
    },
  },
  vehicles_equipment: {
    label: 'Vehicles & Equipment',
    sheetName: 'VEHICLES & EQUIPMENT',
    fields: {
      'Unit Number':              { required: true },
      'Vehicle Type':             { required: true },
      'Year':                     {},
      'Make':                     {},
      'Model':                    {},
      'VIN':                      {},
      'License Plate':            {},
      'Registration Expiration':  { isDate: true },
      'Insurance Policy Number':  {},
      'Insurance Expiration':     { isDate: true },
      'Tank Capacity (Gallons)':  {},
      'Number of Compartments':   {},
      'Pump System':              {},
      'Meter System':             {},
      'Hose Length':              {},
      'Current Mileage':          {},
      'Last Oil Change':          { isDate: true },
      'Last Oil Change Mileage':  {},
      'Next Oil Change Due':      { isDate: true },
      'Next Oil Change Mileage':  {},
      'Last DOT Inspection':      { isDate: true },
      'Next DOT Inspection Due':  { isDate: true },
      'DOT Inspection Certificate': {},
      'Last Vapor Test':          { isDate: true },
      'Next Vapor Test Due':      { isDate: true },
      'Vapor Test Certificate':   {},
      'CDL Required':             {},
      'Hazmat Required':          {},
      'Assigned Driver':          {},
      'Backup Driver':            {},
      'GPS Unit ID':              {},
      'Radio Unit Number':        {},
      'Fuel Card Number':         {},
      'EZ Pass Number':           {},
      'Purchase Date':            { isDate: true },
      'Purchase Price':           {},
      'Current Book Value':       {},
      'Maintenance Schedule':     {},
      'Last Major Repair':        {},
      'Next Service Due':         { isDate: true },
      'Vehicle Status':           { required: true, oneOf: ['Active', 'Maintenance Hold', 'Retired', 'Inactive'] },
      'Location':                 {},
      'Notes':                    {},
    },
  },
  permits_licenses: {
    label: 'Permits & Licenses',
    sheetName: 'PERMITS & LICENSES',
    fields: {
      'Permit Type':              { required: true },
      'Permit Number':            { required: true },
      'Issuing Agency':           { required: true },
      'Issue Date':               { isDate: true },
      'Expiration Date':          { required: true, isDate: true },
      'Renewal Due Date':         { isDate: true },
      'Annual Fee':               {},
      'Responsible Employee':     {},
      'Status':                   { required: true, oneOf: ['Active', 'Expired', 'Pending', 'Suspended'] },
      'Last Inspection':          { isDate: true },
      'Next Inspection':          { isDate: true },
      'Compliance Notes':         {},
      'Renewal Checklist':        {},
      'Alert Days Before Expiry': {},
    },
  },
  employees: {
    label: 'Employees',
    sheetName: 'EMPLOYEES',
    fields: {
      'Employee ID':                  { required: true },
      'Last Name':                    { required: true },
      'First Name':                   { required: true },
      'Date of Birth':                { isDate: true },
      'Hire Date':                    { required: true, isDate: true },
      'Job Title':                    {},
      'Department':                   {},
      'Supervisor':                   {},
      'Pay Rate':                     {},
      'Work Phone':                   {},
      'Work Email':                   { isEmail: true },
      'Emergency Contact Phone':      {},
      'Emergency Contact Relationship': {},
      'CDL Number':                   {},
      'CDL Class':                    { oneOf: ['A', 'B', 'C', 'None', ''] },
      'CDL Expiration':               { isDate: true },
      'Hazmat Endorsement':           {},
      'Hazmat Expiration':            { isDate: true },
      'Tank Endorsement':             {},
      'Air Brakes Endorsement':       {},
      'Medical Certificate Number':   {},
      'Medical Expiration':           { isDate: true },
      'Last MVR Check':               { isDate: true },
      'Next MVR Due':                 { isDate: true },
      'Last Drug Test':               { isDate: true },
      'Expiration HAZMAT TRAINING 3 YEAR CERT': { isDate: true },
      'Last Safety Training':         { isDate: true },
      'Uniform Size':                 {},
      'Assigned Vehicle':             {},
      'COMPANY PHONE':                {},
      'DOB':                          {},
      'Notes':                        {},
      'TSA Check Last 5 Years':       {},
      'TSA Expiration':               { isDate: true },
      'UE ID':                        {},
      '90 Day Review':                { isDate: true },
      'MVR ANNUAL REVIEWS':           { isDate: true },
      'HAZMAT TRAINING 3 YEAR CERT':  { isDate: true },
    },
  },
  storage_tanks: {
    label: 'Storage Tanks',
    sheetName: 'STORAGE TANKS',
    fields: {
      'Tank ID':                  { required: true },
      'Tank Location':            { required: true },
      'Tank Type':                { required: true },
      'Capacity (Gallons)':       {},
      'Product Stored':           {},
      'Installation Date':        { isDate: true },
      'Tank Material':            {},
      'Manufacturer':             {},
      'Serial Number':            {},
      'UST Permit Number':        {},
      'Permit Expiration':        { isDate: true },
      'Last Inspection Date':     { isDate: true },
      'Inspector':                {},
      'Next Inspection Due':      { isDate: true },
      'Leak Detection System':    {},
      'Last Leak Test':           { isDate: true },
      'Next Leak Test Due':       { isDate: true },
      'Spill Containment':        {},
      'Overfill Protection':      {},
      'Cathodic Protection':      {},
      'Groundwater Monitoring':   {},
      'Financial Responsibility': {},
      'Insurance Coverage':       {},
      'Current Inventory':        {},
      'Reorder Level':            {},
      'Maximum Fill':             {},
      'Daily Measurement Time':   {},
      'Measuring Device':         {},
      'Calibration Chart':        {},
      'Last Calibration':         { isDate: true },
      'Next Calibration Due':     { isDate: true },
      'Tank Status':              { required: true, oneOf: ['Active', 'Inactive', 'Decommissioned'] },
      'Notes':                    {},
    },
  },
  maintenance_schedule: {
    label: 'Maintenance Schedule',
    sheetName: 'MAINTENANCE SCHEDULE',
    fields: {
      'Unit/Equipment':     { required: true },
      'Maintenance Type':   { required: true },
      'Frequency':          {},
      'Last Performed':     { isDate: true },
      'Next Due Date':      { required: true, isDate: true },
      'Next Due Mileage':   {},
      'Service Provider':   {},
      'Estimated Cost':     {},
      'Parts Required':     {},
      'Labor Hours':        {},
      'Priority':           { oneOf: ['Critical', 'High', 'Medium', 'Low'] },
      'Status':             { required: true, oneOf: ['Scheduled', 'In Progress', 'Completed', 'Overdue'] },
      'Work Order Number':  {},
      'Notes':              {},
    },
  },
  activity_log: {
    label: 'Activity Log',
    sheetName: 'Activity Log',
    fields: {
      'Timestamp':        { required: true },
      'Asset ID':         { required: true },
      'Asset Name':       {},
      'Action Type':      { required: true },
      'Employee':         {},
      'Location':         {},
      'Odometer/Hours':   {},
      'Fuel Added (gal)': {},
      'Fuel Cost':        {},
      'Condition Notes':  {},
    },
  },
  maintenance_tracker: {
    label: 'Maintenance Tracker (Invoices)',
    sheetName: 'Maintenance Tracker',
    fields: {
      'Invoice ID':       { required: true },
      'Completed Date':   { isDate: true },
      'Vendor':           { required: true },
      'PO Number':        {},
      'Unit Number':      {},
      'Asset Name':       {},
      'Year':             {},
      'Make':             {},
      'Model':            {},
      'Plate Number':     {},
      'VIN':              {},
      'Engine':           {},
      'Mileage Hours':    {},
      'Written By':       {},
      'Parts Cost':       {},
      'Labor Cost':       {},
      'Shop Supplies':    {},
      'Sales Tax':        {},
      'Invoice Total':    {},
      'Line Item Count':  {},
      'Work Requested':   {},
      'Work Completed':   {},
      'Source File':      {},
    },
  },
  invoices: {
    label: 'Invoices',
    sheetName: 'Invoices',
    fields: {
      'Vendor': { required: true },
      'Invoice Number': { required: true },
      'Invoice Date': { required: true, isDate: true },
      'Due Date': { isDate: true },
      'Total Amount': { required: true },
      'Parts Cost': {},
      'Labor Cost': {},
      'Shop Supplies': {},
      'Sales Tax': {},
      'Category': { oneOf: ['maintenance', 'permit', 'fuel', 'insurance', 'other'] },
      'Asset ID': {},
      'Service Type': {},
      'Status': { oneOf: ['pending', 'paid', 'overdue', ''] },
      'PO Number': {},
      'Notes': {},
    },
  },
  maintenance_line_items: {
    label: 'Maintenance Line Items',
    sheetName: 'Line Items',
    fields: {
      'Line Item ID':     { required: true },
      'Invoice ID':       { required: true },
      'Completed Date':   { isDate: true },
      'Vendor':           {},
      'Unit Number':      {},
      'Asset Name':       {},
      'VIN':              {},
      'Qty':              {},
      'Item Description': { required: true },
      'Unit Price':       {},
      'Line Amount':      {},
    },
  },
  colorado_contacts: {
    label: 'Colorado Contacts',
    sheetName: 'COLORADO CONTACTS',
    fields: {
      'Organization':       { required: true },
      'Department':         {},
      'Phone Number':       {},
      'Address':            {},
      'Website':            {},
      'Contact Purpose':    { required: true },
      'Hours':              {},
      'Notes':              {},
    },
  },
  emergency_contacts: {
    label: 'Emergency Contacts',
    sheetName: 'EMERGENCY CONTACTS',
    fields: {
      'Contact Type':           { required: true },
      'Organization/Person':    { required: true },
      'Primary Phone':          { required: true },
      'Secondary Phone':        {},
      '24/7 Available':         {},
      'Email':                  { isEmail: true },
      'Address':                {},
      'Contact Person':         {},
      'Services Provided':      {},
      'Response Time':          {},
      'Notes':                  {},
    },
  },
};

/** Map from XLSX sheet name → CollectionKey for multi-sheet auto-matching */
export const SHEET_NAME_TO_COLLECTION: Record<string, CollectionKey> = Object.fromEntries(
  Object.entries(IMPORT_SCHEMAS).map(([key, schema]) => [schema.sheetName, key as CollectionKey])
);

/** Sheet names to skip when parsing multi-sheet uploads */
export const SKIP_SHEETS = new Set(['README', 'Config']);

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
