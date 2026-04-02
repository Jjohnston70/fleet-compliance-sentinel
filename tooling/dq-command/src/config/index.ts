/**
 * dq-command — Configuration
 * DOT Driver Qualification File System
 */

// ─── Intake Token Settings ───────────────────────────────────────────────────

/** Intake token expiration in hours */
export const INTAKE_TOKEN_EXPIRY_HOURS = 72;

// ─── Compliance Sweep Thresholds ─────────────────────────────────────────────

/** Days before expiration to flag at each severity level */
export const EXPIRY_THRESHOLDS = {
  WARNING: 30,
  HIGH: 14,
  CRITICAL: 7,
  OVERDUE: 0,
} as const;

/** Days after hire before flagging an incomplete DQF */
export const DQF_COMPLETION_DEADLINE_DAYS = 30;

/** Retention period after driver termination per §391.51(c) */
export const RETENTION_YEARS = 3;

// ─── Employment History Requirements ─────────────────────────────────────────

/** Employment history lookback for CDL holders per §391.21 */
export const CDL_EMPLOYMENT_HISTORY_YEARS = 10;

/** Employment history lookback for non-CDL drivers per §391.21 */
export const NON_CDL_EMPLOYMENT_HISTORY_YEARS = 3;

// ─── Medical Certificate Cadence ─────────────────────────────────────────────

/** Medical certificate renewal period in months */
export const MED_CERT_RENEWAL_MONTHS = 24;

// ─── Document Checklist Configuration ────────────────────────────────────────

import { DQ_DOC_TYPES, type DqDocType, type DqDocCadence, type DqDocRequiredFor } from '../data/schema';

export interface DocChecklistConfig {
  doc_type: DqDocType;
  doc_label: string;
  cfr_reference: string;
  file_type: 'dqf' | 'dhf';
  required_for: DqDocRequiredFor;
  cadence: DqDocCadence;
  source: 'generated' | 'uploaded';
}

/**
 * Master checklist configuration — drives the per-driver checklist generation.
 * Order matters: this is the display order in the UI.
 */
export const DQ_CHECKLIST_CONFIG: DocChecklistConfig[] = [
  // ── DQF: Pre-Employment ────────────────────────────────────────────────
  { doc_type: DQ_DOC_TYPES.APPLICATION_FOR_EMPLOYMENT,    doc_label: 'Application for Employment',              cfr_reference: '§391.21',      file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: DQ_DOC_TYPES.RECORD_OF_VIOLATIONS,          doc_label: 'Record of Violations (12-month)',         cfr_reference: '§391.27',      file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: DQ_DOC_TYPES.ROAD_TEST_CERTIFICATE,         doc_label: 'Road Test Certificate',                   cfr_reference: '§391.31',      file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: DQ_DOC_TYPES.CDL_COPY,                      doc_label: 'CDL Copy (front/back)',                   cfr_reference: '§391.33',      file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.PRE_EMPLOYMENT_MVR,            doc_label: 'Pre-Employment MVR (3-year)',             cfr_reference: '§391.23(a)(1)',file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.PREV_EMPLOYER_INVESTIGATION,   doc_label: 'Previous Employer Investigation',         cfr_reference: '§391.23(d)',   file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.DA_HISTORY_INQUIRY,            doc_label: 'D&A History Inquiry (prior employers)',   cfr_reference: '§391.23(e)',   file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.CLEARINGHOUSE_FULL_QUERY,      doc_label: 'Clearinghouse Full Pre-Employment Query', cfr_reference: '§382.701',     file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.CLEARINGHOUSE_CONSENT_PRE_EMP, doc_label: 'Clearinghouse Consent (Pre-Employment)',  cfr_reference: '§382.701(b)',  file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: DQ_DOC_TYPES.MED_EXAMINER_CERT,             doc_label: 'Medical Examiner Certificate',            cfr_reference: '§391.43',      file_type: 'dqf', required_for: 'non_cdl_only', cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.CDLIS_MVR,                     doc_label: 'CDLIS MVR (CDL holders)',                 cfr_reference: '§384.105',     file_type: 'dqf', required_for: 'cdl_only',     cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.NRCME_VERIFICATION_NOTE,       doc_label: 'NRCME Verification Note',                 cfr_reference: '§391.23(m)(1)',file_type: 'dqf', required_for: 'all',          cadence: 'one_time', source: 'generated' },

  // ── DQF: Conditional ───────────────────────────────────────────────────
  { doc_type: DQ_DOC_TYPES.ENTRY_LEVEL_DRIVER_TRAINING,   doc_label: 'Entry-Level Driver Training Certificate', cfr_reference: '§380.509(b)',  file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.SPE_CERTIFICATE,               doc_label: 'SPE Certificate',                         cfr_reference: '§391.49',      file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.MEDICAL_EXEMPTION_LETTER,      doc_label: 'Medical Exemption Letter',                cfr_reference: 'Part 381',     file_type: 'dqf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },

  // ── DQF: Annual Recurring ──────────────────────────────────────────────
  { doc_type: DQ_DOC_TYPES.MVR_ANNUAL_UPDATE,             doc_label: 'MVR Annual Update',                       cfr_reference: '§391.25(a)',   file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.ANNUAL_REVIEW_NOTE,            doc_label: 'Annual Review of Driving Record (note)',  cfr_reference: '§391.25(c)(2)',file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'generated' },
  { doc_type: DQ_DOC_TYPES.MED_CERT_RENEWAL,              doc_label: 'Medical Certificate Renewal',             cfr_reference: '§391.45',      file_type: 'dqf', required_for: 'all',          cadence: 'biennial', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.CLEARINGHOUSE_LIMITED_QUERY,   doc_label: 'Clearinghouse Limited Annual Query',      cfr_reference: '§382.701(b)',  file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.CLEARINGHOUSE_CONSENT_ANNUAL,  doc_label: 'Clearinghouse Consent (Annual)',          cfr_reference: '§382.701',     file_type: 'dqf', required_for: 'all',          cadence: 'annual',   source: 'generated' },

  // ── DHF ────────────────────────────────────────────────────────────────
  { doc_type: DQ_DOC_TYPES.DHF_DRIVER_AUTHORIZATION,      doc_label: 'D&A Records Authorization',               cfr_reference: '§391.23(e)',   file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'generated' },
  { doc_type: DQ_DOC_TYPES.DHF_PREV_EMPLOYER_DA_RESPONSES,doc_label: 'Previous Employer D&A Responses',         cfr_reference: '§391.23(e)',   file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.DHF_PRE_EMP_DRUG_TEST,         doc_label: 'Pre-Employment Drug Test Result',         cfr_reference: '§382.301',     file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.DHF_CLEARINGHOUSE_QUERY,       doc_label: 'DHF Clearinghouse Query Result',          cfr_reference: '§382.701',     file_type: 'dhf', required_for: 'all',          cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.DHF_SAP_REFERRAL,              doc_label: 'SAP Referral & RTD Records',              cfr_reference: '§382.605',     file_type: 'dhf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
  { doc_type: DQ_DOC_TYPES.DHF_RTD_RECORDS,               doc_label: 'Follow-Up Testing Records',               cfr_reference: '40 Subpart O', file_type: 'dhf', required_for: 'conditional',  cadence: 'one_time', source: 'uploaded'  },
];
