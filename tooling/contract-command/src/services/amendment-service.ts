/**
 * Amendment Service
 * Manage contract amendments and modifications
 */

import { ContractAmendment } from '../data/types.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';
import { ContractService } from './contract-service.js';

export class AmendmentService {
  /**
   * Create amendment
   */
  static async create(amendment: Omit<ContractAmendment, 'id' | 'created_at' | 'amendment_number'> & { amendment_number?: number }) {
    if (!amendment.contract_id || !amendment.description) {
      throw new Error('contract_id and description are required');
    }

    // Verify contract exists
    await ContractService.getById(amendment.contract_id);

    // Get existing amendments to calculate next number
    const existing = await inMemoryRepository.getAmendmentsByContract(amendment.contract_id);
    const nextNumber = amendment.amendment_number || (Math.max(...existing.map(a => a.amendment_number), 0) + 1);

    return inMemoryRepository.createAmendment({
      ...amendment,
      amendment_number: nextNumber
    });
  }

  /**
   * Get amendments for contract
   */
  static async getByContract(contractId: string) {
    return inMemoryRepository.getAmendmentsByContract(contractId);
  }

  /**
   * Create amendment and update contract
   */
  static async createAndApply(
    contractId: string,
    description: string,
    valueChange?: number,
    newEndDate?: Date
  ) {
    const contract = await ContractService.getById(contractId);

    // Create amendment
    const amendment = await this.create({
      contract_id: contractId,
      date: new Date(),
      description,
      value_change: valueChange
    });

    // Update contract if needed
    const updates: any = {};
    if (newEndDate) {
      updates.end_date = newEndDate;
    }
    if (valueChange) {
      updates.value = (contract.value || 0) + valueChange;
    }

    if (Object.keys(updates).length > 0) {
      await ContractService.update(contractId, updates);
    }

    return amendment;
  }

  /**
   * Get amendment count for contract
   */
  static async getCountByContract(contractId: string): Promise<number> {
    const amendments = await inMemoryRepository.getAmendmentsByContract(contractId);
    return amendments.length;
  }

  /**
   * Calculate total value changes for contract
   */
  static async getTotalValueChange(contractId: string): Promise<number> {
    const amendments = await inMemoryRepository.getAmendmentsByContract(contractId);
    return amendments.reduce((sum, a) => sum + (a.value_change || 0), 0);
  }
}
