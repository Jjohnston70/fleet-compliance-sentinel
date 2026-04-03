/**
 * Contract API Routes
 * GET/POST /api/contracts
 * GET/PUT/DELETE /api/contracts/[id]
 * GET /api/contracts/expiring
 */

import { ContractService } from '../services/contract-service.js';

/**
 * GET /api/contracts - List all contracts
 * Query params: status, party_id, limit, offset
 */
export async function listContracts(req: { query?: Record<string, any> }) {
  try {
    const filters: any = {};
    if (req.query?.status) filters.status = req.query.status;
    if (req.query?.party_id) filters.party_id = req.query.party_id;

    const contracts = await ContractService.list(filters);
    const limit = parseInt(req.query?.limit || '50');
    const offset = parseInt(req.query?.offset || '0');

    return {
      status: 200,
      data: {
        contracts: contracts.slice(offset, offset + limit),
        total: contracts.length,
        limit,
        offset
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * POST /api/contracts - Create new contract
 */
export async function createContract(req: { body: Record<string, any> }) {
  try {
    const contract = await ContractService.create({
      title: req.body.title,
      contract_number: req.body.contract_number,
      party_id: req.body.party_id,
      contract_type: req.body.contract_type,
      start_date: new Date(req.body.start_date),
      end_date: new Date(req.body.end_date),
      value: req.body.value,
      currency: req.body.currency || 'USD',
      payment_terms: req.body.payment_terms,
      auto_renew: req.body.auto_renew || false,
      renewal_notice_days: req.body.renewal_notice_days || 30,
      document_url: req.body.document_url,
      notes: req.body.notes
    });

    return {
      status: 201,
      data: contract
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/contracts/[id] - Get contract by ID
 */
export async function getContract(req: { params: { id: string } }) {
  try {
    const contract = await ContractService.getById(req.params.id);
    return {
      status: 200,
      data: contract
    };
  } catch (error) {
    return {
      status: 404,
      error: 'Contract not found'
    };
  }
}

/**
 * PUT /api/contracts/[id] - Update contract
 */
export async function updateContract(req: { params: { id: string }; body: Record<string, any> }) {
  try {
    const updates: any = {};
    const allowedFields = ['title', 'status', 'value', 'end_date', 'payment_terms', 'auto_renew', 'renewal_notice_days', 'notes'];

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = ['start_date', 'end_date'].includes(field) ? new Date(req.body[field]) : req.body[field];
      }
    }

    const contract = await ContractService.update(req.params.id, updates);
    return {
      status: 200,
      data: contract
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * DELETE /api/contracts/[id] - Delete contract
 */
export async function deleteContract(req: { params: { id: string } }) {
  try {
    await ContractService.delete(req.params.id);
    return {
      status: 204,
      data: null
    };
  } catch (error) {
    return {
      status: 404,
      error: 'Contract not found'
    };
  }
}

/**
 * GET /api/contracts/expiring - Get expiring contracts
 * Query params: days (default: 30)
 */
export async function getExpiringContracts(req: { query?: Record<string, any> }) {
  try {
    const days = parseInt(req.query?.days || '30');
    const contracts = await ContractService.getExpiringWithin(days);

    return {
      status: 200,
      data: {
        days,
        count: contracts.length,
        contracts
      }
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
