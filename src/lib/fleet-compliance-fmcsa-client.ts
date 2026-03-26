/**
 * Fleet-Compliance FMCSA Client
 *
 * Server-safe, pure-TypeScript fetch wrapper for the FMCSA QCMobile API.
 * Field mappings verified against live API responses (DOT 135370).
 *
 * Endpoints:
 *   GET /carriers/:dot            → { content: { carrier: {...} } }
 *   GET /carriers/:dot/basics     → { content: [ { basic: {...} } ] }
 *   GET /carriers/:dot/authority  → { content: [ { carrierAuthority: {...} } ] }
 *   GET /carriers/:dot/cargo-carried → { content: [ { cargoClassDesc, id } ] }
 */

// ---------------------------------------------------------------------------
// Raw API shapes (as actually returned by the API)
// ---------------------------------------------------------------------------

interface FmcsaCarrierRaw {
  dotNumber: number | string;
  legalName?: string;
  dbaName?: string | null;
  carrierOperation?: { carrierOperationCode?: string; carrierOperationDesc?: string };
  allowedToOperate?: string;        // "Y" | "N"
  isPassengerCarrier?: string;      // "Y" | "N"
  statusCode?: string;              // "A" = active
  commonAuthorityStatus?: string;   // "A" | "N" | "R"
  contractAuthorityStatus?: string;
  brokerAuthorityStatus?: string;
  oosDate?: string | null;
  safetyRating?: string;            // "S" = Satisfactory, "C" = Conditional, "U" = Unsatisfactory
  safetyRatingDate?: string;
  reviewDate?: string;
  phyStreet?: string;
  phyCity?: string;
  phyState?: string;
  phyZipcode?: string;
  phyCountry?: string;
  totalDrivers?: number;
  totalPowerUnits?: number;
  crashTotal?: number;
  fatalCrash?: number;
  injCrash?: number;
  hazmatInsp?: number;
  hazmatOosInsp?: number;
  hazmatOosRate?: number;
  hazmatOosRateNationalAverage?: string;
  driverInsp?: number;
  driverOosInsp?: number;
  driverOosRate?: number;
  driverOosRateNationalAverage?: string;
  vehicleInsp?: number;
  vehicleOosInsp?: number;
  vehicleOosRate?: number;
  vehicleOosRateNationalAverage?: string;
  mcs150Outdated?: string;          // "Y" | "N"
  snapshotDate?: string | null;
}

interface FmcsaCarrierResponse {
  content?: {
    carrier?: FmcsaCarrierRaw;
  };
}

interface FmcsaBasicItemRaw {
  basic?: {
    basicsType?: {
      basicsId?: number;
      basicsCode?: string;
      basicsShortDesc?: string;
      basicsLongDesc?: string;
    };
    basicsPercentile?: string;
    measureValue?: string;
    onRoadPerformanceThresholdViolationIndicator?: string;
    exceededFMCSAInterventionThreshold?: string;
    seriousViolationFromInvestigationPast12MonthIndicator?: string;
    totalInspectionWithViolation?: number;
    totalViolation?: number;
    basicsRunDate?: string;
  };
}

interface FmcsaBasicsResponse {
  content?: FmcsaBasicItemRaw[];
}

interface FmcsaAuthorityItemRaw {
  carrierAuthority?: {
    applicantID?: number;
    docketNumber?: number;
    prefix?: string;
    commonAuthorityStatus?: string;
    contractAuthorityStatus?: string;
    brokerAuthorityStatus?: string;
    authorizedForProperty?: string;
    authorizedForPassenger?: string;
    authorizedForBroker?: string;
    authorizedForHouseholdGoods?: string;
    authority?: string;
  };
}

interface FmcsaAuthorityResponse {
  content?: FmcsaAuthorityItemRaw[];
}

interface FmcsaCargoItemRaw {
  cargoClassDesc?: string;
  id?: { cargoClassId?: number };
}

interface FmcsaCargoResponse {
  content?: FmcsaCargoItemRaw[];
}

// ---------------------------------------------------------------------------
// Normalized shapes exposed to the app
// ---------------------------------------------------------------------------

export interface FmcsaCarrierSummary {
  dotNumber: string;
  legalName: string;
  dbaName: string;
  operationType: string;
  statusCode: string;
  allowedToOperate: boolean;
  outOfService: boolean;
  outOfServiceDate: string;
  safetyRating: string;
  safetyRatingFullLabel: string;
  safetyRatingDate: string;
  reviewDate: string;
  mcs150Outdated: boolean;
  isPassengerCarrier: boolean;
  address: string;
  totalDrivers: number | null;
  totalPowerUnits: number | null;
  crashTotal: number;
  fatalCrash: number;
  injCrash: number;
  hazmatInspections: number;
  hazmatOosRate: number;
  hazmatOosNationalAvg: string;
  driverInspections: number;
  driverOosRate: number;
  driverOosNationalAvg: string;
  vehicleInspections: number;
  vehicleOosRate: number;
  vehicleOosNationalAvg: string;
  commonAuthorityStatus: string;
  contractAuthorityStatus: string;
}

