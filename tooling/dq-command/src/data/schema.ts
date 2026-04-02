/**
 * dq-command — Data Schema
 * DOT Driver Qualification File System
 * Fleet-Compliance Sentinel | True North Data Strategies LLC
 *
 * Implements 49 CFR §391.51 (DQF) and §391.53 (DHF)
 */

// ─── Document Type Enum ──────────────────────────────────────────────────────

export const DQ_DOC_TYPES = {
  // ── DQF: Pre-Employment ──────────────────────────────────────────────────
  APPLICATION_FOR_EMPLOYMENT:       'application_for_employment',        // §391.21  — generated
  RECORD_OF_VIOLATIONS:             'record_of_violations',              // §391.27  — generated
  ROAD_TEST_CERTIFICATE:            'road_test_certificate',             // §391.31  — generated
  CDL_COPY:                         'cdl_copy',                          // §391.33  — uploaded
  PRE_EMPLOYMENT_MVR:               'pre_employment_mvr',                // §391.23  — uploaded
  PREV_EMPLOYER_INVESTIGATION:      'prev_employer_investigation',       // §391.23(d) — uploaded
  DA_HISTORY_INQUIRY:               'da_history_inquiry',                // §391.23(e) — uploaded
  CLEARINGHOUSE_FULL_QUERY:         'clearinghouse_full_query',          // §382.701  — uploaded
  CLEARINGHOUSE_CONSENT_PRE_EMP:    'clearinghouse_consent_pre_emp',     // §382.701(b) — generated
  MED_EXAMINER_CERT:                'med_examiner_cert',                 // §391.43  — uploaded (non-CDL)
  CDLIS_MVR:                        'cdlis_mvr',                         // §384.105  — uploaded (CDL)
  NRCME_VERIFICATION_NOTE:          'nrcme_verification_note',           // §391.23(m) — generated

  // ── DQF: Conditional ────────────────────────────────────────────────────
  ENTRY_LEVEL_DRIVER_TRAINING:      'entry_level_driver_training',       // §380.509(b) — uploaded, CDL + <1yr
  SPE_CERTIFICATE:                  'spe_certificate',                   // §391.49   — uploaded, if applicable
  MEDICAL_EXEMPTION_LETTER:         'medical_exemption_letter',          // Part 381  — uploaded, if applicable

  // ── DQF: Annual Recurring ────────────────────────────────────────────────
  MVR_ANNUAL_UPDATE:                'mvr_annual_update',                 // §391.25(a)   — uploaded
  ANNUAL_REVIEW_NOTE:               'annual_review_note',                // §391.25(c)(2) — generated
  MED_CERT_RENEWAL:                 'med_cert_renewal',                  // §391.45  — uploaded
  CLEARINGHOUSE_LIMITED_QUERY:      'clearinghouse_limited_query',       // §382.701(b) — uploaded
  CLEARINGHOUSE_CONSENT_ANNUAL:     'clearinghouse_consent_annual',      // §382.701  — generated

  // ── DHF ─────────────────────────────────────────────────────────────────
  DHF_DRIVER_AUTHORIZATION:         'dhf_driver_authorization',          // §391.23(e) — generated
  DHF_PREV_EMPLOYER_DA_RESPONSES:   'dhf_prev_employer_da_responses',    // §391.23(e) — uploaded
  DHF_PRE_EMP_DRUG_TEST:            'dhf_pre_emp_drug_test',             // §382.301  — uploaded
  DHF_CLEARINGHOUSE_QUERY:          'dhf_clearinghouse_query',           // §382.701  — uploaded
  DHF_SAP_REFERRAL:                 'dhf_sap_referral',                  // §382.605  — conditional
  DHF_RTD_RECORDS:                  'dhf_rtd_records',                   // 40 Subpart O — conditional
} as const;

export type DqDocType = typeof DQ_DOC_TYPES[keyof typeof DQ_DOC_TYPES];

// ─── File Status ─────────────────────────────────────────────────────────────

export type DqFileStatus = 'incomplete' | 'complete' | 'expired' | 'flagged';
export type DqFileType = 'dqf' | 'dhf';
export type DqDocStatus = 'missing' | 'uploaded' | 'generated' | 'verified' | 'expired';
export type DqDocCadence = 'one_time' | 'annual' | 'biennial';
export type DqDocRequiredFor = 'all' | 'cdl_only' | 'non_cdl_only' | 'conditional';
export type DqActorType = 'user' | 'system' | 'driver';

// ─── Core Entities ───────────────────────────────────────────────────────────

export interface DqFile {
  id: number;
  org_id: string;
  driver_id: string;
  driver_name: string;
  cdl_holder: boolean;
  status: DqFileStatus;
  file_type: DqFileType;
  intake_token: string | null;
  intake_completed_at: string | null;
  retention_delete_after: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DqDocument {
  id: number;
  dq_file_id: number;
  org_id: string;
  doc_type: DqDocType;
  doc_label: string;
  cfr_reference: string | null;
  status: DqDocStatus;
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  expires_at: string | null;
  uploaded_at: string | null;
  generated_at: string | null;
  file_path: string | null;
  generated_doc_path: string | null;
  notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface DqIntakeResponse {
  id: number;
  dq_file_id: number;
  org_id: string;
  section: 'personal' | 'licensing' | 'employment_history' | 'violations' | 'certifications' | 'uploads';
  response_data: Record<string, unknown>;
  submitted_at: string;
}

export interface DqAuditLogEntry {
  id: number;
  dq_file_id: number;
  org_id: string;
  actor_id: string;
  actor_type: DqActorType;
  action: string;
  doc_type: DqDocType | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

// ─── API Input Types ─────────────────────────────────────────────────────────

export interface CreateDqFileInput {
  driver_id: string;
  driver_name: string;
  cdl_holder: boolean;
  hire_date: string;
}

export interface UploadDocumentInput {
  dq_file_id: number;
  doc_type: DqDocType;
  file_path: string;
  expires_at?: string;
}

export interface GenerateDocumentInput {
  dq_file_id: number;
  doc_type: DqDocType;
  generation_options?: Record<string, unknown>;
}

export interface SubmitIntakeSectionInput {
  section: DqIntakeResponse['section'];
  response_data: Record<string, unknown>;
}

// ─── Checklist View Types ────────────────────────────────────────────────────

export interface DqChecklistItem {
  doc_type: DqDocType;
  doc_label: string;
  cfr_reference: string | null;
  status: DqDocStatus;
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  expires_at: string | null;
  days_until_expiry: number | null;
  action: 'view' | 'upload' | 'generate';
}

export interface DqChecklist {
  dq_file_id: number;
  driver_id: string;
  driver_name: string;
  file_type: DqFileType;
  status: DqFileStatus;
  items: DqChecklistItem[];
  total_docs: number;
  completed_docs: number;
  completion_pct: number;
}

export interface DqOrgSummary {
  org_id: string;
  total_drivers: number;
  complete: number;
  incomplete: number;
  expired: number;
  flagged: number;
  expiring_within_30_days: number;
  completion_pct: number;
}

// ─── Suspense Integration ────────────────────────────────────────────────────

export interface DqSuspenseItem {
  collection: 'suspense_items';
  org_id: string;
  data: {
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    due_date: string;
    owner: string | null;
    source: 'dq-command';
    source_id: number;
    cfr_reference: string;
  };
}
