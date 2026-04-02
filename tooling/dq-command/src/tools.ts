/**
 * dq-command — LLM Tool Definitions
 * 11 tools for the DQ file system, matching the command-center module pattern.
 */

import { InMemoryDqRepository } from './data/repository';
import { DqAPIHandlers } from './api/handlers';

export type ToolResult = string | Record<string, unknown>;

export interface ToolHandler {
  name: string;
  description: string;
  handler: (args: Record<string, unknown>) => Promise<ToolResult>;
}

/**
 * Create LLM tool handlers for dq-command.
 */
export function createDqTools(repository: InMemoryDqRepository): ToolHandler[] {
  const handlers = new DqAPIHandlers(repository);

  return [
    {
      name: 'create_dq_file',
      description: 'Create a new DQ file record for a driver and generate their intake link',
      handler: async (args) => {
        const result = await handlers.createFile(args.org_id as string, {
          driver_id: args.driver_id as string,
          driver_name: args.driver_name as string,
          cdl_holder: args.cdl_holder as boolean,
          hire_date: args.hire_date as string,
        });
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'get_dq_checklist',
      description: 'Return the complete DQ file checklist for a driver — all required docs, current status, and gaps',
      handler: async (args) => {
        const result = await handlers.getChecklist(args.dq_file_id as number);
        return result ? JSON.stringify(result, null, 2) : 'DQ file not found';
      },
    },

    {
      name: 'get_dq_gaps',
      description: 'Return all drivers across the org with missing or expiring DQ documents',
      handler: async (args) => {
        const result = await handlers.getGaps(
          args.org_id as string,
          (args.include_expiring_within_days as number) ?? 30
        );
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'upload_dq_document',
      description: 'Record that a document has been uploaded and update its status in the checklist',
      handler: async (args) => {
        const result = await handlers.uploadDocument(args.org_id as string, {
          dq_file_id: args.dq_file_id as number,
          doc_type: args.doc_type as string as any,
          file_path: args.file_path as string,
          expires_at: args.expires_at as string | undefined,
        });
        return result ? JSON.stringify(result, null, 2) : 'Document not found in checklist';
      },
    },

    {
      name: 'generate_dq_document',
      description: 'Generate a pre-filled DOT document (application, violations record, consent form, review note) from driver intake data',
      handler: async (args) => {
        const result = await handlers.generateDocument(args.org_id as string, {
          dq_file_id: args.dq_file_id as number,
          doc_type: args.doc_type as string as any,
          generation_options: args.generation_options as Record<string, unknown> | undefined,
        });
        return result ? JSON.stringify(result, null, 2) : 'Cannot generate this document type';
      },
    },

    {
      name: 'send_intake_link',
      description: 'Generate or resend a driver intake link for a given DQ file',
      handler: async (args) => {
        const file = await handlers.getFile(args.dq_file_id as number);
        if (!file) return 'DQ file not found';
        if (!file.intake_token) return 'No intake token — intake may already be complete';
        // In production, this would send via email/SMS
        const link = `/intake/${file.intake_token}`;
        return JSON.stringify({
          dq_file_id: file.id,
          driver_name: file.driver_name,
          intake_link: link,
          delivery_method: (args.delivery_method as string) ?? 'copy_link',
          status: 'sent',
        }, null, 2);
      },
    },

    {
      name: 'get_intake_status',
      description: 'Check whether a driver has completed their intake form and which sections are done',
      handler: async (args) => {
        const result = await handlers.getIntakeStatus(args.dq_file_id as number);
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'mark_doc_verified',
      description: 'Mark a document as reviewed and verified by a fleet manager',
      handler: async (args) => {
        const result = await handlers.verifyDocument(
          args.document_id as number,
          args.reviewer_id as string,
          args.notes as string | undefined
        );
        return result ? JSON.stringify(result, null, 2) : 'Document not found or not in verifiable state';
      },
    },

    {
      name: 'run_dq_sweep',
      description: 'Trigger a compliance sweep — find expiring or missing docs and create suspense items',
      handler: async (args) => {
        const result = await handlers.runSweep(
          args.org_id as string,
          (args.dry_run as boolean) ?? false
        );
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'get_dq_summary',
      description: 'Return org-level DQ compliance summary — total drivers, % complete, count by status',
      handler: async (args) => {
        const result = await handlers.getSummary(args.org_id as string);
        return JSON.stringify(result, null, 2);
      },
    },

    {
      name: 'archive_dq_file',
      description: 'Soft-delete a DQ file (driver terminated) — triggers 3-year retention flag per §391.51(c)',
      handler: async (args) => {
        const fileService = new (await import('./services/dq-file-service')).DqFileService(repository);
        await fileService.archiveDqFile(
          args.dq_file_id as number,
          args.termination_date as string,
          args.reason as string | undefined
        );
        return JSON.stringify({ status: 'archived', dq_file_id: args.dq_file_id }, null, 2);
      },
    },
  ];
}
