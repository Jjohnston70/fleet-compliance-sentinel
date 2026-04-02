/**
 * dq-command — Intake Service
 * Handles token-gated driver intake form submission and completion.
 */

import { InMemoryDqRepository } from '../data/repository';
import type { DqFile, DqIntakeResponse, SubmitIntakeSectionInput } from '../data/schema';
import { INTAKE_SECTIONS } from '../config/intake-form';
import { INTAKE_TOKEN_EXPIRY_HOURS } from '../config/index';

export class IntakeService {
  constructor(private repo: InMemoryDqRepository) {}

  /**
   * Validate an intake token. Returns the DQ file if valid, null if expired or invalid.
   */
  async validateToken(token: string): Promise<DqFile | null> {
    const file = await this.repo.getDqFileByToken(token);
    if (!file) return null;

    // Check if intake already completed
    if (file.intake_completed_at) return null;

    // Check token expiry (72 hours from file creation)
    const created = new Date(file.created_at);
    const expiry = new Date(created.getTime() + INTAKE_TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);
    if (new Date() > expiry) return null;

    return file;
  }

  /**
   * Get the intake form schema (section definitions).
   */
  getFormSchema() {
    return INTAKE_SECTIONS;
  }

  /**
   * Submit a single intake section.
   */
  async submitSection(
    token: string,
    input: SubmitIntakeSectionInput
  ): Promise<DqIntakeResponse | null> {
    const file = await this.validateToken(token);
    if (!file) return null;

    const response = await this.repo.saveIntakeResponse(
      file.id,
      file.org_id,
      input.section,
      input.response_data
    );

    await this.repo.addAuditEntry({
      dq_file_id: file.id,
      org_id: file.org_id,
      actor_id: 'driver',
      actor_type: 'driver',
      action: 'intake.section_submitted',
      doc_type: null,
      metadata: { section: input.section },
    });

    return response;
  }

  /**
   * Check intake completion status — which sections are submitted.
   */
  async getIntakeStatus(dqFileId: number): Promise<{
    completed_sections: string[];
    remaining_sections: string[];
    is_complete: boolean;
  }> {
    const responses = await this.repo.getIntakeResponses(dqFileId);
    const completedSections = [...new Set(responses.map((r) => r.section))];
    const allSections = INTAKE_SECTIONS.map((s) => s.id);
    const remaining = allSections.filter((s) => !completedSections.includes(s));

    return {
      completed_sections: completedSections,
      remaining_sections: remaining,
      is_complete: remaining.length === 0,
    };
  }

  /**
   * Mark intake as complete. Triggers document generation downstream.
   */
  async completeIntake(token: string): Promise<boolean> {
    const file = await this.validateToken(token);
    if (!file) return false;

    const status = await this.getIntakeStatus(file.id);
    if (!status.is_complete) return false;

    // Mark intake completed on the DQ file
    const now = new Date().toISOString();
    // In production this would be a proper DB update
    file.intake_completed_at = now;
    file.updated_at = now;

    await this.repo.addAuditEntry({
      dq_file_id: file.id,
      org_id: file.org_id,
      actor_id: 'driver',
      actor_type: 'driver',
      action: 'intake.completed',
      doc_type: null,
      metadata: null,
    });

    return true;
  }
}
