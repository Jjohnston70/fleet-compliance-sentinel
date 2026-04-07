/**
 * DQ data store backed by fleet_module_runtime_state Postgres persistence.
 *
 * In-memory Maps are the hot cache. On first access for an org, state is
 * hydrated from Postgres. After every mutation, state is persisted back.
 */

import {
  loadModuleRuntimeState,
  saveModuleRuntimeState,
} from '@/lib/module-runtime-state';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DqFileStatus = 'incomplete' | 'complete' | 'expired' | 'flagged';
export type DqFileType = 'dqf' | 'dhf';
export type DqDocStatus = 'missing' | 'uploaded' | 'generated' | 'verified' | 'expired';
export type DqDocCadence = 'one_time' | 'annual' | 'biennial';
export type DqDocRequiredFor = 'all' | 'cdl_only' | 'non_cdl_only' | 'conditional';

export interface DqFile {
  id: number;
  org_id: string;
  driver_id: string;
  driver_name: string;
  cdl_holder: boolean;
  hire_date: string;
  status: DqFileStatus;
  file_type: DqFileType;
  intake_token: string | null;
  intake_completed_at: string | null;
  retention_delete_after: string | null;
  created_at: string;
  updated_at: string;
}

export interface DqDocument {
  id: number;
  dq_file_id: number;
  org_id: string;
  doc_type: string;
  doc_label: string;
  cfr_reference: string;
  status: DqDocStatus;
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  file_type: DqFileType;
  source: 'generated' | 'uploaded';
  expires_at: string | null;
  uploaded_at: string | null;
  generated_at: string | null;
  file_path: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
}

export interface DqIntakeResponse {
  dq_file_id: number;
  section: string;
  response_data: Record<string, unknown>;
  submitted_at: string;
}

export interface DqOrgSummary {
  total_drivers: number;
  complete: number;
  incomplete: number;
  expired: number;
  flagged: number;
  expiring_within_30_days: number;
  completion_pct: number;
}

export interface DqChecklistItem {
  doc_type: string;
  doc_label: string;
  cfr_reference: string;
  status: DqDocStatus;
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  file_type: DqFileType;
  source: 'generated' | 'uploaded';
  expires_at: string | null;
  days_until_expiry: number | null;
  action: 'view' | 'upload' | 'generate';
}