export interface FmcsaBasic {
  id: number;
  code: string;
  shortDesc: string;
  percentile: string;
  measureValue: string;
  roadDeficient: boolean;
  interventionExceeded: boolean;
  seriousViolation: boolean;
  totalViolations: number;
  inspectionsWithViolation: number;
  runDate: string;
}

export interface FmcsaAuthority {
  docketNumber: string;
  prefix: string;
  commonStatus: string;
  contractStatus: string;
  brokerStatus: string;
  authorizedForProperty: boolean;
  authorizedForPassenger: boolean;
}

export interface FmcsaCargoType {
  id: number;
  description: string;
}

export interface FmcsaFullProfile {
  carrier: FmcsaCarrierSummary;
  basics: FmcsaBasic[];
  authority: FmcsaAuthority[];
  cargo: FmcsaCargoType[];
}

export type FmcsaLookupResult =
  | { ok: true; profile: FmcsaFullProfile }
  | { ok: false; error: string; status?: number };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const FMCSA_BASE = 'https://mobile.fmcsa.dot.gov/qc/services/carriers';

const SAFETY_RATING_LABELS: Record<string, string> = {
  S: 'Satisfactory',
  C: 'Conditional',
  U: 'Unsatisfactory',
};

const AUTHORITY_STATUS_LABELS: Record<string, string> = {
  A: 'Active',
  N: 'None',
  R: 'Revoked',
};

async function apiFetch<T>(url: string): Promise<{ ok: true; data: T } | { ok: false; error: string; status?: number }> {
  let res: Response;
  try {
    res = await fetch(url, { headers: { Accept: 'application/json' }, cache: 'no-store' });
  } catch (err) {
    return { ok: false, error: `Network error: ${String(err)}` };
  }
  if (res.status === 404) return { ok: false, error: 'Not found.', status: 404 };
  if (res.status === 401) return { ok: false, error: 'Invalid or inactive FMCSA API key.', status: 401 };
  if (!res.ok) return { ok: false, error: `FMCSA API returned ${res.status}.`, status: res.status };
  try {
    return { ok: true, data: (await res.json()) as T };
  } catch {
    return { ok: false, error: 'Non-JSON response from FMCSA API.' };
  }
}

function normalizeCarrier(raw: FmcsaCarrierRaw): FmcsaCarrierSummary {
  const address = [raw.phyStreet, raw.phyCity, raw.phyState, raw.phyZipcode, raw.phyCountry]
    .filter(Boolean).join(', ');
  const ratingCode = raw.safetyRating ?? '';
  return {
    dotNumber: String(raw.dotNumber ?? ''),
    legalName: raw.legalName ?? '',
    dbaName: raw.dbaName ?? '',
    operationType: raw.carrierOperation?.carrierOperationDesc ?? '',
    statusCode: raw.statusCode ?? '',
    allowedToOperate: raw.allowedToOperate === 'Y',
    outOfService: Boolean(raw.oosDate),
    outOfServiceDate: raw.oosDate ?? '',
    safetyRating: ratingCode,
    safetyRatingFullLabel: SAFETY_RATING_LABELS[ratingCode] ?? (ratingCode || 'Not Rated'),
    safetyRatingDate: raw.safetyRatingDate ?? '',
    reviewDate: raw.reviewDate ?? '',
    mcs150Outdated: raw.mcs150Outdated === 'Y',
    isPassengerCarrier: raw.isPassengerCarrier === 'Y',
    address,
    totalDrivers: raw.totalDrivers ?? null,
    totalPowerUnits: raw.totalPowerUnits ?? null,
    crashTotal: raw.crashTotal ?? 0,
    fatalCrash: raw.fatalCrash ?? 0,
    injCrash: raw.injCrash ?? 0,
    hazmatInspections: raw.hazmatInsp ?? 0,
    hazmatOosRate: raw.hazmatOosRate ?? 0,
    hazmatOosNationalAvg: raw.hazmatOosRateNationalAverage ?? '',
    driverInspections: raw.driverInsp ?? 0,
    driverOosRate: raw.driverOosRate ?? 0,
    driverOosNationalAvg: raw.driverOosRateNationalAverage ?? '',
    vehicleInspections: raw.vehicleInsp ?? 0,
    vehicleOosRate: raw.vehicleOosRate ?? 0,
    vehicleOosNationalAvg: raw.vehicleOosRateNationalAverage ?? '',
    commonAuthorityStatus: AUTHORITY_STATUS_LABELS[raw.commonAuthorityStatus ?? ''] ?? raw.commonAuthorityStatus ?? '',
    contractAuthorityStatus: AUTHORITY_STATUS_LABELS[raw.contractAuthorityStatus ?? ''] ?? raw.contractAuthorityStatus ?? '',
  };
}

