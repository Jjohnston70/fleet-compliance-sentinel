/**
 * dq-command
 * DOT Driver Qualification File System
 * Fleet-Compliance Sentinel | True North Data Strategies LLC
 *
 * Manages both DQF (49 CFR §391.51) and DHF (49 CFR §391.53) per FMCSA requirements.
 */

// ── Data Layer ───────────────────────────────────────────────────────────────
export { InMemoryDqRepository } from './data/repository';
export {
  DQ_DOC_TYPES,
  type DqDocType,
  type DqFile,
  type DqDocument,
  type DqIntakeResponse,
  type DqAuditLogEntry,
  type DqFileStatus,
  type DqFileType,
  type DqDocStatus,
  type DqChecklist,
  type DqChecklistItem,
  type DqOrgSummary,
  type DqSuspenseItem,
  type CreateDqFileInput,
  type UploadDocumentInput,
  type GenerateDocumentInput,
  type SubmitIntakeSectionInput,
} from './data/schema';

// ── Services ─────────────────────────────────────────────────────────────────
export { DqFileService } from './services/dq-file-service';
export { IntakeService } from './services/intake-service';
export { DocumentService } from './services/document-service';

// ── API ──────────────────────────────────────────────────────────────────────
export { DqAPIHandlers } from './api/handlers';

// ── Hooks ────────────────────────────────────────────────────────────────────
export { DqComplianceSweep, type SweepResult } from './hooks/dq-sweep';

// ── Config ───────────────────────────────────────────────────────────────────
export { DQ_CHECKLIST_CONFIG, type DocChecklistConfig } from './config/index';
export { INTAKE_SECTIONS, type IntakeSectionConfig, type IntakeFieldConfig } from './config/intake-form';

// ── LLM Tools ────────────────────────────────────────────────────────────────
export { createDqTools, type ToolHandler } from './tools';
