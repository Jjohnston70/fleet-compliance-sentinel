/**
 * dq-command — API Handlers
 * REST endpoint handlers for the DQ file system.
 * Route prefix: /api/fleet-compliance/dq/
 */

import { InMemoryDqRepository } from '../data/repository';
import { DqFileService } from '../services/dq-file-service';
import { IntakeService } from '../services/intake-service';
import { DocumentService } from '../services/document-service';
import { DqComplianceSweep } from '../hooks/dq-sweep';
import type {
  CreateDqFileInput,
  UploadDocumentInput,
  GenerateDocumentInput,
  SubmitIntakeSectionInput,
} from '../data/schema';

export class DqAPIHandlers {
  private fileService: DqFileService;
  private intakeService: IntakeService;
  private documentService: DocumentService;
  private sweep: DqComplianceSweep;

  constructor(private repo: InMemoryDqRepository) {
    this.fileService = new DqFileService(repo);
    this.intakeService = new IntakeService(repo);
    this.documentService = new DocumentService(repo);
    this.sweep = new DqComplianceSweep(repo);
  }

  // ── DQ File Management ─────────────────────────────────────────────────

  /** GET /api/fleet-compliance/dq/files */
  async listFiles(orgId: string) {
    return this.repo.listDqFiles(orgId);
  }

  /** POST /api/fleet-compliance/dq/files */
  async createFile(orgId: string, input: CreateDqFileInput) {
    return this.fileService.createDqFile(orgId, input);
  }

  /** GET /api/fleet-compliance/dq/files/[id] */
  async getFile(id: number) {
    return this.repo.getDqFile(id);
  }

  /** GET /api/fleet-compliance/dq/files/[id]/checklist */
  async getChecklist(dqFileId: number) {
    return this.fileService.getChecklist(dqFileId);
  }

  // ── Document Operations ────────────────────────────────────────────────

  /** POST /api/fleet-compliance/dq/documents */
  async uploadDocument(orgId: string, input: UploadDocumentInput) {
    return this.documentService.uploadDocument(orgId, input);
  }

  /** POST /api/fleet-compliance/dq/documents/generate */
  async generateDocument(orgId: string, input: GenerateDocumentInput) {
    return this.documentService.generateDocument(orgId, input);
  }

  /** PATCH /api/fleet-compliance/dq/documents/[id]/verify */
  async verifyDocument(documentId: number, reviewerId: string, notes?: string) {
    return this.documentService.markVerified(documentId, reviewerId, notes);
  }

  // ── Driver Intake ──────────────────────────────────────────────────────

  /** GET /api/fleet-compliance/dq/intake/[token] */
  async validateIntakeToken(token: string) {
    const file = await this.intakeService.validateToken(token);
    if (!file) return null;
    return { valid: true, form_schema: this.intakeService.getFormSchema() };
  }

  /** POST /api/fleet-compliance/dq/intake/[token] */
  async submitIntakeSection(token: string, input: SubmitIntakeSectionInput) {
    return this.intakeService.submitSection(token, input);
  }

  /** POST /api/fleet-compliance/dq/intake/[token]/complete */
  async completeIntake(token: string) {
    return this.intakeService.completeIntake(token);
  }

  /** GET /api/fleet-compliance/dq/intake/status/[dqFileId] */
  async getIntakeStatus(dqFileId: number) {
    return this.intakeService.getIntakeStatus(dqFileId);
  }

  // ── Compliance ─────────────────────────────────────────────────────────

  /** POST /api/fleet-compliance/dq/sweep */
  async runSweep(orgId: string, dryRun = false) {
    return this.sweep.run(orgId, dryRun);
  }

  /** GET /api/fleet-compliance/dq/gaps */
  async getGaps(orgId: string, expiringWithinDays = 30) {
    const missing = await this.repo.getMissingDocuments(orgId);
    const expiring = await this.repo.getExpiringDocuments(orgId, expiringWithinDays);
    return { missing, expiring };
  }

  /** GET /api/fleet-compliance/dq/summary */
  async getSummary(orgId: string) {
    return this.fileService.getOrgSummary(orgId);
  }
}
