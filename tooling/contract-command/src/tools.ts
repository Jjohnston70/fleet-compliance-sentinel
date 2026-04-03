/**
 * LLM Tools for Contract Management
 * Exports tools that can be called by Claude or other LLMs
 */

import { ContractService } from './services/contract-service.js';
import { PartyService } from './services/party-service.js';
import { ContractSummary } from './reporting/contract-summary.js';
import { VendorAnalysis } from './reporting/vendor-analysis.js';
import { ExpirationCalendar } from './reporting/expiration-calendar.js';
import { AmendmentService } from './services/amendment-service.js';

export const CONTRACT_TOOLS = [
  {
    name: 'add_contract',
    description: 'Create a new contract with details and scheduling',
    parameters: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Contract title' },
        party_id: { type: 'string', description: 'UUID of the party (vendor/client)' },
        contract_type: {
          type: 'string',
          enum: ['client_service', 'vendor', 'nda', 'lease', 'employment', 'subcontractor', 'saas'],
          description: 'Type of contract'
        },
        start_date: { type: 'string', description: 'Start date (YYYY-MM-DD)' },
        end_date: { type: 'string', description: 'End date (YYYY-MM-DD)' },
        value: { type: 'number', description: 'Contract value in USD' },
        payment_terms: {
          type: 'string',
          enum: ['net_15', 'net_30', 'net_60', 'monthly', 'quarterly', 'annual'],
          description: 'Payment terms'
        },
        auto_renew: { type: 'boolean', description: 'Enable automatic renewal' },
        renewal_notice_days: {
          type: 'number',
          description: 'Days before expiration to send renewal notice (default: 30)'
        },
        notes: { type: 'string', description: 'Additional notes' }
      },
      required: ['title', 'party_id', 'contract_type', 'start_date', 'end_date']
    }
  },
  {
    name: 'get_expiring_contracts',
    description: 'List contracts expiring within N days',
    parameters: {
      type: 'object',
      properties: {
        days: {
          type: 'number',
          description: 'Number of days to look ahead (default: 30)'
        }
      }
    }
  },
  {
    name: 'get_vendor_analysis',
    description: 'Analyze spending and contract patterns by vendor/party',
    parameters: {
      type: 'object',
      properties: {
        party_id: {
          type: 'string',
          description: 'Optional UUID of specific party for deep analysis'
        },
        limit: {
          type: 'number',
          description: 'Number of top vendors to return (default: 10)'
        }
      }
    }
  },
  {
    name: 'create_amendment',
    description: 'Add an amendment to an existing contract',
    parameters: {
      type: 'object',
      properties: {
        contract_id: { type: 'string', description: 'Contract UUID' },
        description: { type: 'string', description: 'Amendment description' },
        value_change: {
          type: 'number',
          description: 'Change to contract value (positive or negative)'
        },
        new_end_date: {
          type: 'string',
          description: 'New end date if extending contract (YYYY-MM-DD)'
        }
      },
      required: ['contract_id', 'description']
    }
  },
  {
    name: 'get_contract_summary',
    description: 'Get dashboard summary: active, expiring, expired contracts and total value',
    parameters: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'update_contract_status',
    description: 'Transition contract to new status (draft -> pending_review -> active -> expiring/expired)',
    parameters: {
      type: 'object',
      properties: {
        contract_id: { type: 'string', description: 'Contract UUID' },
        new_status: {
          type: 'string',
          enum: ['draft', 'pending_review', 'active', 'expiring', 'expired', 'terminated', 'renewed'],
          description: 'New contract status'
        },
        notes: { type: 'string', description: 'Reason for status change' }
      },
      required: ['contract_id', 'new_status']
    }
  },
  {
    name: 'get_expiration_calendar',
    description: 'Get calendar of contracts expiring in next 90 days, grouped by month',
    parameters: {
      type: 'object',
      properties: {
        months: {
          type: 'number',
          description: 'Number of months to show (6, 12, default: 3)'
        }
      }
    }
  },
  {
    name: 'add_party',
    description: 'Create a new party (vendor, client, partner, subcontractor)',
    parameters: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Party name' },
        party_type: {
          type: 'string',
          enum: ['client', 'vendor', 'partner', 'subcontractor'],
          description: 'Type of party'
        },
        contact_name: { type: 'string', description: 'Contact person name' },
        contact_email: { type: 'string', description: 'Contact email' },
        contact_phone: { type: 'string', description: 'Contact phone number' },
        address: { type: 'string', description: 'Party address' }
      },
      required: ['name', 'party_type']
    }
  }
];

/**
 * Execute tool function
 */
export async function executeTool(
  toolName: string,
  params: Record<string, any>
): Promise<any> {
  switch (toolName) {
    case 'add_contract':
      return ContractService.create({
        title: params.title,
        party_id: params.party_id,
        contract_type: params.contract_type,
        start_date: new Date(params.start_date),
        end_date: new Date(params.end_date),
        value: params.value,
        currency: 'USD',
        payment_terms: params.payment_terms,
        auto_renew: params.auto_renew || false,
        renewal_notice_days: params.renewal_notice_days || 30,
        notes: params.notes
      });

    case 'get_expiring_contracts':
      return ContractService.getExpiringWithin(params.days || 30);

    case 'get_vendor_analysis':
      if (params.party_id) {
        return VendorAnalysis.analyzeParty(params.party_id);
      }
      return VendorAnalysis.getTopVendorsBySpend(params.limit || 10);

    case 'create_amendment':
      return AmendmentService.createAndApply(
        params.contract_id,
        params.description,
        params.value_change,
        params.new_end_date ? new Date(params.new_end_date) : undefined
      );

    case 'get_contract_summary':
      return ContractSummary.generate();

    case 'update_contract_status':
      return ContractService.updateStatus(
        params.contract_id,
        params.new_status,
        params.notes
      );

    case 'get_expiration_calendar':
      if (params.months === 6) {
        return ExpirationCalendar.generate6Months();
      } else if (params.months === 12) {
        return ExpirationCalendar.generate12Months();
      }
      return ExpirationCalendar.generate90Days();

    case 'add_party':
      return PartyService.create({
        name: params.name,
        party_type: params.party_type,
        contact_name: params.contact_name,
        contact_email: params.contact_email,
        contact_phone: params.contact_phone,
        address: params.address
      });

    default:
      throw new Error(`Unknown tool: ${toolName}`);
  }
}

/**
 * Tool error handler
 */
export function handleToolError(error: Error): { error: string; details?: string } {
  console.error('Tool execution error:', error);
  return {
    error: error.message,
    details: error.stack
  };
}
