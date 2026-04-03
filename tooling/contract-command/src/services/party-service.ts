/**
 * Party Service
 * CRUD for vendors, clients, partners, and subcontractors
 */

import { Party, PartyType } from '../data/types.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';

export class PartyService {
  /**
   * Create a new party
   */
  static async create(party: Omit<Party, 'id' | 'created_at' | 'updated_at'>) {
    if (!party.name || !party.party_type) {
      throw new Error('Name and party_type are required');
    }

    if (!['client', 'vendor', 'partner', 'subcontractor'].includes(party.party_type)) {
      throw new Error('Invalid party_type');
    }

    return inMemoryRepository.createParty(party);
  }

  /**
   * Get party by ID
   */
  static async getById(id: string) {
    const party = await inMemoryRepository.getParty(id);
    if (!party) {
      throw new Error(`Party not found: ${id}`);
    }
    return party;
  }

  /**
   * Get all parties
   */
  static async list() {
    return inMemoryRepository.getParties();
  }

  /**
   * Get parties by type
   */
  static async listByType(partyType: PartyType) {
    const parties = await inMemoryRepository.getParties();
    return parties.filter(p => p.party_type === partyType);
  }

  /**
   * Update party
   */
  static async update(id: string, updates: Partial<Party>) {
    await this.getById(id);

    if (updates.party_type && !['client', 'vendor', 'partner', 'subcontractor'].includes(updates.party_type)) {
      throw new Error('Invalid party_type');
    }

    return inMemoryRepository.updateParty(id, updates);
  }

  /**
   * Get contracts for a party
   */
  static async getContracts(partyId: string) {
    await this.getById(partyId);
    const { ContractService } = await import('./contract-service.js');
    const contracts = await ContractService.list({ party_id: partyId });
    return contracts;
  }

  /**
   * Get party by name (case-insensitive)
   */
  static async getByName(name: string) {
    const parties = await inMemoryRepository.getParties();
    return parties.find(p => p.name.toLowerCase() === name.toLowerCase()) || null;
  }

  /**
   * Get vendor statistics for a party
   */
  static async getVendorStats(partyId: string) {
    const { VendorAnalysis } = await import('../reporting/vendor-analysis.js');
    const stats = await VendorAnalysis.analyzeParty(partyId);
    if (!stats) {
      throw new Error(`No contracts found for party: ${partyId}`);
    }
    return stats;
  }
}
