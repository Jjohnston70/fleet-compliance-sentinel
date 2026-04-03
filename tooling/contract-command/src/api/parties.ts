/**
 * Party API Routes
 * GET/POST /api/parties
 * GET/PUT /api/parties/[id]
 * GET /api/parties/[id]/contracts
 */

import { PartyService } from '../services/party-service.js';

/**
 * GET /api/parties - List all parties
 */
export async function listParties(req: { query?: Record<string, any> }) {
  try {
    const parties = await PartyService.list();
    const limit = parseInt(req.query?.limit || '50');
    const offset = parseInt(req.query?.offset || '0');

    return {
      status: 200,
      data: {
        parties: parties.slice(offset, offset + limit),
        total: parties.length,
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
 * POST /api/parties - Create new party
 */
export async function createParty(req: { body: Record<string, any> }) {
  try {
    const party = await PartyService.create({
      name: req.body.name,
      party_type: req.body.party_type,
      contact_name: req.body.contact_name,
      contact_email: req.body.contact_email,
      contact_phone: req.body.contact_phone,
      address: req.body.address,
      notes: req.body.notes
    });

    return {
      status: 201,
      data: party
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/parties/[id] - Get party by ID
 */
export async function getParty(req: { params: { id: string } }) {
  try {
    const party = await PartyService.getById(req.params.id);
    return {
      status: 200,
      data: party
    };
  } catch (error) {
    return {
      status: 404,
      error: 'Party not found'
    };
  }
}

/**
 * PUT /api/parties/[id] - Update party
 */
export async function updateParty(req: { params: { id: string }; body: Record<string, any> }) {
  try {
    const updates: any = {};
    const allowedFields = ['name', 'party_type', 'contact_name', 'contact_email', 'contact_phone', 'address', 'notes'];

    for (const field of allowedFields) {
      if (field in req.body) {
        updates[field] = req.body[field];
      }
    }

    const party = await PartyService.update(req.params.id, updates);
    return {
      status: 200,
      data: party
    };
  } catch (error) {
    return {
      status: 400,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET /api/parties/[id]/contracts - Get contracts for party
 */
export async function getPartyContracts(req: { params: { id: string }; query?: Record<string, any> }) {
  try {
    const contracts = await PartyService.getContracts(req.params.id);
    const limit = parseInt(req.query?.limit || '50');
    const offset = parseInt(req.query?.offset || '0');

    return {
      status: 200,
      data: {
        party_id: req.params.id,
        contracts: contracts.slice(offset, offset + limit),
        total: contracts.length,
        limit,
        offset
      }
    };
  } catch (error) {
    return {
      status: 404,
      error: 'Party not found'
    };
  }
}

/**
 * GET /api/parties/[id]/stats - Get vendor statistics
 */
export async function getPartyStats(req: { params: { id: string } }) {
  try {
    const stats = await PartyService.getVendorStats(req.params.id);
    return {
      status: 200,
      data: stats
    };
  } catch (error) {
    return {
      status: 404,
      error: 'Party not found'
    };
  }
}
