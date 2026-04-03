/**
 * Contract Service
 * CRUD operations and status management for contracts
 */

import { Contract, ContractStatus } from '../data/types.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';

export class ContractService {
  /**
   * Create a new contract
   */
  static async create(contract: Omit<Contract, 'id' | 'created_at' | 'updated_at' | 'status'>) {
    // Validation
    if (!contract.title || !contract.party_id) {
      throw new Error('Title and party_id are required');
    }
    if (!contract.start_date || !contract.end_date) {
      throw new Error('Start and end dates are required');
    }
    if (contract.end_date <= contract.start_date) {
      throw new Error('End date must be after start date');
    }

    return inMemoryRepository.createContract({
      ...contract,
      status: 'draft' as ContractStatus
    });
  }

  /**
   * Get contract by ID
   */
  static async getById(id: string) {
    const contract = await inMemoryRepository.getContract(id);
    if (!contract) {
      throw new Error(`Contract not found: ${id}`);
    }
    return contract;
  }

  /**
   * Get all contracts with optional filters
   */
  static async list(filters?: { status?: ContractStatus; party_id?: string }) {
    return inMemoryRepository.getContracts(filters);
  }

  /**
   * Get contracts expiring within N days
   */
  static async getExpiringWithin(days: number) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    const contracts = await inMemoryRepository.getContracts({ status: 'active' });
    return contracts
      .filter(c => {
        const endDate = new Date(c.end_date);
        return endDate >= now && endDate <= futureDate;
      })
      .sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
  }

  /**
   * Update contract
   */
  static async update(id: string, updates: Partial<Omit<Contract, 'id' | 'created_at' | 'updated_at'>>) {
    const contract = await this.getById(id);

    if (updates.end_date && updates.end_date <= (updates.start_date || contract.start_date)) {
      throw new Error('End date must be after start date');
    }

    return inMemoryRepository.updateContract(id, updates);
  }

  /**
   * Transition contract to new status
   */
  static async updateStatus(id: string, newStatus: ContractStatus, notes?: string) {
    const contract = await this.getById(id);
    const validTransitions = this.getValidTransitions(contract.status);

    if (!validTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${contract.status} to ${newStatus}`);
    }

    const updated = await inMemoryRepository.updateContract(id, {
      status: newStatus
    });

    // Log status change
    if (notes) {
      await inMemoryRepository.createAlert({
        contract_id: id,
        alert_type: 'status_change',
        message: `Status changed from ${contract.status} to ${newStatus}. ${notes}`,
        acknowledged: false
      });
    }

    return updated;
  }

  /**
   * Delete contract
   */
  static async delete(id: string) {
    await this.getById(id);
    return inMemoryRepository.deleteContract(id);
  }

  /**
   * Get valid status transitions
   */
  private static getValidTransitions(currentStatus: ContractStatus): ContractStatus[] {
    const transitions: Record<ContractStatus, ContractStatus[]> = {
      draft: ['pending_review', 'active', 'terminated'],
      pending_review: ['active', 'draft', 'terminated'],
      active: ['expiring', 'expired', 'terminated', 'renewed'],
      expiring: ['expired', 'renewed', 'terminated'],
      expired: ['renewed', 'terminated'],
      terminated: [],
      renewed: ['active']
    };
    return transitions[currentStatus] || [];
  }

  /**
   * Calculate contract duration in days
   */
  static getDurationDays(contract: Contract): number {
    const start = new Date(contract.start_date);
    const end = new Date(contract.end_date);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if contract is active
   */
  static isActive(contract: Contract): boolean {
    const now = new Date();
    const startDate = new Date(contract.start_date);
    const endDate = new Date(contract.end_date);
    return contract.status === 'active' && now >= startDate && now <= endDate;
  }

  /**
   * Get days until expiration
   */
  static daysUntilExpiration(contract: Contract): number {
    const now = new Date();
    const endDate = new Date(contract.end_date);
    return Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  /**
   * Bulk status update for expiring contracts
   */
  static async updateExpiringStatus() {
    const expiringContracts = await this.getExpiringWithin(90);
    let updated = 0;

    for (const contract of expiringContracts) {
      if (contract.status === 'active') {
        await inMemoryRepository.updateContract(contract.id, {
          status: 'expiring'
        });
        updated++;
      }
    }

    return { updated };
  }
}
