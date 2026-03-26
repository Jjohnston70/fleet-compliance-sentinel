export interface FleetComplianceValidationResult {
  valid: boolean;
  errors: string[];
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const YEAR_RE = /^\d{4}$/;

const APPROVED_ASSET_STATUSES = new Set(['active', 'maintenance hold', 'retired', 'inactive']);
const APPROVED_CDL_CLASSES = new Set(['a', 'b', 'c', 'none']);
const APPROVED_PERMIT_TYPES = new Set([
  'state hazmat',
  'federal hazmat',
  'ucr',
  'operating authority mc150',
  'operating authority',
  'mc-150',
  'mc150',
  'ifta',
  'irp',
]);

function normalized(value: string | undefined): string {
  return (value ?? '').trim();
}

function normalizeEnum(value: string | undefined): string {
  return normalized(value).toLowerCase();
}

function addRequiredError(errors: string[], row: Record<string, string>, field: string) {
  if (!normalized(row[field])) {
    errors.push(`${field}: required`);
  }
}

function isValidDate(value: string): boolean {
  if (!DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return false;
  if (parsed.toISOString().slice(0, 10) !== value) return false;
  const year = parsed.getUTCFullYear();
  return year >= 1900 && year <= 2100;
}

function addDateErrorIfInvalid(
  errors: string[],
  row: Record<string, string>,
  field: string,
  required = false
) {
  const value = normalized(row[field]);
  if (!value) {
    if (required) errors.push(`${field}: required`);
    return;
  }
  if (!isValidDate(value)) {
    errors.push(`${field}: must be YYYY-MM-DD`);
  }
}

export function validateDriver(row: Record<string, string>): FleetComplianceValidationResult {
  const errors: string[] = [];

  addRequiredError(errors, row, 'Driver ID');
  addRequiredError(errors, row, 'Driver Name');
  addRequiredError(errors, row, 'License State');
  addDateErrorIfInvalid(errors, row, 'Medical Card Expiry', true);

  const dateFields = [
    'License Expiry',
    'CDL Expiry',
    'Medical Exam Date',
    'Background Check Date',
    'MVR Review Date',
    'Drug Test Date',
    'Last HOS Audit',
    'Last Pre-Trip Date',
    'Last Post-Trip Date',
    'Annual Inspection Due',
    'Hire Date',
    'Termination Date',
  ];
  for (const field of dateFields) {
    addDateErrorIfInvalid(errors, row, field, false);
  }

  const cdlRaw = normalized(row['CDL Class'] || row['License Type']);
  if (cdlRaw) {
    const cdlClass = cdlRaw.toLowerCase().replace(/^class\s+/i, '');
    if (!APPROVED_CDL_CLASSES.has(cdlClass)) {
      errors.push('CDL Class: must be one of A, B, C, None');
    }
  }

  const medical = normalized(row['Medical Card Expiry']);
  if (medical && isValidDate(medical)) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const medicalDate = new Date(`${medical}T00:00:00`);
    if (medicalDate.getTime() < today.getTime()) {
      errors.push('Medical Card Expiry: cannot be in the past for new records');
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateAsset(row: Record<string, string>): FleetComplianceValidationResult {
  const errors: string[] = [];

  if (row['Asset ID'] !== undefined || row['Asset Name'] !== undefined || row['Asset Type'] !== undefined) {
    addRequiredError(errors, row, 'Asset ID');
    addRequiredError(errors, row, 'Asset Name');
    addRequiredError(errors, row, 'Asset Type');
  }

  if (row['Unit Number'] !== undefined || row['Vehicle Type'] !== undefined) {
    addRequiredError(errors, row, 'Unit Number');
    addRequiredError(errors, row, 'Vehicle Type');
  }

  const status = normalized(row['Status'] || row['Vehicle Status']);
  if (!status) {
    errors.push('Status: required');
  } else if (!APPROVED_ASSET_STATUSES.has(normalizeEnum(status))) {
    errors.push('Status: must be one of Active, Maintenance Hold, Retired, Inactive');
  }

  const year = normalized(row.Year || row['Year']);
  if (year && !YEAR_RE.test(year)) {
    errors.push('Year: must be a valid 4-digit number');
  }

  return { valid: errors.length === 0, errors };
}

export function validatePermit(row: Record<string, string>): FleetComplianceValidationResult {
  const errors: string[] = [];

  addRequiredError(errors, row, 'Permit Type');
  addRequiredError(errors, row, 'Permit Number');
  addRequiredError(errors, row, 'Issuing Agency');
  addDateErrorIfInvalid(errors, row, 'Expiration Date', true);

  const permitType = normalizeEnum(row['Permit Type']);
  if (permitType && !APPROVED_PERMIT_TYPES.has(permitType)) {
    errors.push('Permit Type: must be one of State Hazmat, Federal Hazmat, UCR, Operating Authority MC150, IFTA, IRP');
  }

  return { valid: errors.length === 0, errors };
}

export function validateEmployee(row: Record<string, string>): FleetComplianceValidationResult {
  const errors: string[] = [];

  addRequiredError(errors, row, 'Employee ID');
  addRequiredError(errors, row, 'First Name');
  addRequiredError(errors, row, 'Last Name');
  addDateErrorIfInvalid(errors, row, 'Hire Date', true);

  const email = normalized(row['Work Email'] || row.Email);
  if (email && !EMAIL_RE.test(email)) {
    errors.push('Work Email: invalid email format');
  }

  return { valid: errors.length === 0, errors };
}