export interface GapItem {
  driver_name: string;
  driver_id: string;
  dq_file_id: number;
  doc_type: string;
  doc_label: string;
  cfr_reference: string;
  gap_type: 'missing' | 'expiring' | 'expired';
  expires_at: string | null;
  days_until_expiry: number | null;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// ---------------------------------------------------------------------------
// Document checklist config (26 types -- mirrors tooling/dq-command/src/config/)
// ---------------------------------------------------------------------------

interface DocConfig {
  doc_type: string;
  doc_label: string;
  cfr_reference: string;
  file_type: DqFileType;
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  source: 'generated' | 'uploaded';
}

export const DQ_CHECKLIST_CONFIG: DocConfig[] = [
  // DQF Pre-Employment
  { doc_type: 'application_for_employment',    doc_label: 'Application for Employment',              cfr_reference: '§391.21',       file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: 'record_of_violations',          doc_label: 'Record of Violations (12-month)',         cfr_reference: '§391.27',       file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: 'road_test_certificate',         doc_label: 'Road Test Certificate',                   cfr_reference: '§391.31',       file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: 'cdl_copy',                      doc_label: 'CDL Copy (front/back)',                   cfr_reference: '§391.33',       file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'pre_employment_mvr',            doc_label: 'Pre-Employment MVR (3-year)',             cfr_reference: '§391.23(a)(1)', file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'prev_employer_investigation',   doc_label: 'Previous Employer Investigation',         cfr_reference: '§391.23(d)',    file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'da_history_inquiry',            doc_label: 'D&A History Inquiry (prior employers)',   cfr_reference: '§391.23(e)',    file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'clearinghouse_full_query',      doc_label: 'Clearinghouse Full Pre-Employment Query', cfr_reference: '§382.701',      file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'clearinghouse_consent_pre_emp', doc_label: 'Clearinghouse Consent (Pre-Employment)',  cfr_reference: '§382.701(b)',   file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: 'med_examiner_cert',             doc_label: 'Medical Examiner Certificate',            cfr_reference: '§391.43',       file_type: 'dqf', required_for: 'non_cdl_only', cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'cdlis_mvr',                     doc_label: 'CDLIS MVR (CDL holders)',                 cfr_reference: '§384.105',      file_type: 'dqf', required_for: 'cdl_only',     cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'nrcme_verification_note',       doc_label: 'NRCME Verification Note',                 cfr_reference: '§391.23(m)(1)', file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  // DQF Conditional
  { doc_type: 'entry_level_driver_training',   doc_label: 'Entry-Level Driver Training Certificate', cfr_reference: '§380.509(b)',   file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'spe_certificate',               doc_label: 'SPE Certificate',                         cfr_reference: '§391.49',       file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'medical_exemption_letter',      doc_label: 'Medical Exemption Letter',                cfr_reference: 'Part 381',      file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  // DQF Annual Recurring
  { doc_type: 'mvr_annual_update',             doc_label: 'MVR Annual Update',                       cfr_reference: '§391.25(a)',    file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'uploaded'  },
  { doc_type: 'annual_review_note',            doc_label: 'Annual Review of Driving Record (note)',  cfr_reference: '§391.25(c)(2)', file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'generated' },
  { doc_type: 'med_cert_renewal',              doc_label: 'Medical Certificate Renewal',             cfr_reference: '§391.45',       file_type: 'dqf', required_for: 'all',          cadence: 'biennial', source: 'uploaded'  },
  { doc_type: 'clearinghouse_limited_query',   doc_label: 'Clearinghouse Limited Annual Query',      cfr_reference: '§382.701(b)',   file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'uploaded'  },
  { doc_type: 'clearinghouse_consent_annual',  doc_label: 'Clearinghouse Consent (Annual)',          cfr_reference: '§382.701',      file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'generated' },
  // DHF
  { doc_type: 'dhf_driver_authorization',       doc_label: 'D&A Records Authorization',               cfr_reference: '§391.23(e)',    file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: 'dhf_prev_employer_da_responses', doc_label: 'Previous Employer D&A Responses',         cfr_reference: '§391.23(e)',    file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'dhf_pre_emp_drug_test',          doc_label: 'Pre-Employment Drug Test Result',         cfr_reference: '§382.301',      file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'dhf_clearinghouse_query',        doc_label: 'DHF Clearinghouse Query Result',          cfr_reference: '§382.701',      file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'dhf_sap_referral',               doc_label: 'SAP Referral & RTD Records',              cfr_reference: '§382.605',      file_type: 'dhf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: 'dhf_rtd_records',                doc_label: 'Follow-Up Testing Records',               cfr_reference: '40 Subpart O',  file_type: 'dhf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
];

const GENERATABLE_TYPES = new Set([
  'application_for_employment', 'record_of_violations', 'clearinghouse_consent_pre_emp',
  'nrcme_verification_note', 'annual_review_note', 'clearinghouse_consent_annual',
  'dhf_driver_authorization', 'road_test_certificate',
]);

// ---------------------------------------------------------------------------
// In-memory stores (org-scoped, hydrated from Postgres)
// ---------------------------------------------------------------------------

const orgFiles = new Map<string, DqFile[]>();
const orgDocs = new Map<string, DqDocument[]>();
const intakeResponses: DqIntakeResponse[] = [];
let nextFileId = 100;
let nextDocId = 1000;
const hydratedOrgs = new Set<string>();

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

async function hydrateOrg(orgId: string): Promise<void> {
  if (hydratedOrgs.has(orgId)) return;
  hydratedOrgs.add(orgId);

  const snapshot = await loadModuleRuntimeState(orgId, 'dq-files');
  if (snapshot) {
    const files = Array.isArray(snapshot.files) ? snapshot.files as DqFile[] : [];
    const docs = Array.isArray(snapshot.docs) ? snapshot.docs as DqDocument[] : [];
    orgFiles.set(orgId, files);
    orgDocs.set(orgId, docs);
    if (typeof snapshot.nextFileId === 'number') nextFileId = Math.max(nextFileId, snapshot.nextFileId);
    if (typeof snapshot.nextDocId === 'number') nextDocId = Math.max(nextDocId, snapshot.nextDocId);
  } else {
    orgFiles.set(orgId, []);
    orgDocs.set(orgId, []);
  }
}

async function persistOrg(orgId: string): Promise<void> {
  const files = orgFiles.get(orgId) ?? [];
  const docs = orgDocs.get(orgId) ?? [];
  await saveModuleRuntimeState(orgId, 'dq-files', {
    files,
    docs,
    nextFileId,
    nextDocId,
  } as unknown as Record<string, unknown>);
}

function ensureOrgData(orgId: string): void {
  if (orgFiles.has(orgId)) return;
  orgFiles.set(orgId, []);
  orgDocs.set(orgId, []);
}

/**
 * Call before any read/write operation. Hydrates from Postgres on first access.
 */
export async function ensureOrgHydrated(orgId: string): Promise<void> {
  await hydrateOrg(orgId);
  ensureOrgData(orgId);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getFiles(orgId: string, fileType?: DqFileType): DqFile[] {
  ensureOrgData(orgId);
  const files = orgFiles.get(orgId)!;
  return fileType ? files.filter((f) => f.file_type === fileType) : files;
}

export function getFileById(orgId: string, id: number): DqFile | undefined {
  ensureOrgData(orgId);
  return orgFiles.get(orgId)!.find((f) => f.id === id);
}

export function getFileByToken(token: string): DqFile | undefined {
  for (const files of orgFiles.values()) {
    const found = files.find((f) => f.intake_token === token);
    if (found) return found;
  }
  return undefined;
}

export async function createDqFile(orgId: string, input: { driver_id: string; driver_name: string; cdl_holder: boolean; hire_date: string }): Promise<{ dqf: DqFile; dhf: DqFile; intake_token: string }> {
  await ensureOrgHydrated(orgId);
  const now = new Date().toISOString();
  const token = `tok-${crypto.randomUUID().slice(0, 8)}`;

  const dqf: DqFile = {
    id: nextFileId++,
    org_id: orgId,
    driver_id: input.driver_id,
    driver_name: input.driver_name,
    cdl_holder: input.cdl_holder,
    hire_date: input.hire_date,
    status: 'incomplete',
    file_type: 'dqf',
    intake_token: token,
    intake_completed_at: null,
    retention_delete_after: null,
    created_at: now,
    updated_at: now,
  };
  const dhf: DqFile = {
    id: nextFileId++,
    org_id: orgId,
    driver_id: input.driver_id,
    driver_name: input.driver_name,
    cdl_holder: input.cdl_holder,
    hire_date: input.hire_date,
    status: 'incomplete',
    file_type: 'dhf',
    intake_token: null,
    intake_completed_at: null,
    retention_delete_after: null,
    created_at: now,
    updated_at: now,
  };

  orgFiles.get(orgId)!.push(dqf, dhf);

  // Scaffold docs
  const docs = orgDocs.get(orgId)!;
  for (const file of [dqf, dhf]) {
    const applicable = DQ_CHECKLIST_CONFIG.filter((cfg) => {
      if (cfg.file_type !== file.file_type) return false;
      if (cfg.required_for === 'cdl_only' && !file.cdl_holder) return false;
      if (cfg.required_for === 'non_cdl_only' && file.cdl_holder) return false;
      return true;
    });
    for (const cfg of applicable) {
      docs.push({
        id: nextDocId++,
        dq_file_id: file.id,
        org_id: orgId,
        doc_type: cfg.doc_type,
        doc_label: cfg.doc_label,
        cfr_reference: cfg.cfr_reference,
        status: 'missing',
        required_for: cfg.required_for,
        cadence: cfg.cadence,
        file_type: cfg.file_type,
        source: cfg.source,
        expires_at: null,
        uploaded_at: null,
        generated_at: null,
        file_path: null,
        notes: null,
        reviewed_by: null,
        reviewed_at: null,
      });
    }
  }

  await persistOrg(orgId);
  return { dqf, dhf, intake_token: token };
}

export function getDocsForFile(dqFileId: number): DqDocument[] {
  for (const docs of orgDocs.values()) {
    const found = docs.filter((d) => d.dq_file_id === dqFileId);
    if (found.length > 0) return found;
  }
  return [];
}

export function getChecklist(dqFileId: number): DqChecklistItem[] {
  const docs = getDocsForFile(dqFileId);
  const now = Date.now();
  return docs.map((doc) => {
    const daysUntilExpiry = doc.expires_at
      ? Math.ceil((new Date(doc.expires_at).getTime() - now) / 86400000)
      : null;
    let action: 'view' | 'upload' | 'generate' = 'upload';
    if (doc.status === 'uploaded' || doc.status === 'generated' || doc.status === 'verified') {
      action = 'view';
    } else if (doc.source === 'generated') {
      action = 'generate';
    }
    return {
      doc_type: doc.doc_type,
      doc_label: doc.doc_label,
      cfr_reference: doc.cfr_reference,
      status: doc.status,
      required_for: doc.required_for,
      cadence: doc.cadence,
      file_type: doc.file_type,
      source: doc.source,
      expires_at: doc.expires_at,
      days_until_expiry: daysUntilExpiry,
      action,
    };
  });
}

export async function uploadDocument(orgId: string, dqFileId: number, docType: string, filePath: string, expiresAt?: string): Promise<DqDocument | null> {
  await ensureOrgHydrated(orgId);
  const docs = orgDocs.get(orgId)!;
  const doc = docs.find((d) => d.dq_file_id === dqFileId && d.doc_type === docType);
  if (!doc) return null;
  doc.status = 'uploaded';
  doc.uploaded_at = new Date().toISOString();
  doc.file_path = filePath;
  if (expiresAt) doc.expires_at = expiresAt;
  await persistOrg(orgId);
  return doc;
}

export async function generateDocument(orgId: string, dqFileId: number, docType: string): Promise<DqDocument | null> {
  await ensureOrgHydrated(orgId);
  if (!GENERATABLE_TYPES.has(docType)) return null;
  const docs = orgDocs.get(orgId)!;
  const doc = docs.find((d) => d.dq_file_id === dqFileId && d.doc_type === docType);
  if (!doc) return null;
  doc.status = 'generated';
  doc.generated_at = new Date().toISOString();
  await persistOrg(orgId);
  return doc;
}

export function getOrgSummary(orgId: string): DqOrgSummary {
  ensureOrgData(orgId);
  const files = orgFiles.get(orgId)!.filter((f) => f.file_type === 'dqf');
  const now = Date.now();
  const thirtyDaysMs = 30 * 86400000;

  let expiringCount = 0;
  const docs = orgDocs.get(orgId)!;
  for (const doc of docs) {
    if (doc.expires_at) {
      const diff = new Date(doc.expires_at).getTime() - now;
      if (diff > 0 && diff <= thirtyDaysMs) expiringCount++;
    }
  }

  const complete = files.filter((f) => f.status === 'complete').length;
  const incomplete = files.filter((f) => f.status === 'incomplete').length;
  const expired = files.filter((f) => f.status === 'expired').length;
  const flagged = files.filter((f) => f.status === 'flagged').length;

  return {
    total_drivers: files.length,
    complete,
    incomplete,
    expired,
    flagged,
    expiring_within_30_days: expiringCount,
    completion_pct: files.length > 0 ? Math.round((complete / files.length) * 100) : 0,
  };
}

export function getGaps(orgId: string, expiringWithinDays: number = 30): GapItem[] {
  ensureOrgData(orgId);
  const files = orgFiles.get(orgId)!;
  const docs = orgDocs.get(orgId)!;
  const now = Date.now();
  const gaps: GapItem[] = [];

  for (const doc of docs) {
    const file = files.find((f) => f.id === doc.dq_file_id);
    if (!file) continue;
    if (doc.required_for === 'conditional') continue;

    // Missing docs
    if (doc.status === 'missing') {
      gaps.push({
        driver_name: file.driver_name,
        driver_id: file.driver_id,
        dq_file_id: doc.dq_file_id,
        doc_type: doc.doc_type,
        doc_label: doc.doc_label,
        cfr_reference: doc.cfr_reference,
        gap_type: 'missing',
        expires_at: null,
        days_until_expiry: null,
        severity: 'high',
      });
    }

    // Expiring/expired docs
    if (doc.expires_at && doc.status !== 'missing') {
      const daysUntil = Math.ceil((new Date(doc.expires_at).getTime() - now) / 86400000);
      if (daysUntil <= 0) {
        gaps.push({
          driver_name: file.driver_name, driver_id: file.driver_id, dq_file_id: doc.dq_file_id,
          doc_type: doc.doc_type, doc_label: doc.doc_label, cfr_reference: doc.cfr_reference,
          gap_type: 'expired', expires_at: doc.expires_at, days_until_expiry: daysUntil, severity: 'critical',
        });
      } else if (daysUntil <= expiringWithinDays) {
        gaps.push({
          driver_name: file.driver_name, driver_id: file.driver_id, dq_file_id: doc.dq_file_id,
          doc_type: doc.doc_type, doc_label: doc.doc_label, cfr_reference: doc.cfr_reference,
          gap_type: 'expiring', expires_at: doc.expires_at, days_until_expiry: daysUntil,
          severity: daysUntil <= 7 ? 'critical' : daysUntil <= 14 ? 'high' : 'medium',
        });
      }
    }
  }

  // Sort by severity: critical first
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  gaps.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
  return gaps;
}

export function saveIntakeResponse(dqFileId: number, section: string, data: Record<string, unknown>): void {
  intakeResponses.push({ dq_file_id: dqFileId, section, response_data: data, submitted_at: new Date().toISOString() });
  // Note: intake responses are session-scoped and not persisted to fleet_module_runtime_state.
  // They are ephemeral by design (intake is completed in a single session).
}

export function getIntakeResponses(dqFileId: number): DqIntakeResponse[] {
  return intakeResponses.filter((r) => r.dq_file_id === dqFileId);
}

export function getIntakeStatus(dqFileId: number): { completed_sections: string[]; remaining_sections: string[]; is_complete: boolean } {
  const allSections = ['personal', 'licensing', 'employment_history', 'violations', 'certifications', 'uploads'];
  const completed = [...new Set(intakeResponses.filter((r) => r.dq_file_id === dqFileId).map((r) => r.section))];
  const remaining = allSections.filter((s) => !completed.includes(s));
  return { completed_sections: completed, remaining_sections: remaining, is_complete: remaining.length === 0 };
}

export async function completeIntake(token: string): Promise<boolean> {
  const file = getFileByToken(token);
  if (!file) return false;
  file.intake_completed_at = new Date().toISOString();
  file.intake_token = null;
  file.updated_at = new Date().toISOString();
  await persistOrg(file.org_id);
  return true;
}
