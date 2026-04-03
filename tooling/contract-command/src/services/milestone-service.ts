/**
 * Milestone Service
 * Track contract milestones and deliverables
 */

import { ContractMilestone, MilestoneStatus } from '../data/types.js';
import { inMemoryRepository } from '../data/in-memory-repository.js';

export class MilestoneService {
  /**
   * Create milestone for contract
   */
  static async create(milestone: Omit<ContractMilestone, 'id' | 'created_at' | 'updated_at'>) {
    if (!milestone.contract_id || !milestone.title || !milestone.due_date) {
      throw new Error('contract_id, title, and due_date are required');
    }

    return inMemoryRepository.createMilestone(milestone);
  }

  /**
   * Get milestones for contract
   */
  static async getByContract(contractId: string) {
    return inMemoryRepository.getMilestonesByContract(contractId);
  }

  /**
   * Update milestone
   */
  static async update(id: string, updates: Partial<ContractMilestone>) {
    const milestone = await this.getById(id);

    if (updates.completed_date && updates.status !== 'completed') {
      throw new Error('completed_date can only be set when status is completed');
    }

    return inMemoryRepository.updateMilestone(id, updates);
  }

  /**
   * Mark milestone as completed
   */
  static async complete(id: string) {
    return this.update(id, {
      status: 'completed',
      completed_date: new Date()
    });
  }

  /**
   * Get overdue milestones
   */
  static async getOverdue() {
    const now = new Date();
    const allMilestones = await inMemoryRepository.getMilestonesByContract('');
    // Get all milestones - this is a simplified version
    // In production, would query all directly
    return allMilestones.filter(m => {
      const dueDate = new Date(m.due_date);
      return m.status === 'pending' && dueDate < now;
    });
  }

  /**
   * Get milestones due within N days
   */
  static async getDueWithin(days: number, contractId?: string) {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

    let milestones: ContractMilestone[] = [];
    if (contractId) {
      milestones = await inMemoryRepository.getMilestonesByContract(contractId);
    }

    return milestones.filter(m => {
      const dueDate = new Date(m.due_date);
      return m.status === 'pending' && dueDate >= now && dueDate <= futureDate;
    });
  }

  /**
   * Get milestone by ID
   */
  static async getById(id: string) {
    // In production, would fetch from database
    // For now, this is a helper method
    return null;
  }

  /**
   * Update milestone status
   */
  static async updateStatus(id: string, status: MilestoneStatus) {
    return this.update(id, { status });
  }

  /**
   * Check and update overdue milestones
   */
  static async checkAndUpdateOverdue() {
    const now = new Date();
    const allMilestones = await inMemoryRepository.getMilestonesByContract('');
    let updated = 0;

    for (const milestone of allMilestones) {
      if (milestone.status === 'pending') {
        const dueDate = new Date(milestone.due_date);
        if (dueDate < now) {
          await inMemoryRepository.updateMilestone(milestone.id, {
            status: 'overdue'
          });
          updated++;
        }
      }
    }

    return { updated };
  }
}