function normalizeBasic(item: FmcsaBasicItemRaw): FmcsaBasic | null {
  const b = item.basic;
  if (!b) return null;
  const rdv = b.onRoadPerformanceThresholdViolationIndicator ?? '';
  const exceeded = b.exceededFMCSAInterventionThreshold ?? '';
  return {
    id: b.basicsType?.basicsId ?? 0,
    code: b.basicsType?.basicsCode ?? '',
    shortDesc: b.basicsType?.basicsShortDesc ?? '',
    percentile: b.basicsPercentile ?? 'Not Public',
    measureValue: b.measureValue ?? '',
    roadDeficient: rdv === 'Y',
    interventionExceeded: exceeded === 'Y',
    seriousViolation: b.seriousViolationFromInvestigationPast12MonthIndicator === 'Y',
    totalViolations: b.totalViolation ?? 0,
    inspectionsWithViolation: b.totalInspectionWithViolation ?? 0,
    runDate: b.basicsRunDate ? b.basicsRunDate.split('T')[0] : '',
  };
}

function normalizeAuthority(item: FmcsaAuthorityItemRaw): FmcsaAuthority | null {
  const a = item.carrierAuthority;
  if (!a) return null;
  return {
    docketNumber: a.docketNumber != null ? String(a.docketNumber) : '',
    prefix: a.prefix ?? '',
    commonStatus: AUTHORITY_STATUS_LABELS[a.commonAuthorityStatus ?? ''] ?? a.commonAuthorityStatus ?? '',
    contractStatus: AUTHORITY_STATUS_LABELS[a.contractAuthorityStatus ?? ''] ?? a.contractAuthorityStatus ?? '',
    brokerStatus: AUTHORITY_STATUS_LABELS[a.brokerAuthorityStatus ?? ''] ?? a.brokerAuthorityStatus ?? '',
    authorizedForProperty: a.authorizedForProperty === 'Y',
    authorizedForPassenger: a.authorizedForPassenger === 'Y',
  };
}

function normalizeCargo(item: FmcsaCargoItemRaw): FmcsaCargoType {
  return {
    id: item.id?.cargoClassId ?? 0,
    description: item.cargoClassDesc ?? '',
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function lookupFmcsaCarrier(
  dotNumber: string,
  webKey?: string
): Promise<FmcsaLookupResult> {
  const key = (webKey ?? process.env.FMCSA_API_KEY ?? '').trim();
  if (!key) return { ok: false, error: 'FMCSA_API_KEY is not configured.' };

  const dot = dotNumber.trim().replace(/\D/g, '');
  if (!dot) return { ok: false, error: 'DOT number must be numeric.' };

  const qs = `?webKey=${encodeURIComponent(key)}`;

  // Carrier profile is required — fail fast
  const carrierRes = await apiFetch<FmcsaCarrierResponse>(`${FMCSA_BASE}/${dot}${qs}`);
  if (!carrierRes.ok) return { ok: false, error: carrierRes.error, status: carrierRes.status };

  const rawCarrier = carrierRes.data?.content?.carrier;
  if (!rawCarrier) return { ok: false, error: `No carrier found for DOT ${dot}.`, status: 404 };

  // Supplemental endpoints — fail gracefully
  const [basicsRes, authorityRes, cargoRes] = await Promise.all([
    apiFetch<FmcsaBasicsResponse>(`${FMCSA_BASE}/${dot}/basics${qs}`),
    apiFetch<FmcsaAuthorityResponse>(`${FMCSA_BASE}/${dot}/authority${qs}`),
    apiFetch<FmcsaCargoResponse>(`${FMCSA_BASE}/${dot}/cargo-carried${qs}`),
  ]);

  const basics = basicsRes.ok
    ? (basicsRes.data?.content ?? []).map(normalizeBasic).filter((b): b is FmcsaBasic => b !== null)
    : [];
  const authority = authorityRes.ok
    ? (authorityRes.data?.content ?? []).map(normalizeAuthority).filter((a): a is FmcsaAuthority => a !== null)
    : [];
  const cargo = cargoRes.ok
    ? (cargoRes.data?.content ?? []).map(normalizeCargo)
    : [];

  return { ok: true, profile: { carrier: normalizeCarrier(rawCarrier), basics, authority, cargo } };
}

/** Fleet Compliance's USDOT number — used as the default on the FMCSA lookup page. */
export const FLEET_COMPLIANCE_DOT = '135370';
